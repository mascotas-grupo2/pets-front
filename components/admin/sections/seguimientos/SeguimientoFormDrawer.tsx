"use client";

import { createPortal } from "react-dom";
import { useState } from "react";
import { X } from "lucide-react";
import type { CreateFollowupInput } from "@/services/followups";
import type { Option } from "../hook/useSeguimientos";
import { TIPO_OPTIONS } from "./seguimientos.data";

type Props = {
  petOptions: Option<string>[];
  userOptions: Option<number>[];
  /** Fecha de referencia (hoy) para el mínimo del datepicker. */
  now: Date;
  onClose: () => void;
  onSubmit: (input: CreateFollowupInput) => Promise<boolean>;
};

/** Formatea una fecha a "YYYY-MM-DDTHH:mm" para <input type="datetime-local">. */
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SeguimientoFormDrawer({ petOptions, userOptions, now, onClose, onSubmit }: Props) {
  const [petId, setPetId] = useState("");
  const [userId, setUserId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [appointmentAt, setAppointmentAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const minDateTime = toLocalInput(now);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!petId || !userId || !typeId || !appointmentAt) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    const when = new Date(appointmentAt);
    if (Number.isNaN(when.getTime()) || when <= now) {
      setError("Elegí una fecha y hora a futuro para agendar el seguimiento 🙂");
      return;
    }

    setSaving(true);
    const ok = await onSubmit({
      petId,
      userId: Number(userId),
      typeId: Number(typeId),
      appointmentAt: when.toISOString(),
    });
    setSaving(false);
    if (ok) onClose();
  }

  return createPortal(
    <div className="vdrawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="vdrawer"
        role="dialog"
        aria-modal="true"
        aria-label="Agendar seguimiento"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vdrawer-head">
          <h2>Agendar seguimiento</h2>
          <button type="button" className="vdrawer-close" aria-label="Cerrar" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="vdrawer-body seg-form" onSubmit={handleSubmit}>
          <div className="vdrawer-edit-field">
            <label className="vdrawer-edit-label" htmlFor="seg-pet">Mascota *</label>
            <select
              id="seg-pet"
              className="vdrawer-select"
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
            >
              <option value="">Seleccioná una mascota…</option>
              {petOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="vdrawer-edit-field">
            <label className="vdrawer-edit-label" htmlFor="seg-user">Responsable *</label>
            <select
              id="seg-user"
              className="vdrawer-select"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">Seleccioná un responsable…</option>
              {userOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="vdrawer-edit-field">
            <label className="vdrawer-edit-label" htmlFor="seg-type">Tipo *</label>
            <select
              id="seg-type"
              className="vdrawer-select"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
            >
              <option value="">Seleccioná un tipo…</option>
              {TIPO_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="vdrawer-edit-field">
            <label className="vdrawer-edit-label" htmlFor="seg-date">Fecha y hora *</label>
            <input
              id="seg-date"
              type="datetime-local"
              className="vdrawer-input"
              min={minDateTime}
              value={appointmentAt}
              onChange={(e) => setAppointmentAt(e.target.value)}
            />
          </div>

          {error && <p className="seg-form-error">{error}</p>}

          <div className="vdrawer-foot">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? "Agendando…" : "Agendar"}
            </button>
          </div>
        </form>
      </aside>
    </div>,
    document.body,
  );
}
