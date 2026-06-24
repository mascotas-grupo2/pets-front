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
      const url = error.config?.url ?? "";
      const onLoginPage =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/login");

      if (
        !url.includes("auth/login") &&
        !onLoginPage &&
        typeof window !== "undefined"
      ) {
        window.location.href = "/login?error=session_expired";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
