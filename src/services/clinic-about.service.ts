import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class ClinicAboutService {
  async findAll() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.CLINIC_ABOUT.base);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(dto: {
    name: string;
    email: string;
    phone_number: string;
    work_time: string;
    address: string;
  }) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.CLINIC_ABOUT.base, dto);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(dto: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    work_time: string;
    address: string;
  }) {
    try {
      const res = await apiInstance.put(
        `${API_ENDPOINTS.CLINIC_ABOUT.base}${dto.id}/`,
        dto
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const clinicAboutService = new ClinicAboutService();
