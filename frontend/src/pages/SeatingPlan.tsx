import React, { useState, useEffect, useMemo } from 'react';
import examService from '../services/examService';
import classroomService from '../services/classroomService';

import allocationService from '../services/allocationService';
import studentService from '../services/studentService';
import registrationService, { type RegisteredStudent } from '../services/registrationService';
import type { Exam } from '../types/Exam';
import type { Classroom } from '../types/Classroom';
import type { Student } from '../types/Student';
import type { AllocationResult } from '../types/AllocationResult';
import ExamRegistrationModal from '../components/exams/ExamRegistrationModal';

import {
  Search,
  Download,
  Database,
  UserCircle2,
  CircleCheck,
  TriangleAlert,
  X,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Info,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  UserPlus
} from "lucide-react";

interface StudentLookupMap {
  [rollNo: string]: Student;
}

export const SeatingPlan: React.FC = () => {
  // --- State Declarations ---
  const [exams, setExams] = useState<Exam[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMap, setStudentMap] = useState<StudentLookupMap>({});
  
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [selectedClassroomIds, setSelectedClassroomIds] = useState<number[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>([]);
  const [occupiedRoomsMap, setOccupiedRoomsMap] = useState<Record<number, any>>({});
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [activeRoomNo, setActiveRoomNo] = useState<string>('');

  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'seat' | 'name' | 'rollNo'>('seat');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [selectedStudentSeat, setSelectedStudentSeat] = useState<{
    student: Student;
    seatNo: string;
    roomNo: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showConsoleHelp, setShowConsoleHelp] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // --- Initial Data Loading ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [examsData, roomsData, studentsData] = await Promise.all([
          examService.getExams(),
          classroomService.getClassrooms(),
          studentService.getStudents(),
        ]);
        setExams(examsData || []);
        setClassrooms(roomsData || []);
        setStudents(studentsData || []);

        const map: StudentLookupMap = {};
        if (studentsData && Array.isArray(studentsData)) {
          studentsData.forEach((s) => {
            if (s && s.rollNo) {
              map[s.rollNo] = s;
            }
          });
        }
        setStudentMap(map);
      } catch (err) {
        console.error('Failed to load initial configuration data', err);
        triggerToast("Failed to connect to data registry services.", "error");
      }
    };
    loadInitialData();
  }, []);

  const selectedExam = useMemo(() => {
    return exams.find((e) => e.id === Number(selectedExamId)) || null;
  }, [exams, selectedExamId]);

  const loadRegisteredStudentsAndAvailability = async (examId: number) => {
    try {
      const [regsData, availData] = await Promise.all([
        registrationService.getRegistrationsByExam(examId),
        classroomService.getClassroomAvailability(examId)
      ]);
      setRegisteredStudents(regsData || []);

      const occMap: Record<number, any> = {};
      if (availData && availData.occupiedClassrooms) {
        availData.occupiedClassrooms.forEach((occ) => {
          occMap[occ.classroomId] = occ.occupiedBy;
        });
      }
      setOccupiedRoomsMap(occMap);

      // Automatically uncheck any room that is occupied by another exam
      setSelectedClassroomIds((prev) => prev.filter((id) => !occMap[id]));
    } catch (err) {
      console.error("Error loading candidate registrations / availability:", err);
    }
  };

  // --- Synchronization & Allocation Loading ---
  useEffect(() => {
    if (selectedExamId !== '') {
      const id = Number(selectedExamId);
      loadRegisteredStudentsAndAvailability(id);

      const fetchExistingPlan = async () => {
        try {
          const result = await allocationService.getGeneratedPlans(id);
          if (result && result.assignments && result.assignments.length > 0) {
            setAllocationResult(result);
            const uniqueRooms = Array.from(new Set(result.assignments.map((a) => a.roomNo)));
            if (uniqueRooms.length > 0) {
              setActiveRoomNo(uniqueRooms[0]);
            }
            // Automatically check classrooms present in the active layout
            const roomIdsToSelect = classrooms
              .filter(r => uniqueRooms.includes(r.roomNo) && !occupiedRoomsMap[r.id])
              .map(r => r.id);
            if (roomIdsToSelect.length > 0) {
              setSelectedClassroomIds(roomIdsToSelect);
            }
          } else {
            setAllocationResult(null);
            setActiveRoomNo('');
          }
        } catch (error) {
          console.error("Error gathering existing layouts:", error);
          setAllocationResult(null);
          setActiveRoomNo('');
        }
      };
      fetchExistingPlan();
    } else {
      setRegisteredStudents([]);
      setOccupiedRoomsMap({});
      setAllocationResult(null);
      setActiveRoomNo('');
      setSelectedClassroomIds([]);
    }
  }, [selectedExamId, classrooms]);

  // --- Core Action Handlers ---
  const handleClassroomToggle = (classroomId: number) => {
    if (occupiedRoomsMap[classroomId]) {
      triggerToast("Classroom is occupied by another exam in this time slot.", "error");
      return;
    }
    setSelectedClassroomIds((prev) =>
      prev.includes(classroomId)
        ? prev.filter((id) => id !== classroomId) 
        : [...prev, classroomId] 
    );
  };

  const handleSelectAllClassrooms = () => {
    const selectable = classrooms.filter((c) => !occupiedRoomsMap[c.id]);
    if (selectedClassroomIds.length === selectable.length) {
      setSelectedClassroomIds([]);
    } else {
      setSelectedClassroomIds(selectable.map((c) => c.id));
    }
  };

  const handleGenerate = async () => {
    if (selectedExamId === "") {
      triggerToast("Please select an examination first.", "error");
      return;
    }

    if (registeredStudents.length === 0) {
      triggerToast("No candidates are registered for this exam. Please enroll students first.", "error");
      setIsRegModalOpen(true);
      return;
    }

    if (selectedClassroomIds.length === 0) {
      triggerToast("Please select at least one classroom.", "error");
      return;
    }

    if (totalCapacity < registeredStudents.length) {
      triggerToast(`Insufficient capacity. Registered: ${registeredStudents.length}, Available: ${totalCapacity}.`, "error");
      return;
    }

    setIsGenerating(true);
    setAllocationResult(null);
    setActiveRoomNo("");

    try {
      const result = await allocationService.generateSeatingPlan(
        Number(selectedExamId),
        selectedClassroomIds
      );

      setAllocationResult(result);

      if (result && result.success) {
        const rooms = [...new Set(result.assignments.map((a) => a.roomNo))];
        if (rooms.length > 0) {
          setActiveRoomNo(rooms[0]);
        }
        triggerToast("Seating plan generated successfully.", "success");
      } else {
        triggerToast(result?.message || "Unable to complete allocation matrix.", "error");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "System error encountered during optimization runtime.", "error");
    } finally {
      setIsGenerating(false);
    }
  };


  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    window.setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const downloadJSON = () => {
    if (!allocationResult) return;
    const blob = new Blob([JSON.stringify(allocationResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seating_plan_exam_${selectedExamId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("JSON seating plan downloaded successfully.", "success");
  };

  const downloadCSV = () => {
    if (!allocationResult) return;
    let csvContent = "Roll Number,Name,Department,Section,Room,Seat No\n";
    allocationResult.assignments.forEach(a => {
      const student = studentMap[a.rollNo];
      const name = student ? student.name : '';
      const dept = student ? student.department : '';
      const sec = student ? student.section : '';
      csvContent += `"${a.rollNo}","${name}","${dept}","${sec}","${a.roomNo}","${a.seatNo}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seating_plan_exam_${selectedExamId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("CSV seating plan exported successfully.", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSort = (field: 'seat' | 'name' | 'rollNo') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // --- Computational Selectors / Memoizations ---
  const totalCapacity = useMemo(() => {
    return classrooms
      .filter((room) => selectedClassroomIds.includes(room.id))
      .reduce((sum, room) => sum + room.capacity, 0);
  }, [classrooms, selectedClassroomIds]);

  const studentsCount = registeredStudents.length;
  const utilization = totalCapacity === 0 ? 0 : Math.round((studentsCount / totalCapacity) * 100);
  const isCapacitySufficient = studentsCount > 0 && totalCapacity >= studentsCount;

  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    students.forEach(s => {
      if (s.department) depts.add(s.department);
    });
    return ['All', ...Array.from(depts)];
  }, [students]);


  const getDeptStyles = (department: string) => {
    switch (department?.toLowerCase()) {
      case "computer science":
      case "cse":
        return "bg-[#EBDCF6] text-[#6B3FA0] border border-[#DCC6EE]";
      case "electrical engineering":
      case "ee":
        return "bg-[#DCEAF6] text-[#2F6E99] border border-[#C8DCEC]";
      case "electronics & communication":
      case "ece":
        return "bg-[#DCEBD8] text-[#4E7450] border border-[#CFE2CA]";
      case "mechanical engineering":
      case "me":
        return "bg-[#F5E5D4] text-[#A26739] border border-[#EAD5BF]";
      default:
        return "bg-[#EEE8E2] text-[#666666] border border-[#DDD6CF]";
    }
  };

  const activeRooms = useMemo(() => {
    if (!allocationResult) return [];
    return [...new Set(allocationResult.assignments.map((a) => a.roomNo))];
  }, [allocationResult]);

  const activeRoomAssignments = useMemo(() => {
    if (!allocationResult) return [];
    return allocationResult.assignments.filter(
      (assignment) => assignment.roomNo === activeRoomNo
    );
  }, [allocationResult, activeRoomNo]);

  // Comprehensive transformation combining search filters, custom tags, sorting matrices
  const processedAssignments = useMemo(() => {
    let result = [...activeRoomAssignments];

    // Filter by query strings
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter((assignment) => {
        const student = studentMap[assignment.rollNo];
        if (!student) return false;
        return (
          student.name.toLowerCase().includes(query) ||
          student.rollNo.toLowerCase().includes(query) ||
          assignment.seatNo.toLowerCase().includes(query)
        );
      });
    }

    // Filter by high-level academic fields
    if (departmentFilter !== 'All') {
      result = result.filter((assignment) => {
        const student = studentMap[assignment.rollNo];
        return student?.department === departmentFilter;
      });
    }

    // Sorting Engine execution
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'seat') {
        comparison = a.seatNo.localeCompare(b.seatNo, undefined, { numeric: true, sensitivity: 'base' });
      } else {
        const sA = studentMap[a.rollNo];
        const sB = studentMap[b.rollNo];
        if (sA && sB) {
          if (sortBy === 'name') comparison = sA.name.localeCompare(sB.name);
          if (sortBy === 'rollNo') comparison = sA.rollNo.localeCompare(sB.rollNo);
        }
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [activeRoomAssignments, searchTerm, departmentFilter, sortBy, sortOrder, studentMap]);

  return (
    <div className="font-['Manrope',sans-serif] space-y-10 pb-24 text-[#222222]">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed right-8 top-8 z-50 flex items-center gap-3.5 rounded-2xl border border-[#E7DDD5] bg-white px-6 py-4 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          {toastType === 'success' && <CircleCheck size={18} className="text-[#6E8E68]" />}
          {toastType === 'error' && <TriangleAlert size={18} className="text-[#C76F6F]" />}
          {toastType === 'info' && <Info size={18} className="text-[#2F6E99]" />}
          <span className="text-sm font-medium text-[#222222] tracking-tight">
            {toastMessage}
          </span>
        </div>
      )}

      {/* Main Structural Breakdown Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* ====================== LEFT CONSOLE BAR WORKSPACE (4 COLS) ====================== */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="rounded-3xl border border-[#E7DDD5] bg-white p-8 shadow-sm">
            <div className="mb-8 relative">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666]">
                  Configuration Core
                </p>
                <button 
                  onClick={() => setShowConsoleHelp(!showConsoleHelp)}
                  className="text-[#666666] hover:text-[#222222] p-1 rounded-full hover:bg-[#FAF8F5] transition"
                  title="Show console info"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <h2 className="mt-2 font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#222222] tracking-tight">
                Allocation Console
              </h2>
              
              {showConsoleHelp && (
                <div className="mt-4 text-xs bg-[#FAF8F5] p-4 rounded-xl border border-[#E7DDD5] text-[#666666] space-y-2 animate-in fade-in duration-200">
                  <p className="font-semibold text-[#222222]">How to allocate slots:</p>
                  <p>1. Target specific scheduling tracks from the active examination options dropdown.</p>
                  <p>2. Toggle physical parameters via room listings checkboxes to increment total available desks volume.</p>
                  <p>3. Initialize alignment optimization execution pipelines via the primary button interface.</p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Exam Selection Block */}
              <div>
                <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[#666666]">
                  Active Examination
                </label>
                <div className="relative">
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full appearance-none rounded-2xl border border-[#E7DDD5] bg-[#FAF8F5] px-4 py-3.5 text-sm text-[#222222] outline-none transition-all focus:border-[#222222] focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="">Select Examination Event...</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.subjectCode} — {exam.subjectName}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l border-[#E7DDD5] pl-3 text-[#666666]">
                    <Layers size={14} />
                  </div>
                </div>

                {/* Candidate Enrollment Status for Selected Exam */}
                {selectedExamId !== '' && (
                  <div className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#ECE4DD] animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs">
                      <Users size={15} className={registeredStudents.length > 0 ? "text-[#2F6E99]" : "text-amber-600"} />
                      <span>
                        {registeredStudents.length > 0 ? (
                          <><strong className="text-[#2D2825] font-bold">{registeredStudents.length}</strong> candidates enrolled</>
                        ) : (
                          <span className="text-amber-700 font-semibold">0 candidates enrolled</span>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRegModalOpen(true)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus size={12} />
                      {registeredStudents.length > 0 ? "Manage" : "Enroll Now"}
                    </button>
                  </div>
                )}
              </div>

              {/* Room Selection Block */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                    Target Classrooms Registry
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllClassrooms}
                    className="text-xs font-medium text-[#666666] hover:text-[#222222] transition underline underline-offset-4 decoration-[#E7DDD5]"
                  >
                    {selectedClassroomIds.length === classrooms.filter(c => !occupiedRoomsMap[c.id]).length && selectedClassroomIds.length > 0
                      ? "Deselect All" 
                      : "Select All Available"}
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1.5 border border-[#E7DDD5] p-3 rounded-2xl bg-[#FAF8F5]/50 custom-scrollbar">
                  {classrooms.length === 0 ? (
                    <p className="text-xs text-[#666666] text-center py-6">No classrooms registered in database.</p>
                  ) : (
                    classrooms.map((room) => {
                      const isChecked = selectedClassroomIds.includes(room.id);
                      const occupied = occupiedRoomsMap[room.id];

                      if (occupied) {
                        return (
                          <div
                            key={room.id}
                            className="flex flex-col gap-1 rounded-xl border border-rose-200 bg-rose-50/60 p-3 select-none opacity-80 cursor-not-allowed"
                            title={`Room is occupied by ${occupied.subjectName || occupied.examName} (${occupied.startTime} - ${occupied.endTime})`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <TriangleAlert size={14} className="text-rose-600 flex-shrink-0" />
                                <p className="text-xs font-bold text-rose-800">
                                  Hall {room.roomNo}
                                </p>
                              </div>
                              <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100/80 px-2 py-0.5 rounded">
                                Conflicted
                              </span>
                            </div>
                            <p className="text-[11px] text-rose-700 pl-6">
                              Occupied by "{occupied.subjectName || occupied.examName}" ({occupied.startTime}–{occupied.endTime})
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={room.id}
                          onClick={() => handleClassroomToggle(room.id)}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all duration-200 select-none
                          ${isChecked ? "border-[#222222] bg-white shadow-xs font-medium" : "border-[#E7DDD5] bg-[#FAF8F5] hover:bg-white"}`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-all ${isChecked ? 'border-[#222222] bg-[#222222] text-white' : 'border-[#CBB9AB] bg-white'}`}>
                              {isChecked && <CheckCircle2 size={11} strokeWidth={3} />}
                            </div>
                            <div>
                              <p className={`text-sm tracking-tight ${isChecked ? 'text-[#222222] font-semibold' : 'text-[#666666]'}`}>
                                Hall {room.roomNo}
                              </p>
                              <p className="text-[11px] text-[#666666] mt-0.5">
                                Base capacity: <span className="font-mono">{room.capacity}</span> units
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono text-[#666666] bg-[#F3F0EC] px-2 py-0.5 rounded-md">
                            C-{room.capacity}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>


              {/* Advanced Realtime Metrics Display Panel */}
              {selectedClassroomIds.length > 0 && (
                <div className="rounded-2xl border border-[#E7DDD5] bg-[#FAF8F5] p-5 space-y-4 animate-in fade-in duration-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] border-b border-[#E7DDD5] pb-2">
                    Allocation Strategy Matrix
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] uppercase text-[#666666] block">Total Inbound</span>
                      <span className="text-xl font-bold text-[#222222] tracking-tight">{studentsCount} candidates</span>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase text-[#666666] block">Space Bound</span>
                      <span className="text-xl font-bold text-[#222222] tracking-tight">{totalCapacity} desks</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-[#666666]">Density Coefficients</span>
                      <span className="font-bold text-[#222222] font-mono">{utilization}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#E7DDD5]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${isCapacitySufficient ? "bg-[#222222]" : "bg-[#C76F6F]"}`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                    
                    <div className="mt-3.5 flex items-start gap-2.5 rounded-xl bg-white p-3 border border-[#E7DDD5] text-xs">
                      {isCapacitySufficient ? (
                        <>
                          <CircleCheck size={15} className="text-[#6E8E68] mt-0.5 flex-shrink-0" />
                          <p className="text-[#666666] leading-relaxed">
                            <strong className="text-[#222222]">Sufficient space configuration.</strong> Surplus margin yields <span className="font-mono font-semibold">{totalCapacity - studentsCount}</span> floating buffer positions.
                          </p>
                        </>
                      ) : (
                        <>
                          <TriangleAlert size={15} className="text-[#C76F6F] mt-0.5 flex-shrink-0" />
                          <p className="text-[#666666] leading-relaxed">
                            <strong className="text-[#C76F6F]">Insufficient workspace limits.</strong> Expand layout parameter selection to resolve a deficit of <span className="font-mono font-bold text-[#C76F6F]">{studentsCount - totalCapacity}</span> desks.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={selectedExamId === "" || selectedClassroomIds.length === 0 || isGenerating || !isCapacitySufficient}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#222222] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        Processing Matrices...
                      </>
                    ) : (
                      <>
                        <Database size={14} />
                        Run Spatial Optimization
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Subtle Institutional Context Card */}
          <div className="rounded-3xl bg-[#F3F0EC] border border-[#E7DDD5] p-6 text-xs text-[#666666] leading-relaxed space-y-2">
            <p className="font-bold text-[#222222] tracking-wide uppercase text-[9px]">Continuous Enforcement Parameters</p>
            <p>Seating modules generate staggered alignments matching multi-disciplinary balancing to control student visibility profiles and minimize overlapping subject proximity footprints.</p>
          </div>
        </div>

        {/* ====================== RIGHT WORKSPACE ENGINE DISPLAY PANEL (8 COLS) ====================== */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-[#E7DDD5] bg-white p-8 shadow-sm min-h-[calc(100vh-10rem)] flex flex-col">
            
            {/* 1. Core Logic Loader Processing Indicator */}
            {isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center py-40">
                <div className="mb-6 h-10 w-10 animate-spin rounded-full border-2 border-[#E7DDD5] border-t-[#222222]" />
                <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#222222]">
                  Computing Structural Allocations
                </h3>
                <p className="mt-2 text-sm text-[#666666] max-w-xs text-center leading-relaxed">
                  Staggering candidate keys across designated grid systems to balance density indices...
                </p>
              </div>
            )}

            {/* 2. Empty Block Baseline Scenario */}
            {!isGenerating && !allocationResult && (
              <div className="flex-1 flex flex-col items-center justify-center py-40 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#E7DDD5]">
                  <SlidersHorizontal size={24} className="text-[#666666]" />
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#222222]">
                  No Allocation Record Loaded
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#666666]">
                  Select an examination event and activate registry parameters from the left terminal configuration block to map layouts.
                </p>
              </div>
            )}

            {/* 3. Validated Render Stream */}
            {!isGenerating && allocationResult && (
              <div className="space-y-8 flex-1 flex flex-col">
                
                {/* Upper Interface Toolbar Block */}
                <div className="flex flex-col gap-6 border-b border-[#E7DDD5] pb-6 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666]">
                      Active Optimization Output
                    </p>
                    <h2 className="mt-1 font-['Cormorant_Garamond',serif] text-4xl font-bold text-[#222222] tracking-tight">
                      Seating Framework
                    </h2>
                    <p className="mt-1 text-xs text-[#666666]">
                      Resolved mapping for <span className="font-semibold text-[#222222]">{allocationResult.assignments.length} candidates</span> across active institutional properties.
                    </p>
                  </div>

                  {/* Actions & Live Filter Control Bars */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]" />
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Filter by identifier/name..."
                        className="w-52 rounded-xl border border-[#E7DDD5] bg-[#FAF8F5] py-2 pl-9 pr-3.5 text-xs outline-none transition focus:border-[#222222] focus:bg-white"
                      />
                    </div>
                    
                    {/* Department Filtering Selector */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#E7DDD5] bg-[#FAF8F5] px-2.5 py-1.5">
                      <Filter size={12} className="text-[#666666]" />
                      <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="bg-transparent text-xs font-medium text-[#666666] outline-none cursor-pointer"
                      >
                        {departmentsList.map(dept => (
                          <option key={dept} value={dept}>{dept === 'All' ? 'All Depts' : dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Zoom Controls */}
                    {viewMode === 'grid' && (
                      <div className="flex items-center gap-0.5 rounded-xl border border-[#E7DDD5] p-0.5 bg-[#FAF8F5]">
                        <button
                          onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.6))}
                          className="p-1.5 rounded-lg text-[#666666] hover:text-[#222222] hover:bg-white hover:shadow-xs transition-all"
                          title="Zoom Out"
                        >
                          <ZoomOut size={13} />
                        </button>
                        <span className="text-[10px] font-bold font-mono text-[#666666] px-1.5 select-none min-w-[34px] text-center">
                          {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                          onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.4))}
                          className="p-1.5 rounded-lg text-[#666666] hover:text-[#222222] hover:bg-white hover:shadow-xs transition-all"
                          title="Zoom In"
                        >
                          <ZoomIn size={13} />
                        </button>
                        <button
                          onClick={() => setZoomLevel(1.0)}
                          className="p-1.5 rounded-lg text-[#666666] hover:text-[#222222] hover:bg-white hover:shadow-xs transition-all border-l border-[#E7DDD5] rounded-l-none"
                          title="Reset Zoom"
                        >
                          <Maximize2 size={13} />
                        </button>
                      </div>
                    )}

                    {/* Layout Toggles */}
                    <div className="flex items-center gap-0.5 rounded-xl border border-[#E7DDD5] p-0.5 bg-[#FAF8F5]">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-xs text-[#222222]' : 'text-[#666666] hover:text-[#222222]'}`}
                        title="Matrix Grid View"
                      >
                        <LayoutGrid size={13} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-xs text-[#222222]' : 'text-[#666666] hover:text-[#222222]'}`}
                        title="Tabular List View"
                      >
                        <List size={13} />
                      </button>
                    </div>

                    {/* Export Formats */}
                    <button 
                      onClick={downloadCSV} 
                      className="flex items-center gap-1.5 rounded-xl border border-[#E7DDD5] bg-white px-3 py-2 text-xs font-semibold text-[#222222] transition hover:bg-[#FAF8F5]"
                      title="Export CSV Seating Layout"
                    >
                      <Download size={13} /> <span className="hidden sm:inline">Export CSV</span>
                    </button>
                    <button 
                      onClick={downloadJSON} 
                      className="flex items-center gap-1.5 rounded-xl border border-[#E7DDD5] bg-white px-3 py-2 text-xs font-semibold text-[#222222] transition hover:bg-[#FAF8F5]"
                      title="Download JSON Seating Layout"
                    >
                      <Download size={13} /> <span className="hidden sm:inline">Download JSON</span>
                    </button>
                    <button 
                      onClick={handlePrint} 
                      className="flex items-center gap-1.5 rounded-xl border border-[#E7DDD5] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#222222] transition hover:bg-[#E7DDD5]"
                      title="Print Seating Layout"
                    >
                      <List size={13} /> <span className="hidden sm:inline">Print Layout</span>
                    </button>
                  </div>
                </div>

                {/* Internal Location Tabs Subbar */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] block">
                    Active Physical Compound
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {activeRooms.map((roomName) => {
                      const roomObj = classrooms.find((r) => r.roomNo === roomName);
                      const headcount = allocationResult.assignments.filter((a) => a.roomNo === roomName).length;
                      const isTabActive = roomName === activeRoomNo;

                      return (
                        <button
                          key={roomName}
                          type="button"
                          onClick={() => {
                            setActiveRoomNo(roomName);
                            setSelectedStudentSeat(null);
                          }}
                          className={`rounded-xl border px-4 py-2.5 text-left transition-all duration-200 ${
                            isTabActive
                              ? "border-[#222222] bg-[#222222] text-white shadow-sm"
                              : "border-[#E7DDD5] bg-white text-[#222222] hover:border-[#222222]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold tracking-tight">Hall {roomName}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isTabActive ? "bg-white/15 text-white" : "bg-[#FAF8F5] text-[#666666]"}`}>
                              {headcount}/{roomObj?.capacity || 0}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-Legend Block Component */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#666666] bg-[#FAF8F5] p-3 rounded-xl border border-[#E7DDD5]">
                  <span className="font-semibold text-[#222222]">Academic Tracks Legend:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#6B3FA0]" /> <span>Comp. Science</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#2F6E99]" /> <span>Electrical</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#4E7450]" /> <span>Electronics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#A26739]" /> <span>Mechanical</span>
                  </div>
                </div>

                {/* Data Matrix Workspace Viewports */}
                <div className="flex-1">
                  {processedAssignments.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-[#E7DDD5] rounded-2xl bg-[#FAF8F5]/30">
                      <p className="text-sm text-[#666666]">No candidate matrices match the selected structural filters.</p>
                      <button 
                        onClick={() => { setSearchTerm(''); setDepartmentFilter('All'); }} 
                        className="mt-3 text-xs text-[#222222] font-semibold underline underline-offset-4"
                      >
                        Reset active lookup filters
                      </button>
                    </div>
                  ) : viewMode === 'grid' ? (
                    /* Display 2D Spatial Layout Grid of Classroom */
                    (() => {
                      const activeRoomObj = classrooms.find((r) => r.roomNo === activeRoomNo);
                      const rows = activeRoomObj?.rows || 6;
                      const cols = activeRoomObj?.cols || 6;

                      const getAssignmentAt = (r: number, c: number) => {
                        return activeRoomAssignments.find((a) => {
                          const label1 = `R${r}C${c}`;
                          const label2 = `R${r}-C${c}`;
                          return a.seatNo === label1 || a.seatNo === label2;
                        });
                      };

                      const checkIsMatch = (rollNo: string) => {
                        const student = studentMap[rollNo];
                        if (!student) return false;
                        if (searchTerm.trim()) {
                          const query = searchTerm.toLowerCase();
                          const matchesName = student.name.toLowerCase().includes(query);
                          const matchesRoll = student.rollNo.toLowerCase().includes(query);
                          if (!matchesName && !matchesRoll) return false;
                        }
                        if (departmentFilter !== 'All') {
                          if (student.department !== departmentFilter) return false;
                        }
                        return true;
                      };

                      return (
                        <div className="overflow-auto border border-[#E7DDD5] rounded-3xl bg-[#FAF8F5]/30 p-6 custom-scrollbar">
                          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100 / zoomLevel}%` }}>
                            <div 
                              className="grid gap-3.5"
                              style={{
                                gridTemplateColumns: `repeat(${cols}, minmax(130px, 1fr))`
                              }}
                            >
                              {Array.from({ length: rows }).map((_, rIdx) => {
                                const r = rIdx + 1;
                                return Array.from({ length: cols }).map((_, cIdx) => {
                                  const c = cIdx + 1;
                                  const assignment = getAssignmentAt(r, c);
                                  const candidate = assignment ? studentMap[assignment.rollNo] : null;

                                  if (assignment && candidate) {
                                    const matched = checkIsMatch(candidate.rollNo);
                                    const isInspected = selectedStudentSeat?.student.rollNo === candidate.rollNo;

                                    return (
                                      <div
                                        key={`r${r}c${c}`}
                                        onClick={() => setSelectedStudentSeat({ 
                                          student: candidate, 
                                          seatNo: assignment.seatNo, 
                                          roomNo: assignment.roomNo 
                                        })}
                                        className={`group cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between h-28 select-none
                                        ${isInspected 
                                          ? "border-[#222222] bg-white ring-1 ring-[#222222] shadow-sm" 
                                          : "border-[#E7DDD5] bg-white hover:border-[#222222] hover:shadow-xs"}
                                        ${!matched ? 'opacity-25 filter blur-[0.5px] hover:opacity-100 hover:filter-none transition-all' : ''}`}
                                        title={`${candidate.name} (${candidate.rollNo}) - Seat R${r}-C${c}`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-[8px] font-bold tracking-wider text-[#8A7E76] uppercase">R{r}-C{c}</span>
                                          <span className="rounded bg-[#FAF8F5] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#222222] border border-[#E7DDD5] shadow-2xs">
                                            {assignment.seatNo}
                                          </span>
                                        </div>
                                        
                                        <div className="my-1.5 truncate">
                                          <p className="truncate text-xs font-bold text-[#222222]" title={candidate.name}>
                                            {candidate.name}
                                          </p>
                                          <p className="text-[9px] text-[#666666] font-mono mt-0.5">
                                            {candidate.rollNo}
                                          </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-1 border-t border-[#E7DDD5]/60 pt-1.5">
                                          <span className={`inline-block truncate rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-tight max-w-[70%] ${getDeptStyles(candidate.department)}`}>
                                            {candidate.department}
                                          </span>
                                          <span className="text-[8px] font-bold font-mono text-[#8A7E76]">
                                            Sec-{candidate.section || 'A'}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div
                                        key={`r${r}c${c}`}
                                        className="rounded-2xl border border-dashed border-[#E7DDD5] bg-[#FAF8F5]/40 flex flex-col items-center justify-center h-28 text-center select-none"
                                      >
                                        <span className="text-[8px] font-bold text-[#C5BDB5] uppercase tracking-wider">R{r}-C{c}</span>
                                        <span className="text-[10px] font-medium text-[#C5BDB5] mt-1.5">Empty Desk</span>
                                      </div>
                                    );
                                  }
                                });
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* Display List View Variant */
                    <div className="overflow-x-auto border border-[#E7DDD5] rounded-2xl bg-white shadow-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAF8F5] border-b border-[#E7DDD5] text-[#666666] text-[11px] uppercase tracking-wider font-bold">
                            <th className="py-3.5 px-4 cursor-pointer hover:bg-[#F3F0EC] transition" onClick={() => toggleSort('seat')}>
                              <div className="flex items-center gap-1.5">Seat No <ArrowUpDown size={11} /></div>
                            </th>
                            <th className="py-3.5 px-4 cursor-pointer hover:bg-[#F3F0EC] transition" onClick={() => toggleSort('name')}>
                              <div className="flex items-center gap-1.5">Candidate Name <ArrowUpDown size={11} /></div>
                            </th>
                            <th className="py-3.5 px-4 cursor-pointer hover:bg-[#F3F0EC] transition" onClick={() => toggleSort('rollNo')}>
                              <div className="flex items-center gap-1.5">Roll Number <ArrowUpDown size={11} /></div>
                            </th>
                            <th className="py-3.5 px-4">Academic Department</th>
                            <th className="py-3.5 px-4 text-center">Section</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7DDD5] text-xs">
                          {processedAssignments.map((assignment, index) => {
                            const candidate = studentMap[assignment.rollNo];
                            if (!candidate) return null;
                            const isInspected = selectedStudentSeat?.student.rollNo === candidate.rollNo;

                            return (
                              <tr 
                                key={index}
                                onClick={() => setSelectedStudentSeat({ 
                                  student: candidate, 
                                  seatNo: assignment.seatNo, 
                                  roomNo: assignment.roomNo 
                                })}
                                className={`cursor-pointer transition-colors ${isInspected ? 'bg-[#F3F0EC]/60 font-medium' : 'hover:bg-[#FAF8F5]/60'}`}
                              >
                                <td className="py-3 px-4 font-mono font-bold text-[#222222]">{assignment.seatNo}</td>
                                <td className="py-3 px-4 font-semibold text-[#222222]">{candidate.name}</td>
                                <td className="py-3 px-4 font-mono text-[#666666]">{candidate.rollNo}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getDeptStyles(candidate.department)}`}>
                                    {candidate.department}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center font-mono text-[#666666]">{candidate.section || 'N/A'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* ================= DETAILED SIDE INSPECTOR DRAWER OVERLAY ================= */}
      {selectedStudentSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#222222]/15 p-4 backdrop-blur-xs transition-all duration-300">
          <div className="w-full max-w-sm h-full max-h-[640px] overflow-hidden rounded-3xl border border-[#E7DDD5] bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right-6 duration-300">
            
            {/* Inspector Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E7DDD5] px-6 py-5 bg-[#FAF8F5]">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#666666]">
                  Candidate Dossier
                </p>
                <h4 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#222222] mt-0.5">
                  Spatial Mapping Inspector
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentSeat(null)}
                className="rounded-full p-2 text-[#666666] transition hover:bg-[#E7DDD5] hover:text-[#222222]"
              >
                <X size={15} />
              </button>
            </div>

            {/* Profile Graphic Elements */}
            <div className="p-6 text-center border-b border-[#E7DDD5] flex-1 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F0EC] border border-[#E7DDD5]">
                <UserCircle2 size={28} className="text-[#222222]" />
              </div>
              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#222222] tracking-tight">
                  {selectedStudentSeat.student.name}
                </h2>
                <p className="text-xs font-mono text-[#666666] mt-1 bg-[#FAF8F5] inline-block px-2.5 py-1 rounded-md border border-[#E7DDD5]">
                  {selectedStudentSeat.student.rollNo}
                </p>
              </div>

              {/* Parametrization Specifications Fields Grid */}
              <div className="space-y-2.5 pt-2 text-left">
                
                <div className="flex justify-between items-center rounded-xl bg-[#FAF8F5] px-4 py-3 border border-[#E7DDD5]">
                  <span className="text-xs text-[#666666]">Department Registry</span>
                  <span className="text-xs font-bold text-[#222222] text-right max-w-[60%] truncate">
                    {selectedStudentSeat.student.department}
                  </span>
                </div>

                <div className="flex justify-between items-center rounded-xl bg-[#FAF8F5] px-4 py-3 border border-[#E7DDD5]">
                  <span className="text-xs text-[#666666]">Section Component</span>
                  <span className="text-xs font-mono font-bold text-[#222222]">
                    {selectedStudentSeat.student.section || "A"}
                  </span>
                </div>

                <div className="flex justify-between items-center rounded-xl bg-[#FAF8F5] px-4 py-3 border border-[#E7DDD5]">
                  <span className="text-xs text-[#666666]">Semester Level</span>
                  <span className="text-xs font-mono font-bold text-[#222222]">
                    {selectedStudentSeat.student.semester ?? "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center rounded-xl bg-[#FAF8F5] px-4 py-3 border border-[#E7DDD5]">
                  <span className="text-xs text-[#666666]">Assigned Enclosure</span>
                  <span className="text-xs font-bold text-[#222222]">
                    Hall {selectedStudentSeat.roomNo}
                  </span>
                </div>

                <div className="flex justify-between items-center rounded-xl bg-[#EBCFD2]/20 px-4 py-3.5 border border-[#EBCFD2] mt-4 shadow-2xs">
                  <span className="text-xs font-semibold text-[#222222]">Target Safe Seat Descriptor</span>
                  <span className="text-sm font-mono font-bold text-[#222222] bg-white px-2.5 py-0.5 rounded border border-[#EBCFD2]">
                    {selectedStudentSeat.seatNo}
                  </span>
                </div>

              </div>
            </div>

            {/* Modal Bottom Verification Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E7DDD5] flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedStudentSeat(null)}
                className="w-full text-center rounded-xl bg-[#222222] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition"
              >
                Dismiss Verification Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Candidate Enrollment Modal */}
      {isRegModalOpen && selectedExam && (
        <ExamRegistrationModal
          exam={selectedExam}
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          onRegistrationChange={() => {
            if (selectedExamId !== '') {
              loadRegisteredStudentsAndAvailability(Number(selectedExamId));
            }
          }}
        />
      )}

    </div>
  );
};

export default SeatingPlan;
 