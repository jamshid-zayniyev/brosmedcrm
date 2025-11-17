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
    payment_status?: 'p' | 'c' | 'pc';
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
        `${API_ENDPOINTS.PATIENT.base}/${dto.id}/`,
        dto
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
export const patientService = new PatientService();
