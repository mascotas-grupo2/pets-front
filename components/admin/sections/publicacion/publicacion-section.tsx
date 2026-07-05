"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { getAdminPet } from "@/services/mascotas.pets";
import type { AdminPetSummary } from "@/types/pet";
import { usePublicaciones } from "../hook/usePublicaciones";
import { PublicacionStats } from "./PublicacionStats";
import { PublicacionFilters } from "./PublicacionFilters";
import { PublicacionTable } from "./PublicacionTable";
import { PublicacionDrawer } from "./publicacion-drawer";

export function PublicacionSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openEditing, setOpenEditing] = useState(false);
  // Pet traído por id cuando viene de una notificación y no está en la página.
  const [fetchedPet, setFetchedPet] = useState<AdminPetSummary | null>(null);

  // Abrir el drawer directo desde una notificación: /admin/publicacion?pet=<id>
  useEffect(() => {
    const petParam = searchParams.get("pet");
    if (petParam) {
      setOpenEditing(false);
      setSelectedId(petParam);
    }
  }, [searchParams]);

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
    setFetchedPet(null);
    // Limpiar el ?pet de la URL para que un refresh no reabra el drawer.
    if (searchParams.get("pet")) router.replace("/admin/publicacion");
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
    handleApproveClaim,
    handleRenew,
    handleSave,
    reload,
  } = usePublicaciones();

  // El pet seleccionado se busca primero en la lista ya cargada.
  const inList = useMemo(
    () => visible.find((p) => p.id === selectedId) ?? null,
    [visible, selectedId],
  );

  // Si vino de una notificación y no está en la página actual, lo traemos por id.
  useEffect(() => {
    if (!selectedId || inList) {
      setFetchedPet(null);
      return;
    }
    let alive = true;
    getAdminPet(selectedId).then((res) => {
      if (alive && res.ok && res.data) setFetchedPet(res.data);
    });
    return () => {
      alive = false;
    };
  }, [selectedId, inList]);

  const selected =
    inList ?? (fetchedPet?.id === selectedId ? fetchedPet : null);

  const drawerActions = {
    handleApprove,
    handleReject,
    handleFinalize,
    handleDelete,
    handleConfirmReturn,
    handleApproveClaim,
    handleRenew,
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
