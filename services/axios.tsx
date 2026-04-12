import axios from "axios";

const axiosInstance = axios.create({
  // Usar NEXT_PUBLIC_ para que sea accesible desde el navegador
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
