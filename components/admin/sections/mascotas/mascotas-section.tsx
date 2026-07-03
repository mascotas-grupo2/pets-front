"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useMascotas } from "../hook/useMascotas";
import { MascotasStats } from "./MascotasStats";
import { MascotasFilters } from "./MascotasFilters";
import { MascotasTable } from "./MascotasTable";
import type { AdminPetSummary } from "@/types/pet";
import { MascotaDrawer } from "./mascota-drawer";
import { ConfirmDialog } from "../../ui/confirm-dialog";

export function MascotasSection() {
  const [selected, setSelected] = useState<AdminPetSummary | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminPetSummary | null>(null);
  const [busy, setBusy] = useState(false);

  function openDetalle(pet: AdminPetSummary) {
    setEditOpen(false);
    setSelected(pet);
  }
  function openEdicion(pet: AdminPetSummary) {
    setEditOpen(true);
    setSelected(pet);
  }
  function cerrarDrawer() {
    setSelected(null);
    setEditOpen(false);
  }

  const {
    visible, loading,
    counts,
    query, setQuery,
    filtro, setFiltro,
    especie, setEspecie,
    sort, setSort,
    page, setPage, totalPages, total, desde, hasta,
    handleDelete, reload,
  } = useMascotas();

  return (
    <div className="pub mascotas">
      <div className="pub-toolbar">
        <Link href="/mascotas-perdidas/reportar" className="btn btn-outline btn-sm">
          <Plus size={16} aria-hidden /> Nueva mascota
        </Link>
      </div>

      <MascotasStats
        counts={counts}
        filtro={filtro}
        onFiltro={setFiltro}
        loading={loading}
      />

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
        onSort={setSort}
        onView={openDetalle}
        onEdit={openEdicion}
        onDelete={setPendingDelete}
        page={page}
        totalPages={totalPages}
        total={total}
        desde={desde}
        hasta={hasta}
        onPage={setPage}
      />

      {selected && (
        <MascotaDrawer
          key={selected.id}
          pet={selected}
          onClose={cerrarDrawer}
          onChanged={reload}
          initialEditing={editOpen}
        />
      )}

      <ConfirmDialog
        open={pendingDelete != null}
        title="Eliminar mascota"
        message={`¿Eliminar "${
          pendingDelete?.name ?? "sin nombre"
        }"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        danger
        busy={busy}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setBusy(true);
          await handleDelete(pendingDelete);
          setBusy(false);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
