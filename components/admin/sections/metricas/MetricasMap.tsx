"use client";

import React from "react";
import { PetsMap } from "@/components/pets-map";
import type { Pet } from "@/types/pet";

type RefugioLite = {
  id: number;
  name: string;
  latitud?: number | null;
  longitud?: number | null;
};

export type MetricasMapProps = {
  pets: Pet[];
  refugios: RefugioLite[];
};

export default function MetricasMap({ pets, refugios }: MetricasMapProps) {
  return (
    <div className="metricas-map-card">
      <div className="metricas-map-header">
        <h3 className="metricas-map-title">Mapa de ubicaciones</h3>
        <span className="metricas-map-subtitle">
          {pets.length} mascota{pets.length === 1 ? "" : "s"} en el mapa
        </span>
      </div>
      <div className="metricas-map-body">
        {/* Mismo componente que el mapa público de reportes: mascotas perdidas
            como pines sueltos y las del refugio agrupadas en su sede. */}
        <PetsMap pets={pets} refugios={refugios} />
      </div>
    </div>
  );
}
