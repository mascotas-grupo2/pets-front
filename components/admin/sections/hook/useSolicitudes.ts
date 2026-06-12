"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getAdminAdoptions,
  deleteAdoption,
  updateAdoptionStatus,
  type AdminAdoptionItem,
} from "@/services/adoptions";
import type { SortOrder } from "../../ui/data-table";
import type {
  Solicitud,
  EstadoSolicitud,
} from "../solicitudes/solicitudes.data";
import { usePagination } from "./usePagination";

const ESTADOS: EstadoSolicitud[] = [
  "NUEVA",
  "EN_EVALUACION",
  "ENTREVISTA_PENDIENTE",
  "ACEPTADA_CON_SEGUIMIENTO",
  "ACEPTADA",
  "DESCARTADA",
];

function compatLabel(score: number | null): string {
  if (score == null) return "Sin datos";
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Alta";
  if (score >= 65) return "Buena";
  if (score >= 50) return "Moderada";
  return "Baja";
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Mapea una solicitud del backend al shape que consumen las tablas. */
export function toSolicitud(a: AdminAdoptionItem): Solicitud {
  const estado = (
    ESTADOS.includes(a.status as EstadoSolicitud) ? a.status : "NUEVA"
  ) as EstadoSolicitud;
  return {
    id: String(a.id),

    userName: a.applicantName ?? a.userName ?? "—",
    userEmail: a.applicantEmail ?? a.userEmail ?? "",
    userPhoto: a.userPhoto ?? "",
    petName: a.petName ?? "Sin nombre",
    petPhoto: a.petPhoto ?? "",
    compatPct:
      a.compatibilityScore != null ? Math.round(a.compatibilityScore) : 0,
    compatLabel: compatLabel(a.compatibilityScore),
    estado,
    fecha: formatFecha(a.createdAt),
    fechaModificacion: formatFecha(a.updatedAt ?? a.createdAt),
  };
}

export type EstadoFiltro = "TODAS" | EstadoSolicitud;
export type SortKey = "userName" | "petName" | "compat" | "estado" | "fecha";
export type SortDir = "asc" | "desc";
const PAGE_SIZE = 8;

type Params = {
  estado?: EstadoSolicitud;
  q?: string;
  page: number;
  sortKey?: SortKey;
  sort?: SortOrder<SortKey>[];
};

export function useSolicitudes() {
  const [items, setItems] = useState<Solicitud[]>([]);
  const [visible, setVisible] = useState<Solicitud[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<EstadoSolicitud, number>>({
    NUEVA: 0,
    EN_EVALUACION: 0,
    ENTREVISTA_PENDIENTE: 0,
    ACEPTADA_CON_SEGUIMIENTO: 0,
    ACEPTADA: 0,
    DESCARTADA: 0,
  });
  const [loading, setLoading] = useState(true);
  const [query, setQueryRaw] = useState("");
  const [estado, setEstadoRaw] = useState<EstadoFiltro>("TODAS");
  const [sort, setSortRaw] = useState<SortOrder<SortKey>[]>([]);
  const { page, setPage, resetPage, totalPages, desde, hasta } = usePagination(
    PAGE_SIZE,
    total,
  );

  const loadSolicitudes = useCallback(async (params: Params) => {
    setLoading(true);

    const sortQuery = params.sort
      ?.map((s) => `${s.key}:${s.direction}`)
      .join(",");

    const res = await getAdminAdoptions({
      page: params.page,
      pageSize: PAGE_SIZE,
      status: params.estado,
      sort: sortQuery,
    });

    if (!res.ok || !res.data) {
      toast.error("No se pudieron cargar las solicitudes.");
      setLoading(false);
      return;
    }

    const mapped = res.data.items.map(toSolicitud);
    setItems(mapped);

    setCounts({
      NUEVA: res.data.statusTotals.NUEVA ?? 0,
      EN_EVALUACION: res.data.statusTotals.EN_EVALUACION ?? 0,
      ENTREVISTA_PENDIENTE: res.data.statusTotals.ENTREVISTA_PENDIENTE ?? 0,
      ACEPTADA_CON_SEGUIMIENTO:
        res.data.statusTotals.ACEPTADA_CON_SEGUIMIENTO ?? 0,
      ACEPTADA: res.data.statusTotals.ACEPTADA ?? 0,
      DESCARTADA: res.data.statusTotals.DESCARTADA ?? 0,
    });

    setTotal(res.data.total);

    // El ordenamiento y filtrado por estado ya vienen del backend.
    // El filtrado por 'q' también debería delegarse al backend idealmente.
    setVisible(mapped);
    setLoading(false);
  }, []);

  const currentParams: Params = useMemo(
    () => ({
      estado: estado !== "TODAS" ? (estado as EstadoSolicitud) : undefined,
      q: query.trim() || undefined,
      page,
      sort,
    }),
    [estado, query, page, sort],
  );

  // Efecto único para sincronizar filtros y paginación.
  // Al envolver en una función asíncrona interna, evitamos la advertencia
  // de setState síncrono al inicio del efecto.
  useEffect(() => {
    const trigger = async () => {
      await loadSolicitudes(currentParams);
    };
    void trigger();
  }, [loadSolicitudes, currentParams]);

  function setQuery(value: string) {
    setQueryRaw(value);
    resetPage();
  }

  function setEstado(value: EstadoFiltro) {
    setEstadoRaw(value);
    resetPage();
  }

  function toggleEstado(key: EstadoSolicitud) {
    setEstadoRaw((current) => (current === key ? "TODAS" : key));
    resetPage();
  }

  function setSort(next: SortOrder<SortKey>[]) {
    resetPage();
    setSortRaw(next);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Estás seguro de que querés eliminar esta solicitud?"))
      return false;

    const res = await deleteAdoption(id);
    if (res.ok) {
      toast.success("Solicitud eliminada correctamente.");
      await loadSolicitudes(currentParams);
      return true;
    }
    toast.error("No se pudo eliminar la solicitud.");
    return false;
  }

  async function handleUpdateStatus(id: string, newStatus: EstadoSolicitud) {
    const res = await updateAdoptionStatus(id, newStatus);
    if (res.ok) {
      toast.success("Estado de la solicitud actualizado.");
      await loadSolicitudes(currentParams);
      return true;
    }
    toast.error(res.error || "No se pudo actualizar el estado.");
    return false;
  }

  return {
    items,
    visible,
    loading,
    counts,
    query,
    setQuery,
    estado,
    setEstado,
    toggleEstado,
    sort,
    setSort,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handleDelete,
    handleUpdateStatus,
  };
}
