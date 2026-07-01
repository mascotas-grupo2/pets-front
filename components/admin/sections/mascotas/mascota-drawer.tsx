"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { X, PawPrint, Heart } from "lucide-react";
import {
  MascotaEstadoPill,
  transicionesMascotaPermitidas,
  esEstadoMascotaTerminal,
} from "../../lib/pet-status";
import { formatEdad } from "../../lib/pet-format";
import { updatePet, entregaDirectaPet, resolvePet } from "@/services/mascotas.pets";
import { useMascotaDetalle } from "../hook/useMascotaDetalle";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import type { AdminPetSummary, PetStatus } from "@/types/pet";

type Props = {
  pet: AdminPetSummary;
  onClose: () => void;
  /** Se llama tras cambiar el estado o registrar una entrega, para recargar la lista. */
  onChanged?: () => void;
  /** Modo revisión (ej. al abrir desde una alerta de reclamo): oculta "Gestionar
   *  estado" — acá se viene a MIRAR el caso, no a operar la mascota. */
  reviewMode?: boolean;
};

/** Estados operativos que el admin puede setear a mano (sin "adoptado"). */
const STATUS_LABEL: Record<PetStatus, string> = {
  perdido: "Perdido",
  encontrado: "En refugio",
  "en tránsito": "En tránsito",
  "en tratamiento médico": "En tratamiento médico",
  "en adopción": "En adopción",
  adoptado: "Adoptado",
  "devuelta al dueño": "Devuelta al dueño",
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
];

const NOTE_KIND_LABEL: Record<string, string> = {
  general: "General",
  medica: "Médica",
  adopcion: "Adopción",
};

