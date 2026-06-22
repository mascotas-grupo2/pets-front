"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { UbicacionMapa, CategoriaMapa } from "./metricas.data";

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816];

// Colores por categoría, alineados con el mapa de mascotas-perdidas.
const COLORS: Record<CategoriaMapa, { fill: string; stroke: string }> = {
  perdida: { fill: "#ef4444", stroke: "#991b1b" },
  adopcion: { fill: "#22c55e", stroke: "#166534" },
  refugio: { fill: "#3b82f6", stroke: "#1e3a5f" },
  transito: { fill: "#f59e0b", stroke: "#92400e" },
  otros: { fill: "#6b7280", stroke: "#374151" },
};

const LABELS: Record<CategoriaMapa, string> = {
  perdida: "Perdida",
  adopcion: "En adopción",
  refugio: "En refugio",
  transito: "En tránsito",
  otros: "Otros",
};

function pin(cat: CategoriaMapa) {
  const { fill, stroke } = COLORS[cat];
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="38"><path fill="${fill}" stroke="${stroke}" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`,
    className: "leaflet-metricas-pin",
    iconSize: [28, 38],
    iconAnchor: [14, 38],
  });
}

const ICONS: Record<CategoriaMapa, L.DivIcon> = {
  perdida: pin("perdida"),
  adopcion: pin("adopcion"),
  refugio: pin("refugio"),
  transito: pin("transito"),
  otros: pin("otros"),
};

const cap = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

export default function MetricasMapInner({ ubicaciones }: { ubicaciones: UbicacionMapa[] }) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={12}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {ubicaciones.map((u) => (
        <Marker key={u.id} position={[u.lat, u.lng]} icon={ICONS[u.tipo] ?? ICONS.otros}>
          <Popup>
            <strong>{u.nombre}</strong>
            <br />
            <span style={{ fontSize: "12px", color: "#666" }}>
              {cap(u.estado) || LABELS[u.tipo] || u.tipo}
              {u.especie ? ` · ${cap(u.especie)}` : ""}
            </span>
            <br />
            <a
              href={`/mascotas-perdidas/${encodeURIComponent(u.id)}`}
              style={{ fontSize: "12px" }}
            >
              Ver publicación →
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
