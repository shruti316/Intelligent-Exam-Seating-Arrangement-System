import React, { useState, useEffect } from 'react';
import type { Exam } from '../types/Exam';
import type { Classroom } from '../types/Classroom';
import examService from '../services/examService';
import classroomService from '../services/classroomService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { HiDatabase } from 'react-icons/hi';

export const SeatingPlan: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassroomIds, setSelectedClassroomIds] = useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [examsData, roomsData] = await Promise.all([
        examService.getExams(),
        classroomService.getClassrooms()
      ]);
      setExams(examsData);
      setClassrooms(roomsData);
    };
    loadData();
  }, []);

  const handleClassroomToggle = (id: number) => {
    setSelectedClassroomIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card title="Allocation Control Console">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  1. Select Target Exam
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : '')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                >
                  <option value="">-- Choose Scheduled Exam --</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.subjectCode} - {exam.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  2. Select Available Venues
                </label>
                <div className="border border-gray-200 rounded p-2 space-y-1">
                  {classrooms.map((room) => (
                    <label key={room.id} className="flex items-center gap-2 p-1 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedClassroomIds.includes(room.id)}
                        onChange={() => handleClassroomToggle(room.id)}
                      />
                      <span>{room.roomNo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button disabled={!selectedExamId || selectedClassroomIds.length === 0} className="w-full justify-center gap-2">
                <HiDatabase className="w-5 h-5" />
                Generate Seating Plan
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card>
            <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-lg p-6">
              <HiDatabase className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No layout generated</h3>
              <p className="mt-1 text-xs text-gray-500">
                Select parameters to trigger layout generation.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default SeatingPlan;
