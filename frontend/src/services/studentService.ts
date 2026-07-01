import api from "./api";
import type { Student } from "../types/Student";

interface BackendStudent {
    student_id: number;
    roll_no: string;
    first_name: string;
    last_name: string;
    department_id: number;
    department_name: string;
    department_code: string;
    home_zone: string;
    section: string;
    semester: number;
}

interface CreateStudentRequest {
    roll_no: string;
    first_name: string;
    last_name: string;
    department_id: number;
    section: string;
    semester: number;
}

const mapStudent = (student: BackendStudent): Student => ({
    id: student.student_id,
    rollNo: student.roll_no,
    name: `${student.first_name} ${student.last_name}`.trim(),
    department: student.department_name,
    section: student.section,
    semester: student.semester,
});

const studentService = {
    async getStudents(): Promise<Student[]> {
        const response = await api.get<BackendStudent[]>("/students/details");

        return response.data.map(mapStudent);
    },

    async getStudentById(id: number): Promise<Student> {
        const response = await api.get<BackendStudent>(`/students/${id}`);

        return mapStudent(response.data);
    },

    async createStudent(
        student: CreateStudentRequest
    ): Promise<void> {
        await api.post("/students", student);
    },

    async updateStudent(
        id: number,
        student: CreateStudentRequest
    ): Promise<void> {
        await api.put(`/students/${id}`, student);
    },

    async deleteStudent(id: number): Promise<void> {
        await api.delete(`/students/${id}`);
    },

    async uploadCSV(file: File): Promise<void> {
        const formData = new FormData();
        formData.append("file", file);

        await api.post("/students/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

export default studentService; 