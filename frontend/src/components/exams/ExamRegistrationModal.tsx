import React, { useState, useEffect, useMemo } from 'react';
import type { Exam } from '../../types/Exam';
import type { Student } from '../../types/Student';
import type { RegisteredStudent } from '../../services/registrationService';
import registrationService from '../../services/registrationService';
import studentService from '../../services/studentService';
import departmentService, { type Department } from '../../services/departmentService';
import Button from '../common/Button';
import { 
  X, 
  Search, 
  UserPlus, 
  UserMinus, 
  Users, 
  CheckCircle2, 
  Trash2,
  Sparkles
} from 'lucide-react';

interface ExamRegistrationModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onRegistrationChange?: () => void;
}

export const ExamRegistrationModal: React.FC<ExamRegistrationModalProps> = ({
  exam,
  isOpen,
  onClose,
  onRegistrationChange
}) => {
  const [activeTab, setActiveTab] = useState<'enroll' | 'enrolled'>('enroll');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>([]);

  // Filters for Enrollment
  const [deptFilter, setDeptFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected student IDs for bulk enrollment
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Search filter for Enrolled list
  const [enrolledSearch, setEnrolledSearch] = useState('');

  // Toast / Feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, deptsData, regData] = await Promise.all([
        studentService.getStudents(),
        departmentService.getDepartments(),
        registrationService.getRegistrationsByExam(exam.id)
      ]);
      setAllStudents(studentsData || []);
      setDepartments(deptsData || []);
      setRegisteredStudents(regData || []);
    } catch (err: any) {
      console.error("Error loading registration modal data:", err);
      showFeedback("Failed to load registration records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSelectedStudentIds([]);
      setSearchTerm('');
      setEnrolledSearch('');
    }
  }, [isOpen, exam.id]);

  // Set of registered student IDs for fast lookup
  const registeredStudentIdSet = useMemo(() => {
    return new Set(registeredStudents.map(r => r.studentId));
  }, [registeredStudents]);

  // Distinct sections for dropdown
  const availableSections = useMemo(() => {
    const sections = new Set(allStudents.map(s => s.section).filter(Boolean));
    return ['All', ...Array.from(sections).sort()];
  }, [allStudents]);

  // Unregistered candidates available for enrollment, filtered
  const availableToEnroll = useMemo(() => {
    return allStudents.filter(student => {
      if (registeredStudentIdSet.has(student.id)) return false;

      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (deptFilter !== 'All' && student.department !== deptFilter) {
        return false;
      }

      if (sectionFilter !== 'All' && student.section !== sectionFilter) {
        return false;
      }

      if (semesterFilter !== 'All' && String(student.semester) !== semesterFilter) {
        return false;
      }

      return true;
    });
  }, [allStudents, registeredStudentIdSet, searchTerm, deptFilter, sectionFilter, semesterFilter]);

  // Filtered enrolled students
  const filteredEnrolled = useMemo(() => {
    if (!enrolledSearch.trim()) return registeredStudents;
    const q = enrolledSearch.toLowerCase();
    return registeredStudents.filter(s => 
      s.studentName.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.departmentCode.toLowerCase().includes(q)
    );
  }, [registeredStudents, enrolledSearch]);

  // Toggle selection
  const handleToggleSelectStudent = (id: number) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = availableToEnroll.map(s => s.id);
    const allSelected = visibleIds.every(id => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Enroll single student
  const handleEnrollSingle = async (studentId: number) => {
    try {
      setActionLoading(true);
      await registrationService.registerStudent(exam.id, studentId);
      showFeedback("Student enrolled successfully.");
      await loadData();
      if (onRegistrationChange) onRegistrationChange();
    } catch (err: any) {
      showFeedback(err.message || "Failed to register student.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Enroll selected students
  const handleEnrollSelected = async () => {
    if (selectedStudentIds.length === 0) return;
    try {
      setActionLoading(true);
      const res = await registrationService.registerBulkStudents(exam.id, selectedStudentIds);
      showFeedback(res.message || `Successfully enrolled ${selectedStudentIds.length} candidate(s).`);
      setSelectedStudentIds([]);
      await loadData();
      if (onRegistrationChange) onRegistrationChange();
    } catch (err: any) {
      showFeedback(err.message || "Failed to enroll selected candidates.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Enroll all filtered students
  const handleEnrollAllFiltered = async () => {
    const idsToEnroll = availableToEnroll.map(s => s.id);
    if (idsToEnroll.length === 0) return;
    try {
      setActionLoading(true);
      const res = await registrationService.registerBulkStudents(exam.id, idsToEnroll);
      showFeedback(res.message || `Successfully enrolled all ${idsToEnroll.length} filtered candidate(s).`);
      setSelectedStudentIds([]);
      await loadData();
      if (onRegistrationChange) onRegistrationChange();
    } catch (err: any) {
      showFeedback(err.message || "Failed to enroll candidates.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Remove single registration
  const handleRemoveSingle = async (reg: RegisteredStudent) => {
    if (!window.confirm(`Unregister student ${reg.studentName} (${reg.rollNo}) from this examination?`)) {
      return;
    }
    try {
      setActionLoading(true);
      await registrationService.deleteRegistration(reg.registrationId);
      showFeedback(`Removed ${reg.rollNo} from exam registrations.`);
      await loadData();
      if (onRegistrationChange) onRegistrationChange();
    } catch (err: any) {
      showFeedback(err.message || "Failed to remove registration.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Remove all enrolled
  const handleRemoveAllEnrolled = async () => {
    if (registeredStudents.length === 0) return;
    if (!window.confirm(`Are you sure you want to remove all ${registeredStudents.length} registered students from this exam?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const allRegIds = registeredStudents.map(r => r.studentId);
      await registrationService.deleteBulkRegistrations(exam.id, allRegIds);
      showFeedback("All registrations removed.");
      await loadData();
      if (onRegistrationChange) onRegistrationChange();
    } catch (err: any) {
      showFeedback(err.message || "Failed to clear registrations.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#E7DDD5] bg-white shadow-2xl overflow-hidden font-['Manrope',sans-serif]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ECE4DD] px-6 py-4 bg-[#FCFBFA]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF4ED] text-[#64815E]">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#938A84]">
                  {exam.subjectCode}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#EBF2F7] px-2.5 py-0.5 text-xs font-semibold text-[#2F6E99]">
                  {registeredStudents.length} Enrolled Candidates
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#2D2825]">
                {exam.subjectName} — Candidate Registration
              </h3>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between transition ${
            feedback.type === 'error' ? 'bg-rose-50 text-rose-700 border-b border-rose-200' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        {/* Exam Quick Info Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ECE4DD] bg-[#FAF8F5] px-6 py-2.5 text-xs text-[#7A726B]">
          <div className="flex items-center gap-4">
            <span>Date: <strong className="text-[#2D2825]">{exam.examDate}</strong></span>
            <span>Timing: <strong className="text-[#2D2825]">{exam.startTime} – {exam.endTime} ({exam.duration} mins)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('enroll')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTab === 'enroll' 
                  ? 'bg-[#2F3E46] text-white shadow-xs' 
                  : 'bg-white text-[#7A726B] border border-[#ECE4DD] hover:bg-slate-50'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <UserPlus size={14} />
                Enroll Candidates ({availableToEnroll.length} available)
              </span>
            </button>
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTab === 'enrolled' 
                  ? 'bg-[#2F3E46] text-white shadow-xs' 
                  : 'bg-white text-[#7A726B] border border-[#ECE4DD] hover:bg-slate-50'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Registered List ({registeredStudents.length})
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {loading ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              Loading student roster and registrations...
            </div>
          ) : activeTab === 'enroll' ? (
            /* ========================================================
               TAB 1: ENROLL NEW CANDIDATES
               ======================================================== */
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#ECE4DD]">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name / roll..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white text-xs rounded-xl border border-gray-300 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Department filter */}
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white text-xs rounded-xl border border-gray-300 outline-none cursor-pointer text-slate-700"
                >
                  <option value="All">All Departments</option>
                  {departments.map(d => (
                    <option key={d.department_id} value={d.department_name}>
                      {d.department_code} ({d.department_name})
                    </option>
                  ))}
                </select>

                {/* Section filter */}
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white text-xs rounded-xl border border-gray-300 outline-none cursor-pointer text-slate-700"
                >
                  <option value="All">All Sections</option>
                  {availableSections.filter(s => s !== 'All').map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>

                {/* Semester filter */}
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white text-xs rounded-xl border border-gray-300 outline-none cursor-pointer text-slate-700"
                >
                  <option value="All">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={String(sem)}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Bulk Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-2 py-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-[#2D2825]">{availableToEnroll.length}</span> students matching filters
                  {selectedStudentIds.length > 0 && (
                    <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                      {selectedStudentIds.length} selected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedStudentIds.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleEnrollSelected}
                      disabled={actionLoading}
                      className="text-xs h-8 rounded-xl gap-1.5"
                    >
                      <UserPlus size={14} />
                      Enroll Selected ({selectedStudentIds.length})
                    </Button>
                  )}

                  {availableToEnroll.length > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleEnrollAllFiltered}
                      disabled={actionLoading}
                      className="text-xs h-8 rounded-xl gap-1.5"
                    >
                      <Sparkles size={14} />
                      Enroll All Filtered ({availableToEnroll.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Student table */}
              <div className="border border-[#ECE4DD] rounded-2xl overflow-hidden">
                <div className="max-h-[340px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#FAF8F5] sticky top-0 z-10 border-b border-[#ECE4DD] text-[#7A726B]">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              availableToEnroll.length > 0 &&
                              availableToEnroll.every(s => selectedStudentIds.includes(s.id))
                            }
                            onChange={handleSelectAllVisible}
                            className="rounded cursor-pointer"
                          />
                        </th>
                        <th className="p-3 font-semibold">Roll No</th>
                        <th className="p-3 font-semibold">Name</th>
                        <th className="p-3 font-semibold">Department</th>
                        <th className="p-3 font-semibold text-center">Section</th>
                        <th className="p-3 font-semibold text-center">Semester</th>
                        <th className="p-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECE4DD]">
                      {availableToEnroll.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-gray-400">
                            No unassigned students match the search criteria.
                          </td>
                        </tr>
                      ) : (
                        availableToEnroll.map(student => {
                          const isSelected = selectedStudentIds.includes(student.id);
                          return (
                            <tr 
                              key={student.id} 
                              className={`transition hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/40' : ''}`}
                            >
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectStudent(student.id)}
                                  className="rounded cursor-pointer"
                                />
                              </td>
                              <td className="p-3 font-mono font-semibold text-[#2D2825]">
                                {student.rollNo}
                              </td>
                              <td className="p-3 font-medium text-[#2D2825]">
                                {student.name}
                              </td>
                              <td className="p-3 text-slate-600">
                                {student.department}
                              </td>
                              <td className="p-3 text-center font-semibold text-slate-600">
                                {student.section || 'A'}
                              </td>
                              <td className="p-3 text-center text-slate-600">
                                {student.semester ?? '1'}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleEnrollSingle(student.id)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                >
                                  <UserPlus size={12} />
                                  Enroll
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               TAB 2: REGISTERED CANDIDATES LIST
               ======================================================== */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#ECE4DD]">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search enrolled candidates..."
                    value={enrolledSearch}
                    onChange={(e) => setEnrolledSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white text-xs rounded-xl border border-gray-300 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Total: <strong className="text-[#2D2825]">{registeredStudents.length} candidates</strong>
                  </span>
                  {registeredStudents.length > 0 && (
                    <button
                      onClick={handleRemoveAllEnrolled}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition border border-rose-200"
                    >
                      <Trash2 size={12} />
                      Remove All
                    </button>
                  )}
                </div>
              </div>

              {/* Enrolled candidates table */}
              <div className="border border-[#ECE4DD] rounded-2xl overflow-hidden">
                <div className="max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#FAF8F5] sticky top-0 z-10 border-b border-[#ECE4DD] text-[#7A726B]">
                      <tr>
                        <th className="p-3 font-semibold">Roll No</th>
                        <th className="p-3 font-semibold">Student Name</th>
                        <th className="p-3 font-semibold">Department</th>
                        <th className="p-3 font-semibold text-center">Section</th>
                        <th className="p-3 font-semibold text-center">Semester</th>
                        <th className="p-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECE4DD]">
                      {filteredEnrolled.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-400">
                            {registeredStudents.length === 0 
                              ? "No candidates registered for this exam yet. Switch to 'Enroll Candidates' to register students." 
                              : "No candidates match the search."}
                          </td>
                        </tr>
                      ) : (
                        filteredEnrolled.map(reg => (
                          <tr key={reg.registrationId} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-[#2D2825]">
                              {reg.rollNo}
                            </td>
                            <td className="p-3 font-semibold text-[#2D2825]">
                              {reg.studentName}
                            </td>
                            <td className="p-3 text-slate-600">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                                {reg.departmentCode}
                              </span>
                            </td>
                            <td className="p-3 text-center font-semibold text-slate-700">
                              {reg.section || 'A'}
                            </td>
                            <td className="p-3 text-center text-slate-600">
                              {reg.semester ?? '1'}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleRemoveSingle(reg)}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Remove candidate from exam"
                              >
                                <UserMinus size={15} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#ECE4DD] bg-[#FCFBFA] px-6 py-4">
          <div className="text-xs text-[#7A726B]">
            {registeredStudents.length} total candidates registered for this seating session
          </div>
          <Button onClick={onClose} variant="outline" className="rounded-xl">
            Done
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ExamRegistrationModal;
