import type { SeatAssignment } from './SeatAssignment';

export interface AllocationResult {
  examId: number;
  generatedAt: string; // ISO DateTime
  success: boolean;
  message?: string;
  assignments: SeatAssignment[];
}
