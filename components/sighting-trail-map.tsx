"use client";

import { useEffect, useRef, useState } from "react";
import { Route } from "lucide-react";
import { getSightingTrail, type TrailPoint } from "@/services/mascotas.pets";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

/** Carga Leaflet desde CDN una sola vez y resuelve con window.L. */
function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.L) return resolve(w.L);
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[data-leaflet]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(w.L));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.dataset.leaflet = "1";
    script.onload = () => resolve(w.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/** Marcador redondo con número/ícono. */
function pinIcon(L: any, label: string, kind: "origin" | "spot" | "last") {
  return L.divIcon({
    className: "trail-pin-wrap",
    html: `<span class="trail-pin trail-pin--${kind}">${label}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

/**
 * Mapa del recorrido de una mascota perdida: el punto de origen (dónde se
 * perdió) más los avistamientos ACEPTADOS, en orden cronológico y unidos por
 * una línea. El último visto queda resaltado.
 */
export function SightingTrailMap({
  petId,
  origin,
  originLabel,
  reloadKey = 0,
}: {
  petId: string;
  origin: [number, number] | null;
  originLabel?: string | null;
  reloadKey?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [trail, setTrail] = useState<TrailPoint[] | null>(null);

  // Traer el rastro (y refrescar cuando cambia reloadKey, p.ej. tras aceptar).
  useEffect(() => {
    let alive = true;
    getSightingTrail(petId).then((res) => {
      if (alive) setTrail(res.ok ? (res.data ?? []) : []);
    });
    return () => {
      alive = false;
    };
  }, [petId, reloadKey]);

  useEffect(() => {
    if (trail == null) return;
    if (!origin && trail.length === 0) return;

    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        if (!mapRef.current) {
          mapRef.current = L.map(containerRef.current, {
            scrollWheelZoom: false,
          });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap",
            maxZoom: 19,
          }).addTo(mapRef.current);
          layerRef.current = L.layerGroup().addTo(mapRef.current);
        }
        const map = mapRef.current;
        layerRef.current.clearLayers();

        const path: [number, number][] = [];

        if (origin) {
          path.push(origin);
          L.marker(origin, { icon: pinIcon(L, "🏠", "origin") })
            .bindPopup(
              `<strong>Se perdió acá</strong>${
                originLabel ? `<br>${originLabel}` : ""
              }`,
            )
            .addTo(layerRef.current);
        }

        trail.forEach((p, i) => {
          const pos: [number, number] = [p.latitud, p.longitud];
          path.push(pos);
          const isLast = i === trail.length - 1;
          L.marker(pos, {
            icon: pinIcon(L, String(i + 1), isLast ? "last" : "spot"),
            zIndexOffset: isLast ? 1000 : 0,
          })
            .bindPopup(
              `<strong>Visto #${i + 1}${isLast ? " (último)" : ""}</strong>${
                p.place ? `<br>${p.place}` : ""
              }${p.sightedOn ? `<br>📅 ${p.sightedOn}` : ""}`,
            )
            .addTo(layerRef.current);
        });

        if (path.length >= 2) {
          L.polyline(path, {
            color: "#6c5ce7",
            weight: 3,
            opacity: 0.7,
            dashArray: "6 6",
          }).addTo(layerRef.current);
          map.fitBounds(path, { padding: [30, 30], maxZoom: 16 });
        } else if (path.length === 1) {
          map.setView(path[0], 15);
        }
        setTimeout(() => map.invalidateSize(), 60);
      })
      .catch(() => {
        /* si el CDN falla, no mostramos mapa */
      });

    return () => {
      cancelled = true;
    };
  }, [trail, origin, originLabel]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Solo mostramos el recorrido cuando hay al menos un avistamiento confirmado.
  if (trail == null || trail.length === 0) return null;

  const last = trail[trail.length - 1];

  return (
    <section className="trail">
      <div className="trail-head">
        <span className="trail-title">
          <Route size={16} aria-hidden /> Recorrido del animal
        </span>
        <span className="trail-count">
          {trail.length} avistamiento{trail.length > 1 ? "s" : ""} confirmado
          {trail.length > 1 ? "s" : ""}
        </span>
      </div>
      {last && (
        <p className="trail-lastseen">
          📍 Última vez visto: <strong>{last.place || "punto en el mapa"}</strong>
          {last.sightedOn ? ` · ${last.sightedOn}` : ""}
        </p>
      )}
      <div
        ref={containerRef}
        className="trail-map"
        aria-label="Mapa del recorrido del animal"
      />
    </section>
  );
}
