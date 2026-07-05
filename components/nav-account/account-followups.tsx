"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyFollowups, type MyFollowupItem } from "@/services/followups";
import { CatLoader } from "@/components/cat-loader";
import handleToast from "@/components/utils/toast";

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// El estado del seguimiento viene del catálogo del back (code en MAYÚSCULAS:
// PENDIENTE / CONFIRMADO / COMPLETADO / CANCELADO…). Normalizamos por las dudas.
function statusVariant(code?: string): "active" | "accepted" | "cancelled" {
  const c = (code ?? "").toLowerCase();
  if (c === "completado") return "accepted";
  if (c === "cancelado") return "cancelled";
  return "active";
}

export default function MyFollowupsView() {
  const [items, setItems] = useState<MyFollowupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getMyFollowups();
      if (res.ok && res.data) setItems(res.data.items);
      else handleToast("error", res.error ?? "No se pudieron cargar tus seguimientos.");
      setLoading(false);
    })();
  }, []);

  const now = Date.now();

  return (
    <div className="my-requests-section">
      <div className="section-title" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
        <h2>Mis Seguimientos</h2>
        <p style={{ marginLeft: 0 }}>
          Visitas de control post-adopción coordinadas con el refugio.
        </p>
      </div>

      {loading ? (
        <CatLoader label="CARGANDO" />
      ) : items.length === 0 ? (
        <p
          className="empty-state"
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "var(--gray-50)",
            borderRadius: "8px",
          }}
        >
          Todavía no tenés seguimientos agendados. Se programan automáticamente
          cuando tu adopción es aceptada con seguimiento.
        </p>
      ) : (
        <ul className="req-list">
          {items.map((f) => {
            const code = f.status?.code;
            const done = (code ?? "").toLowerCase() === "completado";
            const when = new Date(f.appointmentAt).getTime();
            const upcoming = !done && when >= now;
            return (
              <li key={f.id} className="req-card">
                <div className="req-card-head">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="req-pet-photo"
                    src={f.petPhoto || "/images/pet-dog.jpg"}
                    alt={f.petName ?? "Mascota"}
                  />
                  <div className="req-card-info">
                    <h3>{f.petName ?? "Mascota"}</h3>
                    <p className="req-card-meta">
                      {f.type?.label ?? "Seguimiento"} · {formatFecha(f.appointmentAt)}
                      {upcoming && " · Próxima"}
                    </p>
                  </div>
                  <span className={`req-status-badge req-status-badge--${statusVariant(code)}`}>
                    {f.status?.label ?? "Pendiente"}
                  </span>
                </div>

                {f.petId && (
                  <div className="req-card-actions">
                    <Link href={`/mascotas-perdidas/${f.petId}`} className="btn btn-outline btn-sm">
                      Ver mascota
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
