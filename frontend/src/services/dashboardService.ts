import api from './api';

export interface DashboardStats {
  totalStudents: number;
  totalClassrooms: number;
  totalExams: number;
  totalSeatingPlans: number;
  totalSeats: number;
  occupancyPercentage: number;
  latestPlan: {
    planId: number;
    examId: number;
    generatedAt: string;
    totalStudents: number;
    occupiedSeats: number;
    emptySeats: number;
    conflictCount: number;
    executionTimeMs: number;
  } | null;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<{ success: boolean; stats: DashboardStats }>('/dashboard/stats');
    return response.data.stats;
  }
};

export default dashboardService;
