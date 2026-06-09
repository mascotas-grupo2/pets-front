"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { type Solicitud, type EstadoSolicitud } from "../solicitudes/solicitudes.data";
import { getAdminAdoptions } from "../../../../services/adoptions.services";

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

  const loadSolicitudes = useCallback(
    async (params: Params) => {
      setLoading(true);
      
      const sortParam = params.sortKey ? `${params.sortKey}:${params.sortDir || "desc"}` : undefined;
      const response = await getAdminAdoptions({
        page: params.page,
        pageSize: PAGE_SIZE,
        statusId: params.estado ? mapEstadoToStatusId(params.estado) : undefined,
        sort: sortParam,
      });

      if (!response || !response.ok || !response.data) {
        toast.error("Error al cargar las solicitudes de adopción");
        setLoading(false);
        return;
      }

      const { data } = response;
      setTotal(data.total);
      
      setCounts({
        NUEVA: data.statusTotals["NUEVA"] || 0,
        EN_EVALUACION: data.statusTotals["EN_EVALUACION"] || 0,
        ENTREVISTA_PENDIENTE: data.statusTotals["ENTREVISTA_PENDIENTE"] || 0,
        ACEPTADA_CON_SEGUIMIENTO: data.statusTotals["ACEPTADA_CON_SEGUIMIENTO"] || 0,
        ACEPTADA: data.statusTotals["ACEPTADA"] || 0,
        DESCARTADA: data.statusTotals["DESCARTADA"] || 0,
      });

      const parsedItems: Solicitud[] = data.items.map((item: any) => {
        const compatPct = item.compatibilityScore ?? 0;
        let compatLabel = "Moderada";
        if (compatPct >= 80) compatLabel = "Alta";
        else if (compatPct >= 90) compatLabel = "Excelente";
        else if (compatPct <= 40) compatLabel = "Baja";
        
        return {
          id: String(item.id),
          userName: item.applicantName || item.userName || "Desconocido",
          userEmail: item.applicantEmail || item.userEmail || "",
          userPhoto: item.userPhoto || "",
          petName: item.petName || "Sin nombre",
          petPhoto: item.petPhoto || "",
          compatPct: item.compatibilityScore ?? null,
          compatLabel: item.compatibilityScore == null ? "Sin Evaluar" : compatLabel,
          estado: item.status as EstadoSolicitud,
          fecha: new Date(item.createdAt).toLocaleDateString("es-ES"),
        };
      });

      setVisible(parsedItems);
      setItems(parsedItems);
      setLoading(false);
    },
    [],
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
  }, [query, estado, sort, page]);

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

function mapEstadoToStatusId(estado: EstadoSolicitud): number {
  const map: Record<EstadoSolicitud, number> = {
    NUEVA: 1201,
    EN_EVALUACION: 1202,
    ENTREVISTA_PENDIENTE: 1203,
    ACEPTADA_CON_SEGUIMIENTO: 1204,
    ACEPTADA: 1205,
    DESCARTADA: 1206,
  };
  return map[estado] || 1201;
}
