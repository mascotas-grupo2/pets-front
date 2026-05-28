"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, MoreVertical, ChevronRight } from "lucide-react";
import { Panel } from "../../ui/panel";
import { Pill } from "../../ui/pill";
import { DataTable, type Column } from "../../ui/data-table";
import { EstadoPill } from "../../lib/pet-status";
import { getAdminPets } from "@/services/mascotas.pets";
import type { AdminPetSummary } from "@/types/pet";
import type { SectionProps } from "../../admin-config";
import {
  STATS,
  SOLICITUDES,
  SEGUIMIENTOS,
  ACTIVIDAD,
  compatTone,
  initials,
} from "./dashboard.data";

/** Enlace "Ver todas/os" del encabezado de un panel. */
function VerTodas({
  label = "Ver todas",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="dash-link" onClick={onClick}>
      {label}
    </button>
  );
}

function StatCards({
  publicaciones,
  onVerPublicaciones,
}: {
  publicaciones: number | null;
  onVerPublicaciones?: () => void;
}) {
  return (
    <div className="dash-stats">
      {STATS.map((s) => {
        const Icon = s.icon;
        // "Publicaciones" usa el conteo real; el resto sigue mockeado.
        const esPublicaciones = s.label === "Publicaciones";
        const value = esPublicaciones
          ? publicaciones === null
            ? "…"
            : String(publicaciones)
          : s.value;

        const body = (
          <>
            <div className={`dash-stat-icon tone-${s.tone}`}>
              <Icon size={22} aria-hidden />
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-label">{s.label}</span>
              <span className="dash-stat-value">{value}</span>
              <span className="dash-stat-hint">{s.hint}</span>
            </div>
          </>
        );

        // Sólo "Publicaciones" navega; el resto sigue siendo mock estático.
        return esPublicaciones ? (
          <button
            key={s.label}
            type="button"
            className="dash-stat-card dash-stat-card--link"
            onClick={onVerPublicaciones}
          >
            {body}
          </button>
        ) : (
          <div key={s.label} className="dash-stat-card">
            {body}
          </div>
        );
      })}
    </div>
  );
}

