"use client";

import { Eye, Pencil, MoreVertical, ChevronRight } from "lucide-react";
import { Panel } from "../../ui/panel";
import { Pill } from "../../ui/pill";
import {
  STATS,
  SOLICITUDES,
  SEGUIMIENTOS,
  PUBLICACIONES,
  ACTIVIDAD,
  CITAS,
  COSTOS,
  compatTone,
  initials,
} from "./dashboard.data";

/** Enlace "Ver todas/os" del encabezado de un panel. */
function VerTodas({ label = "Ver todas" }: { label?: string }) {
  return (
    <button type="button" className="dash-link">
      {label}
    </button>
  );
}

function StatCards() {
  return (
    <div className="dash-stats">
      {STATS.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="dash-stat-card">
            <div className={`dash-stat-icon tone-${s.tone}`}>
              <Icon size={22} aria-hidden />
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-label">{s.label}</span>
              <span className="dash-stat-value">{s.value}</span>
              <span className="dash-stat-hint">{s.hint}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SolicitudesPanel() {
  return (
    <Panel title="Solicitudes recientes" action={<VerTodas />}>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Mascota</th>
              <th>Compatibilidad</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th aria-label="Acción" />
            </tr>
          </thead>
          <tbody>
            {SOLICITUDES.map((r) => (
              <tr key={r.usuario}>
                <td>
                  <div className="dash-user">
                    <span className="dash-avatar" aria-hidden>{initials(r.usuario)}</span>
                    <span className="dash-user-text">
                      <span className="dash-user-name">{r.usuario}</span>
                      <span className="dash-user-email">{r.email}</span>
                    </span>
                  </div>
                </td>
                <td>{r.mascota}</td>
                <td>
                  <span className={`dash-compat tone-${compatTone(r.compat.pct)}`}>
                    {r.compat.pct}%
                  </span>
                  <span className="dash-compat-label">{r.compat.label}</span>
                </td>
                <td><Pill tone={r.estado.tone}>{r.estado.label}</Pill></td>
                <td className="dash-muted">{r.fecha}</td>
                <td className="dash-cell-action">
                  <ChevronRight size={16} aria-hidden />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SeguimientosPanel() {
  return (
    <Panel title="Seguimientos próximos" action={<VerTodas label="Ver todos" />}>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Mascota</th>
              <th>Tipo</th>
              <th>Fecha y hora</th>
              <th>Adoptante</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {SEGUIMIENTOS.map((r) => (
              <tr key={r.mascota}>
                <td className="dash-strong">{r.mascota}</td>
                <td>{r.tipo}</td>
                <td className="dash-muted">{r.fechaHora}</td>
                <td>{r.adoptante}</td>
                <td><Pill tone="blue">Programada</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function PublicacionesPanel() {
  return (
    <Panel title="Publicaciones recientes" action={<VerTodas />}>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Publicación</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Vistas</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {PUBLICACIONES.map((r) => (
              <tr key={r.titulo}>
                <td>
                  <span className="dash-user-text">
                    <span className="dash-user-name">{r.titulo}</span>
                    <span className="dash-user-email">{r.detalle}</span>
                  </span>
                </td>
                <td><Pill tone="violet">{r.tipo}</Pill></td>
                <td className="dash-muted">{r.fecha}</td>
                <td><Pill tone={r.estado.tone}>{r.estado.label}</Pill></td>
                <td className="dash-muted">{r.vistas}</td>
                <td className="dash-cell-action">
                  <div className="dash-row-actions">
                    <button type="button" aria-label="Ver"><Eye size={15} /></button>
                    <button type="button" aria-label="Editar"><Pencil size={15} /></button>
                    <button type="button" aria-label="Más"><MoreVertical size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function CitasPanel() {
  return (
    <Panel title="Próximas Citas Veterinarias">
      <ul className="dash-activity divided">
        {CITAS.map((c) => (
          <li key={c.mascota} className="dash-activity-item">
            <span className={`dash-activity-icon tone-${c.tone}`}>
              {c.mascota.charAt(0)}
            </span>
            <span className="dash-activity-text">
              <span className="dash-activity-title">{c.mascota}</span>
              <span className="dash-activity-detail">{c.tipo}</span>
            </span>
            <span className="dash-when">
              <span className="dash-when-date">{c.fecha}</span>
              <span className="dash-when-time">{c.hora}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CostosPanel() {
  return (
    <Panel title="Resumen de Costos">
      <ul className="dash-activity">
        {COSTOS.map((c) => {
          const Icon = c.icon;
          return (
            <li key={c.categoria} className="dash-activity-item">
              <span className={`dash-cost-icon tone-${c.tone}`}>
                <Icon size={18} aria-hidden />
              </span>
              <span className="dash-activity-text">
                <span className="dash-activity-title">{c.categoria}</span>
                <span className="dash-activity-detail">{c.pct}</span>
              </span>
              <span className="dash-cost-amount">{c.monto}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function DashboardSection() {
  return (
    <div className="dash">
      <StatCards />
      <div className="dash-grid">
        <SolicitudesPanel />
        <SeguimientosPanel />
      </div>
      <div className="dash-grid">
        <PublicacionesPanel />
        <ActividadPanel />
      </div>
      <div className="dash-grid">
        <CitasPanel />
        <CostosPanel />
      </div>
    </div>
  );
}
