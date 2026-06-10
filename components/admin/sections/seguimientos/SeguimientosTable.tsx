"use client";

import { Eye, CheckCircle2 } from "lucide-react";
import type { Seguimiento } from "./seguimientos.data";
import { seguimientoEstadoTone } from "./seguimientos.data";
import { ActionButton } from "../../ui/button";
import { DataTable, type Column, type SortOrder } from "../../ui/data-table";
import { Pill } from "../../ui/pill";
import { TablePagination } from "../../ui/table-pagination";
import { PetThumb } from "../../ui/pet-thumb";
import { initials } from "../dashboard/dashboard.data";
import type { SeguimientoSortKey } from "../hook/useSeguimientos";

type Props = {
  data: Seguimiento[];
  loading: boolean;
  sort: SortOrder<SeguimientoSortKey>[];
  onSort: (next: SortOrder<SeguimientoSortKey>[]) => void;
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  onPage: (page: number) => void;
  onView: (s: Seguimiento) => void;
  onToggleEstado: (s: Seguimiento) => void;
};

export function SeguimientosTable({
  data,
  loading,
  sort,
  onSort,
  page,
  totalPages,
  total,
  desde,
  hasta,
  onPage,
  onView,
  onToggleEstado,
}: Props) {
  const columns: Column<Seguimiento>[] = [
    {
      key: "mascota",
      label: "Mascota",
      sortable: true,
      render: (s) => (
        <div className="dash-user">
          <PetThumb pet={{ photo: s.petPhoto }} size={16} />
          <span className="dash-user-name">{s.petName}</span>
        </div>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      sortable: true,
      render: (s) => s.tipo,
    },
    {
      key: "fecha",
      label: "Fecha y hora",
      sortable: true,
      tdClassName: "dash-muted",
      render: (s) => s.fechaLabel,
    },
    {
      // MOCK: "tipo de cita" no existe en el back (valor derivado del id).
      key: "tipoCita",
      label: "Tipo de cita",
      render: (s) => s.tipoCita,
    },
    {
      key: "responsable",
      label: "Responsable",
      sortable: true,
      render: (s) => (
        <div className="dash-user">
          <span className="dash-avatar" aria-hidden>
            {initials(s.responsable)}
          </span>
          <span className="dash-user-name">{s.responsable}</span>
        </div>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (s) => (
        <Pill tone={seguimientoEstadoTone(s.estadoId)}>{s.estado}</Pill>
      ),
    },
    {
      key: "actions",
      ariaLabel: "Acciones",
      tdClassName: "dash-cell-action",
      render: (s) => (
        <div className="dash-row-actions">
          <ActionButton
            icon={Eye}
            onClick={() => onView(s)}
            ariaLabel="Ver seguimiento"
            title="Ver"
          />
          <ActionButton
            icon={CheckCircle2}
            onClick={() => onToggleEstado(s)}
            ariaLabel="Cambiar estado"
            title="Confirmar / marcar pendiente"
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
        rowKey={(s) => s.id}
        loading={loading}
        loadingLabel="Cargando seguimientos…"
        empty="No hay seguimientos para mostrar."
        sort={sort}
        onSort={(next) => onSort(next as SortOrder<SeguimientoSortKey>[])}
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
