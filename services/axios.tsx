import axios from "axios";
import { getViewRefugioId } from "./tenant-view";

const axiosInstance = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
});

// Si el superadmin eligió un refugio en el picker, lo enviamos como ?refugioId=
// para que el backend scopee las vistas de admin a ese refugio. El backend lo
// ignora para roles que no sean superadmin, así que es seguro mandarlo siempre.
axiosInstance.interceptors.request.use((config) => {
  const rid = getViewRefugioId();
  if (rid != null) {
    config.params = { ...(config.params ?? {}), refugioId: rid };
  }
  return config;
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
