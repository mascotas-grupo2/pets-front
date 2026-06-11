"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getFollowups,
  confirmFollowup,
  completeFollowup,
  createFollowup,
  type FollowupItem,
  type CreateFollowupInput,
} from "@/services/followups";
import { getAdminPets } from "@/services/mascotas.pets";
import { getAdminUsers } from "@/services/user.admin";
import type { SortOrder } from "../../ui/data-table";
import {
  toSeguimiento,
  FOLLOWUP_STATUS,
  type Seguimiento,
  type SeguimientoTab,
} from "../seguimientos/seguimientos.data";

const PAGE_SIZE = 8;

export type SeguimientoSortKey =
  | "mascota"
  | "tipo"
  | "fecha"
  | "responsable"
  | "estado";

/** Valor comparable de una fila según la columna de orden. */
function sortValue(s: Seguimiento, key: SeguimientoSortKey): string | number {
  switch (key) {
    case "mascota":
      return s.petName.toLowerCase();
    case "tipo":
      return s.tipo.toLowerCase();
    case "responsable":
      return s.responsable.toLowerCase();
    case "estado":
      return s.estado.toLowerCase();
    case "fecha":
      return new Date(s.appointmentAt).getTime();
    default:
      return "";
  }
}

/** Ordena por la lista de criterios activos (multi-columna). */
function applySort(items: Seguimiento[], sort: SortOrder<SeguimientoSortKey>[]): Seguimiento[] {
  if (sort.length === 0) return items;
  return [...items].sort((a, b) => {
    for (const { key, direction } of sort) {
      const va = sortValue(a, key);
      const vb = sortValue(b, key);
      if (va < vb) return direction === "asc" ? -1 : 1;
      if (va > vb) return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
}

export type Option<V> = { value: V; label: string };

/** Construye los mapas de enriquecimiento y las opciones para los selects. */
async function loadLookups() {
  const [petsRes, usersRes] = await Promise.all([
    getAdminPets(),
    getAdminUsers({ pageSize: 100 }),
  ]);

  const petMap = new Map<string, { name: string; photo: string | null }>();
  const petOptions: Option<string>[] = [];
  if (petsRes.ok && petsRes.data) {
    for (const p of petsRes.data) {
      const name = p.name ?? "Sin nombre";
      petMap.set(p.id, { name, photo: p.photos?.[0] ?? null });
      petOptions.push({ value: p.id, label: name });
    }
  }

  const userMap = new Map<number, string>();
  const userOptions: Option<number>[] = [];
  if (usersRes.ok && usersRes.data) {
    for (const u of usersRes.data.items) {
      userMap.set(u.id, u.name);
      userOptions.push({ value: u.id, label: u.name });
    }
  }

  return { petMap, userMap, petOptions, userOptions };
}

/** Filtra según la pestaña activa (cards). */
function filterByTab(items: Seguimiento[], tab: SeguimientoTab, now: Date): Seguimiento[] {
  if (tab === "pendientes") return items.filter((s) => s.estadoId === FOLLOWUP_STATUS.pendiente);
  if (tab === "confirmadas") return items.filter((s) => s.estadoId === FOLLOWUP_STATUS.confirmado);
  if (tab === "completadas") return items.filter((s) => s.estadoId === FOLLOWUP_STATUS.completado);
  return items;
}

export function useSeguimientos() {
  const [all, setAll] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTabRaw] = useState<SeguimientoTab>("todas");
  const [query, setQueryRaw] = useState("");
  const [page, setPageRaw] = useState(1);
  const [sort, setSortRaw] = useState<SortOrder<SeguimientoSortKey>[]>([]);
  // Filtros reales (delegables al back; acá se aplican sobre la data cargada).
  const [filterTipo, setFilterTipoRaw] = useState<number | null>(null);
  const [filterEstado, setFilterEstadoRaw] = useState<number | null>(null);
  // Opciones para los selects del drawer de alta.
  const [petOptions, setPetOptions] = useState<Option<string>[]>([]);
  const [userOptions, setUserOptions] = useState<Option<number>[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ petMap, userMap, petOptions: pOpts, userOptions: uOpts }, res] = await Promise.all([
      loadLookups(),
      getFollowups({ pageSize: 100 }),
    ]);
    setPetOptions(pOpts);
    setUserOptions(uOpts);

    if (!res.ok || !res.data) {
      toast.error("No se pudieron cargar los seguimientos.");
      setLoading(false);
      return;
    }

    const now = new Date();
    const mapped = res.data.items
      .map((f: FollowupItem) => toSeguimiento(f, petMap, userMap, now))
      .sort((a, b) => new Date(a.appointmentAt).getTime() - new Date(b.appointmentAt).getTime());

    setAll(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const now = useMemo(() => new Date(), [all]);

  const counts = useMemo(() => ({
    todas: all.length,
    pendientes: all.filter((s) => s.estadoId === FOLLOWUP_STATUS.pendiente).length,
    confirmadas: all.filter((s) => s.estadoId === FOLLOWUP_STATUS.confirmado).length,
    completadas: all.filter((s) => s.estadoId === FOLLOWUP_STATUS.completado).length,
  }), [all]);

  // Listado filtrado por pestaña + filtros + búsqueda + orden (datos ya cargados).
  const filtered = useMemo(() => {
    let base = filterByTab(all, tab, now);
    if (filterTipo != null) base = base.filter((s) => s.typeId === filterTipo);
    if (filterEstado != null) base = base.filter((s) => s.estadoId === filterEstado);
    const q = query.trim().toLowerCase();
    const matched = q
      ? base.filter(
          (s) =>
            s.petName.toLowerCase().includes(q) ||
            s.tipo.toLowerCase().includes(q) ||
            s.responsable.toLowerCase().includes(q),
        )
      : base;
    return applySort(matched, sort);
  }, [all, tab, query, sort, filterTipo, filterEstado, now]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const desde = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(safePage * PAGE_SIZE, total);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function setTab(value: SeguimientoTab) {
    setTabRaw(value);
    setPageRaw(1);
  }
  function setQuery(value: string) {
    setQueryRaw(value);
    setPageRaw(1);
  }
  function setPage(n: number) {
    setPageRaw(n);
  }
  function setSort(next: SortOrder<SeguimientoSortKey>[]) {
    setPageRaw(1);
    setSortRaw(next);
  }
  function setFilterTipo(value: number | null) {
    setFilterTipoRaw((cur) => (cur === value ? null : value));
    setPageRaw(1);
  }
  function setFilterEstado(value: number | null) {
    setFilterEstadoRaw((cur) => (cur === value ? null : value));
    setPageRaw(1);
  }

  async function handleCreate(input: CreateFollowupInput) {
    const res = await createFollowup(input);
    if (res.ok) {
      toast.success("Seguimiento agendado correctamente.");
      await load();
      return true;
    }
    toast.error("No se pudo agendar el seguimiento.");
    return false;
  }

  async function handleConfirm(s: Seguimiento) {
    const res = await confirmFollowup(s.id);
    if (res.ok) {
      toast.success("Seguimiento confirmado.");
      await load();
      return true;
    }
    toast.error("No se pudo confirmar.");
    return false;
  }

  async function handleComplete(s: Seguimiento) {
    if (s.estadoId !== FOLLOWUP_STATUS.confirmado) {
      toast.error("Solo se pueden completar seguimientos confirmados.");
      return false;
    }
    const res = await completeFollowup(s.id);
    if (res.ok) {
      toast.success("Seguimiento completado.");
      await load();
      return true;
    }
    toast.error("No se pudo completar.");
    return false;
  }

  return {
    loading,
    tab,
    setTab,
    query,
    setQuery,
    sort,
    setSort,
    filterTipo,
    setFilterTipo,
    filterEstado,
    setFilterEstado,
    petOptions,
    userOptions,
    handleCreate,
    visible,
    total,
    page: safePage,
    setPage,
    totalPages,
    desde,
    hasta,
    counts,
    items: all,
    now,
    reload: load,
    handleConfirm,
    handleComplete,
  };
}
