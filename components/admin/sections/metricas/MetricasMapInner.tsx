"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { UbicacionMapa } from "./metricas.data";

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816];

const ICONS = {
  adopcion: L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="38"><path fill="#22c55e" stroke="#166534" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`,
    className: "leaflet-metricas-pin",
    iconSize: [28, 38],
    iconAnchor: [14, 38],
  }),
  perdida: L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="38"><path fill="#ef4444" stroke="#991b1b" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`,
    className: "leaflet-metricas-pin",
    iconSize: [28, 38],
    iconAnchor: [14, 38],
  }),
  refugio: L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="38"><path fill="#3b82f6" stroke="#1e3a5f" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`,
    className: "leaflet-metricas-pin",
    iconSize: [28, 38],
    iconAnchor: [14, 38],
  }),
};

const LABELS: Record<string, string> = {
  adopcion: "En adopción",
  perdida: "Perdida",
  refugio: "Refugio",
};

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
        <Marker
          key={u.id}
          position={[u.lat, u.lng]}
          icon={ICONS[u.tipo]}
        >
          <Popup>
            <strong>{u.nombre}</strong>
            <br />
            <span style={{ fontSize: "12px", color: "#666" }}>{LABELS[u.tipo] ?? u.tipo}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
