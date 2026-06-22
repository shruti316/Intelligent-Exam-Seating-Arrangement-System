import type { Student } from '../types/Student';

export const mockStudents: Student[] = [
  { id: 1, rollNo: 'CS2023001', name: 'Aarav Sharma', department: 'Computer Science', section: 'A', semester: 4 },
  { id: 2, rollNo: 'CS2023002', name: 'Aditi Verma', department: 'Computer Science', section: 'A', semester: 4 },
  { id: 3, rollNo: 'EE2023015', name: 'Karan Malhotra', department: 'Electrical Engineering', section: 'B', semester: 6 },
  { id: 4, rollNo: 'EC2023042', name: 'Riya Sen', department: 'Electronics & Communication', section: 'A', semester: 4 },
  { id: 5, rollNo: 'ME2023089', name: 'Rohan Das', department: 'Mechanical Engineering', section: 'C', semester: 8 },
  { id: 6, rollNo: 'CS2023005', name: 'Sneha Reddy', department: 'Computer Science', section: 'B', semester: 4 },
  { id: 7, rollNo: 'EE2023018', name: 'Vikram Singh', department: 'Electrical Engineering', section: 'A', semester: 6 },
];

export const studentService = {
  async getStudents(): Promise<Student[]> {
    // Future integration code:
    // const response = await api.get<Student[]>('/students');
    // return response.data;
    return Promise.resolve(mockStudents);
  },

  async uploadCSV(file: File): Promise<{ success: boolean; message: string }> {
    // Future integration code:
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await api.post('/students/upload', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    // return response.data;
    console.log('API trigger: CSV Upload file ->', file.name);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `Successfully imported CSV roster: ${file.name}` });
      }, 500);
    });
  }
};
export default studentService;
