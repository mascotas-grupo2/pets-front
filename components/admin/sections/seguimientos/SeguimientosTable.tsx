"use client";

import { Eye, CheckCircle2, CheckSquare, Ban, Trash2 } from "lucide-react";
import type { Seguimiento } from "./seguimientos.data";
import {
  seguimientoEstadoTone,
  FOLLOWUP_STATUS,
  FOLLOWUP_TYPE,
} from "./seguimientos.data";
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
  onConfirm: (s: Seguimiento) => void;
  onComplete: (s: Seguimiento) => void;
  onReject: (s: Seguimiento) => void;
  onDelete: (s: Seguimiento) => void;
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
  onConfirm,
  onComplete,
  onReject,
  onDelete,
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
      key: "responsable",
      label: "Responsable",
      sortable: true,
      render: (s) => (
        <div className="dash-user">
          <span className="dash-avatar" aria-hidden>
            {initials(s.responsable)}
          </span>
          <span className="seg-resp-cell">
            <span className="dash-user-name">{s.responsable}</span>
            {s.adoptante && (
              <span className="seg-resp-adopter">Adoptante: {s.adoptante}</span>
            )}
          </span>
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
          {s.estadoId === FOLLOWUP_STATUS.pendiente && (
            <ActionButton
              icon={CheckCircle2}
              onClick={() => onConfirm(s)}
              ariaLabel="Confirmar seguimiento"
              title="Confirmar"
            />
          )}
          {s.estadoId === FOLLOWUP_STATUS.confirmado && (
            <ActionButton
              icon={CheckSquare}
              onClick={() => onComplete(s)}
              ariaLabel="Completar seguimiento"
              title="Completar"
            />
          )}
          {s.typeId === FOLLOWUP_TYPE.postAdopcion &&
            (s.estadoId === FOLLOWUP_STATUS.pendiente ||
              s.estadoId === FOLLOWUP_STATUS.confirmado) && (
              <ActionButton
                icon={Ban}
                onClick={() => onReject(s)}
                ariaLabel="Rechazar seguimiento"
                title="Rechazar (descarta la adopción y re-publica la mascota)"
              />
            )}
          <ActionButton
            icon={Trash2}
            onClick={() => onDelete(s)}
            ariaLabel="Eliminar seguimiento"
            title="Eliminar"
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
