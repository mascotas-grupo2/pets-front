"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import handleToast from "@/components/utils/toast";
import {
  approvePet,
  deletePet,
  finalizePet,
  getAdminPetsPaged,
  rejectPet,
  updatePet,
} from "@/services/mascotas.pets";
import type { AdminPetSummary, Pet, PetReportStatus } from "@/types/pet";
import type { SortOrder } from "../../ui/data-table";

export type EstadoFiltro = "todos" | PetReportStatus;
export type SortKey = "name" | "tipo" | "estado" | "fecha" | "vistas";
export type SortDir = "asc" | "desc";

const PAGE_SIZE = 6;

type StatsResponse = {
  pendiente: number;
  activo: number;
  rechazado: number;
  finalizado: number;
  reservada: number;
};

type Params = {
  reportStatus?: PetReportStatus;
  q?: string;
  page: number;
  pageSize: number;
  sort?: SortOrder<SortKey>[];
};

/** Convierte el sort de la tabla al formato del back: "campo:DIR". */
function toSortParam(sort?: SortOrder<SortKey>[]): string | undefined {
  const first = sort?.[0];
  if (!first || first.key === "vistas") return undefined;
  return `${first.key}:${first.direction.toUpperCase()}`;
}

export function usePublicaciones() {
  const [pets, setPets] = useState<AdminPetSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<StatsResponse>({
    pendiente: 0,
    activo: 0,
    rechazado: 0,
    finalizado: 0,
    reservada: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [query, setQueryRaw] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("todos");
  const [sort, setSortRaw] = useState<SortOrder<SortKey>[]>([]);
  const [page, setPageRaw] = useState(1);

  // ── Fetch de tabla: el back pagina, filtra, ordena y devuelve los conteos ──
  const loadPets = useCallback(async (params: Params) => {
    setLoading(true);
    const res = await getAdminPetsPaged({
      page: params.page,
      pageSize: params.pageSize,
      reportStatus: params.reportStatus,
      q: params.q,
      sort: toSortParam(params.sort),
    });
    if (res.ok && res.data) {
      setPets(res.data.items);
      setTotal(res.data.total);
      setCounts(res.data.statusTotals);
      setStatsLoading(false);
    } else {
      handleToast("error", "No se pudieron cargar las publicaciones.");
    }
    setLoading(false);
  }, []);

  // Parámetros actuales para el fetch
  const currentParams: Params = useMemo(() => ({
    reportStatus: estado !== "todos" ? (estado as PetReportStatus) : undefined,
    q: query.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
    sort,
  }), [estado, query, page, sort]);

  useEffect(() => {
    const trigger = async () => {
      await loadPets(currentParams);
    };
    void trigger();
  }, [loadPets, currentParams]);

  // ── Helpers de control ────────────────────────────────────────────────────
  function setQuery(value: string) {
    setQueryRaw(value);
    setPageRaw(1);
  }

  function handleSetEstado(value: EstadoFiltro) {
    setEstado(value);
    setPageRaw(1);
  }

  function toggleEstado(key: PetReportStatus) {
    handleSetEstado(estado === key ? "todos" : key);
  }

  function setSort(next: SortOrder<SortKey>[]) {
    setPageRaw(1);
    setSortRaw(next);
  }

  function setPage(n: number) {
    setPageRaw(n);
  }

  // ── Reload (tras mutaciones) ──────────────────────────────────────────────
  const reload = useCallback(() => {
    loadPets(currentParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, estado, sort, page]);

  // ── Acciones ──────────────────────────────────────────────────────────────
  async function handleApprove(id: string) {
    const res = await approvePet(id);
    if (res.ok) {
      handleToast("success", "Publicación aprobada.");
      await reload();
      return true;
    }
    handleToast("error", "No se pudo aprobar. Probá de nuevo.");
    return false;
  }

  async function handleReject(id: string, reason?: string) {
    const res = await rejectPet(id, reason);
    if (res.ok) {
      handleToast("success", "Publicación rechazada.");
      await reload();
      return true;
    }
    handleToast("error", "No se pudo rechazar. Probá de nuevo.");
    return false;
  }

  async function handleFinalize(id: string) {
    const res = await finalizePet(id);
    if (res.ok) {
      handleToast("success", "Publicación finalizada.");
      await reload();
      return true;
    }
    handleToast("error", "No se pudo finalizar. Probá de nuevo.");
    return false;
  }

  async function handleDelete(id: string, reason?: string) {
    const res = await deletePet(id, reason);
    if (res.ok) {
      handleToast("success", "Publicación eliminada.");
      await reload();
      return true;
    }
    handleToast("error", "No se pudo eliminar. Probá de nuevo.");
    return false;
  }

  async function handleSave(id: string, patch: Partial<Pet>) {
    const res = await updatePet(id, patch);
    if (res.ok) {
      handleToast("success", "Publicación actualizada.");
      await reload();
      return true;
    }
    handleToast("error", "No se pudo guardar. Probá de nuevo.");
    return false;
  }

  // ── Paginación derivada ───────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const desde = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(page * PAGE_SIZE, total);

  return {
    visible: pets,
    loading,
    counts,
    statsLoading,
    query,
    setQuery,
    estado,
    setEstado: handleSetEstado,
    toggleEstado,
    sort,
    setSort,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handleApprove,
    handleReject,
    handleFinalize,
    handleDelete,
    handleSave,
    reload,
  };
}
