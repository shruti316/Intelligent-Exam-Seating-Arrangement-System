import React, { useState, useEffect } from 'react';
import type { Exam } from '../types/Exam';
import examService from '../services/examService';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [validationError, setValidationError] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await examService.getExams();
      setExams(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load examination schedules.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleOpenAddModal = () => {
    setEditingExam(null);
    setSubjectName('');
    setSubjectCode('');
    setExamDate('');
    setStartTime('');
    setEndTime('');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setSubjectName(exam.subjectName);
    setSubjectCode(exam.subjectCode);
    setExamDate(exam.examDate);
    setStartTime(exam.startTime);
    setEndTime(exam.endTime);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleDeleteExam = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this examination? Generated seating plans for this session will be permanently deleted.')) {
      try {
        await examService.deleteExam(id);
        showToast('Examination deleted successfully.');
        loadExams();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete exam.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!subjectName.trim()) return setValidationError('Subject Name is required.');
    if (!subjectCode.trim()) return setValidationError('Subject Code is required.');
    if (!examDate) return setValidationError('Exam Date is required.');
    if (!startTime) return setValidationError('Start Time is required.');
    if (!endTime) return setValidationError('End Time is required.');

    // Time Comparison
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    if (startMinutes >= endMinutes) {
      return setValidationError('End Time must be strictly after Start Time.');
    }

    const calculatedDuration = endMinutes - startMinutes;
    const newExamData = {
      subjectName: subjectName.trim(),
      subjectCode: subjectCode.trim(),
      examDate,
      startTime,
      endTime,
      duration: calculatedDuration
    };

    try {
      if (editingExam) {
        await examService.updateExam(editingExam.id, newExamData);
        showToast('Examination schedule updated successfully.');
      } else {
        await examService.createExam(newExamData);
        showToast('Examination scheduled successfully.');
      }
      setIsModalOpen(false);
      loadExams();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save examination schedule.');
    }
  };

  const columns: Column<Exam>[] = [
    { header: 'Subject Code', key: 'subjectCode' },
    { header: 'Subject Name', key: 'subjectName' },
    { header: 'Date', key: 'examDate' },
    { header: 'Start Time', key: 'startTime' },
    { header: 'End Time', key: 'endTime' },
    { header: 'Duration', key: 'duration', render: (row: Exam) => `${row.duration} mins` },
    {
      header: 'Actions',
      key: 'actions',
      render: (row: Exam) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenEditModal(row)}
            className="text-slate-600 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100 transition"
            title="Edit exam schedule"
          >
            <Edit size={15} />
          </button>
          <button 
            onClick={() => handleDeleteExam(row.id)}
            className="text-slate-600 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition"
            title="Delete exam record"
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

      <Card
        title="Scheduled Examinations"
        actions={
          <Button onClick={handleOpenAddModal} variant="primary" size="sm" className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" />
            Create Exam
          </Button>
        }
      >
        <p className="text-xs text-gray-500">
          These schedules are referenced during automatic seating layout generation.
        </p>
      </Card>

      <Card>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading scheduled exams...</div>
        ) : (
          <Table
            columns={columns}
            data={exams}
            emptyMessage="No examinations scheduled yet."
          />
        )}
      </Card>

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[#E7DDD5] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-slate-50">
              <h3 className="font-semibold text-lg text-slate-800">
                {editingExam ? 'Edit Examination Details' : 'Schedule New Exam'}
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
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-301"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Exam Date</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none transition focus:border-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  {editingExam ? 'Save Changes' : 'Schedule Exam'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Exams;
