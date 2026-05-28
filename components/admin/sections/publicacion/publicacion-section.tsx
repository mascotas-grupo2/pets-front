"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  SlidersHorizontal,
  Plus,
  Eye,
  Pencil,
  MoreVertical,
  Trash2,
  Check,
  X,
  PawPrint,
} from "lucide-react";
import { toast } from "sonner";
import { Pill } from "../../ui/pill";
import { DataTable, type Column } from "../../ui/data-table";
import { EstadoPill } from "../../lib/pet-status";
import { PublicacionDrawer } from "./publicacion-drawer";
import {
  approvePet,
  deletePet,
  finalizePet,
  getAdminPets,
  rejectPet,
  updatePet,
} from "@/services/mascotas.pets";
import type { AdminPetSummary, Pet, PetReportStatus } from "@/types/pet";

type EstadoFiltro = "todos" | PetReportStatus;
type Accion = "approve" | "reject" | "finalize" | "delete";
type SortKey = "name" | "tipo" | "estado" | "fecha" | "vistas";
type SortDir = "asc" | "desc";
type Sort = { key: SortKey; dir: SortDir };

/** Orden lógico de los estados para ordenar por la columna ESTADO. */
const ESTADO_RANK: Record<PetReportStatus, number> = {
  pendiente: 0,
  activo: 1,
  finalizado: 2,
  rechazado: 3,
};

const FILTROS: { id: EstadoFiltro; label: string }[] = [
  { id: "todos", label: "Todas" },
  { id: "pendiente", label: "Nuevas" },
  { id: "activo", label: "Publicadas" },
  { id: "rechazado", label: "Rechazadas" },
  { id: "finalizado", label: "Finalizadas" },
];

const ACCION_OK: Record<Accion, string> = {
  approve: "aprobada",
  reject: "rechazada",
  finalize: "finalizada",
  delete: "eliminada",
};

/** Convierte la fecha a número comparable; 0 si no se puede parsear. */
function dateValue(d?: string) {
  const t = d ? new Date(d).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
}

/** Comparador entre dos publicaciones según la columna activa. */
function compare(a: AdminPetSummary, b: AdminPetSummary, key: SortKey): number {
  switch (key) {
    case "name":
      return (a.name ?? "").localeCompare(b.name ?? "", "es", {
        sensitivity: "base",
      });
    case "tipo":
      return (a.statusLabel ?? a.status ?? "").localeCompare(
        b.statusLabel ?? b.status ?? "",
        "es",
        { sensitivity: "base" },
      );
    case "estado":
      return (
        (a.reportStatus ? ESTADO_RANK[a.reportStatus] : 99) -
        (b.reportStatus ? ESTADO_RANK[b.reportStatus] : 99)
      );
    case "fecha":
      return dateValue(a.date) - dateValue(b.date);
    case "vistas":
      // Sin dato de vistas en el backend todavía: no reordena.
      return 0;
  }
}

