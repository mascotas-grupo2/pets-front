"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  PawPrint,
  X,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Download,
  ImageIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useSolicitudDetail } from "../../hook/useSolicitudDetail";
import { useEvaluacion } from "../../hook/useEvaluacion";
import type { AdoptionDetail } from "@/types/adoption-detail";
import type { Solicitud } from "../solicitudes.data";
import { AdoptanteModal } from "./adoptante-modal";
import { MascotaModal } from "./mascota-modal";
import { MatchingModal } from "./matching-modal";
import { Pill } from "../../../ui/pill";
import {
  ESTADO_LABELS,
  esEstadoTerminal,
  transicionesPermitidas,
  efectoTransicion,
  solicitudEstadoTone,
} from "../../../lib/solicitud-status";

type Props = {
  solicitud: Solicitud;
  onClose: () => void;
  onIrAMensajes: (userId: string) => void;
  onUpdateStatus?: (
    id: string,
    status: Solicitud["estado"],
  ) => Promise<boolean>;
};

const TABS = [
  { id: "evaluacion", label: "Evaluación" },
  { id: "mensajes", label: "Mensajes" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Compatibility helpers (same logic used elsewhere)
function compatTone(pct: number) {
  if (pct >= 75) return { stroke: "#22c55e", label: "tone-green" };
  if (pct >= 50) return { stroke: "#f59e0b", label: "tone-amber" };
  return { stroke: "#ef4444", label: "tone-red" };
}
function compatLabel(score: number | null): string {
  if (score == null) return "Sin datos";
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Alta";
  if (score >= 65) return "Buena";
  if (score >= 50) return "Moderada";
  return "Baja";
}

function CompatCircle({ pct, label }: { pct: number; label: string }) {
  const tone = compatTone(pct);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="sdet-compat-circle-wrap">
      <svg width="136" height="136" viewBox="0 0 136 136">
        <circle
          cx="68"
          cy="68"
          r={r}
          fill="none"
          stroke="var(--gray-100)"
          strokeWidth="10"
        />
        <circle
          cx="68"
          cy="68"
          r={r}
          fill="none"
          stroke={tone.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="sdet-compat-inner">
        <span className="sdet-compat-value">{pct}%</span>
        <span className={`sdet-compat-sublabel ${tone.label}`}>{label}</span>
      </div>
    </div>
  );
}

/* --- Tabs implemented to accept data from detail --- */

import type {
  AdoptionMessage,
  AdoptionFile,
  AdoptionHistoryItem,
} from "@/types/adoption-detail";

function TabEvaluacion({ adoptionId }: { adoptionId: number }) {
  const { items, checked, notes, toggle, addNote } = useEvaluacion(adoptionId);
  const [nota, setNota] = useState("");

  async function guardarNota() {
    const ok = await addNote(nota);
    if (ok) setNota("");
  }

  return (
    <div className="sdet-tab-content sdet-eval">
      <p className="sdet-section-label">
        Checklist · {checked.length}/{items.length}
      </p>
      <div className="sdet-chips">
        {items.map((item) => {
          const on = checked.includes(item);
          return (
            <button
              key={item}
              type="button"
              className={`sdet-chip-check${on ? " is-checked" : ""}`}
              onClick={() => toggle(item)}
            >
              {on && <CheckCircle2 size={12} aria-hidden />}
              {item}
            </button>
          );
        })}
      </div>

      <p className="sdet-section-label" style={{ marginTop: "1rem" }}>
        Impresiones
      </p>
      <div className="sdet-nota-composer">
        <textarea
          className="sdet-nota-input"
          placeholder="Anotá una impresión o comentario..."
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={3}
          style={{ resize: "none" }}
        />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={guardarNota}
          disabled={!nota.trim()}
        >
          Guardar
        </button>
      </div>

      {notes.length > 0 && (
        <ul className="sdet-notas-list">
          {notes.map((n) => (
            <li key={n.id} className="sdet-nota-item">
              <p className="sdet-nota-texto">{n.text}</p>
              <time className="sdet-nota-fecha">
                {new Date(n.createdAt).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TabMensajes({
  nombre,
  onIrAMensajes,
  userId,
  messages,
}: {
  nombre?: string;
  onIrAMensajes: (userId: string) => void;
  userId?: string;
  messages?: AdoptionMessage[];
}) {
  const msgs = messages ?? [];
  const irBtn = (
    <button
      type="button"
      className="btn btn-primary sdet-ir-mensajes"
      onClick={() => userId && onIrAMensajes(userId)}
      disabled={!userId}
      title={!userId ? "No se pudo identificar al solicitante" : undefined}
    >
      <MessageSquare size={15} /> Ir a la conversación
    </button>
  );
  if (msgs.length === 0) {
    return (
      <div className="sdet-tab-content sdet-mensajes-readonly">
        <div className="sdet-empty">
          Todavía no hay mensajes con este solicitante.
        </div>
        {irBtn}
      </div>
    );
  }
  return (
    <div className="sdet-tab-content sdet-mensajes-readonly">
      <div className="sdet-thread">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={`msg-bubble-row ${m.senderRole === "admin" ? "is-mine" : "is-theirs"}`}
          >
            {m.senderRole !== "admin" && (
              <span className="msg-avatar msg-avatar-sm" aria-hidden>
                {(nombre ?? "US").slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="msg-bubble">
              <p>{m.text}</p>
              <time>{m.timestamp}</time>
            </div>
          </div>
        ))}
      </div>
      {irBtn}
    </div>
  );
}

function MimeIcon({ mime }: { mime: string }) {
  const isImage = mime.startsWith("image/");
  return (
    <span
      className={`sdet-archivo-mime${isImage ? "" : " sdet-archivo-mime--pdf"}`}
    >
      {isImage ? <ImageIcon size={15} /> : <FileText size={15} />}
    </span>
  );
}
function TabArchivos({ files }: { files?: AdoptionFile[] }) {
  const [localFiles, setLocalFiles] = useState<AdoptionFile[]>(files ?? []);
  function eliminar(id: string) {
    setLocalFiles((p) => p.filter((f) => f.id !== id));
  }
  if (localFiles.length === 0) {
    return (
      <div className="sdet-tab-content sdet-archivos">
        <div className="sdet-tab-empty">
          <FileText size={28} /> <p>El adoptante aún no subió archivos.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="sdet-tab-content sdet-archivos">
      {localFiles.map((f) => (
        <div key={f.id} className="sdet-archivo-row">
          <MimeIcon mime={f.mimeType} />
          <div className="sdet-archivo-info">
            <span className="sdet-archivo-label">{f.label ?? f.name}</span>
            <span className="sdet-archivo-meta">
              {f.sizeBytes ? `${(f.sizeBytes / 1024) | 0} KB` : ""} ·{" "}
              {f.uploadedAt}
            </span>
          </div>
          <div className="sdet-archivo-actions">
            <a
              href={f.url ?? "#"}
              className="btn btn-xs btn-outline"
              aria-label={`Descargar ${f.label ?? f.name}`}
              download
            >
              <Download size={13} />
            </a>
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              aria-label={`Eliminar ${f.label ?? f.name}`}
              onClick={() => eliminar(f.id)}
              style={{ color: "var(--danger)" }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabHistorial({ history }: { history?: AdoptionHistoryItem[] }) {
  const list = history ?? [];
  if (list.length === 0) {
    return (
      <div className="sdet-tab-content sdet-historial">
        <div className="sdet-tab-empty">
          <Clock size={28} /> <p>No hay eventos en el historial.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="sdet-tab-content sdet-historial">
      <ul className="sdet-historial-list">
        {list.map((h) => (
          <li key={h.id} className="sdet-historial-item">
            <span className="sdet-historial-icon">
              {h.type &&
                {
                  solicitud: <ChevronRight size={14} />,
                  mensaje: <MessageSquare size={14} />,
                  archivo: <FileText size={14} />,
                  comentario: <Clock size={14} />,
                }[h.type]}
            </span>
            <span className="sdet-historial-texto">{h.text}</span>
            <time className="sdet-historial-fecha">{h.timestamp}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --- Modal de confirmación de cambio de estado --- */

function ConfirmarEstadoModal({
  actual,
  destino,
  loading,
  onConfirm,
  onCancel,
}: {
  actual: Solicitud["estado"];
  destino: Solicitud["estado"];
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const efecto = efectoTransicion(destino);
  const esRechazo = destino === "DESCARTADA";

  return createPortal(
    <div className="sdet-modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="sdet-modal sdet-modal--sm"
        role="dialog"
        aria-label="Confirmar cambio de estado"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sdet-modal-head">
          <h2>Confirmar cambio de estado</h2>
          <button
            type="button"
            className="vdrawer-close"
            aria-label="Cerrar"
            onClick={onCancel}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sdet-modal-body">
          <p className="sdet-confirm-text">
            Vas a cambiar el estado de{" "}
            <Pill tone={solicitudEstadoTone(actual)}>
              {ESTADO_LABELS[actual]}
            </Pill>{" "}
            a{" "}
            <Pill tone={solicitudEstadoTone(destino)}>
              {ESTADO_LABELS[destino]}
            </Pill>
            .
          </p>

          {efecto && (
            <div
              className={`sdet-confirm-alert${esRechazo ? " sdet-confirm-alert--danger" : ""}`}
            >
              <AlertTriangle size={16} aria-hidden />
              <span>{efecto}</span>
            </div>
          )}

          <p className="sdet-confirm-question">¿Confirmás el cambio?</p>
        </div>

        <div className="sdet-modal-foot">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${esRechazo ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Cambiando..." : "Sí, cambiar estado"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* --- Main drawer component: fetches detail and builds compat criteria dynamically --- */

export function SolicitudDetail({
  solicitud,
  onClose,
  onIrAMensajes,
  onUpdateStatus,
}: Props) {
  const [tab, setTab] = useState<TabId>("evaluacion");
  const opciones = transicionesPermitidas(solicitud.estado);
  const terminal = esEstadoTerminal(solicitud.estado);
  const [selectedEstado, setSelectedEstado] = useState<Solicitud["estado"]>(
    opciones[0] ?? solicitud.estado,
  );
  const [showAdoptante, setShowAdoptante] = useState(false);
  const [showMascota, setShowMascota] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: detail, loading: loadingDetail } = useSolicitudDetail(
    solicitud.id,
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const handleConfirmarCambio = async () => {
    if (!onUpdateStatus) return;
    setIsUpdating(true);
    const ok = await onUpdateStatus(solicitud.id, selectedEstado);
    setIsUpdating(false);
    if (ok) {
      setConfirmOpen(false);
      // El listado se recarga con el nuevo estado y la fecha de modificación;
      // cerramos el drawer para que el cambio quede reflejado en la tabla.
      onClose();
    }
  };

  const userPhoto = solicitud.userPhoto?.trim() ? solicitud.userPhoto : null;
  const petPhoto = solicitud.petPhoto?.trim() ? solicitud.petPhoto : null;

  // prefer detail scores/labels when available
  const compatPct =
    detail?.compatibilityScore != null
      ? Math.round(detail.compatibilityScore)
      : solicitud.compatPct;
  const compatLbl = detail
    ? compatLabel(detail.compatibilityScore)
    : solicitud.compatLabel;

  // Build compat criteria from `detail` when present, with sensible fallbacks
  const COMPAT_CRITERIOS = (() => {
    const d = detail;
    if (!d) {
      return [
        { label: "Experiencia con animales", value: "—" },
        { label: "Vivienda apta", value: "—" },
        { label: "Tiempo disponible", value: "—" },
        { label: "Tiene niños", value: "—" },
        { label: "Tiene otros animales", value: "—" },
      ];
    }

    const experiencia = d.experience ? "Sí" : "No";
    const tieneNiños = (d.children ?? 0) > 0 ? "Sí" : "No";
    const tieneOtros = d.otherAnimalsLabel === "Sí" ? "Sí" : "No";
    const viviendaApta =
      d.hasGardenLabel === "Sí" ||
      (d.householdSettingLabel ?? "").toLowerCase().includes("casa")
        ? "Sí"
        : "No";

    let tiempo = "—";
    const act = (d.activityLevelLabel ?? "").toLowerCase();
    if (act.includes("alto")) tiempo = "Alto";
    else if (act.includes("medi") || act.includes("media")) tiempo = "Medio";
    else if (act) tiempo = act.charAt(0).toUpperCase() + act.slice(1);

    return [
      { label: "Experiencia con animales", value: experiencia },
      { label: "Vivienda apta", value: viviendaApta },
      { label: "Tiempo disponible", value: tiempo },
      { label: "Tiene niños", value: tieneNiños },
      { label: "Tiene otros animales", value: tieneOtros },
    ];
  })();

  return (
    <>
      <div className="vdrawer-overlay" onClick={onClose} role="presentation">
        <aside
          className="vdrawer sdet-drawer"
          role="dialog"
          aria-label={`Detalle de solicitud ${solicitud.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="vdrawer-head">
            <div>
              <h2>Solicitud #{solicitud.id}</h2>
              <p className="solicitud-detail-header-meta">
                Fecha: {solicitud.fecha}
              </p>
            </div>
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
            {loadingDetail && (
              <div className="sdet-loading-indicator">Cargando detalles...</div>
            )}
            <div className="sdet-top-cards">
              <article className="sdet-card">
                <p className="sdet-card-eyebrow">Adoptante</p>
                <div className="sdet-card-profile">
                  {userPhoto ? (
                    <Image
                      className="sdet-card-avatar"
                      src={userPhoto}
                      alt={solicitud.userName || "Adoptante"}
                      width={48}
                      height={48}
                      unoptimized
                    />
                  ) : (
                    <div className="sdet-card-avatar sdet-card-avatar--empty">
                      <PawPrint size={20} />
                    </div>
                  )}
                  <div className="sdet-card-info">
                    <p className="sdet-card-name">{solicitud.userName}</p>
                    <p className="sdet-card-sub">
                      <Mail size={12} />
                      {solicitud.userEmail}
                    </p>
                    <p className="sdet-card-sub">
                      <Phone size={12} />
                      {detail?.applicant?.phone ?? "—"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline sdet-card-btn"
                  onClick={() => setShowAdoptante(true)}
                >
                  Ver perfil completo
                </button>
              </article>

              <article className="sdet-card">
                <p className="sdet-card-eyebrow">Mascota</p>
                <div className="sdet-card-profile">
                  {petPhoto ? (
                    <Image
                      className="sdet-card-avatar sdet-card-avatar--pet"
                      src={petPhoto}
                      alt={solicitud.petName || "Mascota"}
                      width={48}
                      height={48}
                      unoptimized
                    />
                  ) : (
                    <div className="sdet-card-avatar sdet-card-avatar--empty">
                      <PawPrint size={20} />
                    </div>
                  )}
                  <div className="sdet-card-info">
                    <p className="sdet-card-name">{solicitud.petName}</p>
                    <p className="sdet-card-sub">
                      {detail?.pet?.name ? `${detail.pet.name}` : "—"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline sdet-card-btn"
                  onClick={() => setShowMascota(true)}
                >
                  Ver mascota
                </button>
              </article>
            </div>

            <section className="sdet-compat-section">
              <p className="sdet-section-label">Compatibilidad</p>
              <div className="sdet-compat-body">
                <CompatCircle pct={compatPct} label={compatLbl} />
                <ul className="sdet-compat-list">
                  {COMPAT_CRITERIOS.map((item) => (
                    <li key={item.label} className="sdet-compat-item">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              {detail && (
                <div style={{ marginTop: "1rem", textAlign: "right" }}>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowMatchingModal(true)}
                  >
                    Ver detalle del cálculo
                  </button>
                </div>
              )}
            </section>

            <section className="sdet-estado-section">
              <p className="sdet-section-label">Estado actual</p>
              <div className="sdet-estado-actual">
                <Pill tone={solicitudEstadoTone(solicitud.estado)}>
                  {ESTADO_LABELS[solicitud.estado]}
                </Pill>
                <span className="sdet-estado-fecha">
                  Última modificación:{" "}
                  {solicitud.fechaModificacion ?? solicitud.fecha}
                </span>
              </div>

              {terminal ? (
                <p className="sdet-estado-terminal">
                  Esta solicitud está finalizada y no admite más cambios de
                  estado.
                </p>
              ) : (
                <div className="sdet-estado-row">
                  <div className="field sdet-estado-select-wrap">
                    <label
                      className="sdet-estado-sublabel"
                      htmlFor="sdet-estado-select"
                    >
                      Cambiar a
                    </label>
                    <select
                      id="sdet-estado-select"
                      className="select"
                      value={selectedEstado}
                      onChange={(e) =>
                        setSelectedEstado(e.target.value as Solicitud["estado"])
                      }
                    >
                      {opciones.map((value) => (
                        <option key={value} value={value}>
                          {ESTADO_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary sdet-estado-btn"
                    onClick={() => setConfirmOpen(true)}
                    disabled={isUpdating || !onUpdateStatus}
                  >
                    Cambiar estado
                  </button>
                </div>
              )}
            </section>

            <div className="sdet-tabs" role="tablist">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`sdet-tab${tab === item.id ? " active" : ""}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "evaluacion" && (
              <TabEvaluacion adoptionId={Number(solicitud.id)} />
            )}
            {tab === "mensajes" && (
              <TabMensajes
                nombre={detail?.user?.name ?? solicitud.userName}
                onIrAMensajes={onIrAMensajes}
                userId={detail?.user?.id ? String(detail.user.id) : undefined}
                messages={detail?.messages}
              />
            )}
          </div>
        </aside>
      </div>

      {showAdoptante && (
        <AdoptanteModal
          solicitud={solicitud}
          onClose={() => setShowAdoptante(false)}
        />
      )}
      {showMascota && (
        <MascotaModal
          solicitud={solicitud}
          onClose={() => setShowMascota(false)}
        />
      )}
      {showMatchingModal && detail && (
        <MatchingModal
          detail={detail}
          onClose={() => setShowMatchingModal(false)}
        />
      )}
      {confirmOpen && (
        <ConfirmarEstadoModal
          actual={solicitud.estado}
          destino={selectedEstado}
          loading={isUpdating}
          onConfirm={handleConfirmarCambio}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
