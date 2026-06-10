"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAdminPets, deletePet } from "@/services/mascotas.pets";
import type { AdminPetSummary, AnimalType, PetStatus } from "@/types/pet";
import type { SortOrder } from "../../ui/data-table";

export type FiltroEstado = "todas" | "refugio" | "adopcion" | "adoptados";
export type FiltroEspecie = "todas" | AnimalType;

const PAGE_SIZE = 8;

/** "refugio" agrupa todo lo que no es adopción ni adoptado. */
export function inFiltro(status: PetStatus | undefined, f: FiltroEstado) {
  if (f === "todas") return true;
  if (f === "adopcion") return status === "en adopción";
  if (f === "adoptados") return status === "adoptado";
  return status !== "en adopción" && status !== "adoptado";
}

type Params = {
  filtro: FiltroEstado;
  especie: FiltroEspecie;
  q: string;
  sort: SortOrder<string>[];
  page: number;
};

export function useMascotas() {
  const [visible, setVisible] = useState<AdminPetSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    todas: 0,
    refugio: 0,
    adopcion: 0,
    adoptados: 0,
  });
  const [loading, setLoading] = useState(true);

  const [query, setQueryRaw] = useState("");
  const [filtro, setFiltroRaw] = useState<FiltroEstado>("todas");
  const [especie, setEspecieRaw] = useState<FiltroEspecie>("todas");
  const [sort, setSortRaw] = useState<SortOrder<string>[]>([{ key: "name", direction: "asc" }]);
  const [page, setPageRaw] = useState(1);

  // ── Fetch + filtrado cliente (temporal hasta que el back soporte params) ──
  // TODO: reemplazar el cuerpo de loadPets por:
  // const res = await getAdminPets({ filtro, especie, q, sort, page, pageSize: PAGE_SIZE });
  // setPets(res.data.data); setTotal(res.data.total); setCounts(res.data.counts);
  const loadPets = useCallback(async (params: Params) => {
    setLoading(true);
    const res = await getAdminPets();
    if (res.ok && res.data) {
      const all = res.data;

      // Counts sobre el total (no sobre la página)
      setCounts({
        todas: all.length,
        refugio: all.filter((p) => inFiltro(p.status, "refugio")).length,
        adopcion: all.filter((p) => p.status === "en adopción").length,
        adoptados: all.filter((p) => p.status === "adoptado").length,
      });

      // Filtrado
      const q = params.q.trim().toLowerCase();
      let filtered = all.filter((p) => {
        if (!inFiltro(p.status, params.filtro)) return false;
        if (params.especie !== "todas" && p.animalType !== params.especie)
          return false;
        if (!q) return true;
        return (
          (p.name ?? "").toLowerCase().includes(q) ||
          (p.breed ?? "").toLowerCase().includes(q) ||
          (p.animalTypeLabel ?? p.animalType ?? "").toLowerCase().includes(q)
        );
      });

      // Sort
      const activeSort = params.sort?.[0];
      if (activeSort?.key === "name") {
        filtered = [...filtered].sort((a, b) => {
          const c = (a.name ?? "").localeCompare(b.name ?? "", "es", {
            sensitivity: "base",
          });
          return activeSort.direction === "asc" ? c : -c;
        });
      }

      setTotal(filtered.length);
      const from = (params.page - 1) * PAGE_SIZE;
      setVisible(filtered.slice(from, from + PAGE_SIZE));
    } else {
      toast.error("No se pudieron cargar las mascotas.");
    }
    setLoading(false);
  }, []);

  const currentParams: Params = useMemo(
    () => ({ filtro, especie, q: query, sort, page }),
    [filtro, especie, query, sort, page]
  );

  useEffect(() => {
    const trigger = async () => {
      await loadPets(currentParams);
    };
    void trigger();
  }, [loadPets, currentParams]);

  const reload = useCallback(
    () => loadPets(currentParams),
    [currentParams, loadPets],
  );

  // ── Setters que resetean página ───────────────────────────────────────────
  function setQuery(v: string) {
    setQueryRaw(v);
    setPageRaw(1);
  }
  function setFiltro(v: FiltroEstado) {
    setFiltroRaw(v);
    setPageRaw(1);
  }
  function setEspecie(v: FiltroEspecie) {
    setEspecieRaw(v);
    setPageRaw(1);
  }
  function setPage(n: number) {
    setPageRaw(n);
  }
  function setSort(next: SortOrder<string>[]) {
    setPageRaw(1);
    setSortRaw(next);
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  async function handleDelete(pet: AdminPetSummary) {
    if (
      !window.confirm(
        `¿Eliminar "${pet.name ?? "sin nombre"}"? Esta acción no se puede deshacer.`,
      )
    )
      return false;
    const res = await deletePet(pet.id);
    if (res.ok) {
      toast.success("Mascota eliminada.");
      await reload();
      return true;
    }
    toast.error("No se pudo eliminar. Probá de nuevo.");
    return false;
  }

  // ── Paginación derivada ───────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const desde = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(page * PAGE_SIZE, total);

  return {
    visible,
    loading,
    counts,
    query,
    setQuery,
    filtro,
    setFiltro,
    especie,
    setEspecie,
    sort,
    setSort,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handleDelete,
    reload,
  };
}
