"use client";

import { useEffect, useRef } from "react";

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

type LatLng = { lat: number; lng: number };

/**
 * Mini-mapa para marcar el punto exacto de un avistamiento. Un click deja
 * (o mueve) el marcador y reporta las coordenadas al padre.
 */
export function SightingMapPicker({
  center,
  value,
  onChange,
}: {
  center: [number, number];
  value: LatLng | null;
  onChange: (v: LatLng) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  // Guardamos el callback en un ref para que el handler de click (registrado
  // una sola vez) siempre llame a la última versión.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;

    const placeMarker = (L: any, map: any, lat: number, lng: number) => {
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      else markerRef.current = L.marker([lat, lng]).addTo(map);
    };

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const map = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView(value ? [value.lat, value.lng] : center, value ? 16 : 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);
        if (value) placeMarker(L, map, value.lat, value.lng);
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          placeMarker(L, map, lat, lng);
          onChangeRef.current({ lat, lng });
        });
        mapRef.current = map;
        // El contenedor recién se pinta dentro del modal: recalcular tamaño.
        setTimeout(() => map.invalidateSize(), 60);
      })
      .catch(() => {
        /* si el CDN falla, el usuario igual puede describir el lugar en texto */
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="sight-map"
      aria-label="Mapa para marcar el lugar del avistamiento"
    />
  );
}
