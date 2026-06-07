"use client";

import { Eye, Trash2 } from "lucide-react";
import type { SortKey } from "../hook/useSolicitudes";
import type { Solicitud } from "./solicitudes.data";
import { ActionButton } from "../../ui/button";
import { DataTable, type Column, type SortOrder } from "../../ui/data-table";
import { Pill } from "../../ui/pill";
import { TablePagination } from "../../ui/table-pagination";
import { initials, compatTone } from "../dashboard/dashboard.data";
import { PetThumb } from "../../ui/pet-thumb";
import { solicitudEstadoTone } from "../../lib/solicitud-status";

type Props = {
  data: Solicitud[];
  loading: boolean;
  sort: SortOrder<SortKey>[];
  onSort: (next: SortOrder<SortKey>[]) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  onPage: (page: number) => void;
};

export function SolicitudesTable({
  data,
  loading,
  sort,
  onSort,
  onDelete,
  page,
  totalPages,
  total,
  desde,
  hasta,
  onPage,
}: Props) {
  const columns: Column<Solicitud>[] = [
    {
      key: "userName",
      label: "Solicitante",
      sortable: true,
      render: (u) => (
        <div className="dash-user">
          {u.userPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="persona-avatar" src={u.userPhoto} alt="" />
          ) : (
            <span className="dash-avatar" aria-hidden>
              {initials(u.userName)}
            </span>
          )}
          <span className="dash-user-name">{u.userName}</span>
        </div>
      ),
    },
    {
      key: "petName",
      label: "Mascota",
      sortable: true,
      render: (p) => (
        <div className="dash-user">
          <PetThumb pet={{ photo: p.petPhoto }} size={16} />
          <span className="dash-user-name">{p.petName ?? "Sin nombre"}</span>
        </div>
      ),
    },
    {
      key: "compat",
      label: "Compatibilidad",
      render: (s) => (
        <>
          <span className={`dash-compat tone-${compatTone(s.compatPct)}`}>
            {s.compatPct}%
          </span>
          <span className="dash-compat-label">{s.compatLabel}</span>
        </>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (item) => (
        <Pill tone={solicitudEstadoTone(item.estado)}>
          {item.estado.replace(/_/g, " ")}
        </Pill>
      ),
    },
    {
      key: "fecha",
      label: "Fecha",
      sortable: true,
      tdClassName: "dash-muted",
      render: (item) => item.fecha,
    },
    {
      key: "actions",
      ariaLabel: "Acciones",
      tdClassName: "dash-cell-action",
      render: (item) => (
        <div className="dash-row-actions">
          <ActionButton
            icon={Eye}
            href={`/admin/solicitudes?requestId=${item.id}`}
            ariaLabel="Ver solicitud"
            title="Ver"
          />
          <ActionButton
            icon={Trash2}
            onClick={() => onDelete(item.id)}
            ariaLabel="Eliminar solicitud"
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
        rowKey={(item) => item.id}
        loading={loading}
        loadingLabel="Cargando solicitudes…"
        empty="No hay solicitudes para mostrar."
        sort={sort}
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

// tones mapped in ../../lib/solicitud-status.tsx
