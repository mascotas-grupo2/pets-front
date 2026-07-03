"use client";

import { createPortal } from "react-dom";
import { X, CalendarClock, UserCog, Clock, CalendarDays, Heart } from "lucide-react";
import type { Seguimiento } from "./seguimientos.data";
import { seguimientoEstadoTone, formatAppointment } from "./seguimientos.data";
import { TYPE_ICON } from "./seguimientos.icons";
import { Pill } from "../../ui/pill";
import { PetThumb } from "../../ui/pet-thumb";

type Props = {
  seguimiento: Seguimiento;
  onClose: () => void;
};

function fullDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserCog;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="seg-detail-row">
      <span className="seg-detail-row-icon" aria-hidden>
        <Icon size={16} />
      </span>
      <span className="seg-detail-row-label">{label}</span>
      <span className="seg-detail-row-value">{children}</span>
    </div>
  );
}

export function SeguimientoDetailDrawer({ seguimiento: s, onClose }: Props) {
  const TipoIcon = TYPE_ICON[s.typeId] ?? CalendarClock;

  return createPortal(
    <div className="vdrawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="vdrawer seg-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del seguimiento"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="seg-head">
          <div className="seg-head-icon" aria-hidden>
            <CalendarClock size={20} />
          </div>
          <div className="seg-head-text">
            <h2>Detalle del seguimiento</h2>
            <p>Información completa de la visita programada.</p>
          </div>
          <button type="button" className="vdrawer-close" aria-label="Cerrar" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="vdrawer-body">
          {/* Hero de la mascota */}
          <div className="seg-detail-hero">
            <PetThumb pet={{ photo: s.petPhoto }} size={52} />
            <div className="seg-detail-hero-info">
              <strong>{s.petName}</strong>
              <Pill tone={seguimientoEstadoTone(s.estadoId)}>{s.estado}</Pill>
            </div>
          </div>

          {/* Card destacada de fecha */}
          <div className="seg-detail-date-card">
            <span className="seg-detail-date-icon" aria-hidden>
              <CalendarDays size={20} />
            </span>
            <div className="seg-detail-date-text">
              <span className="seg-detail-date-when">{formatAppointment(s.appointmentAt)}</span>
              <span className="seg-detail-date-full">{fullDate(s.appointmentAt)}</span>
            </div>
          </div>

          {/* Detalles */}
          <div className="seg-detail-rows">
            <Row icon={TipoIcon} label="Tipo">{s.tipo}</Row>
            <Row icon={UserCog} label="Responsable">{s.responsable}</Row>
            {s.adoptante && (
              <Row icon={Heart} label="Adoptante">{s.adoptante}</Row>
            )}
            <Row icon={Clock} label="Agendado el">{fullDate(s.createdAt)}</Row>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
