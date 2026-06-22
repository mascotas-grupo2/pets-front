"use client";

import { useCallback, useEffect, useState } from "react";
import { getMapaReportes } from "@/services/metrics";
import type { UbicacionMapa, CategoriaMapa } from "../metricas/metricas.data";

/** Deriva la categoría del pin (color) a partir del estado real de la mascota. */
function categoria(estado?: string): CategoriaMapa {
  const e = (estado || "").toLowerCase();
  if (e.includes("perdid")) return "perdida";
  if (e.includes("adop")) return "adopcion"; // en adopción / adoptado
  if (e.includes("tránsito") || e.includes("transito")) return "transito";
  if (e.includes("encontr") || e.includes("refugio") || e.includes("médic") || e.includes("medic"))
    return "refugio";
  return "otros";
}

/**
 * Carga el mapa de ubicaciones desde su endpoint dedicado (separado de las
 * métricas), normalizando cada punto a UbicacionMapa para el componente.
 */
export function useMapaReportes(params?: { estado?: string; especie?: string }) {
  const [ubicaciones, setUbicaciones] = useState<UbicacionMapa[]>([]);
  const [loading, setLoading] = useState(true);

  const estado = params?.estado;
  const especie = params?.especie;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMapaReportes({ estado, especie });
    const list = res.ok && res.data ? res.data.data : [];
    setUbicaciones(
      list.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        lat: u.lat,
        lng: u.lng,
        tipo: categoria(u.estado),
        estado: u.estado,
        especie: u.especie,
      })),
    );
    setLoading(false);
  }, [estado, especie]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ubicaciones, loading, reload: load };
}
