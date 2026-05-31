"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, MoreVertical, ChevronRight } from "lucide-react";
import { Panel } from "../../ui/panel";
import { Pill } from "../../ui/pill";
import { DataTable, type Column } from "../../ui/data-table";
import { ActionButton } from "../../ui/button";
import { EstadoPill } from "../../lib/pet-status";
import { getAdminPets } from "@/services/mascotas.pets";
import type { AdminPetSummary } from "@/types/pet";
import type { Section } from "../../admin-config";
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
  href,
}: {
  label?: string;
  href?: string;
}) {
  return href ? (
    <Link href={href} className="dash-link">
      {label}
    </Link>
  ) : (
    <span className="dash-link">{label}</span>
  );
}

/** Cada stat-card del dashboard navega a su sección correspondiente. */
const STAT_SECTION: Record<string, Section> = {
  "Mascotas activas": "mascotas",
  Solicitudes: "solicitudes",
  "Seguimientos hoy": "seguimientos",
  Publicaciones: "publicacion",
  "Mensajes sin leer": "mensajes",
};

function StatCards({
  publicaciones,
}: {
  publicaciones: number | null;
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

        const target = STAT_SECTION[s.label];
        const href = target ? `/admin/${target}` : undefined;

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

        return href ? (
          <Link
            key={s.label}
            href={href}
            className="dash-stat-card dash-stat-card--link"
          >
            {body}
          </Link>
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
    <Panel title="Solicitudes recientes" action={<VerTodas href="/admin/solicitudes" />}>
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
    <Panel title="Seguimientos próximos" action={<VerTodas label="Ver todos" href="/admin/seguimientos" />}>
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
  href,
}: {
  pets: AdminPetSummary[];
  loading: boolean;
  href?: string;
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
      ariaLabel: "Acción",
      tdClassName: "dash-cell-action",
      render: () => (
        <div className="dash-row-actions">
          <ActionButton
            icon={Eye}
            href={href ?? "/admin/publicacion"}
            ariaLabel="Ver"
          />
          <ActionButton
            icon={Pencil}
            href={href ?? "/admin/publicacion"}
            ariaLabel="Editar"
          />
          <ActionButton icon={MoreVertical} ariaLabel="Más" />
        </div>
      ),
    },
  ];

  return (
    <Panel title="Publicaciones recientes" action={<VerTodas href={href} />}>
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

export function DashboardSection() {
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

  return (
    <div className="dash">
      <StatCards publicaciones={loading ? null : pets.length} />
      <div className="dash-grid">
        <SolicitudesPanel />
        <SeguimientosPanel />
      </div>
      <div className="dash-grid">
        <PublicacionesPanel pets={pets} loading={loading} href="/admin/publicacion" />
        <ActividadPanel />
      </div>
    </div>
  );
}
