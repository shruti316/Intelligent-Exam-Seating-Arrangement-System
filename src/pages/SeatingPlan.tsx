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
import { HiDatabase, HiOutlineSearch, HiOutlineUserCircle, HiX } from 'react-icons/hi';

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
  const [selectedStudentSeat, setSelectedStudentSeat] = useState<{ student: Student; seatNo: string; roomNo: string } | null>(null);

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

  const searchMatchAssignments = allocationResult && searchTerm.trim()
    ? allocationResult.assignments.filter(a => {
        const s = studentMap[a.rollNo];
        return s && (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()));
      })
    : [];

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
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-xs text-gray-500">Seated: {allocationResult.assignments.length}</span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search student seat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-44"
                    />
                  </div>
                </div>

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

                          const isHighlighted = student && searchMatchAssignments.some(sa => sa.rollNo === student.rollNo && sa.roomNo === activeRoomNo);

                          if (student) {
                            return (
                              <button
                                key={seatLabel}
                                onClick={() => setSelectedStudentSeat({ student, seatNo: seatLabel, roomNo: activeRoomNo })}
                                className={`border rounded p-2 text-left flex flex-col justify-between h-20 text-[10px] shadow-sm focus:outline-none ${isHighlighted ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300 animate-pulse font-bold' : getDeptStyles(student.department)}`}
                              >
                                <span className="font-semibold text-[8px] opacity-75">{seatLabel}</span>
                                <span className="font-bold truncate mt-1">{student.name}</span>
                                <span className="opacity-80 truncate">{student.rollNo}</span>
                              </button>
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

      {selectedStudentSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center bg-indigo-900 text-white px-4 py-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <HiOutlineUserCircle className="w-5 h-5" />
                Candidate Seat Profile
              </h4>
              <button onClick={() => setSelectedStudentSeat(null)} className="text-indigo-200 hover:text-white">
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
                  <span className="text-gray-400 block">Department</span>
                  <span className="font-bold text-gray-800">{selectedStudentSeat.student.department}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Section</span>
                  <span className="font-bold text-gray-800">{selectedStudentSeat.student.section}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setSelectedStudentSeat(null)} size="sm" variant="secondary">Dismiss Profile</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SeatingPlan;
