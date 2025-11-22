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

export interface LineChartStat {
  day: string;
  patients: number;
  consultations: number;
  tahlillar: number;
  tolovlar: number;
}

class ReportService {
  async getReport(dto: ReportRequest): Promise<ReportResponse> {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.REPORT.base, dto);
      return res.data;
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  }

  async reportStatsPdf({
    start_date,
    end_date,
  }: {
    start_date: string;
    end_date: string;
  }) {
    try {
      const res = await apiInstance.post(
        API_ENDPOINTS.REPORT.pdf,
        {
          start_date,
          end_date,
        },
        {
          responseType: "blob", // Important for file downloads
        }
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async reportStatsExcel({
    start_date,
    end_date,
  }: {
    start_date: string;
    end_date: string;
  }) {
    try {
      const res = await apiInstance.post(
        API_ENDPOINTS.REPORT.excel,
        {
          start_date,
          end_date,
        },
        {
          responseType: "blob", // Important for file downloads
        }
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async reportLineChartStats(): Promise<LineChartStat[]> {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.REPORT.weekStatsChart);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
