import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
});

// Interceptor de respuesta para manejar el 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.config?.url?.includes("auth/login")) {
        return Promise.reject(error);
      }
      // La sesión expiró definitivamente.
      window.location.href = "/login?error=session_expired";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
