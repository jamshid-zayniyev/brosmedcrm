import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class DepartmentTypeService {
  async findAll() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.DEPARTMENT_TYPE.base);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(dto: {
    department: number;
    title: string;
    title_uz: string;
    title_ru: string;
    price: number;
  }) {
    try {
      const res = await apiInstance.post(
        API_ENDPOINTS.DEPARTMENT_TYPE.base,
        dto
      );
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
    department: number;
    price: number;
  }) {
    try {
      const res = await apiInstance.put(
        `${API_ENDPOINTS.DEPARTMENT_TYPE.base}${dto.id}/`,
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
        `${API_ENDPOINTS.DEPARTMENT_TYPE.base}${id}/`
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const departmentTypeService = new DepartmentTypeService();
