import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class AuthService {
  async login({
    phone_number,
    password,
  }: {
    phone_number: string;
    password: string;
  }) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.USER.login, {
        phone_number,
        password,
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findMe() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.USER.findMe);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findUsers() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.USER.users);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createUser(dto: {
    department: number;
    full_name: string;
    username: string;
    phone_number: string;
    password: string;
    role: string;
    is_active: boolean;
    price: number;
    passport: string;
  }) {
    try {
      const res = await apiInstance.post(API_ENDPOINTS.USER.users, dto);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(dto: {
    id: number;
    department?: number;
    full_name?: string;
    username?: string;
    phone_number?: string;
    password?: string;
    role?: string;
    is_active?: boolean;
    price?: number;
    passport?: string;
  }) {
    try {
      const res = await apiInstance.put(
        `${API_ENDPOINTS.USER.users}${dto.id}/`,
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
      const res = await apiInstance.delete(`${API_ENDPOINTS.USER.users}${id}/`);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const authService = new AuthService();
