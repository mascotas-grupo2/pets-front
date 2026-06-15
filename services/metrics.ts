import { PetStatus } from "@/types/pet";
import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export type MascotaPorEstado = {
  estado: string;
  cantidad: number;
};

export type SolicitudPorEstado = {
  estado: string;
  cantidad: number;
};

export type SeguimientoPorEstado = {
  estado: string;
  cantidad: number;
};

export type UsuarioPorMes = {
  mes: string;
  cantidad: number;
};

export type MascotaPorTipo = {
  tipo: string;
  cantidad: number;
};

export type TopPublicacion = {
  id: string;
  titulo: string;
  vistas: number;
  comentarios: number;
  estado: PetStatus;
  avatar?: string;
};

export type UbicacionMascota = {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  tipo: PetStatus;
};

export type MetricasData = {
  kpis: {
    mascotasPublicadas: number;
    mascotasAdoptadas: number;
    mascotasPerdidas: number;
    tasaAdopcion: number;
    seguimientosPendientes: number;
    usuariosRegistrados: number;
  };
  mascotasPorEstado: MascotaPorEstado[];
  solicitudesPorEstado: SolicitudPorEstado[];
  seguimientosPorEstado: SeguimientoPorEstado[];
  usuariosPorMes: UsuarioPorMes[];
  mascotasPorTipo: MascotaPorTipo[];
  topPublicaciones: TopPublicacion[];
  mapaReportes: UbicacionMascota[];
};

export const getMetricas = (periodo: string = "30d", signal?: AbortSignal) =>
  request<{ok: boolean, data: MetricasData}>((s) =>
    axios.get("pets/admin/metricas", {
      params: { periodo },
      signal: s || signal,
    }),
  );
