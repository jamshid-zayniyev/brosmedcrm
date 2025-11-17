import apiInstance from "../lib/api-instance";
import { API_ENDPOINTS } from "../utils/shared";

class CashierService {
  async getStats() {
    try {
      const res = await apiInstance.get(API_ENDPOINTS.CASHIER.stats);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const cashierService = new CashierService();
