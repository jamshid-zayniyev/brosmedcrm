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
}

export const authService = new AuthService();
