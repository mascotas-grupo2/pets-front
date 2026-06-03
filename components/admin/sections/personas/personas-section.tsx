"use client";

import { usePersonas } from "../hook/usePersonas";
import { PersonasStats } from "./PersonasStats";
import { PersonasFilters } from "./PersonasFilters";
import { PersonasTable } from "./PersonasTable";

/** Gestión de usuarios y adoptantes: conteos, búsqueda/filtros y tabla. */
export function PersonasSection() {
  const {
    visible,
    loading,
    counts,
    query,
    setQuery,
    tipo,
    setTipo,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handlePromote,
    handleDemote,
  } = usePersonas();

  return (
    <div className="pub mascotas personas">
      <PersonasStats counts={counts} loading={loading} />

      <PersonasFilters
        query={query}
        onQuery={setQuery}
        tipo={tipo}
        onTipo={setTipo}
      />

      <PersonasTable
        data={visible}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        desde={desde}
        hasta={hasta}
        onPage={setPage}
        onPromote={handlePromote}
        onDemote={handleDemote}
      />
    </div>
  );
}
