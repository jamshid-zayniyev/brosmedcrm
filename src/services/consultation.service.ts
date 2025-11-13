import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class ConsultationService {
  async findAll() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.DOCTOR.consultations);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async create(dto: { id: number }) {
    try {
      const res = await apiInstance.post(
        `${API_ENDPOINTS.DOCTOR.consultations}${dto.id}/`,
        dto
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(dto: { id: number }) {
    try {
      const res = await apiInstance.put(
        `${API_ENDPOINTS.DOCTOR.consultations}${dto.id}/`,
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
        `${API_ENDPOINTS.DOCTOR.consultations}${id}/`
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const consultationService = new ConsultationService();
