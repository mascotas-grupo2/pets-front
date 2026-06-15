"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { usePublicaciones } from "../hook/usePublicaciones";
import { PublicacionStats } from "./PublicacionStats";
import { PublicacionFilters } from "./PublicacionFilters";
import { PublicacionTable } from "./PublicacionTable";
import { PublicacionDrawer } from "./publicacion-drawer";

export function PublicacionSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openEditing, setOpenEditing] = useState(false);

  function handleView(id: string) {
    setOpenEditing(false);
    setSelectedId(id);
  }

  function handleEdit(id: string) {
    setOpenEditing(true);
    setSelectedId(id);
  }

  function handleClose() {
    setSelectedId(null);
    setOpenEditing(false);
  }

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
    setSort,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handleApprove,
    handleReject,
    handleFinalize,
    handleDelete,
    handleConfirmReturn,
    handleSave,
    reload,
  } = usePublicaciones();

  // El pet seleccionado se busca en la lista ya cargada (no hay fetch extra)
  const selected = useMemo(
    () => visible.find((p) => p.id === selectedId) ?? null,
    [visible, selectedId],
  );

  const drawerActions = {
    handleApprove,
    handleReject,
    handleFinalize,
    handleDelete,
    handleConfirmReturn,
    handleSave,
  };

  return (
    <div className="pub">
      <div className="pub-toolbar">
        <Link href="/mascotas-perdidas/reportar" className="btn btn-outline btn-sm">
          <Plus size={16} aria-hidden /> Nueva publicación
        </Link>
      </div>

      <PublicacionStats
        counts={counts}
        loading={loading}
        estado={estado}
        onToggle={toggleEstado}
      />

      <PublicacionFilters
        query={query}
        onQuery={setQuery}
        estado={estado}
        onEstado={setEstado}
      />

      <PublicacionTable
        data={visible}
        loading={loading}
        sort={sort}
        onSort={setSort}
        onView={handleView}
        onEdit={handleEdit}
        page={page}
        totalPages={totalPages}
        total={total}
        desde={desde}
        hasta={hasta}
        onPage={setPage}
      />

      {selected && (
        <PublicacionDrawer
          pet={selected}
          onClose={handleClose}
          actions={drawerActions}
          initialEditing={openEditing}
        />
      )}
    </div>
  );
}
