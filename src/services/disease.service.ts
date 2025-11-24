import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class DiseaseService {
  async create(dto: {
    disease: string;
    patient: number;
    department: number;
    department_types?: number;
    user?: number;
  }) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.DISEASE.base, dto);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findDiseaseForPatient(id: number) {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.DISEASE.forPatient(id));
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
export const diseaseService = new DiseaseService();
