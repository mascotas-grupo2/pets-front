"use client";

import { Pet } from "@/types/pet";
import { useEffect, useMemo, useRef, useState } from "react";
import { CatLoader } from "@/components/cat-loader";

/**
 * Coordenadas de las ubicaciones conocidas (las del seed de CABA). El back guarda
 * la ubicación como texto; el mapa resuelve esas cadenas a lat/lng acá.
 */
const GEO: Record<string, [number, number]> = {
  "Plaza Serrano, Palermo, CABA": [-34.5889, -58.4306],
  "Parque Centenario, Caballito, CABA": [-34.6064, -58.4356],
  "Parque Lezama, San Telmo, CABA": [-34.628, -58.3697],
  "Parque Rivadavia, Caballito, CABA": [-34.6184, -58.4357],
  "Barrancas de Belgrano, CABA": [-34.561, -58.4546],
  "Parque Chacabuco, CABA": [-34.6357, -58.4316],
  "Plaza Irlanda, Caballito, CABA": [-34.6156, -58.4456],
  "Parque Los Andes, Chacarita, CABA": [-34.5856, -58.4519],
  "Plaza Pueyrredón, Flores, CABA": [-34.628, -58.4636],
  "Parque Saavedra, CABA": [-34.5547, -58.4869],
};

/** Color del pin según el estado de la mascota. */
function statusColor(status: Pet["status"]): string {
  switch (status) {
    case "perdido":
      return "#e53935";
    case "encontrado":
      return "#1ba07a";
    case "en tránsito":
      return "#f5a623";
    case "adoptado":
      return "#6b7280";
    default:
      return "#6c5ce7";
  }
}

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
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-leaflet]`,
    );
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

export function PetsMap({ pets }: { pets: Pet[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const located = useMemo(
    () => pets.filter((p) => GEO[p.location]),
    [pets],
  );
  const unlocated = pets.length - located.length;

  // Inicializa el mapa una sola vez.
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const map = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView([-34.61, -58.44], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);
        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Redibuja los marcadores cuando cambian los resultados filtrados.
  useEffect(() => {
    const w = window as any;
    const L = w.L;
    if (status !== "ready" || !L || !mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();
    const pts: [number, number][] = [];
    located.forEach((p) => {
      const [lat, lng] = GEO[p.location];
      pts.push([lat, lng]);
      const marker = L.circleMarker([lat, lng], {
        radius: 9,
        color: "#fff",
        weight: 2,
        fillColor: statusColor(p.status),
        fillOpacity: 1,
      });
      const name =
        p.name ?? p.animalType.charAt(0).toUpperCase() + p.animalType.slice(1);
      marker.bindPopup(
        `<div class="map-pop">
           <strong>${name}</strong>
           <span class="map-pop-status">${p.status}</span>
           <span class="map-pop-loc">📍 ${p.location}</span>
           <a href="/mascotas-perdidas/${p.id}">Ver más →</a>
         </div>`,
      );
      layerRef.current.addLayer(marker);
    });
    if (pts.length > 0) {
      mapRef.current.fitBounds(pts, { padding: [40, 40], maxZoom: 14 });
    }
  }, [located, status]);

  return (
    <div className="pets-map-wrap">
      <div ref={containerRef} className="pets-map" aria-label="Mapa de mascotas">
        {status === "loading" && <CatLoader label="CARGANDO" variant="page" />}
      </div>
      {status === "error" && (
        <p className="pets-map-msg">
          No se pudo cargar el mapa. Probá la vista de grilla.
        </p>
      )}
      <div className="pets-map-legend">
        <span><i style={{ background: "#e53935" }} /> Perdido</span>
        <span><i style={{ background: "#1ba07a" }} /> Encontrado</span>
        <span><i style={{ background: "#f5a623" }} /> En tránsito</span>
        <span><i style={{ background: "#6c5ce7" }} /> En adopción</span>
        {unlocated > 0 && (
          <span className="pets-map-legend-note">
            {unlocated} sin ubicación en el mapa
          </span>
        )}
      </div>
    </div>
  );
}
