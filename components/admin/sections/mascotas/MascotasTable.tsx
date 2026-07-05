"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Eye, MoreVertical, Trash2, Pencil } from "lucide-react";
import { DataTable, type Column } from "../../ui/data-table";
import { TablePagination } from "../../ui/table-pagination";
import { ActionButton } from "../../ui/button";
import { MascotaEstadoPill } from "../../lib/pet-status";
import { formatEdad } from "../../lib/pet-format";
import { PetThumb } from "../../ui/pet-thumb";
import type { AdminPetSummary } from "@/types/pet";
import type { SortOrder } from "../../ui/data-table";

type Props = {
  data: AdminPetSummary[];
  loading: boolean;
  sort: SortOrder<string>[];
  onSort: (next: SortOrder<string>[]) => void;
  onView: (pet: AdminPetSummary) => void;
  onEdit: (pet: AdminPetSummary) => void;
  onDelete: (pet: AdminPetSummary) => void;
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  onPage: (n: number) => void;
};

/** Estados en los que el refugio gestiona a la mascota: se puede editar su ficha
 * (vacunas, peso, tratamiento…) desde el panel, aunque no sea el publicador. */
const ADMIN_EDITABLE_STATUSES = new Set([
  "en tránsito",
  "en tratamiento médico",
  "en adopción",
  "adoptado",
  "devuelta al dueño",
]);

/** Menú contextual por fila. Se renderiza por portal para que el scroll
 * horizontal de la tabla (responsive) no lo recorte. */
function RowMenu({
  pet,
  onView,
  onEdit,
  onDelete,
}: {
  pet: AdminPetSummary;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
    }
    // Cualquier click cierra (los items corren su onClick antes de propagar).
    document.addEventListener("click", close);
    // Si la página/tabla scrollea o cambia de tamaño, la posición ya no sirve.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggle() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen((s) => !s);
  }

  return (
    <span className="pub-menu-wrap">
      <button
        ref={triggerRef}
        type="button"
        className="pub-menu-trigger"
        aria-label="Más acciones"
        title="Más acciones"
        onClick={toggle}
      >
        <MoreVertical size={15} />
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            className="pub-menu"
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 1000 }}
          >
            <button type="button" className="pub-menu-item" onClick={() => { setOpen(false); onView(); }}>
              <Eye size={15} /> Ver detalle
            </button>
            <Link
              href={`/mascotas-perdidas/${pet.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pub-menu-item"
              onClick={() => setOpen(false)}
            >
              <Eye size={15} /> Ver perfil completo
            </Link>
            {pet.status && ADMIN_EDITABLE_STATUSES.has(pet.status) && (
              <button
                type="button"
                className="pub-menu-item"
                onClick={() => { setOpen(false); onEdit(); }}
              >
                <Pencil size={15} /> Editar datos
              </button>
            )}
            <button type="button" className="pub-menu-item danger" onClick={() => { setOpen(false); onDelete(); }}>
              <Trash2 size={15} /> Eliminar
            </button>
          </div>,
          document.body,
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
  onEdit,
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
            onEdit={() => onEdit(p)}
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
