import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de respuesta para manejar el 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, la devolvemos tal cual
  (error) => {
    if (error.response?.status === 401) {
      // Si llega un 401 aquí, es porque el Proxy ya intentó refrescar y no pudo.
      // La sesión expiró definitivamente.
      window.location.href = "/login?error=session_expired";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
