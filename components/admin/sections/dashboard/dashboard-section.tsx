"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Eye, Pencil, MoreVertical, ChevronRight } from "lucide-react";
import { Panel } from "../../ui/panel";
import { Pill } from "../../ui/pill";
import { DataTable, type Column } from "../../ui/data-table";
import { ActionButton } from "../../ui/button";
import { EstadoPill } from "../../lib/pet-status";
import type { AdminPetSummary } from "@/types/pet";

import {
  SEGUIMIENTOS,
  ACTIVIDAD,
  compatTone,
  initials,
} from "./dashboard.data";
import { useDashboardPreviews } from "../hook/useDashboardPreviews";
import { DashboardStatCards } from "./DashboardStatCards";
import { DashboardTablePanel } from "./DashboardTablePanel";
import { DashboardRecentList } from "./DashboardRecentList";
import { solicitudEstadoTone } from "../../lib/solicitud-status";

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

type SolicitudPreviewItem = {
  id: string;
  usuario: string;
  email: string;
  mascota: string | null | undefined;
  compat: { pct: number; label: string };
  estado: { label: string; tone: Tone };
  fecha: string;
};

import type { Tone } from "../../ui/types";

const SOLICITUDES_COLS: Column<SolicitudPreviewItem>[] = [
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
    <Panel
      title="Seguimientos próximos"
      action={<VerTodas label="Ver todos" href="/admin/seguimientos" />}
    >
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
    {
      key: "vistas",
      label: "Vistas",
      tdClassName: "dash-muted",
      render: () => "—",
    },
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

export function DashboardSection() {
  // Memorizamos las opciones para evitar que el hook dispare peticiones en bucle
  // al recibir una nueva referencia de objeto en cada render.
  const previewOptions = useMemo(() => ({ pageSize: 5 }), []);

  const {
    publicaciones: publicacionesPreview,
    publicacionesCount,
    solicitudes: solicitudesPreviewRaw,
    pubsLoading,
    solicitudesLoading,
  } = useDashboardPreviews(previewOptions);

  // Memorizamos el mapeo para evitar cálculos innecesarios y cambios de referencia en las props de las tablas
  const solicitudesPreview = useMemo(() =>
    solicitudesPreviewRaw.map((s) => ({
      id: s.id,
      usuario: s.userName,
      email: s.userEmail,
      mascota: s.petName,
      compat: { pct: s.compatPct, label: s.compatLabel },
      estado: {
        label: s.estado.replace(/_/g, " "),
        tone: solicitudEstadoTone(s.estado),
      },
      fecha: s.fecha,
    })),
    [solicitudesPreviewRaw]
  );

  return (
    <div className="dash">
      <DashboardStatCards
        publicaciones={pubsLoading ? null : (publicacionesCount ?? null)}
      />
      <div className="dash-grid">
        <DashboardTablePanel
          title="Solicitudes recientes"
          href="/admin/solicitudes"
          columns={SOLICITUDES_COLS}
          data={solicitudesPreview}
          rowKey={(r) => r.id}
          loading={solicitudesLoading}
        />
        <SeguimientosPanel />
      </div>
      <div className="dash-grid">
        <PublicacionesPanel
          pets={publicacionesPreview}
          loading={pubsLoading}
          href="/admin/publicacion"
        />
        <DashboardRecentList items={ACTIVIDAD} />
      </div>
    </div>
  );
}
