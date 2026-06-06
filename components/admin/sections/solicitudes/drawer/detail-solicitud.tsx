"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { getAdoptionById } from "@/services/adoptions";
import type { AdoptionDetail } from "@/types/adoption-detail";
import type { Solicitud } from "../solicitudes.data";
import { AdoptanteModal } from "./adoptante-modal";
import { MascotaModal } from "./mascota-modal";

type Props = {
  solicitud: Solicitud;
  onClose: () => void;
  onIrAMensajes: (userId: string) => void;
};

const TABS = [
  { id: "evaluacion", label: "Evaluación" },
  { id: "mensajes", label: "Mensajes" },
  { id: "archivos", label: "Archivos" },
  { id: "historial", label: "Historial" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ESTADO_LABELS: Record<Solicitud["estado"], string> = {
  NUEVA: "Nueva",
  EN_EVALUACION: "En evaluación",
  ENTREVISTA_PENDIENTE: "Entrevista pendiente",
  ACEPTADA_CON_SEGUIMIENTO: "Aceptada con seguimiento",
  ACEPTADA: "Aceptada",
  DESCARTADA: "Descartada",
};

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
  AdoptionHistoryItem
} from "@/types/adoption-detail";

function TabEvaluacion() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [nota, setNota] = useState("");
  const [notas, setNotas] = useState<{ texto: string; fecha: string }[]>([]);

  function toggle(label: string) {
    setChecks((prev) => ({ ...prev, [label]: !prev[label] }));
  }
  function guardarNota() {
    const texto = nota.trim();
    if (!texto) return;
    const fecha = new Date().toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setNotas((prev) => [{ texto, fecha }, ...prev]);
    setNota("");
  }

  const CHECKLIST = [
    "Verificó identidad",
    "Consultó sobre vivienda",
    "Evaluó experiencia previa",
    "Revisó situación familiar",
    "Coordinó visita al hogar",
  ];

  return (
    <div className="sdet-tab-content sdet-eval">
      <p className="sdet-section-label">Checklist</p>
      <div className="sdet-chips">
        {CHECKLIST.map((item) => (
          <button
            key={item}
            type="button"
            className={`sdet-chip-check${checks[item] ? " is-checked" : ""}`}
            onClick={() => toggle(item)}
          >
            {checks[item] && <CheckCircle2 size={12} aria-hidden />}
            {item}
          </button>
        ))}
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

      {notas.length > 0 && (
        <ul className="sdet-notas-list">
          {notas.map((n, i) => (
            <li key={i} className="sdet-nota-item">
              <p className="sdet-nota-texto">{n.texto}</p>
              <time className="sdet-nota-fecha">{n.fecha}</time>
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
  solicitudId,
  messages,
}: {
  nombre?: string;
  onIrAMensajes: (id: string) => void;
  solicitudId: string;
  messages?: AdoptionMessage[];
}) {
  const msgs = messages ?? [];
  if (msgs.length === 0) {
    return (
      <div className="sdet-tab-content sdet-mensajes-readonly">
        <div className="sdet-empty">No hay mensajes disponibles.</div>
        <button
          type="button"
          className="btn btn-primary sdet-ir-mensajes"
          onClick={() => onIrAMensajes(solicitudId)}
        >
          <MessageSquare size={15} /> Ir al mensaje
        </button>
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
      <button
        type="button"
        className="btn btn-primary sdet-ir-mensajes"
        onClick={() => onIrAMensajes(solicitudId)}
      >
        <MessageSquare size={15} /> Ir al mensaje
      </button>
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

/* --- Main drawer component: fetches detail and builds compat criteria dynamically --- */

export function SolicitudDetail({ solicitud, onClose, onIrAMensajes }: Props) {
  const [tab, setTab] = useState<TabId>("evaluacion");
  const [selectedEstado, setSelectedEstado] = useState<Solicitud["estado"]>(
    solicitud.estado,
  );
  const [showAdoptante, setShowAdoptante] = useState(false);
  const [showMascota, setShowMascota] = useState(false);

  const [detail, setDetail] = useState<AdoptionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await getAdoptionById(solicitud.id);
      if (cancelled) return;
      if (res.ok && res.data) setDetail(res.data);
      setLoadingDetail(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [solicitud.id]);

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
                    <img
                      className="sdet-card-avatar"
                      src={userPhoto}
                      alt={solicitud.userName || "Adoptante"}
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
                    <img
                      className="sdet-card-avatar sdet-card-avatar--pet"
                      src={petPhoto}
                      alt={solicitud.petName || "Mascota"}
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
            </section>

            <section className="sdet-estado-section">
              <p className="sdet-section-label">Estado actual</p>
              <div className="sdet-estado-row">
                <div className="field sdet-estado-select-wrap">
                  <select
                    className="select"
                    value={selectedEstado}
                    onChange={(e) =>
                      setSelectedEstado(e.target.value as Solicitud["estado"])
                    }
                  >
                    {Object.entries(ESTADO_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-primary sdet-estado-btn"
                >
                  Cambiar estado
                </button>
              </div>
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

            {tab === "evaluacion" && <TabEvaluacion />}
            {tab === "mensajes" && (
              <TabMensajes
                nombre={detail?.user?.name ?? solicitud.userName}
                onIrAMensajes={onIrAMensajes}
                solicitudId={solicitud.id}
                messages={detail?.messages}
              />
            )}
            {tab === "archivos" && <TabArchivos files={detail?.files} />}
            {tab === "historial" && (
              <TabHistorial history={detail?.history} />
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
    </>
  );
}
