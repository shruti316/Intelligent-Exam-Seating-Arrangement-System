import api from './api';
import type { Classroom } from '../types/Classroom';

const mapClassroom = (classroom: any): Classroom => ({
  id: classroom.classroom_id,
  roomNo: classroom.room_no,
  rows: classroom.rows_count,
  cols: classroom.cols_count,
  capacity: classroom.capacity,
  zone: classroom.zone || 'Main Block',
});

export const classroomService = {
  async getClassrooms(): Promise<Classroom[]> {
    const response = await api.get<any[]>('/classrooms');
    return response.data.map(mapClassroom);
  },

  async addClassroom(classroom: Omit<Classroom, 'id'>): Promise<Classroom> {
    const backendData = {
      room_no: classroom.roomNo,
      rows_count: classroom.rows,
      cols_count: classroom.cols,
      capacity: classroom.capacity,
      zone: classroom.zone
    };
    const response = await api.post<{ message: string; classroomId?: number }>('/classrooms', backendData);
    
    return {
      ...classroom,
      id: response.data.classroomId || Math.floor(Math.random() * 1000) + 100,
    };
  },

  async deleteClassroom(id: number): Promise<void> {
    await api.delete(`/classrooms/${id}`);
  },

  async updateClassroom(id: number, classroom: Omit<Classroom, 'id'>): Promise<void> {
    const backendData = {
      room_no: classroom.roomNo,
      rows_count: classroom.rows,
      cols_count: classroom.cols,
      capacity: classroom.capacity,
      zone: classroom.zone
    };
    await api.put(`/classrooms/${id}`, backendData);
  }
};

export default classroomService;
