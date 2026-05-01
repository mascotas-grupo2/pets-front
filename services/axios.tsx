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
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado reintentar la petición aún
    // (la bandera _retry evita bucles infinitos de reintento)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos la petición como reintentada

      try {
        // Llamamos a nuestro endpoint de refresh en Next.js
        // Este endpoint leerá la cookie HttpOnly 'refresh_token' y actualizará la 'auth_token'
        await axios.post("/api/auth/refresh");

        // Si el refresh fue exitoso, reintentamos la petición original con el nuevo token
        // Axios automáticamente enviará las cookies actualizadas.
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla (ej. el refresh_token también expiró o es inválido),
        // redirigimos al usuario a la página de login para que se autentique de nuevo.
        console.error("Token refresh failed, redirecting to login:", refreshError);
        window.location.href = "/login?error=session_expired"; // Redirigir al login
        return Promise.reject(refreshError); // Rechazamos la promesa para que el error se propague
      }
    }

    return Promise.reject(error); // Para cualquier otro error, lo propagamos
  },
);

export default axiosInstance;
