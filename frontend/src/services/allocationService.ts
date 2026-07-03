import api from './api';
import type { AllocationResult } from '../types/AllocationResult';
import type { SeatAssignment } from '../types/SeatAssignment';

export const allocationService = {
  async generateSeatingPlan(examId: number, classroomIds: number[]): Promise<AllocationResult> {
    const response = await api.post<{ success: boolean; message: string; data: any }>('/seating/generate', { 
      examId, 
      classroomIds 
    });

    if (!response.data.success) {
      return {
        examId,
        generatedAt: new Date().toISOString(),
        success: false,
        message: response.data.message || 'Unable to generate seating plan.',
        assignments: [],
      };
    }

    const details = await this.getGeneratedPlans(examId);
    if (!details) {
      return {
        examId,
        generatedAt: new Date().toISOString(),
        success: false,
        message: 'Plan generated but details could not be retrieved.',
        assignments: [],
      };
    }

    return {
      examId,
      generatedAt: details.generatedAt,
      success: true,
      message: 'Seating plan generated successfully.',
      assignments: details.assignments,
    };
  },

  async getGeneratedPlans(examId: number): Promise<AllocationResult | null> {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>(`/seating/${examId}`);
      if (!response.data.success || !response.data.data || response.data.data.length === 0) {
        return null;
      }

      const list = response.data.data;
      const assignments: SeatAssignment[] = list.map((item: any) => ({
        rollNo: item.roll_no,
        roomNo: item.room_no,
        seatNo: item.seat_label,
      }));

      return {
        examId,
        generatedAt: list[0].generated_at || new Date().toISOString(),
        success: true,
        assignments,
      };
    } catch (error) {
      console.error('Error fetching plan:', error);
      return null;
    }
  }
};

export default allocationService;

