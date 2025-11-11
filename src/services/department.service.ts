import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class DepartmentService {
  async findAll() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.DEPARTMENT.base);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(dto: { title: string; title_ru: string; title_uz: string }) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.DEPARTMENT.base, dto);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(dto: {
    id: number;
    title: string;
    title_uz: string;
    title_ru: string;
  }) {
    try {
      const res = await apiInstance.put(
        `${API_ENDPOINTS.DEPARTMENT.base}${dto.id}/`,
        dto
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const res = await apiInstance.delete(
        `${API_ENDPOINTS.DEPARTMENT.base}${id}/`
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const departmentService = new DepartmentService();
