"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Seguimiento } from "./seguimientos.data";
import { seguimientoEstadoTone } from "./seguimientos.data";
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="vdrawer-field">
      <span className="vdrawer-field-label">{label}</span>
      <span className="vdrawer-field-value">{children}</span>
    </div>
  );
}

export function SeguimientoDetailDrawer({ seguimiento: s, onClose }: Props) {
  return createPortal(
    <div className="vdrawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="vdrawer"
        role="dialog"
        aria-label="Detalle del seguimiento"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vdrawer-head">
          <h2>Detalle del seguimiento</h2>
          <button
            type="button"
            className="vdrawer-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="vdrawer-body">
          <div className="seg-detail-pet">
            <PetThumb pet={{ photo: s.petPhoto }} size={28} />
            <div className="seg-detail-pet-info">
              <strong>{s.petName}</strong>
              <Pill tone={seguimientoEstadoTone(s.estadoId)}>{s.estado}</Pill>
            </div>
          </div>

          <Field label="Tipo">{s.tipo}</Field>
          <Field label="Tipo de cita">{s.tipoCita}</Field>
          <Field label="Fecha y hora">{fullDate(s.appointmentAt)}</Field>
          <Field label="Responsable">{s.responsable}</Field>
          <Field label="Agendado el">{fullDate(s.createdAt)}</Field>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
