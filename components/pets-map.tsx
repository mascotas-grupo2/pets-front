"use client";

import { Pet } from "@/types/pet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import { CatLoader } from "@/components/cat-loader";
import { LocateFixed } from "lucide-react";

/**
 * Fallback de coordenadas para ubicaciones conocidas del seed que todavía no
 * tengan lat/lng geocodificada en la base. Las mascotas reales ya traen
 * `latitud`/`longitud` (geocodificadas en el alta), que tienen prioridad.
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

/** Resuelve la posición [lat, lng] de una mascota: coords reales o fallback. */
function petLatLng(pet: Pet): [number, number] | null {
  const lat = (pet as { latitud?: number | null }).latitud;
  const lng = (pet as { longitud?: number | null }).longitud;
  if (typeof lat === "number" && typeof lng === "number") return [lat, lng];
  return GEO[pet.location] ?? null;
}

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

/** "850 m" / "2,4 km" a partir de kilómetros. */
function fmtDist(km: number): string {
  return km < 1
    ? `${Math.round(km * 1000)} m`
    : `${km.toFixed(1).replace(".", ",")} km`;
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
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "locating" | "error">(
    "idle",
  );

  // Mascotas con posición conocida.
  const located = useMemo(
    () =>
      pets
        .map((p) => ({ pet: p, pos: petLatLng(p) }))
        .filter((x): x is { pet: Pet; pos: [number, number] } => x.pos !== null),
    [pets],
  );
  const unlocated = pets.length - located.length;

  // Pedir la ubicación del usuario ("Vos").
  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("error");
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc([pos.coords.latitude, pos.coords.longitude]);
        setGeoState("idle");
      },
      () => setGeoState("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

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

  // Redibuja marcadores cuando cambian los resultados o la ubicación del usuario.
  useEffect(() => {
    const L = (window as any).L;
    if (status !== "ready" || !L || !mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();
    const bounds: [number, number][] = [];

    // Distancia desde "Vos" (turf, haversine) si tenemos ubicación.
    const distKm = userLoc
      ? (pos: [number, number]) =>
          distance(point([userLoc[1], userLoc[0]]), point([pos[1], pos[0]]), {
            units: "kilometers",
          })
      : null;

    located.forEach(({ pet, pos }) => {
      bounds.push(pos);
      const marker = L.circleMarker(pos, {
        radius: 9,
        color: "#fff",
        weight: 2,
        fillColor: statusColor(pet.status),
        fillOpacity: 1,
      });
      const name =
        pet.name ?? pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1);
      const distHtml = distKm
        ? `<span class="map-pop-dist">📏 a ${fmtDist(distKm(pos))} de vos</span>`
        : "";
      marker.bindPopup(
        `<div class="map-pop">
           <strong>${name}</strong>
           <span class="map-pop-status">${pet.status}</span>
           <span class="map-pop-loc">📍 ${pet.location}</span>
           ${distHtml}
           <a href="/mascotas-perdidas/${pet.id}">Ver más →</a>
         </div>`,
      );
      layerRef.current.addLayer(marker);
    });

    // Marcador "Vos".
    if (userLoc) {
      bounds.push(userLoc);
      const youIcon = L.divIcon({
        className: "map-you-icon",
        html: '<span class="map-you-dot"></span><span class="map-you-label">Vos</span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker(userLoc, { icon: youIcon, zIndexOffset: 1000 }).addTo(
        layerRef.current,
      );
    }

    if (bounds.length === 1) {
      mapRef.current.setView(bounds[0], 14);
    } else if (bounds.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [located, status, userLoc]);

  // Mascota más cercana (para el resumen).
  const nearest = useMemo(() => {
    if (!userLoc || located.length === 0) return null;
    let best: { pet: Pet; km: number } | null = null;
    for (const { pet, pos } of located) {
      const km = distance(
        point([userLoc[1], userLoc[0]]),
        point([pos[1], pos[0]]),
        { units: "kilometers" },
      );
      if (!best || km < best.km) best = { pet, km };
    }
    return best;
  }, [userLoc, located]);

  return (
    <div className="pets-map-wrap">
      <div className="pets-map-toolbar">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={locate}
          disabled={geoState === "locating"}
        >
          <LocateFixed size={15} aria-hidden />
          {geoState === "locating" ? "Buscando…" : "Cerca de mí"}
        </button>
        {geoState === "error" && (
          <span className="pets-map-toolbar-msg">
            No pudimos obtener tu ubicación.
          </span>
        )}
        {nearest && (
          <span className="pets-map-toolbar-msg">
            La más cercana:{" "}
            <strong>{nearest.pet.name ?? nearest.pet.animalType}</strong> a{" "}
            {fmtDist(nearest.km)}.
          </span>
        )}
      </div>

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
        <span><i style={{ background: "#1ba07a" }} /> En refugio</span>
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
