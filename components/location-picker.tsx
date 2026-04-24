"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const LocationMap = dynamic(() => import("./location-map"), { ssr: false });

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };

type Props = {
  value: string;
  onChange: (address: string) => void;
};

export function LocationPicker({ value, onChange }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const ignoreNextSearch = useRef(false);

  useEffect(() => {
    if (value !== query) setQuery(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (ignoreNextSearch.current) {
      ignoreNextSearch.current = false;
      return;
    }
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=0&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": "es" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as NominatimResult[];
        setSuggestions(data);
      } catch {
        /* ignore */
      }
    }, 500);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  function pickSuggestion(r: NominatimResult) {
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    setCoords({ lat, lng });
    ignoreNextSearch.current = true;
    setQuery(r.display_name);
    onChange(r.display_name);
    setOpen(false);
    setSuggestions([]);
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "es" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) {
        ignoreNextSearch.current = true;
        setQuery(data.display_name);
        onChange(data.display_name);
      }
    } catch {
      /* ignore */
    }
  }

  function handleMapPick(lat: number, lng: number) {
    setCoords({ lat, lng });
    reverseGeocode(lat, lng);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        handleMapPick(pos.coords.latitude, pos.coords.longitude);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="location-picker">
      <div className="location-fields">
        <div className="location-field location-search">
          <span>Buscar dirección *</span>
          <input
            className="input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Calle y número, barrio, ciudad…"
            autoComplete="off"
          />
          {open && suggestions.length > 0 && (
            <ul className="location-suggestions" role="listbox">
              {suggestions.map((s) => (
                <li key={s.place_id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickSuggestion(s);
                    }}
                  >
                    {s.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <small className="location-hint">
            Escribí una dirección y elegí una sugerencia, o marcá el punto
            exacto en el mapa.
          </small>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm location-use-mine"
          disabled={locating}
          onClick={handleUseMyLocation}
        >
          📍 {locating ? "Obteniendo…" : "Usar mi ubicación actual"}
        </button>

        {coords && (
          <div className="location-coords">
            Pin: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </div>
        )}
      </div>

      <div className="location-map-col">
        <div className="location-map">
          <LocationMap
            lat={coords?.lat ?? null}
            lng={coords?.lng ?? null}
            defaultCenter={DEFAULT_CENTER}
            onPick={handleMapPick}
          />
        </div>
        <small className="location-hint">
          Mapa de OpenStreetMap — gratis, sin API key.
        </small>
      </div>
    </div>
  );
}
