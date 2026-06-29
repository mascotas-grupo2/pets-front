"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminAlerts, type AdminAlert } from "@/services/messages.services";
import { confirmReturnPet, getAdminPet } from "@/services/mascotas.pets";
import { rejectClaimPet } from "@/services/messages.services";
import { MascotaDrawer } from "../mascotas/mascota-drawer";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import type { AdminPetSummary } from "@/types/pet";

const TYPE_META: Record<
  AdminAlert["type"],
  { label: string; Icon: typeof Bell }
> = {
  reclamo: { label: "Reclamo", Icon: AlertTriangle },
  devuelta: { label: "Devuelta", Icon: CheckCircle2 },
};

type Pending =
  | { kind: "aceptar"; alert: AdminAlert }
  | { kind: "rechazar"; alert: AdminAlert }
  | null;

export function AlertsCarousel({
  highlightUserId,
}: { highlightUserId?: number | null } = {}) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [drawerPet, setDrawerPet] = useState<AdminPetSummary | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const load = useCallback(async () => {
    const res = await getAdminAlerts();
    if (res.ok && res.data) setAlerts(res.data.alerts);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const calc = () => {
      const ok = el.scrollWidth > el.clientWidth + 1;
      setCanScroll(ok);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [alerts]);

  useEffect(() => {
    if (!highlightUserId) return;
    const idx = alerts.findIndex((a) => a.userId === highlightUserId);
    if (idx < 0) return;
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".alert-card");
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    el.scrollTo({ left: idx * step, behavior: "smooth" });
    setActive(idx);
  }, [highlightUserId, alerts]);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".alert-card");
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    setActive(Math.round(el.scrollLeft / step));
  }

  function scrollByCards(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".alert-card");
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    const next = Math.max(0, Math.min(alerts.length - 1, active + dir));
    el.scrollTo({ left: next * step, behavior: "smooth" });
    setActive(next);
  }

  async function verDetalles(petId: string | null) {
    if (!petId) return;
    const res = await getAdminPet(petId);
    if (res.ok && res.data) setDrawerPet(res.data);
    else toast.error("No se pudo abrir el detalle de la mascota.");
  }

  async function confirmarPending() {
    if (!pending) return;
    const { kind, alert } = pending;
    if (!alert.petId) return;
    setBusy(true);
    const res =
      kind === "aceptar"
        ? await confirmReturnPet(alert.petId, "")
        : await rejectClaimPet(alert.petId, alert.petId, "");
    setBusy(false);
    if (res.ok) {
      toast.success(
        kind === "aceptar" ? "Devolución confirmada." : "Reclamo rechazado.",
      );
      setPending(null);
      void load();
    } else {
      toast.error(res.error ?? "No se pudo completar la acción.");
    }
  }

  if (loading || alerts.length === 0) return null;

  return (
    <section className="alerts-carousel">
      <header className="alerts-head">
        <span className="alerts-head-icon">
          <Bell size={20} aria-hidden />
        </span>
        <div className="alerts-head-text">
          <strong>
            {alerts.length} alerta{alerts.length === 1 ? "" : "s"} activa
            {alerts.length === 1 ? "" : "s"}
          </strong>
          {canScroll && <span>Deslizá para ver todas</span>}
        </div>
        {/* Botón "Ver todas" oculto: no existe ruta /admin/solicitudes */}
      </header>

      <div className="alerts-viewport">
        {canScroll && (
          <button
            type="button"
            className="alerts-arrow alerts-arrow--left"
            aria-label="Anterior"
            onClick={() => scrollByCards(-1)}
            disabled={active === 0}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="alerts-track" ref={trackRef} onScroll={onScroll}>
          {alerts.map((a) => {
            const meta = TYPE_META[a.type];
            return (
              <article
                key={a.id}
                className={`alert-card alert-card--${a.type}${
                  a.userId && a.userId === highlightUserId
                    ? " is-highlighted"
                    : ""
                }`}
              >
                <span className={`alert-badge alert-badge--${a.type}`}>
                  <meta.Icon size={14} aria-hidden /> {meta.label}
                </span>
                <div className="alert-card-main">
                  {a.petPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.petPhoto}
                      alt={a.petName}
                      className="alert-card-photo"
                    />
                  ) : (
                    <div className="alert-card-photo alert-card-photo--empty" />
                  )}
                  <div className="alert-card-info">
                    <strong>{a.petName}</strong>
                    <p>{a.description}</p>
                  </div>
                </div>
                <div className="alert-card-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => verDetalles(a.petId)}
                  >
                    <ExternalLink size={14} aria-hidden /> Ver detalles
                  </button>
                  {a.type === "reclamo" && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          setPending({ kind: "aceptar", alert: a })
                        }
                      >
                        Aceptar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          setPending({ kind: "rechazar", alert: a })
                        }
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {a.type === "devuelta" && (
                    <span className="claim-returned-badge">
                      <CheckCircle2 size={14} aria-hidden /> Devuelta
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {canScroll && (
          <button
            type="button"
            className="alerts-arrow alerts-arrow--right"
            aria-label="Siguiente"
            onClick={() => scrollByCards(1)}
            disabled={active >= alerts.length - 1}
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {canScroll && (
        <div className="alerts-dots">
          {alerts.map((a, i) => (
            <button
              key={a.id}
              type="button"
              aria-label={`Ir a la alerta ${i + 1}`}
              className={`alerts-dot${i === active ? " is-active" : ""}`}
              onClick={() => {
                const el = trackRef.current;
                if (!el) return;
                const card = el.querySelector<HTMLElement>(".alert-card");
                const step = card ? card.offsetWidth + 16 : el.clientWidth;
                el.scrollTo({ left: i * step, behavior: "smooth" });
                setActive(i);
              }}
            />
          ))}
        </div>
      )}

      {drawerPet && (
        <MascotaDrawer
          pet={drawerPet}
          onClose={() => setDrawerPet(null)}
          onChanged={() => void load()}
          reviewMode
        />
      )}

      <ConfirmDialog
        open={pending !== null}
        title={
          pending?.kind === "aceptar"
            ? "Confirmar devolución"
            : "Rechazar reclamo"
        }
        message={
          pending?.kind === "aceptar"
            ? `¿Confirmás que ${pending?.alert.personName ?? "esta persona"} es el dueño de ${pending?.alert.petName} y que la mascota fue devuelta? Se cerrará la publicación.`
            : `¿Rechazar el reclamo de ${pending?.alert.personName ?? "esta persona"} sobre ${pending?.alert.petName}? Se le avisará a la persona.`
        }
        confirmLabel={pending?.kind === "aceptar" ? "Confirmar" : "Rechazar"}
        cancelLabel="Cancelar"
        danger={pending?.kind === "rechazar"}
        busy={busy}
        onConfirm={confirmarPending}
        onCancel={() => setPending(null)}
      />
    </section>
  );
}
