"use client";

import { AdminSubnav } from "@/components/admin-subnav";
import { useAdminGuard } from "@/components/admin/use-admin-guard";
import handleToast from "@/components/utils/toast";
import {
  AdminUser,
  AdminUserRole,
  listAdminUsers,
  updateUserRole,
} from "@/services/admin.users";
import { useCallback, useEffect, useMemo, useState } from "react";

const ROLE_OPTIONS: { value: AdminUserRole | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "Usuario" },
];

const PAGE_SIZE = 20;

export default function AdminUsuariosPage() {
  const { user: currentUser, blocked } = useAdminGuard();

  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | "todos">(
    "todos",
  );
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;

    const startFetching = async () => {
      const res = await listAdminUsers({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        role: roleFilter === "todos" ? undefined : roleFilter,
      });

      if (!ignore) {
        if (res.ok && res.data) {
          setItems(res.data.items);
          setTotal(res.data.total);
        }
        setLoading(false);
      }
    };

    startFetching();
    return () => {
      ignore = true;
    };
  }, [page, search, roleFilter]);

  // Debounce de búsqueda
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return;

    const t = setTimeout(() => {
      setLoading(true);
      setSearch(trimmed);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleRoleChange = async (
    user: AdminUser,
    newRole: AdminUserRole,
  ) => {
    if (user.role === newRole) return;
    const action = newRole === "admin" ? "promover a admin" : "quitar admin a";
    if (
      !window.confirm(
        `¿Seguro que querés ${action} ${user.name || user.email}?`,
      )
    ) {
      return;
    }
    setSavingId(user.id);
    const res = await updateUserRole(user.id, newRole);
    setSavingId(null);
    if (res.ok && res.data) {
      setItems((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: res.data!.role } : u)),
      );
      handleToast("success", `Rol actualizado para ${user.email}.`);
    } else {
      handleToast("error", res.error ?? "No se pudo actualizar el rol.");
    }
  };

  const summary = useMemo(() => {
    const admins = items.filter((u) => u.role === "admin").length;
    return { admins, users: items.length - admins };
  }, [items]);

  if (blocked) return null;

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Panel de admin — Usuarios</h1>
          <p>Gestioná los roles de los usuarios registrados.</p>
        </div>
      </div>

      <div className="container" style={{ padding: "2rem 0" }}>
        <AdminSubnav />

        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <label className="field-label" htmlFor="admin-users-search">
              Buscar
            </label>
            <input
              id="admin-users-search"
              className="input"
              type="search"
              placeholder="Nombre o email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="admin-toolbar-filter">
            <label className="field-label" htmlFor="admin-users-role">
              Rol
            </label>
            <select
              id="admin-users-role"
              className="select"
              value={roleFilter}
              onChange={(e) => {
                const val = e.target.value as AdminUserRole | "todos";
                if (val !== roleFilter) {
                  setLoading(true);
                  setRoleFilter(val);
                  setPage(1);
                }
              }}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <p className="admin-toolbar-count">
            <strong>{total}</strong>{" "}
            {total === 1 ? "usuario" : "usuarios"} ·{" "}
            {summary.admins} admin{summary.admins !== 1 ? "s" : ""} en esta
            página
          </p>
        </div>

        {loading ? (
          <p style={{ padding: "2rem 0", textAlign: "center" }}>Cargando…</p>
        ) : items.length === 0 ? (
          <p style={{ padding: "2rem 0", textAlign: "center" }}>
            No se encontraron usuarios.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Origen</th>
                  <th>Rol</th>
                  <th>Registrado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => {
                  const isSelf = currentUser.name === u.name; // fallback (no expongo email del usuario)
                  const busy = savingId === u.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-thumb">
                            {u.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.photo} alt={u.name} />
                            ) : (
                              <span aria-hidden>👤</span>
                            )}
                          </div>
                          <div>
                            <strong>{u.name || "(Sin nombre)"}</strong>
                            <div className="admin-id">#{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {u.email}
                        {!u.emailVerified && (
                          <span
                            className="admin-chip"
                            style={{
                              marginLeft: "0.4rem",
                              fontSize: "0.7rem",
                            }}
                          >
                            sin verificar
                          </span>
                        )}
                      </td>
                      <td style={{ textTransform: "capitalize" }}>
                        {u.ssoProvider ?? "local"}
                      </td>
                      <td>
                        <span
                          className={`admin-chip ${
                            u.role === "admin"
                              ? "admin-chip-medico"
                              : "admin-chip-encontrado"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {new Date(u.createdAt).toLocaleDateString("es-AR")}
                      </td>
                      <td>
                        {u.role === "admin" ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            disabled={busy || isSelf}
                            title={
                              isSelf
                                ? "No podés cambiar tu propio rol"
                                : "Quitar permisos de admin"
                            }
                            onClick={() => handleRoleChange(u, "user")}
                          >
                            {busy ? "…" : "Quitar admin"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={busy}
                            onClick={() => handleRoleChange(u, "admin")}
                          >
                            {busy ? "…" : "Promover a admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="pagination"
            aria-label="Paginación"
            style={{ marginTop: "1.25rem" }}
          >
            <button
              type="button"
              className="pagination-btn"
              onClick={() => {
                setLoading(true);
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page === 1}
            >
              ←
            </button>
            <span style={{ padding: "0 0.75rem", alignSelf: "center" }}>
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => {
                setLoading(true);
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={page === totalPages}
            >
              →
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
