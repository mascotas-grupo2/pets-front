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

export type ActivityItem = {
  id: string;
  type: "solicitud" | "mensaje" | "publicacion" | "usuario" | "comentario";
  title: string;
  detail: string;
  link: string;
  at: string;
};

/** Actividad reciente del dashboard (derivada de datos reales, clickeable). */
export const getDashboardActivity = (limit = 8) =>
  request<ActivityItem[]>(() =>
    axios.get("dashboard/activity", { params: { limit } }),
  );
