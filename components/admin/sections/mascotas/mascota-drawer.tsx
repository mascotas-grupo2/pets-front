"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { X, PawPrint, Heart } from "lucide-react";
import { MascotaEstadoPill } from "../../lib/pet-status";
import { formatEdad } from "../../lib/pet-format";
import { updatePet, entregaDirectaPet } from "@/services/mascotas.pets";
import type { AdminPetSummary, PetStatus } from "@/types/pet";

type Props = {
  pet: AdminPetSummary;
  onClose: () => void;
  /** Se llama tras cambiar el estado o registrar una entrega, para recargar la lista. */
  onChanged?: () => void;
};

/** Estados operativos que el admin puede setear a mano (sin "adoptado"). */
const ESTADOS_OPERATIVOS: PetStatus[] = [
  "perdido",
  "encontrado",
  "en tránsito",
  "en tratamiento médico",
  "en adopción",
];

const STATUS_LABEL: Record<PetStatus, string> = {
  perdido: "Perdido",
  encontrado: "En refugio",
  "en tránsito": "En tránsito",
  "en tratamiento médico": "En tratamiento médico",
  "en adopción": "En adopción",
  adoptado: "Adoptado",
};

type Tab =
  | "overview"
  | "historial"
  | "seguimientos"
  | "solicitudes"
  | "archivos"
  | "notas";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "historial", label: "Historial" },
  { id: "seguimientos", label: "Seguimientos" },
  { id: "solicitudes", label: "Solicitudes" },
  { id: "archivos", label: "Archivos" },
  { id: "notas", label: "Notas" },
];

/**
 * MOCK: datos de ejemplo para las secciones sin backend (compatibilidad,
 * próximo seguimiento, notas rápidas). Reemplazar cuando existan los endpoints.
 */
const MOCK_COMPAT = 78;
const MOCK_SEGUIMIENTO = {
  tipo: "Control veterinario",
  fecha: "25/05/2026 15:30",
  responsable: "Laura Martínez",
};
const MOCK_NOTAS = [
  "Le gusta dormir en lugares altos.",
  "Convive bien con gatos tranquilos.",
];

function boolText(v?: boolean) {
  if (v === undefined) return "—";
  return v ? "Sí" : "No";
}

