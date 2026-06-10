"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useMascotas } from "../hook/useMascotas";
import { MascotasTabs } from "./MascotasTabs";
import { MascotasFilters } from "./MascotasFilters";
import { MascotasTable } from "./MascotasTable";
import type { AdminPetSummary } from "@/types/pet";
import { MascotaDrawer } from "./mascota-drawer";

export function MascotasSection() {
  const [selected, setSelected] = useState<AdminPetSummary | null>(null);

  const {
    visible, loading,
    counts,
    query, setQuery,
    filtro, setFiltro,
    especie, setEspecie,
    sort, toggleSort,
    page, setPage, totalPages, total, desde, hasta,
    handleDelete,
  } = useMascotas();

  return (
    <div className="pub mascotas">
      <div className="pub-toolbar">
        <Link href="/mascotas-perdidas/reportar" className="btn btn-outline btn-sm">
          <Plus size={16} aria-hidden /> Nueva mascota
        </Link>
      </div>

      <MascotasTabs counts={counts} filtro={filtro} onFiltro={setFiltro} />

      <MascotasFilters
        query={query}
        onQuery={setQuery}
        especie={especie}
        onEspecie={setEspecie}
      />

      <MascotasTable
        data={visible}
        loading={loading}
        sort={sort}
        onSort={toggleSort}
        onView={setSelected}
        onDelete={handleDelete}
        page={page}
        totalPages={totalPages}
        total={total}
        desde={desde}
        hasta={hasta}
        onPage={setPage}
      />

      {selected && (
        <MascotaDrawer
          pet={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
