import api from './api';
import type { Exam } from '../types/Exam';

const mapExam = (exam: any): Exam => {
  let duration = 180; // default fallback
  if (exam.start_time && exam.end_time) {
    const [sh, sm] = exam.start_time.split(':').map(Number);
    const [eh, em] = exam.end_time.split(':').map(Number);
    duration = (eh * 60 + em) - (sh * 60 + sm);
  }
  return {
    id: exam.exam_id,
    subjectName: exam.subject_name || exam.exam_name,
    subjectCode: exam.subject_code,
    examDate: exam.exam_date ? exam.exam_date.substring(0, 10) : '',
    startTime: exam.start_time ? exam.start_time.substring(0, 5) : '',
    endTime: exam.end_time ? exam.end_time.substring(0, 5) : '',
    duration
  };
};

export const examService = {
  async getExams(): Promise<Exam[]> {
    const response = await api.get<any[]>('/exams');
    return response.data.map(mapExam);
  },

  async createExam(exam: Omit<Exam, 'id'>): Promise<Exam> {
    const backendData = {
      exam_name: exam.subjectName,
      subject_code: exam.subjectCode,
      subject_name: exam.subjectName,
      semester: 1, // default semester
      exam_date: exam.examDate,
      start_time: exam.startTime + ":00",
      end_time: exam.endTime + ":00",
      status: 'Scheduled'
    };
    const response = await api.post<{ message: string; examId?: number }>('/exams', backendData);
    
    return {
      ...exam,
      id: response.data.examId || Math.floor(Math.random() * 1000) + 100,
    };
  },

  async deleteExam(id: number): Promise<void> {
    await api.delete(`/exams/${id}`);
  },

  async updateExam(id: number, exam: Omit<Exam, 'id'>): Promise<void> {
    const backendData = {
      exam_name: exam.subjectName,
      subject_code: exam.subjectCode,
      subject_name: exam.subjectName,
      semester: 1,
      exam_date: exam.examDate,
      start_time: exam.startTime + ":00",
      end_time: exam.endTime + ":00",
      status: 'Scheduled'
    };
    await api.put(`/exams/${id}`, backendData);
  }
};

export default examService;
