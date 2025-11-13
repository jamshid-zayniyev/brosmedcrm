import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class LabService {
  async findAll() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.LAB.base);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(dto: FormData) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.LAB.base, dto);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update({ id, dto }: { dto: FormData; id: number }) {
    try {
      const res = await apiInstance.post(
        `${API_ENDPOINTS.LAB.base}${id}/`,
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
      const res = await apiInstance.delete(`${API_ENDPOINTS.LAB.base}${id}/`);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
export const labService = new LabService();
