import React, { useState, useEffect } from 'react';
import type { Exam } from '../types/Exam';
import type { Classroom } from '../types/Classroom';
import type { Student } from '../types/Student';
import type { AllocationResult } from '../types/AllocationResult';
import examService from '../services/examService';
import classroomService from '../services/classroomService';
import studentService from '../services/studentService';
import allocationService from '../services/allocationService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { HiDatabase, HiCheckCircle } from 'react-icons/hi';

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

  useEffect(() => {
    const loadData = async () => {
      const [examsData, roomsData, studentsData] = await Promise.all([
        examService.getExams(),
        classroomService.getClassrooms(),
        studentService.getStudents()
      ]);
      setExams(examsData);
      setClassrooms(roomsData);
      setStudents(studentsData);
      const map: StudentLookupMap = {};
      studentsData.forEach(s => { map[s.rollNo] = s; });
      setStudentMap(map);
    };
    loadData();
  }, []);

  const handleClassroomToggle = (id: number) => {
    setSelectedClassroomIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedExamId === '' || selectedClassroomIds.length === 0) return;
    setIsGenerating(true);
    const res = await allocationService.generateSeatingPlan(selectedExamId, selectedClassroomIds);
    setAllocationResult(res);
    setIsGenerating(false);
    if (res.success && res.assignments.length > 0) {
      setActiveRoomNo(res.assignments[0].roomNo);
    }
  };

  const activeRooms = allocationResult ? Array.from(new Set(allocationResult.assignments.map(a => a.roomNo))) : [];
  const selectedClassroomMeta = classrooms.find(c => c.roomNo === activeRoomNo);
  const activeRoomAssignments = allocationResult ? allocationResult.assignments.filter(a => a.roomNo === activeRoomNo) : [];

  const getDeptStyles = (dept: string) => {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
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

              <Button onClick={handleGenerate} disabled={!selectedExamId || selectedClassroomIds.length === 0 || isGenerating} className="w-full justify-center gap-2">
                <HiDatabase className="w-5 h-5" />
                Generate Seating Plan
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card>
            {!allocationResult ? (
              <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-lg p-6">
                <HiDatabase className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No layout generated</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Select parameters to trigger layout generation.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {activeRooms.map(roomName => (
                    <button
                      key={roomName}
                      onClick={() => setActiveRoomNo(roomName)}
                      className={`px-4 py-2 border-b-2 text-xs font-semibold ${activeRoomNo === roomName ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' : 'border-transparent text-gray-500'}`}
                    >
                      {roomName}
                    </button>
                  ))}
                </div>

                {selectedClassroomMeta && (
                  <div className="space-y-4">
                    <div className="w-full bg-slate-700 text-slate-300 text-xs font-bold text-center py-1.5 rounded uppercase">
                      [ Front of Hall / Blackboard ]
                    </div>

                    <div
                      className="grid gap-2.5 p-4 border border-gray-100 rounded-lg bg-gray-50/50 justify-center"
                      style={{
                        gridTemplateColumns: `repeat(${selectedClassroomMeta.cols}, minmax(70px, 100px))`,
                      }}
                    >
                      {Array.from({ length: selectedClassroomMeta.rows }).map((_, rIdx) => {
                        const r = rIdx + 1;
                        return Array.from({ length: selectedClassroomMeta.cols }).map((_, cIdx) => {
                          const c = cIdx + 1;
                          const seatLabel = `R${r}-C${c}`;
                          const assignment = activeRoomAssignments.find(a => a.seatNo === seatLabel);
                          const student = assignment ? studentMap[assignment.rollNo] : null;

                          if (student) {
                            return (
                              <div
                                key={seatLabel}
                                className={`border rounded p-2 text-left flex flex-col justify-between h-20 text-[10px] shadow-sm ${getDeptStyles(student.department)}`}
                              >
                                <span className="font-semibold text-[8px] opacity-75">{seatLabel}</span>
                                <span className="font-bold truncate mt-1">{student.name}</span>
                                <span className="opacity-80 truncate">{student.rollNo}</span>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={seatLabel}
                                className="border border-dashed border-gray-200 bg-white rounded p-2 flex flex-col justify-between items-center h-20 text-[9px] text-gray-300"
                              >
                                <span className="self-start font-semibold text-[7px]">{seatLabel}</span>
                                <span>Empty</span>
                                <span />
                              </div>
                            );
                          }
                        });
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
export default SeatingPlan;
