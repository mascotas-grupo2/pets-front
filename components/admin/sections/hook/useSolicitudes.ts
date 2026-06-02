"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { SOLICITUDES, type Solicitud, type EstadoSolicitud } from "../solicitudes/solicitudes.data";

export type EstadoFiltro = "TODAS" | EstadoSolicitud;
export type SortKey = "userName" | "petName" | "compat" | "estado" | "fecha";
export type SortDir = "asc" | "desc";
export type Sort = { key: SortKey; dir: SortDir };

const PAGE_SIZE = 20;

type Params = {
  estado?: EstadoSolicitud;
  q?: string;
  page: number;
  sortKey?: SortKey;
  sortDir?: SortDir;
};

export function useSolicitudes() {
  const [items, setItems] = useState<Solicitud[]>(SOLICITUDES);
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

  const loadSolicitudes = useCallback(
    async (params: Params) => {
      setLoading(true);
      let filtered = [...items];

      if (params.estado) {
        filtered = filtered.filter((item) => item.estado === params.estado);
      }

      if (params.q) {
        const q = params.q.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.userName.toLowerCase().includes(q) ||
            item.petName.toLowerCase().includes(q) ||
            item.userEmail.toLowerCase().includes(q),
        );
      }

      if (params.sortKey) {
        filtered = [...filtered].sort((a, b) => {
          let result = 0;
          if (params.sortKey === "userName") {
            result = a.userName.localeCompare(b.userName, "es", { sensitivity: "base" });
          } else if (params.sortKey === "petName") {
            result = a.petName.localeCompare(b.petName, "es", { sensitivity: "base" });
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

      setCounts({
        NUEVA: items.filter((item) => item.estado === "NUEVA").length,
        EN_EVALUACION: items.filter((item) => item.estado === "EN_EVALUACION").length,
        ENTREVISTA_PENDIENTE: items.filter((item) => item.estado === "ENTREVISTA_PENDIENTE").length,
        ACEPTADA_CON_SEGUIMIENTO: items.filter((item) => item.estado === "ACEPTADA_CON_SEGUIMIENTO").length,
        ACEPTADA: items.filter((item) => item.estado === "ACEPTADA").length,
        DESCARTADA: items.filter((item) => item.estado === "DESCARTADA").length,
      });

      setTotal(filtered.length);
      const from = (params.page - 1) * PAGE_SIZE;
      setVisible(filtered.slice(from, from + PAGE_SIZE));
      setLoading(false);
    },
    [items],
  );

  const currentParams: Params = {
    estado: estado !== "TODAS" ? (estado as EstadoSolicitud) : undefined,
    q: query.trim() || undefined,
    page,
    sortKey: sort?.key,
    sortDir: sort?.dir,
  };

  useEffect(() => {
    loadSolicitudes(currentParams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, estado, sort, page, items]);

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
    if (!window.confirm(`¿Eliminar la solicitud de ${solicitud.userName} sobre ${solicitud.petName}? Esta acción no se puede deshacer.`)) {
      return false;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Solicitud eliminada.");
    return true;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const desde = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(page * PAGE_SIZE, total);

  return {
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
