"use client";

import { useEffect, useState } from "react";
import { Check, Eye, MapPin } from "lucide-react";
import { acceptSighting, listSightings, type Sighting } from "@/services/mascotas.pets";
import { Pill } from "../../../ui/pill";

/**
 * Lista de avistamientos ("La vi") de una publicación para el admin/dueño.
 * Permite confirmar cada avistamiento; al aceptar, se avisa a quien lo reportó.
 */
export function SightingsSection({ petId }: { petId: string }) {
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

  const handleAccept = async (sightingId: string) => {
    setBusyId(sightingId);
    const res = await acceptSighting(petId, sightingId);
    if (res.ok && res.data) {
      setItems((prev) =>
        (prev ?? []).map((s) => (s.id === sightingId ? res.data! : s)),
      );
    }
    setBusyId(null);
  };

  if (items == null) {
    return (
      <section className="vdrawer-section">
        <h3>Avistamientos</h3>
        <p className="vdrawer-desc">Cargando…</p>
      </section>
    );
  }

  return (
    <section className="vdrawer-section">
      <h3>
        Avistamientos{items.length > 0 ? ` (${items.length})` : ""}
      </h3>
      {items.length === 0 ? (
        <p className="vdrawer-desc">Todavía nadie reportó haber visto a esta mascota.</p>
      ) : (
        <ul className="sight-list">
          {items.map((s) => (
            <li key={s.id} className="sight-list-item">
              <div className="sight-list-head">
                <span className="sight-list-place">
                  <MapPin size={14} aria-hidden /> {s.place || "Sin ubicación"}
                </span>
                {s.accepted ? (
                  <Pill tone="green">Confirmado</Pill>
                ) : (
                  <Pill tone="amber">Nuevo</Pill>
                )}
              </div>
              {s.sightedOn && (
                <p className="sight-list-meta">Fecha: {s.sightedOn}</p>
              )}
              {s.note && <p className="sight-list-note">{s.note}</p>}
              {s.contact && (
                <p className="sight-list-meta">Contacto: {s.contact}</p>
              )}
              {!s.accepted && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAccept(s.id)}
                  disabled={busyId === s.id}
                >
                  <Check size={14} aria-hidden />
                  {busyId === s.id ? "Aceptando…" : "Aceptar"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
