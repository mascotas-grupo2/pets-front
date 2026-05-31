"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getAdminUsers, type AdminUser } from "@/services/user.admin";

export type TipoFiltro = "todos" | "admin" | "adoptante" | "comun";

const PAGE_SIZE = 10;

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
  const [counts, setCounts] = useState({ todos: 0, admin: 0, adoptante: 0, comun: 0 });
  const [loading, setLoading] = useState(true);

  const [query, setQueryRaw] = useState("");
  const [tipo, setTipoRaw] = useState<TipoFiltro>("todos");
  const [page, setPageRaw] = useState(1);

  // ── Fetch + filtrado cliente (temporal hasta que el back soporte params) ──
  // TODO: reemplazar por:
  // const res = await getAdminUsers({ tipo, q, page, pageSize: PAGE_SIZE });
  // setVisible(res.data.items); setTotal(res.data.total); setCounts(res.data.counts);
  const loadUsers = useCallback(async (params: Params) => {
    setLoading(true);
    const search = params.q;
    const page = params.page;
    const pageSize = PAGE_SIZE;
    const res = await getAdminUsers({search, page,  pageSize });
    if (res.ok && res.data) {
      const all = res.data.items;

      setCounts({
        todos: res.data.total,
        admin: all.filter((u) => categoriaUsuario(u) === "admin").length,
        adoptante: all.filter((u) => categoriaUsuario(u) === "adoptante").length,
        comun: all.filter((u) => categoriaUsuario(u) === "comun").length,
      });

      const q = params.q.trim().toLowerCase();
      const filtered = all.filter((u) => {
        if (params.tipo !== "todos" && categoriaUsuario(u) !== params.tipo) return false;
        if (!q) return true;
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      });

      setTotal(filtered.length);
      const from = (params.page - 1) * PAGE_SIZE;
      setVisible(filtered.slice(from, from + PAGE_SIZE));
    } else {
      toast.error("No se pudieron cargar las personas.");
    }
    setLoading(false);
  }, []);

  const currentParams: Params = { tipo, q: query, page };

  useEffect(() => {
    loadUsers(currentParams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, tipo, page]);

  const reload = useCallback(() => loadUsers(currentParams), [currentParams, loadUsers]);

  function setQuery(v: string) { setQueryRaw(v); setPageRaw(1); }
  function setTipo(v: TipoFiltro) { setTipoRaw(v); setPageRaw(1); }
  function setPage(n: number) { setPageRaw(n); }

  // ── Acciones ──────────────────────────────────────────────────────────────
  // TODO: implementar cuando existan los endpoints
  async function handleDelete(user: AdminUser): Promise<boolean> {
    if (!window.confirm(`¿Eliminar a "${user.name}"? Esta acción no se puede deshacer.`)) return false;
    // const res = await deleteUser(user.id);
    // if (res.ok) { toast.success("Usuario eliminado."); await reload(); return true; }
    toast.error("Eliminar usuario no está disponible aún.");
    return false;
  }

  async function handlePromote(user: AdminUser): Promise<boolean> {
    if (!window.confirm(`¿Promover a "${user.name}" como administrador?`)) return false;
    // const res = await promoteUser(user.id);
    // if (res.ok) { toast.success("Usuario promovido a admin."); await reload(); return true; }
    toast.error("Promover usuario no está disponible aún.");
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
    query, setQuery,
    tipo, setTipo,
    page, setPage, totalPages, total, desde, hasta,
    handleDelete,
    handlePromote,
    reload,
  };
}
