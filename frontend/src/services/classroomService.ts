import type { Classroom } from '../types/Classroom';

export const mockClassrooms: Classroom[] = [
  { id: 1, roomNo: 'LH-101', rows: 6, cols: 6, capacity: 36, zone: 'Block A' },
  { id: 2, roomNo: 'LH-102', rows: 5, cols: 8, capacity: 40, zone: 'Block A' },
  { id: 3, roomNo: 'LH-201', rows: 8, cols: 8, capacity: 64, zone: 'Block B' },
  { id: 4, roomNo: 'Auditorium-A', rows: 10, cols: 12, capacity: 120, zone: 'Main Wing' },
];

export const classroomService = {
  async getClassrooms(): Promise<Classroom[]> {
    // Future integration code:
    // const response = await api.get<Classroom[]>('/classrooms');
    // return response.data;
    return Promise.resolve(mockClassrooms);
  },

  async addClassroom(classroom: Omit<Classroom, 'id'>): Promise<Classroom> {
    // Future integration code:
    // const response = await api.post<Classroom>('/classrooms', classroom);
    // return response.data;
    console.log('API trigger: Add Classroom ->', classroom);
    const newClassroom: Classroom = {
      ...classroom,
      id: Math.floor(Math.random() * 1000) + 5,
    };
    return Promise.resolve(newClassroom);
  }
};
export default classroomService;
