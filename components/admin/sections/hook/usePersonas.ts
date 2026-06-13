"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  deleteUser,
  getAdminUsers,
  updateUserRole,
  type AdminUser,
} from "@/services/user.admin";
import { usePagination } from "./usePagination";
import type { SortOrder } from "../../ui/data-table";

export type TipoFiltro = "todos" | "admin" | "adoptante" | "comun";

const PAGE_SIZE = 8;
const ROLE_ID = { admin: 502, user: 501 } as const;

// Mapea las claves de columna de la tabla a los campos que ordena el backend
// (USER_SORT_MAP: name | email | role | createdAt | id).
const SORT_KEY_MAP: Record<string, string> = {
  name: "name",
  email: "email",
  tipo: "role",
  actividad: "createdAt",
};

/** Traduce el filtro de tipo a los params que entiende el back. */
function tipoToParams(tipo: TipoFiltro): { roleId?: number; adopter?: boolean } {
  if (tipo === "admin") return { roleId: ROLE_ID.admin };
  if (tipo === "adoptante") return { adopter: true };
  if (tipo === "comun") return { roleId: ROLE_ID.user, adopter: false };
  return {};
}

export function categoriaUsuario(u: AdminUser): Exclude<TipoFiltro, "todos"> {
  if (u.role === "admin") return "admin";
  if (u.adopter) return "adoptante";
  return "comun";
}

type Params = {
  tipo: TipoFiltro;
  q: string;
  page: number;
  sort: SortOrder<string>[];
};

export function usePersonas() {
  const [visible, setVisible] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    todos: 0,
    admin: 0,
    adoptante: 0,
    comun: 0,
  });
  const [loading, setLoading] = useState(true);

  const [query, setQueryRaw] = useState("");
  const [tipo, setTipoRaw] = useState<TipoFiltro>("todos");
  const [sort, setSortRaw] = useState<SortOrder<string>[]>([]);
  const { page, setPage, resetPage, totalPages, desde, hasta } = usePagination(PAGE_SIZE, total);

  // El back pagina, filtra, ordena y devuelve los conteos globales (cards correctas).
  const loadUsers = useCallback(async (params: Params) => {
    setLoading(true);
    const sortQuery = params.sort
      .map((s) => `${SORT_KEY_MAP[s.key] ?? s.key}:${s.direction}`)
      .join(",");
    const res = await getAdminUsers({
      ...tipoToParams(params.tipo),
      search: params.q.trim() || undefined,
      page: params.page,
      pageSize: PAGE_SIZE,
      sort: sortQuery || undefined,
    });
    if (res.ok && res.data) {
      setVisible(res.data.items);
      setTotal(res.data.total);
      setCounts({
        todos: res.data.totals.total,
        admin: res.data.totals.admins,
        adoptante: res.data.totals.adopters,
        comun: res.data.totals.comunes,
      });
    } else {
      toast.error("No se pudieron cargar las personas.");
    }
    setLoading(false);
  }, []);

  const currentParams: Params = useMemo(
    () => ({ tipo, q: query, page, sort }),
    [tipo, query, page, sort],
  );

  useEffect(() => {
    const trigger = async () => {
      await loadUsers(currentParams);
    };
    void trigger();
  }, [loadUsers, currentParams]);

  const reload = useCallback(
    () => loadUsers(currentParams),
    [currentParams, loadUsers],
  );

  function setQuery(v: string) {
    setQueryRaw(v);
    resetPage();
  }
  function setTipo(v: TipoFiltro) {
    setTipoRaw(v);
    resetPage();
  }
  function setSort(next: SortOrder<string>[]) {
    resetPage();
    setSortRaw(next);
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  // La confirmación la maneja la sección con ConfirmDialog (modal propio), no
  // con window.confirm: estos handlers ejecutan directamente la acción.
  async function handlePromote(user: AdminUser): Promise<boolean> {
    const res = await updateUserRole(user.id, "admin");
    if (res.ok) {
      toast.success(`"${user.name}" ahora es administrador.`);
      await reload();
      return true;
    }
    toast.error("No se pudo cambiar el rol.");
    return false;
  }

  async function handleDemote(user: AdminUser): Promise<boolean> {
    const res = await updateUserRole(user.id, "user");
    if (res.ok) {
      toast.success(`"${user.name}" ya no es administrador.`);
      await reload();
      return true;
    }
    // El back devuelve 400 si es el último admin del sistema.
    toast.error(
      res.error ||
        (res.status === 400
          ? "No se puede: es el único administrador."
          : "No se pudo cambiar el rol."),
    );
    return false;
  }

  async function handleDelete(user: AdminUser): Promise<boolean> {
    const res = await deleteUser(user.id);
    if (res.ok) {
      toast.success(`"${user.name}" fue eliminado.`);
      await reload();
      return true;
    }
    // El back devuelve 400 si es el último admin o si intentás borrarte a vos mismo.
    toast.error(res.error || "No se pudo eliminar el usuario.");
    return false;
  }

  return {
    visible,
    loading,
    counts,
    query,
    setQuery,
    tipo,
    setTipo,
    sort,
    setSort,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handlePromote,
    handleDemote,
    handleDelete,
    reload,
  };
}