/** Gestión de publicaciones: conteos, búsqueda/filtros, orden y tabla con acciones. */
export function PublicacionSection() {
  const [pets, setPets] = useState<AdminPetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("todos");
  const [sort, setSort] = useState<Sort | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const [selected, setSelected] = useState<AdminPetSummary | null>(null);
  const [editing, setEditing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  // Recarga la lista tras una mutación (se invoca desde handlers, no desde un effect).
  async function load() {
    const res = await getAdminPets();
    if (res.ok && res.data) setPets(res.data);
    else toast.error("No se pudieron cargar las publicaciones.");
  }

  useEffect(() => {
    getAdminPets().then((res) => {
      if (res.ok && res.data) setPets(res.data);
      else toast.error("No se pudieron cargar las publicaciones.");
      setLoading(false);
    });
  }, []);

  // Cerrar el menú "…" al hacer click afuera.
  useEffect(() => {
    if (!menuId) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".pub-menu") && !t.closest(".pub-menu-trigger")) {
        setMenuId(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuId]);

  const counts = useMemo(
    () => ({
      pendiente: pets.filter((p) => p.reportStatus === "pendiente").length,
      activo: pets.filter((p) => p.reportStatus === "activo").length,
      rechazado: pets.filter((p) => p.reportStatus === "rechazado").length,
    }),
    [pets],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = pets.filter((p) => {
      if (estado !== "todos" && p.reportStatus !== estado) return false;
      if (!q) return true;
      return (
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q)
      );
    });
    if (sort) {
      filtered.sort((a, b) => {
        const c = compare(a, b, sort.key);
        return sort.dir === "asc" ? c : -c;
      });
    }
    return filtered;
  }, [pets, query, estado, sort]);

  /** Click en encabezado: asc → desc → sin orden. */
  function toggleSort(key: SortKey) {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: "asc" };
      if (s.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  /** Click en una card: alterna el filtro por ese estado. */
  function toggleEstado(key: PetReportStatus) {
    setEstado((e) => (e === key ? "todos" : key));
  }

  function openView(pet: AdminPetSummary) {
    setSelected(pet);
    setEditing(false);
  }

  function openEdit(pet: AdminPetSummary) {
    setMenuId(null);
    setSelected(pet);
    setEditing(true);
  }

  async function runAction(pet: AdminPetSummary, action: Accion) {
    setMenuId(null);
    if (
      action === "delete" &&
      !window.confirm(
        `¿Eliminar la publicación "${pet.name ?? "sin nombre"}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setBusyId(pet.id);
    const res =
      action === "approve"
        ? await approvePet(pet.id)
        : action === "reject"
          ? await rejectPet(pet.id)
          : action === "finalize"
            ? await finalizePet(pet.id)
            : await deletePet(pet.id);
    setBusyId(null);
    if (res.ok) {
      setSelected(null);
      await load();
      toast.success(`Publicación ${ACCION_OK[action]}.`);
    } else {
      toast.error("No se pudo completar la acción. Probá de nuevo.");
    }
  }

  async function saveEdit(patch: Partial<Pet>) {
    if (!selected) return;
    setBusyId(selected.id);
    const res = await updatePet(selected.id, patch);
    setBusyId(null);
    if (res.ok) {
      setSelected(null);
      setEditing(false);
      await load();
      toast.success("Publicación actualizada.");
    } else {
      toast.error("No se pudo guardar. Probá de nuevo.");
    }
  }

  // Columnas de la tabla de publicaciones (consumidas por <DataTable>).
  const columns: Column<AdminPetSummary>[] = [
    {
      key: "name",
      label: "Publicación",
      sortable: true,
      render: (pet) => {
        const thumb = pet.photos?.[0] ?? pet.photo ?? null;
        return (
          <div className="dash-user">
            <span className="val-thumb" aria-hidden>
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" />
              ) : (
                <PawPrint size={16} />
              )}
            </span>
            <span className="dash-user-text">
              <span className="dash-user-name">{pet.name ?? "Sin nombre"}</span>
              <span className="dash-user-email">{pet.location}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: "tipo",
      label: "Tipo",
      sortable: true,
      render: (pet) => (
        <Pill tone="violet">{pet.statusLabel ?? pet.status ?? "—"}</Pill>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (pet) => <EstadoPill status={pet.reportStatus} />,
    },
    {
      key: "fecha",
      label: "Fecha",
      sortable: true,
      tdClassName: "dash-muted",
      render: (pet) => pet.date,
    },
    {
      key: "vistas",
      label: "Vistas",
      sortable: true,
      tdClassName: "dash-muted",
      render: () => "—",
    },
    {
      key: "actions",
      ariaLabel: "Acciones",
      tdClassName: "dash-cell-action",
      render: (pet) => {
        const st = pet.reportStatus;
        return (
          <div className="dash-row-actions pub-actions">
            <button
              type="button"
              aria-label="Ver"
              title="Ver"
              onClick={() => openView(pet)}
            >
              <Eye size={15} />
            </button>
            <button
              type="button"
              aria-label="Editar"
              title="Editar"
              onClick={() => openEdit(pet)}
            >
              <Pencil size={15} />
            </button>
            <span className="pub-menu-wrap">
              <button
                type="button"
                className="pub-menu-trigger"
                aria-label="Más acciones"
                title="Más acciones"
                disabled={busyId === pet.id}
                onClick={() =>
                  setMenuId((m) => (m === pet.id ? null : pet.id))
                }
              >
                <MoreVertical size={15} />
              </button>
              {menuId === pet.id && (
                <div className="pub-menu">
                  {(st === "pendiente" || st === "rechazado") && (
                    <button
                      type="button"
                      className="pub-menu-item"
                      onClick={() => runAction(pet, "approve")}
                    >
                      <Check size={15} /> Aprobar
                    </button>
                  )}
                  {(st === "pendiente" || st === "activo") && (
                    <button
                      type="button"
                      className="pub-menu-item"
                      onClick={() => runAction(pet, "reject")}
                    >
                      <X size={15} /> Rechazar
                    </button>
                  )}
                  {st === "activo" && (
                    <button
                      type="button"
                      className="pub-menu-item"
                      onClick={() => runAction(pet, "finalize")}
                    >
                      <CheckCircle2 size={15} /> Finalizar
                    </button>
                  )}
                  <button
                    type="button"
                    className="pub-menu-item danger"
                    onClick={() => runAction(pet, "delete")}
                  >
                    <Trash2 size={15} /> Eliminar
                  </button>
                </div>
              )}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="pub">
      <div className="pub-toolbar">
        <Link
          href="/mascotas-perdidas/reportar"
          className="btn btn-outline btn-sm"
        >
          <Plus size={16} aria-hidden /> Nueva publicación
        </Link>
      </div>

      <div className="pub-stats">
        <button
          type="button"
          className={`dash-stat-card pub-stat-btn${estado === "pendiente" ? " is-active" : ""}`}
          aria-pressed={estado === "pendiente"}
          onClick={() => toggleEstado("pendiente")}
        >
          <div className="dash-stat-icon tone-violet">
            <Clock size={22} aria-hidden />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Nuevos (pendientes)</span>
            <span className="dash-stat-value">
              {loading ? "…" : counts.pendiente}
            </span>
          </div>
        </button>
        <button
          type="button"
          className={`dash-stat-card pub-stat-btn${estado === "activo" ? " is-active" : ""}`}
          aria-pressed={estado === "activo"}
          onClick={() => toggleEstado("activo")}
        >
          <div className="dash-stat-icon tone-green">
            <CheckCircle2 size={22} aria-hidden />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Publicadas</span>
            <span className="dash-stat-value">
              {loading ? "…" : counts.activo}
            </span>
          </div>
        </button>
        <button
          type="button"
          className={`dash-stat-card pub-stat-btn${estado === "rechazado" ? " is-active" : ""}`}
          aria-pressed={estado === "rechazado"}
          onClick={() => toggleEstado("rechazado")}
        >
          <div className="dash-stat-icon tone-red">
            <XCircle size={22} aria-hidden />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Rechazadas</span>
            <span className="dash-stat-value">
              {loading ? "…" : counts.rechazado}
            </span>
          </div>
        </button>
      </div>

      <div className="pub-controls">
        <div className="pub-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Buscar publicación..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
              className={`pub-chip${estado === f.id ? " active" : ""}`}
              onClick={() => setEstado(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <DataTable
        columns={columns}
        data={visible}
        rowKey={(pet) => pet.id}
        loading={loading}
        loadingLabel="Cargando publicaciones…"
        empty="No hay publicaciones para mostrar."
        sort={sort}
        onSort={(k) => toggleSort(k as SortKey)}
        tableClassName="pub-table"
        wrapClassName="pub-table-wrap"
      />

      {selected && (
        <PublicacionDrawer
          key={`${selected.id}:${editing ? "edit" : "view"}`}
          pet={selected}
          busy={busyId === selected.id}
          editing={editing}
          onClose={() => {
            setSelected(null);
            setEditing(false);
          }}
          onApprove={() => runAction(selected, "approve")}
          onReject={() => runAction(selected, "reject")}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}
