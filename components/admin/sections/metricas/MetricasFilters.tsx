"use client";

import React from "react";
export type MetricasFilter = "7d" | "30d" | "90d" | "1y";

export type MetricasFiltersProps = {
  activeFilter: MetricasFilter;
  onFilterChange: (filter: MetricasFilter) => void;
  filters?: { key: MetricasFilter; label: string }[];
};

const DEFAULT_FILTERS: { key: MetricasFilter; label: string }[] = [
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "90d", label: "90 días" },
  { key: "1y", label: "1 año" },
];

export function MetricasFilters({ activeFilter, onFilterChange, filters }: MetricasFiltersProps) {
  const filtersToShow = filters ?? DEFAULT_FILTERS;
  return (
    <div className="metricas-filters" role="group" aria-label="Filtros rápidos de métricas">
      {filtersToShow.map((f) => (
        <button
          key={f.key}
          type="button"
          className={`metricas-filter-btn ${activeFilter === f.key ? "metricas-filter-btn--active" : ""}`}
          onClick={() => onFilterChange(f.key)}
          aria-pressed={activeFilter === f.key}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
