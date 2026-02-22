import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { handleStorage } from "../utils/handle-storage";
import { API_ENDPOINTS, serverUrl } from "../utils/shared";

// Refresh uchun alohida instance (interceptorsiz)
const refreshInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

const apiInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

apiInstance.interceptors.request.use((config) => {
  const access_token = handleStorage({ key: "access_token" });
  if (access_token && !config.url?.includes("/login")) {
    config.headers["Authorization"] = `Bearer ${access_token}`;
  }

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

apiInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // ✅ refreshInstance ishlatilmoqda, loop yo'q
        const res = await refreshInstance.post(API_ENDPOINTS.USER.refreshToken);
        const access_token = res.data;
        handleStorage({ key: "access_token", value: access_token });
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return apiInstance(originalRequest);
      } catch (refreshError) {
        handleStorage({ key: "access_token", value: null });
        // Foydalanuvchini login sahifasiga yo'naltirish
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 429) {
      toast.error("Error", {
        description: "Too Many Requests",
      });
    }

    const errorData = error.response?.data as {
      error: string;
      message: string;
    };
    if (errorData && "error" in errorData && errorData.error) {
      toast.error(errorData.error, {
        description: errorData.message || "Xato haqida ma'lumot yo'q",
      });
    }

    return Promise.reject(error);
  }
);

export default apiInstance;