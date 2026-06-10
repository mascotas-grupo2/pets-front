"use client";

import { useState } from "react";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { useSeguimientos } from "../hook/useSeguimientos";
import { SeguimientosTable } from "./SeguimientosTable";
import { SeguimientosCalendar } from "./SeguimientosCalendar";
import { SeguimientosFilters } from "./SeguimientosFilters";
import { SeguimientoFormDrawer } from "./SeguimientoFormDrawer";
import { SeguimientoDetailDrawer } from "./SeguimientoDetailDrawer";
import type { Seguimiento, SeguimientoTab } from "./seguimientos.data";

const TABS: { id: SeguimientoTab; label: string }[] = [
  { id: "proximos", label: "Próximos" },
  { id: "todos", label: "Todos" },
  { id: "completados", label: "Completados" },
];

export function SeguimientosSection() {
  const {
    loading,
    tab,
    setTab,
    query,
    setQuery,
    sort,
    setSort,
    filterTipo,
    setFilterTipo,
    filterEstado,
    setFilterEstado,
    petOptions,
    userOptions,
    handleCreate,
    visible,
    total,
    page,
    setPage,
    totalPages,
    desde,
    hasta,
    items,
    now,
    handleToggleEstado,
  } = useSeguimientos();

  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Seguimiento | null>(null);

  return (
    <div className="pub seg">
      <div className="pub-toolbar">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          <Plus size={16} aria-hidden /> Agendar seguimiento
        </button>
      </div>

      <div className="seg-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`seg-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="seg-layout">
        <div className="seg-main">
          <div className="pub-controls">
            <div className="pub-search">
              <Search size={16} aria-hidden />
              <input
                type="search"
                placeholder="Buscar seguimiento..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={16} aria-hidden /> Filtros
            </button>
          </div>

          {showFilters && (
            <SeguimientosFilters
              filterTipo={filterTipo}
              onTipo={setFilterTipo}
              filterEstado={filterEstado}
              onEstado={setFilterEstado}
            />
          )}

          <SeguimientosTable
            data={visible}
            loading={loading}
            sort={sort}
            onSort={setSort}
            page={page}
            totalPages={totalPages}
            total={total}
            desde={desde}
            hasta={hasta}
            onPage={setPage}
            onView={setDetail}
            onToggleEstado={handleToggleEstado}
          />
        </div>

        <SeguimientosCalendar now={now} items={items} />
      </div>

      {showForm && (
        <SeguimientoFormDrawer
          petOptions={petOptions}
          userOptions={userOptions}
          now={now}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}

      {detail && (
        <SeguimientoDetailDrawer seguimiento={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}
