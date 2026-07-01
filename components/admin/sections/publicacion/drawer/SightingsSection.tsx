"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Eye,
  MapPin,
  Phone,
  X,
  XCircle,
} from "lucide-react";
import {
  acceptSighting,
  listSightings,
  rejectSighting,
  type Sighting,
} from "@/services/mascotas.pets";

/**
 * Lista de avistamientos ("La vi") de una publicación para el admin/dueño.
 * Permite confirmar cada avistamiento; al aceptar, se avisa a quien lo reportó.
 */
export function SightingsSection({
  petId,
  canManage = true,
  onChanged,
}: {
  petId: string;
  /** Si es false, es la vista del reportante: read-only y sin botones. */
  canManage?: boolean;
  /** Se llama tras aceptar/rechazar (para refrescar el mapa de recorrido). */
  onChanged?: () => void;
}) {
  const [items, setItems] = useState<Sighting[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listSightings(petId).then((res) => {
      if (alive && res.ok) setItems(res.data ?? []);
      else if (alive) setItems([]);
    });
    return () => {
      alive = false;
    };
  }, [petId]);

  const resolve = async (
    sightingId: string,
    action: (p: string, s: string) => ReturnType<typeof acceptSighting>,
  ) => {
    setBusyId(sightingId);
    const res = await action(petId, sightingId);
    if (res.ok && res.data) {
      setItems((prev) =>
        (prev ?? []).map((s) => (s.id === sightingId ? res.data! : s)),
      );
      onChanged?.();
    }
    setBusyId(null);
  };

  const pending = (items ?? []).filter(
    (s) => !s.accepted && !s.rejected,
  ).length;

  // En la vista del reportante no mostramos nada si no tiene avistamientos
  // (así no aparece una sección vacía en cada publicación que visita).
  if (!canManage && (items == null || items.length === 0)) return null;

  return (
    <div className="sightings">
      <div className="sightings-head">
        <span className="sightings-title">
          <Eye size={16} aria-hidden />
          {canManage ? "Avistamientos" : "Tus avistamientos"}
          {items && items.length > 0 && (
            <span className="sightings-count">{items.length}</span>
          )}
        </span>
        {canManage && pending > 0 && (
          <span className="sightings-pending">{pending} sin confirmar</span>
        )}
      </div>

      {items == null ? (
        <p className="sightings-empty">Cargando…</p>
      ) : items.length === 0 ? (
        <div className="sightings-empty-box">
          <MapPin size={22} aria-hidden />
          <p>
            {canManage
              ? "Todavía nadie reportó haber visto a esta mascota."
              : "No reportaste avistamientos de esta mascota."}
          </p>
        </div>
      ) : (
        <ul className="sightings-list">
          {items.map((s) => (
            <li
              key={s.id}
              className={`sighting-card${
                s.accepted ? " is-accepted" : s.rejected ? " is-rejected" : ""
              }`}
            >
              <div className="sighting-card-top">
                <span className="sighting-place">
                  <span className="sighting-pin" aria-hidden>
                    <MapPin size={15} />
                  </span>
                  {s.place || "Ubicación no indicada"}
                </span>
                {s.accepted ? (
                  <span className="sighting-badge is-ok">
                    <CheckCircle2 size={13} aria-hidden /> Confirmado
                  </span>
                ) : s.rejected ? (
                  <span className="sighting-badge is-no">
                    <XCircle size={13} aria-hidden /> Descartado
                  </span>
                ) : (
                  <span className="sighting-badge is-new">Nuevo</span>
                )}
              </div>

              {(s.sightedOn || s.contact) && (
                <div className="sighting-meta">
                  {s.sightedOn && (
                    <span>
                      <Calendar size={13} aria-hidden /> {s.sightedOn}
                    </span>
                  )}
                  {s.contact && (
                    <span>
                      <Phone size={13} aria-hidden /> {s.contact}
                    </span>
                  )}
                </div>
              )}

              {s.note && <p className="sighting-note">“{s.note}”</p>}

              {(s.latitud != null && s.longitud != null) && (
                <a
                  className="sighting-maplink"
                  href={`https://www.openstreetmap.org/?mlat=${s.latitud}&mlon=${s.longitud}#map=17/${s.latitud}/${s.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={13} aria-hidden /> Ver punto exacto en el mapa
                </a>
              )}

              {canManage && !s.accepted && !s.rejected && (
                <div className="sighting-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm sighting-reject"
                    onClick={() => resolve(s.id, rejectSighting)}
                    disabled={busyId === s.id}
                  >
                    <X size={14} aria-hidden /> Rechazar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => resolve(s.id, acceptSighting)}
                    disabled={busyId === s.id}
                  >
                    <Check size={14} aria-hidden />
                    {busyId === s.id ? "…" : "Aceptar"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
