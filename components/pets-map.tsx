"use client";

import { Pet } from "@/types/pet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import { CatLoader } from "@/components/cat-loader";
import { LocateFixed } from "lucide-react";
import DOMPurify from "dompurify";

type RefugioLite = {
  id: number;
  name: string;
  latitud?: number | null;
  longitud?: number | null;
};

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

/** ¿Es una mascota gestionada por un refugio (no un reporte suelto)? */
function isManaged(pet: Pet): boolean {
  return (pet.refugioId ?? null) != null;
}

/** Imagen por defecto según tipo (mismos assets que las tarjetas). */
function placeholderFor(animalType: Pet["animalType"]): string {
  return animalType === "gato" ? "/images/pet-cat.jpg" : "/images/pet-dog.jpg";
}

/** Primera foto de la mascota (o placeholder), validando el esquema de URL. */
function petPhoto(pet: Pet): string {
  const raw =
    Array.isArray(pet.photos) && pet.photos.length > 0 ? pet.photos[0] : "";
  return /^(https?:\/\/|\/)/.test(raw) ? raw : placeholderFor(pet.animalType);
}

/** Emoji del marcador según el tipo de animal. */
function petEmoji(animalType: Pet["animalType"]): string {
  if (animalType === "gato") return "🐱";
  if (animalType === "perro") return "🐶";
  return "";
}

/** Nombre a mostrar (o el tipo capitalizado si no tiene). */
function petDisplayName(pet: Pet): string {
  return (
    pet.name ??
    pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1)
  );
}

/** Tipo capitalizado ("Perro" / "Gato" / "Otro"). */
function typeLabelOf(pet: Pet): string {
  return pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1);
}

/**
 * Ubica una card superpuesta cerca de un punto del mapa, clampada para que
 * siempre quede dentro del área visible (se voltea debajo si no entra arriba).
 */
function placeCard(
  px: number,
  py: number,
  cardW: number,
  cardH: number,
  mapW: number,
  mapH: number,
): { left: number; top: number } {
  let left = px - cardW / 2;
  let top = py - cardH - 18; // por defecto, encima del marcador
  if (top < 6) top = py + 20; // sin espacio arriba → debajo del marcador
  left = Math.max(6, Math.min(left, mapW - cardW - 6));
  top = Math.max(6, Math.min(top, mapH - cardH - 6));
  return { left, top };
}

type HoverCard =
  | { kind: "pet"; pet: Pet; left: number; top: number }
  | { kind: "refugio"; name: string; count: number; left: number; top: number };


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
    const existing =
      document.querySelector<HTMLScriptElement>(`script[data-leaflet]`);
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

