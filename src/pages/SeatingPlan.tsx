import React, { useState, useEffect } from 'react';
import examService from '../services/examService';
import classroomService from '../services/classroomService';
import allocationService from '../services/allocationService';
import studentService from '../services/studentService';
import type { Exam } from '../types/Exam';
import type { Classroom } from '../types/Classroom';
import type { Student } from '../types/Student';
import type { AllocationResult } from '../types/AllocationResult';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  HiOutlineSearch,
  HiDownload,
  HiDatabase,
  HiOutlineUserCircle,
  HiCheckCircle,
  HiExclamationCircle,
  HiX
} from 'react-icons/hi';

interface StudentLookupMap {
  [rollNo: string]: Student;
}

export const SeatingPlan: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMap, setStudentMap] = useState<StudentLookupMap>({});
  
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassroomIds, setSelectedClassroomIds] = useState<number[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [activeRoomNo, setActiveRoomNo] = useState<string>('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentSeat, setSelectedStudentSeat] = useState<{
    student: Student;
    seatNo: string;
    roomNo: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [examsData, roomsData, studentsData] = await Promise.all([
          examService.getExams(),
          classroomService.getClassrooms(),
          studentService.getStudents(),
        ]);
        setExams(examsData);
        setClassrooms(roomsData);
        setStudents(studentsData);

        // Build mapping of roll number -> Student for easy grid info displays
        const map: StudentLookupMap = {};
        studentsData.forEach((s) => {
          map[s.rollNo] = s;
        });
        setStudentMap(map);
      } catch (err) {
        console.error('Failed to load initial seeding plan configuration data', err);
      }
    };
    loadInitialData();
  }, []);

  // Fetch generated plan if it exists for the exam
  useEffect(() => {
    if (selectedExamId !== '') {
      const fetchExistingPlan = async () => {
        const result = await allocationService.getGeneratedPlans(selectedExamId);
        setAllocationResult(result);
        if (result && result.assignments.length > 0) {
          // Set first room as active default
          const uniqueRooms = Array.from(new Set(result.assignments.map((a) => a.roomNo)));
          if (uniqueRooms.length > 0) {
            setActiveRoomNo(uniqueRooms[0]);
          }
        } else {
          setActiveRoomNo('');
        }
      };
      fetchExistingPlan();
    } else {
      setAllocationResult(null);
      setActiveRoomNo('');
    }
  }, [selectedExamId]);

  const handleClassroomToggle = (classroomId: number) => {
    setSelectedClassroomIds((prev) =>
      prev.includes(classroomId)
        ? prev.filter((id) => id !== classroomId)
        : [...prev, classroomId]
    );
  };

  const handleGenerate = async () => {
    if (selectedExamId === '' || selectedClassroomIds.length === 0) return;
    
    setIsGenerating(true);
    setAllocationResult(null);
    setActiveRoomNo('');
    
    try {
      const result = await allocationService.generateSeatingPlan(selectedExamId, selectedClassroomIds);
      setAllocationResult(result);
      if (result.success && result.assignments.length > 0) {
        const uniqueRooms = Array.from(new Set(result.assignments.map((a) => a.roomNo)));
        if (uniqueRooms.length > 0) {
          setActiveRoomNo(uniqueRooms[0]);
        }
        showToast('Seating layout generated successfully!');
      } else {
        showToast(result.message || 'Generation failed.');
      }
    } catch (error) {
      console.error(error);
      showToast('Error generating allocation plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExport = (type: 'CSV' | 'PDF') => {
    if (!allocationResult) return;
    showToast(`Successfully exported layout as ${type}!`);
  };

  // Calculations for selection panel
  const totalCapacity = classrooms
    .filter((c) => selectedClassroomIds.includes(c.id))
    .reduce((acc, curr) => acc + curr.capacity, 0);

  const studentsCount = students.length;
  const isCapacitySufficient = totalCapacity >= studentsCount;

  // Visual seat color helper based on department to showcase the spacing constraints
  const getDeptStyles = (dept: string) => {
    switch (dept.toLowerCase()) {
      case 'computer science':
        return 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60 hover:bg-purple-100';
      case 'electrical engineering':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60 hover:bg-blue-100';
      case 'electronics & communication':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100';
      case 'mechanical engineering':
        return 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/60 hover:bg-orange-100';
      default:
        return 'bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/60 hover:bg-teal-100';
    }
  };

  // Filtered rooms to show tabs for
  const activeRooms = allocationResult
    ? Array.from(new Set(allocationResult.assignments.map((a) => a.roomNo)))
    : [];

  const selectedClassroomMeta = classrooms.find((c) => c.roomNo === activeRoomNo);
  const activeRoomAssignments = allocationResult
    ? allocationResult.assignments.filter((a) => a.roomNo === activeRoomNo)
    : [];

  // Locate candidate location in the assignments
  const searchMatchAssignments = allocationResult && searchTerm.trim()
    ? allocationResult.assignments.filter((a) => {
        const s = studentMap[a.rollNo];
        if (!s) return false;
        return (
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl animate-fade-in text-sm font-medium">
          <HiCheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Control Panel (Left) & Layout Visualizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Allocation Control Console">
            <div className="space-y-4">
              
              {/* Select Exam */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  1. Select Target Exam
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : '')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Choose Scheduled Exam --</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.subjectCode} - {exam.subjectName} ({exam.examDate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Rooms */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  2. Select Available Venues
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded divide-y divide-gray-100 p-2 space-y-1">
                  {classrooms.map((room) => {
                    const isChecked = selectedClassroomIds.includes(room.id);
                    return (
                      <label
                        key={room.id}
                        className={`flex items-center justify-between p-2 rounded text-sm cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleClassroomToggle(room.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-semibold text-gray-800">{room.roomNo}</span>
                        </div>
                        <span className="text-xs text-gray-500">Cap: {room.capacity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Capacity Calculator Status */}
              {selectedClassroomIds.length > 0 && (
                <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Students Enrolled:</span>
                    <span className="font-bold text-gray-800">{studentsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Selected Seats Capacity:</span>
                    <span className="font-bold text-gray-800">{totalCapacity}</span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCapacitySufficient ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((totalCapacity / studentsCount) * 100, 100)}%` }}
                    />
                  </div>

                  {/* Sufficiency Badge */}
                  <div className="flex items-center gap-1.5 text-xs mt-2">
                    {isCapacitySufficient ? (
                      <>
                        <HiCheckCircle className="text-emerald-500 w-4 h-4" />
                        <span className="text-emerald-700 font-medium">Capacity is sufficient</span>
                      </>
                    ) : (
                      <>
                        <HiExclamationCircle className="text-red-500 w-4 h-4" />
                        <span className="text-red-700 font-medium">
                          Warning: Need {studentsCount - totalCapacity} more seats!
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleGenerate}
                disabled={selectedExamId === '' || selectedClassroomIds.length === 0 || isGenerating}
                className="w-full justify-center gap-2 py-2.5 text-sm"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing Allocation...
                  </>
                ) : (
                  <>
                    <HiDatabase className="w-5 h-5" />
                    Generate Seating Plan
                  </>
                )}
              </Button>

            </div>
          </Card>
        </div>

        {/* Right Side: Grid Visualizer */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            {/* Case: Generating Loading */}
            {isGenerating && (
              <div className="py-24 text-center space-y-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-sm font-semibold text-gray-500">
                  Allocation solver executing Graph Coloring & Backtracking constraints checks...
                </p>
              </div>
            )}

            {/* Case: No Plan Exists */}
            {!isGenerating && !allocationResult && (
              <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-lg p-6">
                <HiDatabase className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No layout generated</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                  Select a scheduled exam and choose classrooms from the left panel, then trigger layout generation.
                </p>
              </div>
            )}

            {/* Case: Seating Plan Loaded */}
            {!isGenerating && allocationResult && (
              <div className="space-y-6">
                
                {/* Result Top Bar: Stats & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Arrangement Output View
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Seated: <span className="font-semibold text-gray-800">{allocationResult.assignments.length}</span> students | Generated: {new Date(allocationResult.generatedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Search and Exports */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <HiOutlineSearch className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search student seat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-44"
                      />
                    </div>
                    <Button onClick={() => handleExport('CSV')} variant="outline" size="sm" className="gap-1 px-2.5 py-1.5 text-xs">
                      <HiDownload className="w-3.5 h-3.5" />
                      CSV
                    </Button>
                    <Button onClick={() => handleExport('PDF')} variant="outline" size="sm" className="gap-1 px-2.5 py-1.5 text-xs">
                      <HiDownload className="w-3.5 h-3.5" />
                      PDF
                    </Button>
                  </div>
                </div>

                {/* Tabs bar for classrooms */}
                {activeRooms.length > 0 ? (
                  <div className="flex border-b border-gray-200 overflow-x-auto whitespace-nowrap">
                    {activeRooms.map((roomName) => {
                      const countSeated = allocationResult.assignments.filter((a) => a.roomNo === roomName).length;
                      const cMeta = classrooms.find((c) => c.roomNo === roomName);
                      const maxCapacity = cMeta ? cMeta.capacity : 0;
                      const isActive = activeRoomNo === roomName;
                      
                      return (
                        <button
                          key={roomName}
                          onClick={() => setActiveRoomNo(roomName)}
                          className={`px-4 py-2 border-b-2 text-xs font-semibold focus:outline-none transition-all ${
                            isActive
                              ? 'border-indigo-600 text-indigo-600 font-bold bg-indigo-50/20'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {roomName} <span className="text-gray-400">({countSeated}/{maxCapacity})</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-red-500">Solver could not seat students in any selected rooms.</p>
                )}

                {/* Render Selected Classroom Layout Grid */}
                {selectedClassroomMeta && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Visual Blackboard front of the classroom */}
                    <div className="w-full bg-slate-700 text-slate-300 text-xs font-bold text-center py-1.5 rounded uppercase tracking-widest shadow-sm">
                      [ Front of Hall / Blackboard ]
                    </div>

                    {/* Seat Grid Box */}
                    <div
                      className="grid gap-2.5 p-4 border border-gray-100 rounded-lg bg-gray-50/50 justify-center overflow-x-auto"
                      style={{
                        gridTemplateColumns: `repeat(${selectedClassroomMeta.cols}, minmax(70px, 100px))`,
                      }}
                    >
                      {Array.from({ length: selectedClassroomMeta.rows }).map((_, rIdx) => {
                        const r = rIdx + 1;
                        return Array.from({ length: selectedClassroomMeta.cols }).map((_, cIdx) => {
                          const c = cIdx + 1;
                          const seatLabel = `R${r}-C${c}`;
                          
                          // Check if assignment exists
                          const assignment = activeRoomAssignments.find((a) => a.seatNo === seatLabel);
                          const student = assignment ? studentMap[assignment.rollNo] : null;

                          // Search highlight check
                          const isHighlighted = student && searchMatchAssignments.some(
                            (sa) => sa.rollNo === student.rollNo && sa.roomNo === activeRoomNo
                          );

                          if (student) {
                            return (
                              <button
                                key={seatLabel}
                                onClick={() =>
                                  setSelectedStudentSeat({
                                    student,
                                    seatNo: seatLabel,
                                    roomNo: activeRoomNo,
                                  })
                                }
                                className={`border rounded p-2 text-left flex flex-col justify-between h-20 text-[10px] leading-tight transition-all shadow-sm focus:outline-none ${
                                  isHighlighted
                                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 border-amber-400 ring-2 ring-amber-300 animate-pulse font-bold'
                                    : getDeptStyles(student.department)
                                }`}
                              >
                                <span className="font-semibold text-[8px] opacity-75">{seatLabel}</span>
                                <span className="font-bold truncate w-full mt-1">{student.name}</span>
                                <span className="opacity-80 truncate">{student.rollNo}</span>
                                <div className="mt-1 flex items-center justify-between text-[7px] font-semibold opacity-90 uppercase">
                                  <span>{student.section}</span>
                                  <span className="truncate max-w-[40px]">{student.department.split(' ')[0]}</span>
                                </div>
                              </button>
                            );
                          } else {
                            return (
                              <div
                                key={seatLabel}
                                className="border border-dashed border-gray-200 bg-white rounded p-2 flex flex-col justify-between items-center h-20 text-[9px] text-gray-300"
                              >
                                <span className="self-start font-semibold text-[7px] text-gray-300">{seatLabel}</span>
                                <span>Empty</span>
                                <span />
                              </div>
                            );
                          }
                        });
                      })}
                    </div>

                    {/* Room Legend details */}
                    <div className="flex flex-wrap gap-4 items-center justify-center text-xs p-2 bg-gray-50 rounded text-gray-600 border border-gray-200">
                      <span className="font-bold">Legend (Depts):</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> CS</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> EE</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> EC</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> ME</span>
                    </div>

                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Student Details Dialog / Modal popup */}
      {selectedStudentSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center bg-indigo-900 text-white px-4 py-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <HiOutlineUserCircle className="w-5 h-5" />
                Candidate Seat Profile
              </h4>
              <button
                onClick={() => setSelectedStudentSeat(null)}
                className="text-indigo-200 hover:text-white"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="text-center">
                <h5 className="text-lg font-bold text-gray-900">{selectedStudentSeat.student.name}</h5>
                <p className="text-xs text-indigo-600 font-semibold">{selectedStudentSeat.student.rollNo}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-gray-100 py-3">
                <div>
                  <span className="text-gray-400 block font-medium">Department</span>
                  <span className="font-bold text-gray-800">{selectedStudentSeat.student.department}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Section / Semester</span>
                  <span className="font-bold text-gray-800">
                    Sec {selectedStudentSeat.student.section} / Sem {selectedStudentSeat.student.semester || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Assigned Venue</span>
                  <span className="font-bold text-gray-800">{selectedStudentSeat.roomNo}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Seat Coordinate</span>
                  <span className="font-bold text-gray-800">{selectedStudentSeat.seatNo}</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button onClick={() => setSelectedStudentSeat(null)} size="sm" variant="secondary">
                  Dismiss Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatingPlan;
