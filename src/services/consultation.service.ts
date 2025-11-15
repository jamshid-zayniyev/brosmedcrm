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
    diagnosis_uz: string;
    diagnosis_ru: string;
    recommendation: string;
    recommendation_uz: string;
    recommendation_ru: string;
    recipe: string;
    recipe_uz: string;
    recipe_ru: string;
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
