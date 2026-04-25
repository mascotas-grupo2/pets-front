"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const RED_PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="32" height="42">
  <path fill="#e53935" stroke="#8a0e0e" stroke-width="1.2"
        d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z"/>
  <circle cx="12" cy="12" r="4.5" fill="#fff"/>
</svg>
`;

const redPin = L.divIcon({
  html: RED_PIN_SVG,
  className: "leaflet-red-pin",
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

// Fix for default marker icons not being found in Next.js environments.
// This prevents Leaflet from trying to load missing images for the default marker.
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: null,
    iconUrl: null,
    shadowUrl: null,
  });
}

type Props = {
  lat: number | null;
  lng: number | null;
  defaultCenter: { lat: number; lng: number };
  onPick: (lat: number, lng: number) => void;
};

export default function LocationMap({
  lat,
  lng,
  defaultCenter,
  onPick,
}: Props) {
  const center: [number, number] =
    lat != null && lng != null
      ? [lat, lng]
      : [defaultCenter.lat, defaultCenter.lng];

  return (
    <MapContainer
      center={center}
      zoom={lat != null ? 15 : 12}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <ClickHandler onPick={onPick} />
      <Recenter lat={lat} lng={lng} />
      {lat != null && lng != null && (
        <Marker
          position={[lat, lng]}
          icon={redPin}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng();
              onPick(p.lat, p.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat == null || lng == null) return;
    map.setView([lat, lng], Math.max(map.getZoom(), 15));
  }, [lat, lng, map]);
  return null;
}
