import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { API_ENDPOINTS, serverUrl } from "../utils/shared";
import { handleStorage } from "../utils/handle-storage";

const apiInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

apiInstance.interceptors.request.use((config) => {
  const access_token = handleStorage({ key: "access_token" });
  config.headers["Authorization"] = `Bearer ${access_token}`;

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export default apiInstance;