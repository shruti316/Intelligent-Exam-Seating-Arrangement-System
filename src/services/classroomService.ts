export const classroomService = { getClassrooms: () => Promise.resolve([]), addClassroom: (c: any) => Promise.resolve({ ...c, id: 1 }) }; export default classroomService;
