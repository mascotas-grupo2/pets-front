"use client";

import { useEffect, useState } from "react";

/** 30 segmentos que forman el gatito animado (la animación es 100% CSS). */
const SEGMENTS = Array.from({ length: 30 });

function Cat() {
  return (
    <div className="cat" aria-hidden>
      {SEGMENTS.map((_, i) => (
        <div key={i} className="cat__segment" />
      ))}
    </div>
  );
}

type CatLoaderProps = {
  /** Texto bajo/sobre el gato. Por defecto "CARGANDO". */
  label?: string;
  /** Tamaño: inline (chico), page (mediano, con padding). */
  variant?: "inline" | "page";
  /** Texto en blanco (para fondos de color). */
  onPrimary?: boolean;
  className?: string;
};

/** Loader reutilizable del gatito. Reemplaza spinners/skeletons en la app. */
export function CatLoader({
  label = "CARGANDO",
  variant = "page",
  onPrimary = false,
  className,
}: CatLoaderProps) {
  return (
    <div
      className={`cat-loader cat-loader--${variant}${
        onPrimary ? " cat-loader--onprimary" : ""
      }${className ? ` ${className}` : ""}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Cat />
      {label && <p className="cat-loading-text">{label}</p>}
    </div>
  );
}

/**
 * Preloader de pantalla completa que aparece apenas se entra al sitio (una vez
 * por sesión, como firulapp). Se desvanece al montar / cuando la página cargó.
 */
export function AppPreloader() {
  const [hidden, setHidden] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Mostrar solo una vez por sesión para no molestar en cada navegación.
    if (sessionStorage.getItem("preloaderSeen")) {
      setDone(true);
      return;
    }
    sessionStorage.setItem("preloaderSeen", "1");
    const fade = setTimeout(() => setHidden(true), 1400);
    const remove = setTimeout(() => setDone(true), 1950);
    return () => {
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, []);

  if (done) return null;

  return (
    <div
      className={`cat-screen${hidden ? " cat-screen--hidden" : ""}`}
      role="status"
      aria-label="Cargando Huellitas Unidas"
    >
      <div className="cat-loader cat-loader--onprimary" style={{ fontSize: 14 }}>
        <Cat />
        <p className="cat-loading-text">CARGANDO</p>
      </div>
    </div>
  );
}
