"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, MoreVertical, Trash2 } from "lucide-react";
import { DataTable, type Column } from "../../ui/data-table";
import { TablePagination } from "../../ui/table-pagination";
import { ActionButton } from "../../ui/button";
import { MascotaEstadoPill } from "../../lib/pet-status";
import { formatEdad } from "../../lib/pet-format";
import { PetThumb } from "../../ui/pet-thumb";
import type { AdminPetSummary } from "@/types/pet";
import type { TableSort } from "../../ui/data-table";

type Props = {
  data: AdminPetSummary[];
  loading: boolean;
  sort: TableSort | null;
  onSort: (key: string) => void;
  onView: (pet: AdminPetSummary) => void;
  onDelete: (pet: AdminPetSummary) => Promise<boolean>;
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  onPage: (n: number) => void;
};

/** Menú contextual por fila. Se cierra al hacer click afuera. */
function RowMenu({
  pet,
  onView,
  onDelete,
}: {
  pet: AdminPetSummary;
  onView: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  async function handleDelete() {
    setOpen(false);
    setBusy(true);
    await onDelete();
    setBusy(false);
  }

  return (
    <span className="pub-menu-wrap" ref={ref}>
      <button
        type="button"
        className="pub-menu-trigger"
        aria-label="Más acciones"
        title="Más acciones"
        disabled={busy}
        onClick={() => setOpen((s) => !s)}
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="pub-menu">
          <button type="button" className="pub-menu-item" onClick={() => { setOpen(false); onView(); }}>
            <Eye size={15} /> Ver detalle
          </button>
          <Link
            href={`/admin/mascotas/${pet.id}`}
            className="pub-menu-item"
            onClick={() => setOpen(false)}
          >
            <Eye size={15} /> Ver perfil completo
          </Link>
          <button type="button" className="pub-menu-item danger" onClick={handleDelete}>
            <Trash2 size={15} /> Eliminar
          </button>
        </div>
      )}
    </span>
  );
}

export function MascotasTable({
  data,
  loading,
  sort,
  onSort,
  onView,
  onDelete,
  page,
  totalPages,
  total,
  desde,
  hasta,
  onPage,
}: Props) {
  const columns: Column<AdminPetSummary>[] = [
    {
      key: "name",
      label: "Nombre",
      sortable: true,
      render: (p) => (
        <div className="dash-user">
          <PetThumb pet={p} />
          <span className="dash-user-name">{p.name ?? "Sin nombre"}</span>
        </div>
      ),
    },
    {
      key: "especie",
      label: "Especie",
      render: (p) => p.animalTypeLabel ?? p.animalType ?? "—",
    },
    {
      key: "raza",
      label: "Raza",
      render: (p) => p.breed ?? "—",
    },
    {
      key: "edad",
      label: "Edad",
      render: (p) => formatEdad(p.ageMonths),
    },
    {
      key: "estado",
      label: "Estado",
      render: (p) => <MascotaEstadoPill status={p.status} label={p.statusLabel} />,
    },
    {
      key: "ingreso",
      label: "Ingreso",
      tdClassName: "dash-muted",
      render: (p) => p.date,
    },
    {
      key: "actions",
      ariaLabel: "Acciones",
      align: "right",
      tdClassName: "dash-cell-action",
      render: (p) => (
        <div className="dash-row-actions pub-actions">
          <ActionButton
            icon={Eye}
            onClick={() => onView(p)}
            ariaLabel="Ver preview"
            title="Ver preview"
          />
          <RowMenu
            pet={p}
            onView={() => onView(p)}
            onDelete={() => onDelete(p)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        rowKey={(p) => p.id}
        loading={loading}
        loadingLabel="Cargando mascotas…"
        empty="No hay mascotas para mostrar."
        sort={sort}
        onSort={onSort}
        wrapClassName="pub-table-wrap"
      />
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        desde={desde}
        hasta={hasta}
        onPage={onPage}
      />
    </>
  );
}
