"use client";

import { useCallback, useEffect, useState } from "react";
import handleToast from "@/components/utils/toast";
import {
  approvePet,
  deletePet,
  finalizePet,
  getAdminPets,
  rejectPet,
  updatePet,
} from "@/services/mascotas.pets";
import type { AdminPetSummary, Pet, PetReportStatus } from "@/types/pet";

export type EstadoFiltro = "todos" | PetReportStatus;
export type SortKey = "name" | "tipo" | "estado" | "fecha" | "vistas";
export type SortDir = "asc" | "desc";
export type Sort = { key: SortKey; dir: SortDir };

const PAGE_SIZE = 6;

// ── Tipos de respuesta esperados del back ─────────────────────────────────────
// Cuando el back esté listo, getAdminPets deberá aceptar estos params
// y devolver PaginatedResponse<AdminPetSummary>

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

type StatsResponse = {
  pendiente: number;
  activo: number;
  rechazado: number;
  finalizado: number;
};

type Params = {
  reportStatus?: PetReportStatus;
  q?: string;
  page: number;
  pageSize: number;
  sortKey?: SortKey;
  sortDir?: SortDir;
};

// ── TODO: reemplazar con la firma real cuando el back esté listo ──────────────
// export const getAdminPets = (params: Params) =>
//   request<PaginatedResponse<AdminPetSummary>>(() =>
//     axios.get("mascotas/admin/list", { params })
//   );
//
// export const getAdminPetStats = () =>
//   request<StatsResponse>(() => axios.get("mascotas/admin/stats"));

export function usePublicaciones() {
  const [pets, setPets] = useState<AdminPetSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<StatsResponse>({
    pendiente: 0,
    activo: 0,
    rechazado: 0,
    finalizado: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [query, setQueryRaw] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("todos");
  const [sort, setSort] = useState<Sort | null>(null);
  const [page, setPageRaw] = useState(1);

  // ── Fetch de stats (independiente de la tabla) ────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    // TODO: reemplazar por llamada real al endpoint de stats
    // const res = await getAdminPetStats();
    // if (res.ok && res.data) setCounts(res.data);
    //
    // Mientras tanto: calculamos sobre el total (solo funciona sin paginación)
    setStatsLoading(false);
  }, []);

  // ── Fetch de tabla (con params de filtro/sort/paginación) ─────────────────
  const loadPets = useCallback(async (params: Params) => {
    setLoading(true);
    // TODO: cuando el back soporte params, pasarlos acá:
    // const res = await getAdminPets(params);
    // if (res.ok && res.data) {
    //   setPets(res.data.data);
    //   setTotal(res.data.total);
    // }
    //
    // ── TEMPORAL: trae todo y filtra/pagina en cliente ────────────────────────
    const res = await getAdminPets();
    if (res.ok && res.data) {
      let filtered = res.data;

      // Filtro por estado
      if (params.reportStatus) {
        filtered = filtered.filter(
          (p) => p.reportStatus === params.reportStatus,
        );
      }

      // Búsqueda
      if (params.q) {
        const q = params.q.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            (p.name ?? "").toLowerCase().includes(q) ||
            (p.description ?? "").toLowerCase().includes(q) ||
            (p.location ?? "").toLowerCase().includes(q),
        );
      }

      // Sort
      if (params.sortKey && params.sortKey !== "vistas") {
        filtered = [...filtered].sort((a, b) => {
          let c = 0;
          if (params.sortKey === "name")
            c = (a.name ?? "").localeCompare(b.name ?? "", "es", {
              sensitivity: "base",
            });
          else if (params.sortKey === "tipo")
            c = (a.statusLabel ?? a.status ?? "").localeCompare(
              b.statusLabel ?? b.status ?? "",
              "es",
              { sensitivity: "base" },
            );
          else if (params.sortKey === "estado")
            c = rankEstado(a.reportStatus) - rankEstado(b.reportStatus);
          else if (params.sortKey === "fecha")
            c = dateVal(a.date) - dateVal(b.date);
          return params.sortDir === "desc" ? -c : c;
        });
      }

      // Stats temporales (sobre total sin paginar)
      setCounts({
        pendiente: res.data.filter((p) => p.reportStatus === "pendiente")
          .length,
        activo: res.data.filter((p) => p.reportStatus === "activo").length,
        rechazado: res.data.filter((p) => p.reportStatus === "rechazado")
          .length,
        finalizado: res.data.filter((p) => p.reportStatus === "finalizado")
          .length,
      });

      // Paginación
      setTotal(filtered.length);
      const from = (params.page - 1) * params.pageSize;
      setPets(filtered.slice(from, from + params.pageSize));
    } else {
      handleToast("error", "No se pudieron cargar las publicaciones.");
    }
    setLoading(false);
  }, []);

  // Parámetros actuales para el fetch
  const currentParams: Params = {
    reportStatus: estado !== "todos" ? (estado as PetReportStatus) : undefined,
    q: query.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
    sortKey: sort?.key,
    sortDir: sort?.dir,
  };

  useEffect(() => {
    loadPets(currentParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, estado, sort, page]);

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

  function toggleSort(key: SortKey) {
    setPageRaw(1);
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: "asc" };
      if (s.dir === "asc") return { key, dir: "desc" };
      return null;
    });
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

  async function handleReject(id: string) {
    const res = await rejectPet(id);
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

  async function handleDelete(id: string) {
    const res = await deletePet(id);
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
    toggleSort,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const ESTADO_RANK: Record<string, number> = {
  pendiente: 0,
  activo: 1,
  finalizado: 2,
  rechazado: 3,
};
function rankEstado(s?: string) {
  return s ? (ESTADO_RANK[s] ?? 99) : 99;
}
function dateVal(d?: string) {
  const t = d ? new Date(d).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
}