const SOLICITUDES_COLS: Column<(typeof SOLICITUDES)[number]>[] = [
  {
    key: "usuario",
    label: "Usuario",
    render: (r) => (
      <div className="dash-user">
        <span className="dash-avatar" aria-hidden>
          {initials(r.usuario)}
        </span>
        <span className="dash-user-text">
          <span className="dash-user-name">{r.usuario}</span>
          <span className="dash-user-email">{r.email}</span>
        </span>
      </div>
    ),
  },
  { key: "mascota", label: "Mascota", render: (r) => r.mascota },
  {
    key: "compat",
    label: "Compatibilidad",
    render: (r) => (
      <>
        <span className={`dash-compat tone-${compatTone(r.compat.pct)}`}>
          {r.compat.pct}%
        </span>
        <span className="dash-compat-label">{r.compat.label}</span>
      </>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    render: (r) => <Pill tone={r.estado.tone}>{r.estado.label}</Pill>,
  },
  {
    key: "fecha",
    label: "Fecha",
    tdClassName: "dash-muted",
    render: (r) => r.fecha,
  },
  {
    key: "action",
    ariaLabel: "Acción",
    tdClassName: "dash-cell-action",
    render: () => <ChevronRight size={16} aria-hidden />,
  },
];

function SolicitudesPanel() {
  return (
    <Panel title="Solicitudes recientes" action={<VerTodas />}>
      <DataTable
        columns={SOLICITUDES_COLS}
        data={SOLICITUDES}
        rowKey={(r) => r.usuario}
      />
    </Panel>
  );
}

const SEGUIMIENTOS_COLS: Column<(typeof SEGUIMIENTOS)[number]>[] = [
  {
    key: "mascota",
    label: "Mascota",
    tdClassName: "dash-strong",
    render: (r) => r.mascota,
  },
  { key: "tipo", label: "Tipo", render: (r) => r.tipo },
  {
    key: "fechaHora",
    label: "Fecha y hora",
    tdClassName: "dash-muted",
    render: (r) => r.fechaHora,
  },
  { key: "adoptante", label: "Adoptante", render: (r) => r.adoptante },
  {
    key: "estado",
    label: "Estado",
    render: () => <Pill tone="blue">Programada</Pill>,
  },
];

function SeguimientosPanel() {
  return (
    <Panel title="Seguimientos próximos" action={<VerTodas label="Ver todos" />}>
      <DataTable
        columns={SEGUIMIENTOS_COLS}
        data={SEGUIMIENTOS}
        rowKey={(r) => r.mascota}
      />
    </Panel>
  );
}

function PublicacionesPanel({
  pets,
  loading,
  onVerTodas,
}: {
  pets: AdminPetSummary[];
  loading: boolean;
  onVerTodas?: () => void;
}) {
  // Las 5 publicaciones más recientes por fecha de creación.
  const recientes = useMemo(
    () =>
      [...pets]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? b.date).getTime() -
            new Date(a.createdAt ?? a.date).getTime(),
        )
        .slice(0, 5),
    [pets],
  );

  const columns: Column<AdminPetSummary>[] = [
    {
      key: "name",
      label: "Publicación",
      render: (p) => (
        <span className="dash-user-text">
          <span className="dash-user-name">{p.name ?? "Sin nombre"}</span>
          <span className="dash-user-email">{p.location}</span>
        </span>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (p) => <Pill tone="violet">{p.statusLabel ?? p.status}</Pill>,
    },
    {
      key: "fecha",
      label: "Fecha",
      tdClassName: "dash-muted",
      render: (p) => p.date,
    },
    {
      key: "estado",
      label: "Estado",
      render: (p) => <EstadoPill status={p.reportStatus} />,
    },
    { key: "vistas", label: "Vistas", tdClassName: "dash-muted", render: () => "—" },
    {
      key: "actions",
      ariaLabel: "Acciones",
      tdClassName: "dash-cell-action",
      render: () => (
        <div className="dash-row-actions">
          <button type="button" aria-label="Ver" onClick={onVerTodas}>
            <Eye size={15} />
          </button>
          <button type="button" aria-label="Editar" onClick={onVerTodas}>
            <Pencil size={15} />
          </button>
          <button type="button" aria-label="Más">
            <MoreVertical size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Panel
      title="Publicaciones recientes"
      action={<VerTodas onClick={onVerTodas} />}
    >
      <DataTable
        columns={columns}
        data={recientes}
        rowKey={(p) => p.id}
        loading={loading}
        empty="No hay publicaciones."
      />
    </Panel>
  );
}

function ActividadPanel() {
  return (
    <Panel title="Actividad reciente">
      <ul className="dash-activity">
        {ACTIVIDAD.map((a) => {
          const Icon = a.icon;
          return (
            <li key={a.titulo} className="dash-activity-item">
              <span className={`dash-activity-icon tone-${a.tone}`}>
                <Icon size={16} aria-hidden />
              </span>
              <span className="dash-activity-text">
                <span className="dash-activity-title">{a.titulo}</span>
                <span className="dash-activity-detail">{a.detalle}</span>
              </span>
              <span className="dash-activity-time">{a.tiempo}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function DashboardSection({ onNavigate }: SectionProps) {
  const [pets, setPets] = useState<AdminPetSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getAdminPets().then((res) => {
      if (!alive) return;
      if (res.ok && res.data) setPets(res.data);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const verPublicaciones = () => onNavigate?.("publicacion");

  return (
    <div className="dash">
      <StatCards
        publicaciones={loading ? null : pets.length}
        onVerPublicaciones={verPublicaciones}
      />
      <div className="dash-grid">
        <SolicitudesPanel />
        <SeguimientosPanel />
      </div>
      <div className="dash-grid">
        <PublicacionesPanel
          pets={pets}
          loading={loading}
          onVerTodas={verPublicaciones}
        />
        <ActividadPanel />
      </div>
    </div>
  );
}
