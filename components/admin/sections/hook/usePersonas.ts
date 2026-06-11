"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getAdminUsers,
  updateUserRole,
  type AdminUser,
} from "@/services/user.admin";

export type TipoFiltro = "todos" | "admin" | "adoptante" | "comun";

const PAGE_SIZE = 8;
const ROLE_ID = { admin: 502, user: 501 } as const;

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
  const [page, setPageRaw] = useState(1);

  // El back pagina, filtra y devuelve los conteos globales (cards correctas).
  const loadUsers = useCallback(async (params: Params) => {
    setLoading(true);
    const res = await getAdminUsers({
      ...tipoToParams(params.tipo),
      search: params.q.trim() || undefined,
      page: params.page,
      pageSize: PAGE_SIZE,
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

  const currentParams: Params = useMemo(() => ({ tipo, q: query, page }), [tipo, query, page]);

  useEffect(() => {
    loadUsers(currentParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, tipo, page]);

  const reload = useCallback(
    () => loadUsers(currentParams),
    [currentParams, loadUsers],
  );

  function setQuery(v: string) {
    setQueryRaw(v);
    setPageRaw(1);
  }
  function setTipo(v: TipoFiltro) {
    setTipoRaw(v);
    setPageRaw(1);
  }
  function setPage(n: number) {
    setPageRaw(n);
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  // TODO: implementar cuando existan los endpoints
  async function handleDelete(user: AdminUser): Promise<boolean> {
    if (
      !window.confirm(
        `¿Eliminar a "${user.name}"? Esta acción no se puede deshacer.`,
      )
    )
      return false;
    // const res = await deleteUser(user.id);
    // if (res.ok) { toast.success("Usuario eliminado."); await reload(); return true; }
    toast.error("Eliminar usuario no está disponible aún.");
    return false;
  }

  async function handlePromote(user: AdminUser): Promise<boolean> {
    if (!window.confirm(`¿Promover a "${user.name}" como administrador?`))
      return false;
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
    if (!window.confirm(`¿Quitar el rol de administrador a "${user.name}"?`))
      return false;
    const res = await updateUserRole(user.id, "user");
    if (res.ok) {
      toast.success(`"${user.name}" ya no es administrador.`);
      await reload();
      return true;
    }
    // El back devuelve 400 si es el último admin del sistema.
    toast.error(
      res.status === 400
        ? "No se puede: es el único administrador."
        : "No se pudo cambiar el rol.",
    );
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
    tipo,
    setTipo,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handleDelete,
    handlePromote,
    handleDemote,
    reload,
  };
}
