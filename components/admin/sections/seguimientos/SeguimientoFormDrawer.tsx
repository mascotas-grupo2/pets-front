"use client";

import { createPortal } from "react-dom";
import { useState } from "react";
import {
  X,
  CalendarClock,
  PawPrint,
  UserCog,
  ClipboardCheck,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import type { CreateFollowupInput } from "@/services/followups";
import type { Option } from "../hook/useSeguimientos";
import { TIPO_OPTIONS } from "./seguimientos.data";
import { TYPE_ICON } from "./seguimientos.icons";
import { SegSelect } from "./SegSelect";

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

/** Atajos de fecha alineados al esquema de seguimiento post-adopción (7/30/90 días). */
const QUICK_DATES: { label: string; days: number }[] = [
  { label: "+7 días", days: 7 },
  { label: "+30 días", days: 30 },
  { label: "+90 días", days: 90 },
];

export function SeguimientoFormDrawer({ petOptions, userOptions, now, onClose, onSubmit }: Props) {
  const [petId, setPetId] = useState("");
  const [userId, setUserId] = useState("");
  const [typeId, setTypeId] = useState<number | "">("");
  const [appointmentAt, setAppointmentAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const minDateTime = toLocalInput(now);

  /** Setea la fecha a hoy+N días, a las 10:00, y la marca como activa. */
  function quickPick(days: number) {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(10, 0, 0, 0);
    setAppointmentAt(toLocalInput(d));
    setError(null);
  }

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
        className="vdrawer seg-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Agendar seguimiento"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="seg-head">
          <div className="seg-head-icon" aria-hidden>
            <CalendarClock size={20} />
          </div>
          <div className="seg-head-text">
            <h2>Agendar seguimiento</h2>
            <p>Programá una visita, control o tratamiento para la mascota.</p>
          </div>
          <button type="button" className="vdrawer-close" aria-label="Cerrar" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="vdrawer-body seg-form" onSubmit={handleSubmit}>
          {/* Mascota */}
          <div className="seg-field">
            <label className="seg-label" htmlFor="seg-pet">
              <PawPrint size={14} aria-hidden /> Mascota <span className="seg-req">*</span>
            </label>
            <SegSelect
              id="seg-pet"
              value={petId}
              options={petOptions}
              placeholder="Seleccioná una mascota…"
              onChange={(v) => setPetId(v)}
            />
          </div>

          {/* Responsable */}
          <div className="seg-field">
            <label className="seg-label" htmlFor="seg-user">
              <UserCog size={14} aria-hidden /> Responsable <span className="seg-req">*</span>
            </label>
            <SegSelect
              id="seg-user"
              value={userId === "" ? "" : Number(userId)}
              options={userOptions}
              placeholder="Seleccioná un responsable…"
              onChange={(v) => setUserId(String(v))}
            />
          </div>

          {/* Tipo — chips visuales */}
          <div className="seg-field">
            <span className="seg-label">
              <ClipboardCheck size={14} aria-hidden /> Tipo <span className="seg-req">*</span>
            </span>
            <div className="seg-type-grid" role="radiogroup" aria-label="Tipo de seguimiento">
              {TIPO_OPTIONS.map((o) => {
                const Icon = TYPE_ICON[o.id] ?? CalendarClock;
                const active = typeId === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`seg-type-chip${active ? " is-active" : ""}`}
                    onClick={() => setTypeId(o.id)}
                  >
                    <Icon size={16} aria-hidden />
                    <span>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="seg-field">
            <label className="seg-label" htmlFor="seg-date">
              <CalendarDays size={14} aria-hidden /> Fecha y hora <span className="seg-req">*</span>
            </label>
            <input
              id="seg-date"
              type="datetime-local"
              className="seg-input"
              min={minDateTime}
              value={appointmentAt}
              onChange={(e) => setAppointmentAt(e.target.value)}
            />
            <div className="seg-quick">
              {QUICK_DATES.map((q) => (
                <button
                  key={q.days}
                  type="button"
                  className="seg-quick-chip"
                  onClick={() => quickPick(q.days)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="seg-form-error">
              <AlertCircle size={15} aria-hidden /> {error}
            </p>
          )}

          <div className="seg-foot">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary seg-submit" disabled={saving}>
              <CalendarClock size={16} aria-hidden />
              {saving ? "Agendando…" : "Agendar"}
            </button>
          </div>
        </form>
      </aside>
    </div>,
    document.body,
  );
}
