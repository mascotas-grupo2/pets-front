"use client";

import { Eye, Pencil } from "lucide-react";
import { DataTable, type Column, type SortOrder } from "../../ui/data-table";
import { TablePagination } from "../../ui/table-pagination";
import { ActionButton } from "../../ui/button";
import { EstadoPill } from "../../lib/pet-status";
import { PetThumb } from "../../ui/pet-thumb";
import type { AdminPetSummary } from "@/types/pet";
import type { SortKey } from "../hook/usePublicaciones";

type Props = {
  data: AdminPetSummary[];
  loading: boolean;
  sort: SortOrder<SortKey>[];
  onSort: (next: SortOrder<SortKey>[]) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  // paginación
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  onPage: (n: number) => void;
};

export function PublicacionTable({
  data,
  loading,
  sort,
  onSort,
  onView,
  onEdit,
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
      label: "Publicación",
      sortable: true,
      render: (pet) => (
        <div className="dash-user">
          <PetThumb pet={pet} />
          <span className="dash-user-text">
            <span className="dash-user-name">{pet.name ?? "Sin nombre"}</span>
            <span className="dash-user-email">{pet.location}</span>
          </span>
        </div>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      sortable: true,
      render: (pet) => (
        <div
          style={{
            fontSize: "0.85rem",
            padding: "0.2rem 0.4rem",
            display: "inline-block",
            backgroundColor: "#e8d5f7",
            borderRadius: "1rem",
            fontWeight: "500",
            color: "#6d28d9",
          }}
        >
          {pet.statusLabel ?? pet.status ?? "—"}
        </div>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (pet) => <EstadoPill status={pet.reportStatus} />,
    },
    {
      key: "fecha",
      label: "Fecha",
      sortable: true,
      tdClassName: "dash-muted",
      render: (pet) => pet.date,
    },
    {
      key: "vistas",
      label: "Vistas",
      sortable: true,
      tdClassName: "dash-muted",
      render: () => "—",
    },
    {
      key: "actions",
      ariaLabel: "Acciones",
      tdClassName: "dash-cell-action",
      render: (pet) => (
        <div className="dash-row-actions">
          <ActionButton
            icon={Eye}
            onClick={() => onView(pet.id)}
            ariaLabel="Ver publicación"
            title="Ver"
          />
          <ActionButton
            icon={Pencil}
            onClick={() => onEdit(pet.id)}
            ariaLabel="Editar publicación"
            title="Editar"
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
        rowKey={(pet) => pet.id}
        loading={loading}
        loadingLabel="Cargando publicaciones…"
        empty="No hay publicaciones para mostrar."
        sort={sort as SortOrder<string>[]}
        onSort={(next) => onSort(next as SortOrder<SortKey>[])}
        tableClassName="pub-table"
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