export function PetsMap({
  pets,
  refugios = [],
}: {
  pets: Pet[];
  refugios?: RefugioLite[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const resizeObsRef = useRef<ResizeObserver | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "locating" | "error">(
    "idle",
  );

  // Card de preview al pasar el mouse (posicionada y clampada dentro del mapa).
  const [hover, setHover] = useState<HoverCard | null>(null);

  // Refugios con coordenadas conocidas → posición de su marcador.
  const refugioById = useMemo(() => {
    const m = new Map<number, { name: string; pos: [number, number] }>();
    for (const r of refugios) {
      if (typeof r.latitud === "number" && typeof r.longitud === "number") {
        m.set(r.id, { name: r.name, pos: [r.latitud, r.longitud] });
      }
    }
    return m;
  }, [refugios]);

  // Mascotas perdidas (reportes sueltos) con posición conocida.
  const loosePets = useMemo(
    () =>
      pets
        .filter((p) => !isManaged(p))
        .map((p) => ({ pet: p, pos: petLatLng(p) }))
        .filter(
          (x): x is { pet: Pet; pos: [number, number] } => x.pos !== null,
        ),
    [pets],
  );

  // Mascotas de refugio agrupadas por sede (solo refugios con coordenadas).
  const refugioGroups = useMemo(() => {
    const groups = new Map<
      number,
      { name: string; pos: [number, number]; pets: Pet[] }
    >();
    for (const p of pets) {
      const rid = p.refugioId ?? null;
      if (rid == null) continue;
      const r = refugioById.get(rid);
      if (!r) continue; // refugio sin coords → cuenta como "sin ubicación"
      let g = groups.get(rid);
      if (!g) {
        g = { name: r.name, pos: r.pos, pets: [] };
        groups.set(rid, g);
      }
      g.pets.push(p);
    }
    return [...groups.entries()].map(([id, g]) => ({ refugioId: id, ...g }));
  }, [pets, refugioById]);

  // Puntos que se dibujan (perdidas sueltas + marcadores de refugio). Formato
  // unificado para bounds y "más cercana". El filtrado por tipo de reporte ya
  // lo hace la página (Todos / Perdidos / En adopción) antes de pasar `pets`.
  type DrawItem =
    | { kind: "pet"; pet: Pet; pos: [number, number] }
    | {
        kind: "refugio";
        refugioId: number;
        name: string;
        pos: [number, number];
        pets: Pet[];
      };
  const drawItems = useMemo<DrawItem[]>(() => {
    const items: DrawItem[] = [];
    for (const { pet, pos } of loosePets)
      items.push({ kind: "pet", pet, pos });
    for (const g of refugioGroups) items.push({ kind: "refugio", ...g });
    return items;
  }, [loosePets, refugioGroups]);

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
        // Leaflet calcula el tamaño al inicializar. Cuando el mapa vive dentro
        // de un panel (ej. Métricas, abajo de una página larga) puede montarse
        // antes de tener su tamaño final y los tiles quedan en gris. Forzamos un
        // recálculo al inicio y ante cualquier cambio de tamaño del contenedor.
        setTimeout(() => map.invalidateSize(), 0);
        if (typeof ResizeObserver !== "undefined" && containerRef.current) {
          const ro = new ResizeObserver(() => map.invalidateSize());
          ro.observe(containerRef.current);
          resizeObsRef.current = ro;
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
      if (resizeObsRef.current) {
        resizeObsRef.current.disconnect();
        resizeObsRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Redibuja marcadores cuando cambian los resultados o la ubicación del usuario.
  useEffect(() => {
    const L = (window as any).L;
    if (status !== "ready" || !L || !mapRef.current || !layerRef.current)
      return;
    // Asegura el tamaño correcto antes de encuadrar (evita tiles en gris / mal
    // fitBounds cuando el contenedor cambió de tamaño desde el init).
    mapRef.current.invalidateSize();
    layerRef.current.clearLayers();
    setHover(null);
    const bounds: [number, number][] = [];

    // Distancia desde "Vos" (turf, haversine) si tenemos ubicación.
    const distKm = userLoc
      ? (pos: [number, number]) =>
          distance(point([userLoc[1], userLoc[0]]), point([pos[1], pos[0]]), {
            units: "kilometers",
          })
      : null;

    const clean = (value: unknown) =>
      DOMPurify.sanitize(String(value ?? ""), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    // Sanitiza el HTML del popup/tooltip permitiendo solo lo que usamos (incluye
    // <img>, con lo que DOMPurify neutraliza src maliciosos como javascript:).
    const safeHtml = (raw: string) =>
      DOMPurify.sanitize(raw, {
        ALLOWED_TAGS: ["div", "span", "strong", "a", "img", "br"],
        ALLOWED_ATTR: ["class", "href", "src", "alt", "target", "rel"],
      });
    const distHtml = (pos: [number, number]) =>
      distKm
        ? `<span class="map-pop-dist">📏 a ${clean(fmtDist(distKm(pos)))} de vos</span>`
        : "";

    for (const item of drawItems) {
      bounds.push(item.pos);

      if (item.kind === "pet") {
        const { pet, pos } = item;
        const emoji = petEmoji(pet.animalType);
        // Carita del animal (perro/gato) o un punto para "otro".
        const icon = emoji
          ? L.divIcon({
              className: "map-pet-icon",
              html: `<span class="map-pet-badge">${emoji}</span>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })
          : L.divIcon({
              className: "map-pet-icon",
              html: `<span class="map-pet-dot"></span>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
        const marker = L.marker(pos, { icon });
        const href = `/mascotas-perdidas/${encodeURIComponent(pet.id)}`;
        // Preview clampada al área del mapa (no se recorta contra el borde).
        marker.on("mouseover", () => {
          const map = mapRef.current;
          const el = containerRef.current;
          if (!map || !el) return;
          const p = map.latLngToContainerPoint(pos);
          const { left, top } = placeCard(
            p.x,
            p.y,
            190,
            195,
            el.clientWidth,
            el.clientHeight,
          );
          setHover({ kind: "pet", pet, left, top });
        });
        marker.on("mouseout", () => setHover(null));
        // Click en la mascota: abre su reporte en una pestaña nueva.
        marker.on("click", () => {
          setHover(null);
          window.open(href, "_blank", "noopener,noreferrer");
        });
        layerRef.current.addLayer(marker);
      } else {
        // Marcador especial del refugio: agrupa todas sus mascotas en la sede.
        const { name, pos, pets: groupPets } = item;
        const icon = L.divIcon({
          className: "map-refugio-icon",
          html: `<span class="map-refugio-badge">🏠<span class="map-refugio-count">${groupPets.length}</span></span>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const shown = groupPets.slice(0, 6);
        const listHtml = shown
          .map(
            (p) =>
              `<a class="map-pop-listitem" href="/mascotas-perdidas/${encodeURIComponent(p.id)}" target="_blank" rel="noopener noreferrer"><img class="map-pop-listimg" src="${petPhoto(p)}" alt="" />${clean(petDisplayName(p))}</a>`,
          )
          .join("");
        const moreHtml =
          groupPets.length > shown.length
            ? `<span class="map-pop-more">y ${groupPets.length - shown.length} más…</span>`
            : "";
        const marker = L.marker(pos, { icon });
        // Preview clampada; el detalle (lista) se abre en el popup al clickear.
        marker.on("mouseover", () => {
          const map = mapRef.current;
          const el = containerRef.current;
          if (!map || !el) return;
          const p = map.latLngToContainerPoint(pos);
          const { left, top } = placeCard(
            p.x,
            p.y,
            210,
            96,
            el.clientWidth,
            el.clientHeight,
          );
          setHover({ kind: "refugio", name, count: groupPets.length, left, top });
        });
        marker.on("mouseout", () => setHover(null));
        marker.on("click", () => setHover(null));
        marker.bindPopup(
          safeHtml(
            `<div class="map-pop">
               <strong>🏠 ${clean(name)}</strong>
               <span class="map-pop-status">${groupPets.length} en adopción</span>
               ${distHtml(pos)}
               <div class="map-pop-list">${listHtml}${moreHtml}</div>
             </div>`,
          ),
        );
        layerRef.current.addLayer(marker);
      }
    }

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
  }, [drawItems, status, userLoc]);

  // Punto más cercano (para el resumen): perdida suelta o refugio.
  const nearest = useMemo(() => {
    if (!userLoc || drawItems.length === 0) return null;
    let best: { label: string; km: number } | null = null;
    for (const item of drawItems) {
      const km = distance(
        point([userLoc[1], userLoc[0]]),
        point([item.pos[1], item.pos[0]]),
        { units: "kilometers" },
      );
      const label =
        item.kind === "pet"
          ? (item.pet.name ?? item.pet.animalType)
          : item.name;
      if (!best || km < best.km) best = { label, km };
    }
    return best;
  }, [userLoc, drawItems]);

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
            La más cercana: <strong>{nearest.label}</strong> a{" "}
            {fmtDist(nearest.km)}.
          </span>
        )}
      </div>

      <div className="pets-map-viewport">
        <div
          ref={containerRef}
          className="pets-map"
          aria-label="Mapa de mascotas"
        >
          {status === "loading" && (
            <CatLoader label="CARGANDO" variant="page" />
          )}
        </div>
        {hover && (
          <div
            className="map-hovercard"
            style={{ left: hover.left, top: hover.top }}
          >
            {hover.kind === "pet" ? (
              <div className="map-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="map-preview-img"
                  src={petPhoto(hover.pet)}
                  alt=""
                />
                <div className="map-preview-body">
                  <span className="map-preview-name">
                    {petDisplayName(hover.pet)}
                  </span>
                  <span className="map-preview-meta">
                    {typeLabelOf(hover.pet)} · Perdida
                  </span>
                  <span className="map-preview-cta">
                    Click para ver el reporte →
                  </span>
                </div>
              </div>
            ) : (
              <div className="map-preview map-preview--refugio">
                <span className="map-preview-name">🏠 {hover.name}</span>
                <span className="map-preview-meta">
                  {hover.count} en adopción
                </span>
                <span className="map-preview-cta">
                  Click para ver las mascotas →
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {status === "error" && (
        <p className="pets-map-msg">
          No se pudo cargar el mapa. Probá la vista de grilla.
        </p>
      )}
    </div>
  );
}
