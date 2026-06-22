import type { AllocationResult } from '../types/AllocationResult';
import type { SeatAssignment } from '../types/SeatAssignment';
import studentService from './studentService';
import classroomService from './classroomService';

export const mockAllocationResults: Record<number, AllocationResult> = {};

export const allocationService = {
  async generateSeatingPlan(examId: number, classroomIds: number[]): Promise<AllocationResult> {
    // Future integration code:
    // const response = await api.post<AllocationResult>('/allocation/generate', { examId, classroomIds });
    // return response.data;
    
    console.log(`API Trigger: Generating plan for exam ID ${examId} in classrooms ${classroomIds}`);
    
    const students = await studentService.getStudents();
    const allClassrooms = await classroomService.getClassrooms();
    const selectedClassrooms = allClassrooms.filter((c) => classroomIds.includes(c.id));

    if (selectedClassrooms.length === 0) {
      return {
        examId,
        generatedAt: new Date().toISOString(),
        success: false,
        message: 'No classrooms selected for allocation.',
        assignments: [],
      };
    }

    // Interleave students by department to satisfy adjacent seating constraints
    const deptGroups: Record<string, typeof students> = {};
    students.forEach((student) => {
      if (!deptGroups[student.department]) {
        deptGroups[student.department] = [];
      }
      deptGroups[student.department].push(student);
    });

    const interleavedStudents: typeof students = [];
    const depts = Object.keys(deptGroups);
    let hasMore = true;
    let index = 0;

    while (hasMore) {
      hasMore = false;
      for (const dept of depts) {
        if (index < deptGroups[dept].length) {
          interleavedStudents.push(deptGroups[dept][index]);
          hasMore = true;
        }
      }
      index++;
    }

    // Assign seats in row-major order across chosen rooms
    const assignments: SeatAssignment[] = [];
    let studentIdx = 0;

    for (const room of selectedClassrooms) {
      if (studentIdx >= interleavedStudents.length) break;

      for (let r = 1; r <= room.rows; r++) {
        if (studentIdx >= interleavedStudents.length) break;
        for (let c = 1; c <= room.cols; c++) {
          if (studentIdx >= interleavedStudents.length) break;

          const student = interleavedStudents[studentIdx++];
          assignments.push({
            rollNo: student.rollNo,
            roomNo: room.roomNo,
            seatNo: `R${r}-C${c}`,
          });
        }
      }
    }

    const mockResult: AllocationResult = {
      examId,
      generatedAt: new Date().toISOString(),
      success: true,
      message: `Seating layout successfully generated using the C++ Allocation Engine (Dynamic Mock). Seated ${assignments.length} out of ${students.length} students across ${selectedClassrooms.length} rooms.`,
      assignments,
    };

    // Save in cache
    mockAllocationResults[examId] = mockResult;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockResult);
      }, 1200); // 1.2s delay to simulate engine computational execution
    });
  },

  async getGeneratedPlans(examId: number): Promise<AllocationResult | null> {
    // Future integration code:
    // const response = await api.get<AllocationResult>(`/allocation/exam/${examId}`);
    // return response.data;
    
    if (mockAllocationResults[examId]) {
      return Promise.resolve(mockAllocationResults[examId]);
    }
    return Promise.resolve(null);
  }
};

export default allocationService;

