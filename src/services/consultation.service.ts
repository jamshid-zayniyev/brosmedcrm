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
  async create(dto: {
    patient: number;
    diagnosis: string;
    recommendation: string;
    recipe: string;
    patient_status: string;
  }) {
    try {
      const res = await apiInstance.post(
        `${API_ENDPOINTS.DOCTOR.consultations}`,
        dto
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findStats() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.DOCTOR.stats);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const consultationService = new ConsultationService();
