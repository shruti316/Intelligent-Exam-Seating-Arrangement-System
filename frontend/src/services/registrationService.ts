import api from "./api";

export interface RegisteredStudent {
  registrationId: number;
  studentId: number;
  rollNo: string;
  firstName: string;
  lastName: string;
  studentName: string;
  departmentName: string;
  departmentCode: string;
  section: string;
  semester: number;
}

export const registrationService = {
  // Get all registered students for a specific exam
  async getRegistrationsByExam(examId: number): Promise<RegisteredStudent[]> {
    const response = await api.get<RegisteredStudent[]>(`/registrations/exam/${examId}`);
    return response.data;
  },

  // Register an individual student
  async registerStudent(examId: number, studentId: number): Promise<void> {
    await api.post("/registrations", {
      exam_id: examId,
      student_id: studentId
    });
  },

  // Register students in bulk
  async registerBulkStudents(examId: number, studentIds: number[]): Promise<{ message: string; affectedRows: number }> {
    const response = await api.post<{ success: boolean; message: string; affectedRows: number }>("/registrations/bulk", {
      exam_id: examId,
      student_ids: studentIds
    });
    return response.data;
  },

  // Remove a registration by registration ID
  async deleteRegistration(registrationId: number): Promise<void> {
    await api.delete(`/registrations/${registrationId}`);
  },

  // Remove a registration by exam ID and student ID
  async unregisterStudent(examId: number, studentId: number): Promise<void> {
    await api.delete(`/registrations/exam/${examId}/student/${studentId}`);
  },

  // Remove multiple registrations
  async deleteBulkRegistrations(examId: number, studentIds: number[]): Promise<{ message: string; affectedRows: number }> {
    const response = await api.post<{ success: boolean; message: string; affectedRows: number }>("/registrations/bulk-delete", {
      exam_id: examId,
      student_ids: studentIds
    });
    return response.data;
  }
};

export default registrationService;
