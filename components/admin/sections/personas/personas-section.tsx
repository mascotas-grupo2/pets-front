"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Users,
  ShieldCheck,
  Heart,
  User,
  Eye,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "../../ui/data-table";
import { TablePagination } from "../../ui/table-pagination";
import { usePagination } from "../../lib/use-pagination";
import { Pill } from "../../ui/pill";
import type { Tone } from "../../ui/types";
import { getAdminUsers, type AdminUser } from "@/services/user.admin";

type TipoFiltro = "todos" | "admin" | "adoptante" | "comun";

const PAGE_SIZE = 10;

const FILTROS: { id: TipoFiltro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "admin", label: "Admins" },
  { id: "adoptante", label: "Adoptantes" },
  { id: "comun", label: "Usuarios comunes" },
];

/** Categoría de una persona: admin tiene prioridad sobre adoptante. */
function categoria(u: AdminUser): TipoFiltro {
  if (u.role === "admin") return "admin";
  if (u.adopter) return "adoptante";
  return "comun";
}

const TIPO_META: Record<
  Exclude<TipoFiltro, "todos">,
  { label: string; tone: Tone }
> = {
  admin: { label: "Admin", tone: "violet" },
  adoptante: { label: "Adoptante", tone: "green" },
  comun: { label: "Usuario común", tone: "gray" },
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function fecha(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-AR");
}

/** Gestión de usuarios y adoptantes: conteos, búsqueda/filtros y tabla. */
export function PersonasSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState<TipoFiltro>("todos");
  const [showFiltros, setShowFiltros] = useState(false);

  useEffect(() => {
    // Traemos hasta 100 (límite del endpoint) y resolvemos conteos/filtros en
    // el cliente. Para >100 usuarios habría que paginar/contar en el backend.
    getAdminUsers({ pageSize: 100 }).then((res) => {
      if (res.ok && res.data) {
        setUsers(res.data.items);
        setTotal(res.data.total);
      } else {
        toast.error("No se pudieron cargar las personas.");
      }
      setLoading(false);
    });
  }, []);

  const counts = useMemo(
    () => ({
      total,
      admins: users.filter((u) => categoria(u) === "admin").length,
      adoptantes: users.filter((u) => categoria(u) === "adoptante").length,
      comunes: users.filter((u) => categoria(u) === "comun").length,
    }),
    [users, total],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (tipo !== "todos" && categoria(u) !== tipo) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    });
  }, [users, query, tipo]);

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    total: totalRows,
    desde,
    hasta,
  } = usePagination(visible, PAGE_SIZE);

  function placeholder() {
    toast.info("Próximamente.");
  }

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "Nombre",
      render: (u) => (
        <div className="dash-user">
          {u.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="persona-avatar" src={u.photo} alt="" />
          ) : (
            <span className="dash-avatar" aria-hidden>
              {initials(u.name)}
            </span>
          )}
          <span className="dash-user-name">{u.name}</span>
        </div>
      ),
    },
    { key: "email", label: "Email", tdClassName: "dash-muted", render: (u) => u.email },
    {
      key: "tipo",
      label: "Tipo",
      render: (u) => {
        const meta = TIPO_META[categoria(u) as Exclude<TipoFiltro, "todos">];
        return <Pill tone={meta.tone}>{meta.label}</Pill>;
      },
    },
    {
      key: "actividad",
      label: "Última actividad",
      tdClassName: "dash-muted",
      render: (u) => fecha(u.createdAt),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      tdClassName: "dash-cell-action",
      render: () => (
        <div className="dash-row-actions">
          <button type="button" aria-label="Ver" title="Ver" onClick={placeholder}>
            <Eye size={15} />
          </button>
          <button
            type="button"
            aria-label="Editar"
            title="Editar"
            onClick={placeholder}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            aria-label="Más"
            title="Más"
            onClick={placeholder}
          >
            <MoreVertical size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="pub mascotas personas">
      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-icon tone-blue">
            <Users size={22} aria-hidden />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Total personas</span>
            <span className="dash-stat-value">
              {loading ? "…" : counts.total}
            </span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon tone-violet">
            <ShieldCheck size={22} aria-hidden />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Admins</span>
            <span className="dash-stat-value">
              {loading ? "…" : counts.admins}
            </span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon tone-green">
            <Heart size={22} aria-hidden />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Adoptantes</span>
            <span className="dash-stat-value">
              {loading ? "…" : counts.adoptantes}
            </span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon tone-amber">
            <User size={22} aria-hidden />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Usuarios comunes</span>
            <span className="dash-stat-value">
              {loading ? "…" : counts.comunes}
            </span>
          </div>
        </div>
      </div>

      <div className="pub-controls">
        <div className="pub-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Buscar persona..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setShowFiltros((s) => !s)}
        >
          <SlidersHorizontal size={16} aria-hidden /> Filtros
        </button>
      </div>

      {showFiltros && (
        <div className="pub-filter-chips">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`pub-chip${tipo === f.id ? " active" : ""}`}
              onClick={() => {
                setTipo(f.id);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <DataTable
        columns={columns}
        data={pageItems}
        rowKey={(u) => u.id}
        loading={loading}
        loadingLabel="Cargando personas…"
        empty="No hay personas para mostrar."
      />

      {!loading && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={totalRows}
          desde={desde}
          hasta={hasta}
          onPage={setPage}
        />
      )}
    </div>
  );
}
