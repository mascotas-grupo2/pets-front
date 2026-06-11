import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export type DashboardStats = {
  mascotasActivas: number;
  mascotasPerdidas: number;
  solicitudes: number;
  seguimientosHoy: number;
  publicaciones: number;
  mensajesSinLeer: number;
};

export const getDashboardStats = () =>
  request<DashboardStats>(() => axios.get("dashboard/stats"));
