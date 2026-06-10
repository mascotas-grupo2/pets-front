"use client";

import { useState } from "react";
import Link from "next/link";
import { X, PawPrint } from "lucide-react";
import { MascotaEstadoPill } from "../../lib/pet-status";
import { formatEdad } from "../../lib/pet-format";
import type { AdminPetSummary } from "@/types/pet";

type Props = {
  pet: AdminPetSummary;
  onClose: () => void;
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
export function MascotaDrawer({ pet, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const thumb = pet.photos?.[0] ?? pet.photo ?? null;
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

        <div className="vdrawer-foot">
          <Link
            href={`/mascotas-perdidas/${pet.id}`}
            className="btn btn-primary"
            style={{ flex: 1, textAlign: "center" }}
          >
            Ver perfil completo
          </Link>
        </div>
      </aside>
    </div>
  );
}
