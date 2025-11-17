import { AnalysisResultPayload } from "../interfaces/analysis-result.interface";
import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class AnalysisResultService {
  async create(dto: AnalysisResultPayload[]) {
    try {
      const res = await apiInstance.post(
        API_ENDPOINTS.ANALYSIS_RESULT.create,
        dto
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(dto: { id: number; result: number; analysis_result: string }) {
    try {
      const res = await apiInstance.put(
        API_ENDPOINTS.ANALYSIS_RESULT.update(dto.id),
        {
          result: dto.result,
          analysis_result: dto.analysis_result
        }
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const analysisResultService = new AnalysisResultService();
