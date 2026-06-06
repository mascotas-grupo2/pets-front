"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getAdminAdoptions,
  type AdminAdoptionItem,
} from "@/services/adoptions";
import type {
  Solicitud,
  EstadoSolicitud,
} from "../solicitudes/solicitudes.data";

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
    userName: a.userName ?? a.applicantName ?? "—",
    userEmail: a.userEmail ?? a.applicantEmail ?? "",
    userPhoto: a.userPhoto ?? "",
    petName: a.petName ?? "Sin nombre",
    petPhoto: a.petPhoto ?? "",
    compatPct:
      a.compatibilityScore != null ? Math.round(a.compatibilityScore) : 0,
    compatLabel: compatLabel(a.compatibilityScore),
    estado,
    fecha: formatFecha(a.createdAt),
  };
}

export type EstadoFiltro = "TODAS" | EstadoSolicitud;
export type SortKey = "userName" | "petName" | "compat" | "estado" | "fecha";
export type SortDir = "asc" | "desc";
export type Sort = { key: SortKey; dir: SortDir };

const PAGE_SIZE = 8;

type Params = {
  estado?: EstadoSolicitud;
  q?: string;
  page: number;
  sortKey?: SortKey;
  sortDir?: SortDir;
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
  const [sort, setSort] = useState<Sort | null>(null);
  const [page, setPageRaw] = useState(1);

  const loadSolicitudes = useCallback(async (params: Params) => {
    setLoading(true);

    const res = await getAdminAdoptions({
      page: params.page,
      pageSize: PAGE_SIZE,
      status: params.estado,
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

    let visibleRows = mapped;

    if (params.q) {
      const q = params.q.toLowerCase();
      visibleRows = visibleRows.filter(
        (item) =>
          item.userName.toLowerCase().includes(q) ||
          (item.petName ?? "").toLowerCase().includes(q) ||
          item.userEmail.toLowerCase().includes(q),
      );
    }

    if (params.sortKey) {
      visibleRows = [...visibleRows].sort((a, b) => {
        let result = 0;
        if (params.sortKey === "userName") {
          result = a.userName.localeCompare(b.userName, "es", {
            sensitivity: "base",
          });
        } else if (params.sortKey === "petName") {
          result = (a.petName ?? "").localeCompare(b.petName ?? "", "es", {
            sensitivity: "base",
          });
        } else if (params.sortKey === "compat") {
          result = a.compatPct - b.compatPct;
        } else if (params.sortKey === "estado") {
          result = rankEstado(a.estado) - rankEstado(b.estado);
        } else if (params.sortKey === "fecha") {
          result = parseFecha(a.fecha) - parseFecha(b.fecha);
        }
        return params.sortDir === "desc" ? -result : result;
      });
    }

    setVisible(visibleRows);
    setLoading(false);
  }, []);

  const currentParams: Params = useMemo(() => ({
    estado: estado !== "TODAS" ? (estado as EstadoSolicitud) : undefined,
    q: query.trim() || undefined,
    page,
    sortKey: sort?.key,
    sortDir: sort?.dir,
  }), [estado, query, page, sort]);

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
    setPageRaw(1);
  }

  function setEstado(value: EstadoFiltro) {
    setEstadoRaw(value);
    setPageRaw(1);
  }

  function toggleEstado(key: EstadoSolicitud) {
    setEstadoRaw((current) => (current === key ? "TODAS" : key));
    setPageRaw(1);
  }

  function toggleSort(key: SortKey) {
    setPageRaw(1);
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  function setPage(n: number) {
    setPageRaw(n);
  }

  async function handleDelete(id: string) {
    const solicitud = items.find((item) => item.id === id);
    if (!solicitud) return false;
    // El backend todavía no expone un endpoint para eliminar solicitudes.
    toast.error("Eliminar solicitud no está disponible aún.");
    return false;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const desde = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(page * PAGE_SIZE, total);

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
    toggleSort,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handleDelete,
  };
}

const ESTADO_ORDER: Record<EstadoSolicitud, number> = {
  NUEVA: 0,
  EN_EVALUACION: 1,
  ENTREVISTA_PENDIENTE: 2,
  ACEPTADA_CON_SEGUIMIENTO: 3,
  ACEPTADA: 4,
  DESCARTADA: 5,
};

function rankEstado(value: EstadoSolicitud) {
  return ESTADO_ORDER[value] ?? 99;
}

function parseFecha(fecha: string) {
  const [dia, mes, anio] = fecha.split("/").map(Number);
  return new Date(anio, mes - 1, dia).getTime();
}
