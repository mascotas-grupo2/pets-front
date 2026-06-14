"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  cancelMyAdoption,
  getMyAdoptions,
  type MyAdoption,
} from "@/services/adoptions";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { CatLoader } from "@/components/cat-loader";
import handleToast from "@/components/utils/toast";

// Cadena incremental de estados (espejo del backend). DESCARTADA es terminal aparte.
const CHAIN = [
  "NUEVA",
  "EN_EVALUACION",
  "ENTREVISTA_PENDIENTE",
  "ACEPTADA_CON_SEGUIMIENTO",
  "ACEPTADA",
] as const;

const STATUS_LABELS: Record<string, string> = {
  NUEVA: "Nueva",
  EN_EVALUACION: "En evaluación",
  ENTREVISTA_PENDIENTE: "Entrevista pendiente",
  ACEPTADA_CON_SEGUIMIENTO: "Aceptada con seguimiento",
  ACEPTADA: "Aceptada",
  DESCARTADA: "Cancelada",
};

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MyRequestsView() {
  const [requests, setRequests] = useState<MyAdoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const res = await getMyAdoptions();
    if (res.ok && res.data) setRequests(res.data);
    else handleToast("error", res.error ?? "No se pudieron cargar tus solicitudes.");
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onConfirmCancel() {
    if (confirmId == null) return;
    setBusy(true);
    const res = await cancelMyAdoption(confirmId);
    setBusy(false);
    if (res.ok) {
      handleToast("success", "Solicitud cancelada.");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === confirmId ? { ...r, status: "DESCARTADA" } : r,
        ),
      );
      setConfirmId(null);
    } else {
      handleToast("error", res.error ?? "No se pudo cancelar la solicitud.");
    }
  }

  return (
    <div className="my-requests-section">
      <div className="section-title" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
        <h2>Mis Solicitudes</h2>
        <p style={{ marginLeft: 0 }}>
          Seguí el estado de tus solicitudes de adopción.
        </p>
      </div>

      {loading ? (
        <CatLoader label="CARGANDO" />
      ) : requests.length === 0 ? (
        <p
          className="empty-state"
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "var(--gray-50)",
            borderRadius: "8px",
          }}
        >
          Todavía no enviaste ninguna solicitud de adopción.
        </p>
      ) : (
        <ul className="req-list">
          {requests.map((r) => {
            const cancelled = r.status === "DESCARTADA";
            const accepted = r.status === "ACEPTADA";
            const terminal = cancelled || accepted;
            const currentIndex = CHAIN.indexOf(r.status as (typeof CHAIN)[number]);
            return (
              <li key={r.id} className={`req-card${cancelled ? " req-card--cancelled" : ""}`}>
                <div className="req-card-head">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="req-pet-photo"
                    src={r.petPhoto || "/images/pet-dog.jpg"}
                    alt={r.petName ?? "Mascota"}
                  />
                  <div className="req-card-info">
                    <h3>
                      {r.petName ?? "Mascota"}
                      {r.kind === "transito" && (
                        <span className="req-kind-chip">Tránsito</span>
                      )}
                    </h3>
                    <p className="req-card-meta">
                      {r.kind === "transito" ? "Ofrecida el " : "Enviada el "}
                      {formatFecha(r.createdAt)}
                      {r.compatibilityScore != null &&
                        ` · Compatibilidad ${Math.round(r.compatibilityScore)}%`}
                    </p>
                  </div>
                  <span
                    className={`req-status-badge req-status-badge--${
                      cancelled ? "cancelled" : accepted ? "accepted" : "active"
                    }`}
                  >
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>

                {cancelled && r.rejectionReason && (
                  <p className="req-reject-reason">
                    <strong>Motivo del rechazo:</strong> {r.rejectionReason}
                  </p>
                )}

                {!cancelled && (
                  <ol className="req-steps">
                    {CHAIN.map((code, i) => {
                      const done = currentIndex >= 0 && currentIndex >= i;
                      const current = currentIndex === i;
                      return (
                        <li
                          key={code}
                          className={`req-step${done ? " is-done" : ""}${
                            current ? " is-current" : ""
                          }`}
                        >
                          <span className="req-step-dot" aria-hidden />
                          <span className="req-step-label">{STATUS_LABELS[code]}</span>
                        </li>
                      );
                    })}
                  </ol>
                )}

                <div className="req-card-actions">
                  {r.petId && (
                    <Link href={`/mascotas-perdidas/${r.petId}`} className="btn btn-outline btn-sm">
                      Ver mascota
                    </Link>
                  )}
                  {!terminal && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmId(r.id)}
                    >
                      Cancelar solicitud
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={confirmId != null}
        title="Cancelar solicitud"
        message="¿Seguro que querés retirar esta solicitud de adopción? Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        cancelLabel="No"
        danger
        busy={busy}
        onConfirm={onConfirmCancel}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
