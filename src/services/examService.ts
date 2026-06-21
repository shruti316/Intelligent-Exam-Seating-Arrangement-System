import type { Exam } from '../types/Exam';

export const mockExams: Exam[] = [
  { id: 1, subjectName: 'Data Structures & Algorithms', subjectCode: 'CS-201', examDate: '2026-07-10', startTime: '09:30', endTime: '12:30', duration: 180 },
  { id: 2, subjectName: 'Operating Systems', subjectCode: 'CS-302', examDate: '2026-07-12', startTime: '14:00', endTime: '17:00', duration: 180 },
  { id: 3, subjectName: 'Database Management Systems', subjectCode: 'CS-204', examDate: '2026-07-15', startTime: '09:30', endTime: '12:30', duration: 180 },
];

export const examService = {
  async getExams(): Promise<Exam[]> {
    // Future integration code:
    // const response = await api.get<Exam[]>('/exams');
    // return response.data;
    return Promise.resolve(mockExams);
  },

  async createExam(exam: Omit<Exam, 'id'>): Promise<Exam> {
    // Future integration code:
    // const response = await api.post<Exam>('/exams', exam);
    // return response.data;
    console.log('API trigger: Create Exam ->', exam);
    const newExam: Exam = {
      ...exam,
      id: Math.floor(Math.random() * 1000) + 4,
    };
    return Promise.resolve(newExam);
  }
};
export default examService;
