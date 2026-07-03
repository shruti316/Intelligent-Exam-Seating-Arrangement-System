import api from './api';

export interface Department {
  department_id: number;
  department_name: string;
  department_code: string;
  home_zone?: string;
}

export const departmentService = {
  async getDepartments(): Promise<Department[]> {
    const response = await api.get<Department[]>('/departments');
    return response.data;
  }
};

export default departmentService;
