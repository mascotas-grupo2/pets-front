import axios from "axios";

export type ResponseAxios<T> = {
  ok: boolean;
  data: T | null;
  status: number;
};

const axiosInstance = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
