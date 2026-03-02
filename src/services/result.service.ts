import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class ResultService {
  async findResultForDepartment(id: number) {
    try {
      const res = await apiInstance.get(
        API_ENDPOINTS.RESULT.findResultForDepartment(id)
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteResult(id: number) {
    try {
      const res = await apiInstance.delete(API_ENDPOINTS.RESULT.delete(id));
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const resultService = new ResultService();
