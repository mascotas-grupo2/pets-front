"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getAdminPetsPaged,
  deletePet,
  type PetStatusTotals,
} from "@/services/mascotas.pets";
import type { AdminPetSummary, AnimalType } from "@/types/pet";
import type { SortOrder } from "../../ui/data-table";

export type FiltroEstado =
  | "todas"
  | "perdido"
  | "refugio"
  | "adopcion"
  | "adoptados";
export type FiltroEspecie = "todas" | AnimalType;

const PAGE_SIZE = 8;

const ANIMAL_TYPE_ID: Record<AnimalType, number> = {
  perro: 1,
  gato: 2,
  otro: 3,
};

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
  const [counts, setCounts] = useState<PetStatusTotals>({
    todas: 0,
    perdido: 0,
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

  // El back pagina, filtra (categoría/especie/búsqueda), ordena y cuenta.
  const loadPets = useCallback(async (params: Params) => {
    setLoading(true);
    const first = params.sort?.[0];
    const res = await getAdminPetsPaged({
      page: params.page,
      pageSize: PAGE_SIZE,
      statusCategory: params.filtro !== "todas" ? params.filtro : undefined,
      animalTypeId:
        params.especie !== "todas" ? ANIMAL_TYPE_ID[params.especie] : undefined,
      q: params.q.trim() || undefined,
      sort: first ? `${first.key}:${first.direction.toUpperCase()}` : undefined,
    });
    if (res.ok && res.data) {
      setVisible(res.data.items);
      setTotal(res.data.total);
      setCounts(res.data.petStatusTotals);
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
