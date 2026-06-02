"use client";

import { useSolicitudes } from "../hook/useSolicitudes";
import { SolicitudesStats } from "./SolicitudesStats";
import { SolicitudesFilters } from "./SolicitudesFilters";
import { SolicitudesTable } from "./SolicitudesTable";

export function SolicitudesSection() {
  const {
    visible,
    loading,
    counts,
    query,
    setQuery,
    estado,
    setEstado,
    toggleEstado,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handleDelete,
  } = useSolicitudes();

  return (
    <div className="pub">
      <SolicitudesStats counts={counts} loading={loading} estado={estado} onToggle={toggleEstado} />
      <SolicitudesFilters query={query} onQuery={setQuery} estado={estado} onEstado={setEstado} />
      <SolicitudesTable
        data={visible}
        loading={loading}
        sort={sort}
        onSort={toggleSort}
        onDelete={handleDelete}
        page={page}
        totalPages={totalPages}
        total={total}
        desde={desde}
        hasta={hasta}
        onPage={setPage}
      />
    </div>
  );
}