/** Drawer lateral con el detalle de una mascota. */
export function MascotaDrawer({ pet, onClose, onChanged }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [estado, setEstado] = useState<PetStatus>(pet.status);
  const [recipient, setRecipient] = useState("");
  const [showEntrega, setShowEntrega] = useState(false);
  const [busy, setBusy] = useState(false);
  const yaAdoptada = pet.status === "adoptado";
  const thumb = pet.photos?.[0] ?? pet.photo ?? null;

  async function guardarEstado() {
    if (estado === pet.status) return;
    setBusy(true);
    const res = await updatePet(pet.id, { status: estado });
    setBusy(false);
    if (res.ok) {
      toast.success("Estado actualizado.");
      onChanged?.();
      onClose();
    } else {
      toast.error(res.error || "No se pudo cambiar el estado.");
    }
  }

  async function registrarEntrega() {
    if (!recipient.trim()) return;
    setBusy(true);
    const res = await entregaDirectaPet(pet.id, recipient.trim());
    setBusy(false);
    if (res.ok) {
      toast.success("Adopción directa registrada.");
      onChanged?.();
      onClose();
    } else {
      toast.error(res.error || "No se pudo registrar la entrega.");
    }
  }
  const especie = pet.animalTypeLabel ?? pet.animalType ?? "—";
  const sub = [especie, pet.breed, formatEdad(pet.ageMonths)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="vdrawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="vdrawer"
        role="dialog"
        aria-label={`Detalle de ${pet.name ?? "mascota"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vdrawer-head">
          <h2>{pet.name ?? "Sin nombre"}</h2>
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
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="vdrawer-photo" src={thumb} alt={pet.name ?? ""} />
          ) : (
            <div className="vdrawer-photo mdrawer-photo-empty">
              <PawPrint size={40} aria-hidden />
            </div>
          )}

          <div className="vdrawer-pills">
            <MascotaEstadoPill status={pet.status} label={pet.statusLabel} />
          </div>
          <p className="mdrawer-sub">{sub}</p>
          <p className="mdrawer-ingreso">Ingresó: {pet.date ?? "—"}</p>

          <div className="mdrawer-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`mdrawer-tab${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" ? (
            <>
              <div className="vdrawer-section">
                <h3>Información</h3>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Sexo</span>
                  <span className="vdrawer-field-value">
                    {pet.sexLabel ?? pet.sex ?? "—"}
                  </span>
                </div>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Esterilizado</span>
                  <span className="vdrawer-field-value">
                    {boolText(pet.neutered)}
                  </span>
                </div>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Peso</span>
                  <span className="vdrawer-field-value">
                    {pet.weightKg ? `${pet.weightKg} kg` : "—"}
                  </span>
                </div>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Color</span>
                  <span className="vdrawer-field-value">{pet.color ?? "—"}</span>
                </div>
                <div className="vdrawer-field">
                  <span className="vdrawer-field-label">Personalidad</span>
                  <span className="vdrawer-field-value">
                    {pet.description || "—"}
                  </span>
                </div>
              </div>

              <div className="vdrawer-section">
                <h3>Estado actual</h3>
                <div className="vdrawer-pills">
                  <MascotaEstadoPill
                    status={pet.status}
                    label={pet.statusLabel}
                  />
                </div>
                {pet.description ? (
                  <p className="vdrawer-desc">{pet.description}</p>
                ) : (
                  <p className="vdrawer-desc mdrawer-muted">Sin descripción.</p>
                )}
              </div>

              <div className="vdrawer-section">
                <h3>Gestionar estado</h3>
                {yaAdoptada ? (
                  <p className="vdrawer-desc mdrawer-muted">
                    La mascota está adoptada (estado final).
                  </p>
                ) : (
                  <div className="mdrawer-estado-row">
                    <select
                      className="input"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value as PetStatus)}
                      disabled={busy}
                    >
                      {ESTADOS_OPERATIVOS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={guardarEstado}
                      disabled={busy || estado === pet.status}
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              {/* MOCK: sin backend todavía */}
              <div className="vdrawer-section">
                <h3>Compatibilidad promedio</h3>
                <div className="mdrawer-compat">
                  <div className="mdrawer-compat-bar">
                    <div
                      className="mdrawer-compat-fill"
                      style={{ width: `${MOCK_COMPAT}%` }}
                    />
                  </div>
                  <span className="mdrawer-compat-val">{MOCK_COMPAT}%</span>
                </div>
              </div>

              {/* MOCK: sin backend todavía */}
              <div className="vdrawer-section">
                <h3>Próximo seguimiento</h3>
                <p className="mdrawer-seg-tipo">{MOCK_SEGUIMIENTO.tipo}</p>
                <p className="mdrawer-seg-meta">{MOCK_SEGUIMIENTO.fecha}</p>
                <p className="mdrawer-seg-meta">
                  {MOCK_SEGUIMIENTO.responsable}
                </p>
              </div>

              {/* MOCK: sin backend todavía */}
              <div className="vdrawer-section">
                <h3>Notas rápidas</h3>
                {MOCK_NOTAS.map((n, i) => (
                  <p key={i} className="vdrawer-desc">
                    {n}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <div className="mdrawer-placeholder">
              Esta sección estará disponible próximamente.
            </div>
          )}
        </div>

        <div
          className="vdrawer-foot"
          style={{ flexDirection: "column", alignItems: "stretch", gap: "0.5rem" }}
        >
          {!yaAdoptada &&
            (showEntrega ? (
              <div className="mdrawer-estado-row">
                <input
                  className="input"
                  placeholder="¿A quién se entregó?"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={busy}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={registrarEntrega}
                  disabled={busy || !recipient.trim()}
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEntrega(false)}
                  disabled={busy}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowEntrega(true)}
              >
                <Heart size={16} aria-hidden /> Registrar adopción directa
              </button>
            ))}
          <Link
            href={`/mascotas-perdidas/${pet.id}`}
            className="btn btn-primary"
            style={{ textAlign: "center" }}
          >
            Ver perfil completo
          </Link>
        </div>
      </aside>
    </div>
  );
}