function fmtFecha(d: string) {
  return new Date(d).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function boolText(v?: boolean) {
  if (v === undefined) return "—";
  return v ? "Sí" : "No";
}

const IMG_URL_RE = /(https?:\/\/\S+?\.(?:png|jpe?g|jfif|webp))/gi;

/** Separa de una nota las URLs de imagen (ej. fotos de prueba de un reclamo) del
 *  texto, y limpia datos internos que no van en la UI (ID de usuario). */
function splitNotePhotos(text: string) {
  const fotos = text.match(IMG_URL_RE) ?? [];
  const limpio = text
    .replace(IMG_URL_RE, "")
    .replace(/Fotos de prueba:\s*/i, "")
    .replace(/Usuario ID:\s*\d+/i, "") // dato interno, no se muestra
    .replace(/\s{2,}/g, " ")
    .trim();
  return { limpio, fotos };
}

/** Drawer lateral con el detalle de una mascota. */
export function MascotaDrawer({ pet, onClose, onChanged, reviewMode = false }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const {
    loading: loadingDetalle,
    notas,
    proximo,
    compat,
  } = useMascotaDetalle(pet.id);
  const [estado, setEstado] = useState<PetStatus>(pet.status);
  const [recipient, setRecipient] = useState("");
  const [showEntrega, setShowEntrega] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [busy, setBusy] = useState(false);
  const yaAdoptada = esEstadoMascotaTerminal(pet.status);
  // "Registrar adopción directa" solo aplica a mascotas que están en adopción.
  const puedeEntregar = pet.status === "en adopción";
  // El cierre "apareció/resuelta" aplica a casos de pérdida (perdido/encontrado).
  const puedeCerrar =
    (pet.status === "perdido" || pet.status === "encontrado") &&
    pet.reportStatus !== "finalizado";
  // Estados ofrecidos: el actual + solo los siguientes válidos (incremental).
  const opcionesEstado: PetStatus[] = [
    pet.status,
    ...transicionesMascotaPermitidas(pet.status),
  ];
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

  async function cerrarPublicacion() {
    setBusy(true);
    const res = await resolvePet(pet.id);
    setBusy(false);
    if (res.ok) {
      toast.success("Publicación cerrada.");
      setShowCerrar(false);
      onChanged?.();
      onClose();
    } else {
      toast.error(res.error || "No se pudo cerrar la publicación.");
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

          <>
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
                  <span className="vdrawer-field-label">Refugio</span>
                  <span className="vdrawer-field-value">
                    {pet.refugioName ?? "—"}
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
                  <span className="vdrawer-field-value">
                    {pet.color ?? "—"}
                  </span>
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

              {!reviewMode && (
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
                        {opcionesEstado.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                            {s === pet.status ? " (actual)" : ""}
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
              )}

              <div className="vdrawer-section">
                <h3>Compatibilidad promedio</h3>
                {loadingDetalle ? (
                  <p className="vdrawer-desc mdrawer-muted">Cargando…</p>
                ) : compat.promedio == null ? (
                  <p className="vdrawer-desc mdrawer-muted">
                    Sin solicitudes de adopción todavía.
                  </p>
                ) : (
                  <>
                    <div className="mdrawer-compat">
                      <div className="mdrawer-compat-bar">
                        <div
                          className="mdrawer-compat-fill"
                          style={{ width: `${compat.promedio}%` }}
                        />
                      </div>
                      <span className="mdrawer-compat-val">
                        {compat.promedio}%
                      </span>
                    </div>
                    <p className="mdrawer-seg-meta">
                      Promedio de {compat.solicitudes} solicitud
                      {compat.solicitudes === 1 ? "" : "es"}.
                    </p>
                  </>
                )}
              </div>

              <div className="vdrawer-section">
                <h3>Próximo seguimiento</h3>
                {loadingDetalle ? (
                  <p className="vdrawer-desc mdrawer-muted">Cargando…</p>
                ) : !proximo ? (
                  <p className="vdrawer-desc mdrawer-muted">
                    Sin seguimientos programados.
                  </p>
                ) : (
                  <>
                    <p className="mdrawer-seg-tipo">
                      {proximo.type?.label ?? "Seguimiento"}
                    </p>
                    <p className="mdrawer-seg-meta">
                      {fmtFecha(proximo.appointmentAt)}
                    </p>
                    {proximo.status?.label && (
                      <p className="mdrawer-seg-meta">{proximo.status.label}</p>
                    )}
                  </>
                )}
              </div>

              <div className="vdrawer-section">
                <h3>Notas</h3>
                {loadingDetalle ? (
                  <p className="vdrawer-desc mdrawer-muted">Cargando…</p>
                ) : notas.length === 0 ? (
                  <p className="vdrawer-desc mdrawer-muted">Sin notas.</p>
                ) : (
                  notas.map((n) => {
                    const { limpio, fotos } = splitNotePhotos(n.text);
                    return (
                      <div key={n.id} className="mdrawer-nota">
                        <p className="vdrawer-desc">{limpio}</p>
                        {fotos.length > 0 && (
                          <div className="mdrawer-nota-fotos">
                            {fotos.map((src, i) => (
                              <a
                                key={i}
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                title="Ver foto de prueba"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src}
                                  alt={`Prueba ${i + 1}`}
                                  onError={(e) => {
                                    // Si la foto no existe/falla, ocultamos el enlace
                                    // (evita el ícono de imagen rota).
                                    const a = e.currentTarget.closest("a");
                                    if (a) a.style.display = "none";
                                  }}
                                />
                              </a>
                            ))}
                          </div>
                        )}
                        <span className="mdrawer-seg-meta">
                          {NOTE_KIND_LABEL[n.kind]
                            ? `${NOTE_KIND_LABEL[n.kind]} · `
                            : ""}
                          {fmtFecha(n.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          </>
        </div>

        <div
          className="vdrawer-foot"
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: "0.5rem",
          }}
        >
          {puedeEntregar &&
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
          {puedeCerrar && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowCerrar(true)}
              disabled={busy}
            >
              Cerrar publicación (apareció / resuelta)
            </button>
          )}
          <Link
            href={`/mascotas-perdidas/${pet.id}`}
            className="btn btn-primary"
            style={{ textAlign: "center" }}
          >
            Ver perfil completo
          </Link>
        </div>

        <ConfirmDialog
          open={showCerrar}
          title="Cerrar publicación"
          message={`¿Cerrar la publicación de ${
            pet.name ?? "esta mascota"
          }? Se marca como resuelta y deja de mostrarse en el listado.`}
          confirmLabel="Sí, cerrar"
          cancelLabel="Cancelar"
          busy={busy}
          onConfirm={cerrarPublicacion}
          onCancel={() => setShowCerrar(false)}
        />
      </aside>
    </div>
  );
}
