import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class LabService {
  async findAllAnalysis() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.LAB.base);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createAnalysis(dto: FormData) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.LAB.base, dto);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateAnalysis({ id, dto }: { dto: any; id: number }) {
    try {
      const res = await apiInstance.put(`${API_ENDPOINTS.LAB.base}${id}/`, dto);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteAnalysis(id: number) {
    try {
      const res = await apiInstance.delete(`${API_ENDPOINTS.LAB.base}${id}/`);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getStats() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.LAB.stats);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAnalysisResults({
    analysis_id,
    patient_id,
  }: {
    patient_id: number;
    analysis_id: number;
  }) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.LAB.analysisResult, {
        patient_id,
        analysis_id,
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
export const labService = new LabService();
