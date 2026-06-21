import React, { useState, useEffect } from 'react';
import type { Exam } from '../types/Exam';
import examService from '../services/examService';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { HiPlus } from 'react-icons/hi';

export const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(180);

  useEffect(() => {
    const loadExams = async () => {
      const data = await examService.getExams();
      setExams(data);
      setLoading(false);
    };
    loadExams();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectCode.trim() || !examDate || !startTime || !endTime) return;

    const newExamData = {
      subjectName,
      subjectCode,
      examDate,
      startTime,
      endTime,
      duration
    };

    const addedExam = await examService.createExam(newExamData);
    setExams((prev) => [...prev, addedExam]);

    // Reset Form
    setSubjectName('');
    setSubjectCode('');
    setExamDate('');
    setStartTime('');
    setEndTime('');
    setDuration(180);
    setIsCreating(false);
  };

  const columns: Column<Exam>[] = [
    { header: 'Subject Code', accessor: 'subjectCode' },
    { header: 'Subject Name', accessor: 'subjectName' },
    { header: 'Date', accessor: 'examDate' },
    { header: 'Start Time', accessor: 'startTime' },
    { header: 'End Time', accessor: 'endTime' },
    { header: 'Duration', accessor: (row) => `${row.duration} mins` },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Scheduled Examinations"
        headerActions={
          !isCreating && (
            <Button onClick={() => setIsCreating(true)} variant="primary" size="sm" className="gap-2">
              <HiPlus className="w-4 h-4" />
              Create Exam
            </Button>
          )
        }
      >
        {isCreating && (
          <form onSubmit={handleCreateExam} className="p-4 border border-gray-200 rounded bg-gray-50 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Schedule New Examination</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-301"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min={30}
                  max={600}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="block w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setIsCreating(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Schedule Exam
              </Button>
            </div>
          </form>
        )}
        <p className="text-xs text-gray-500 mt-2">
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
            rowKey={(exam) => exam.id}
            emptyMessage="No examinations scheduled yet."
          />
        )}
      </Card>
    </div>
  );
};
export default Exams;
