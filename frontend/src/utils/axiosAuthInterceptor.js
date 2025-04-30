import { performLogout } from "./auth";
import { getSessionStorage } from "./sessionStorageUtil";

export const addAuthInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getSessionStorage("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to catch 401 errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token might be expired, logout the user
        performLogout();
        window.location.href = "/"
      }
      return Promise.reject(error);
    }
  );
};
