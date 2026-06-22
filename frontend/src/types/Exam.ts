export interface Exam {
  id: number;
  subjectName: string;
  subjectCode: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // in minutes
}
