import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

interface ReportRequest {
  start_date: string;
  end_date: string;
}

interface UmumiyReport {
  start_date: string;
  end_date: string;
  jami_bemorlar: number;
  konsultatsiyalar: number;
  tahlillar: number;
  tolovlar: number;
}

interface DepartmentReport {
  department: string;
  jami_bemorlar: number;
  konsultatsiyalar: number;
  tahlillar: number;

  tolovlar: number;
}

export interface ReportResponse {
  umumiy: UmumiyReport;
  departments: DepartmentReport[];
}

class ReportService {
  async getReport(dto: ReportRequest): Promise<ReportResponse> {
    try {
      // Assuming the endpoint is '/report/'. You might need to add this to your API_ENDPOINTS
      const res = await apiInstance.post(API_ENDPOINTS.REPORT.base, dto);
      return res.data;
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
