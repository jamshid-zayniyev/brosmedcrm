import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class PatientService {
  async findAll({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.PATIENT.base, {
        params: {
          page,
          limit,
        },
      });
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
        dto,
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePatientById(
    id: number,
    data: {
      user?: number;
      department?: number;
      department_types?: number;
      name?: string;
      last_name?: string;
      middle_name?: string;
      gender?: "e" | "a";
      birth_date?: string;
      phone_number?: string;
      passport?: string;
      address?: string;
      disease?: string;
      disease_uz?: string;
      disease_ru?: string;
      self_disease?: string;
      payment_status?: "p" | "c" | "pc";
      patient_status?: "r" | "l" | "d" | "t" | "f" | "rc";
    }
  ) {
    try {
      const res = await apiInstance.put(
        `${API_ENDPOINTS.PATIENT.base}${id}/`,
        data
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
        `${API_ENDPOINTS.PATIENT.base}${id}/`,
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
        API_ENDPOINTS.PATIENT.patientsForDoctor,
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
        dto,
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
        { patient_id },
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
    filename,
  }: {
    patient_id: number;
    analysis_id: number;
    filename: string;
  }) {
    try {
      const res = await apiInstance.post(
        API_ENDPOINTS.PATIENT.downloadAnalysisFile,
        {
          patient_id,
          analysis_id,
        },
        {
          responseType: "blob", // 🔑 blob bo'lishi shart
        },
      );

      // Blob yaratishda type berish
      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);

      // Fayl nomini backend'dan olish
      const contentDisposition = res.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename\*?=(?:UTF-8''|")?([^;"']+)/,
        );
        if (filenameMatch?.[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Faylni yuklash
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "download";
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
