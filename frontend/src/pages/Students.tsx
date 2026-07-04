import React, { useState, useEffect } from 'react';
import type { Student } from '../types/Student';
import studentService from '../services/studentService';
import departmentService from '../services/departmentService';
import type { Department } from '../services/departmentService';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Search, Plus, Upload, Edit, Trash2, X } from 'lucide-react';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [uploadMessage, setUploadMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Form State
  const [rollNo, setRollNo] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [section, setSection] = useState('A');
  const [semester, setSemester] = useState<number>(1);
  const [validationError, setValidationError] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, deptsData] = await Promise.all([
        studentService.getStudents(),
        departmentService.getDepartments()
      ]);
      setStudents(studentsData);
      setDepartments(deptsData);
    } catch (err) {
      console.error(err);
      showToast('Error loading student directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadMessage('Uploading...');
      try {
        const response = await studentService.uploadCSV(file);
        showToast(response.message, 'success');
        loadData();
      } catch (err: any) {
        showToast(err.message || 'CSV upload failed.', 'error');
      } finally {
        setUploadMessage('');
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setRollNo('');
    setFirstName('');
    setLastName('');
    setDepartmentId('');
    setSection('A');
    setSemester(1);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    const matchedDept = departments.find(d => d.department_code === student.department);
    
    setEditingStudent(student);
    setRollNo(student.rollNo);
    // Split name safely
    const nameParts = student.name.split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    setDepartmentId(matchedDept ? matchedDept.department_id : '');
    setSection(student.section || 'A');
    setSemester(student.semester || 1);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        await studentService.deleteStudent(id);
        showToast('Student deleted successfully.');
        loadData();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete student.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!rollNo.trim()) return setValidationError('Roll Number is required.');
    if (!firstName.trim()) return setValidationError('First Name is required.');
    if (departmentId === '') return setValidationError('Please select a department.');
    if (!section.trim()) return setValidationError('Section is required.');
    if (semester < 1 || semester > 8) return setValidationError('Semester must be between 1 and 8.');

    const payload = {
      roll_no: rollNo.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      department_id: Number(departmentId),
      section: section.trim(),
      semester
    };

    try {
      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, payload);
        showToast('Student record updated successfully.');
      } else {
        await studentService.createStudent(payload);
        showToast('New student registered successfully.');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setValidationError(err.message || 'An error occurred.');
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(query) ||
      student.rollNo.toLowerCase().includes(query) ||
      student.department.toLowerCase().includes(query);
      
    if (selectedDeptFilter === 'All') return matchesSearch;
    return matchesSearch && student.department === selectedDeptFilter;
  });

  const departmentsList = ['All', ...Array.from(new Set(students.map(s => s.department)))];

  const columns: Column<Student>[] = [
    { header: 'Roll No', key: 'rollNo' },
    { header: 'Name', key: 'name' },
    { header: 'Department', key: 'department' },
    { header: 'Section', key: 'section' },
    { header: 'Semester', key: 'semester', render: (row: Student) => row.semester ?? 'N/A' },
    {
      header: 'Actions',
      key: 'actions',
      render: (row: Student) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenEditModal(row)}
            className="text-slate-600 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100 transition"
            title="Edit student details"
          >
            <Edit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteStudent(row.id)}
            className="text-slate-600 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition"
            title="Delete student details"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="font-['Manrope',sans-serif] space-y-6">
      
      {/* Toast message container */}
      {toast && (
        <div className="fixed right-8 top-8 z-50 flex items-center gap-3 rounded-2xl border border-[#E7DDD5] bg-white px-5 py-3 shadow-xl animate-in slide-in-from-top-4">
          <span className={`text-xs font-semibold ${toast.type === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}>
            {toast.message}
          </span>
        </div>
      )}

      <Card title="Student Directory Management">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, roll number, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl bg-white text-sm outline-none transition focus:border-indigo-500"
              />
            </div>
            
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none cursor-pointer bg-white text-slate-700"
            >
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleOpenAddModal} className="gap-2 rounded-xl">
              <Plus size={16} />
              Add Student
            </Button>

            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-600 rounded-xl text-indigo-600 hover:bg-indigo-50 text-sm font-semibold transition-colors">
                <Upload className="w-4 h-4" />
                Upload CSV
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {uploadMessage && (
              <span className="text-xs text-indigo-600 font-semibold">{uploadMessage}</span>
            )}
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading student directory...</div>
        ) : (
          <Table
            columns={columns}
            data={filteredStudents}
            emptyMessage="No students match the search query or filters."
          />
        )}
      </Card>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[#E7DDD5] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-slate-50">
              <h3 className="font-semibold text-lg text-slate-800">
                {editingStudent ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {validationError && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100">
                  {validationError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2023CS001"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  disabled={!!editingStudent}
                  className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Academic Department</label>
                <select
                  required
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none cursor-pointer bg-white"
                >
                  <option value="">Select Department...</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_code} — {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Section</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Semester</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={8}
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;
