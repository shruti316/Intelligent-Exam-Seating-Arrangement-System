export const examService = { getExams: () => Promise.resolve([]), createExam: (e: any) => Promise.resolve({ ...e, id: 1 }) }; export default examService;
