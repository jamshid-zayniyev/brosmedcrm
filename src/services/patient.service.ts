import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class PatientService {
  async findAll() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.PATIENT.base);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(dto: {
    user?: number;
    department: number;
    department_types?: number;
    name: string;
    last_name: string;
    middle_name: string;
    gender: string;
    birth_date: string;
    phone_number: string;
    address: string;
    disease: string;
    disease_uz: string;
    disease_ru: string;
  }) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.PATIENT.base, dto);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const res = await apiInstance.get(`${API_ENDPOINTS.PATIENT.base}${id}/`);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(dto: {
    id: number;
    user?: number;
    department?: number;
    department_types?: number;
    name?: string;
    last_name?: string;
    middle_name?: string;
    gender?: string;
    birth_date?: string;
    phone_number?: string;
    address?: string;
    disease?: string;
    disease_uz?: string;
    disease_ru?: string;
    payment_status?: "p" | "c" | "pc";
  }) {
    try {
      const res = await apiInstance.put(
        `${API_ENDPOINTS.PATIENT.base}${dto.id}/`,
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
        `${API_ENDPOINTS.PATIENT.base}${id}/`
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAllForDoctor() {
    try {
      const res = await apiInstance.get(
        API_ENDPOINTS.PATIENT.patientsForDoctor
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePatientStatus(dto: { id: number; patient_status: string }) {
    try {
      const res = await apiInstance.put(
        `${API_ENDPOINTS.PATIENT.base}${dto.id}/`,
        dto
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findPatientAnalysis(patient_id: number) {
    try {
      const res = await apiInstance.post(
        API_ENDPOINTS.PATIENT.patientAnalysis,
        { patient_id }
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async downloadPatientAnalysisFile({
    patient_id,
    analysis_id,
  }: {
    patient_id: number;
    analysis_id: number;
  }) {
    try {
      const res = await apiInstance.post(
        API_ENDPOINTS.PATIENT.downloadAnalysisFile,
        {
          patient_id,
          analysis_id,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const contentDisposition = res.headers["content-disposition"];
      let filename = "download.docx"; // A more sensible default
      if (contentDisposition) {
        // More robust regex to handle quoted and unquoted filenames
        const filenameMatch = contentDisposition.match(
          /filename\*?=['"]?([^'"]+)['"]?/
        );
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1].replace(/['"]/g, ""); // Clean up any quotes
        }
      }

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async searchPatient(search: string) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.PATIENT.search, {
        search,
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
export const patientService = new PatientService();
