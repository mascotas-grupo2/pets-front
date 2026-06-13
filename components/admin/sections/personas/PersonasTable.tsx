"use client";

import { ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { DataTable, type Column, type SortOrder } from "../../ui/data-table";
import { TablePagination } from "../../ui/table-pagination";
import { Pill } from "../../ui/pill";
import type { Tone } from "../../ui/types";
import type { AdminUser } from "@/services/user.admin";
import { categoriaUsuario, TipoFiltro } from "../hook/usePersonas";

const TIPO_META: Record<Exclude<TipoFiltro, "todos">, { label: string; tone: Tone }> = {
  admin: { label: "Admin", tone: "violet" },
  adoptante: { label: "Adoptante", tone: "green" },
  comun: { label: "Usuario común", tone: "gray" },
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

function fecha(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-AR");
}

type Props = {
  data: AdminUser[];
  loading: boolean;
  sort: SortOrder<string>[];
  onSort: (next: SortOrder<string>[]) => void;
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  onPage: (n: number) => void;
  onPromote: (u: AdminUser) => void;
  onDemote: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
};

export function PersonasTable({ data, loading, sort, onSort, page, totalPages, total, desde, hasta, onPage, onPromote, onDemote, onDelete }: Props) {
  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "Nombre",
      sortable: true,
      render: (u) => (
        <div className="dash-user">
          {u.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="persona-avatar" src={u.photo} alt="" />
          ) : (
            <span className="dash-avatar" aria-hidden>{initials(u.name)}</span>
          )}
          <span className="dash-user-name">{u.name}</span>
        </div>
      ),
    },
    { key: "email", label: "Email", sortable: true, tdClassName: "dash-muted", render: (u) => u.email },
    {
      key: "tipo",
      label: "Tipo",
      sortable: true,
      render: (u) => {
        const meta = TIPO_META[categoriaUsuario(u) as Exclude<TipoFiltro, "todos">];
        return <Pill tone={meta.tone}>{meta.label}</Pill>;
      },
    },
    { key: "actividad", label: "Última actividad", sortable: true, tdClassName: "dash-muted", render: (u) => fecha(u.createdAt) },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      tdClassName: "dash-cell-action",
      render: (u) => {
        const esAdmin = categoriaUsuario(u) === "admin";
        return (
          <div className="dash-row-actions">
            {esAdmin ? (
              <button
                type="button"
                aria-label="Quitar administrador"
                title="Quitar administrador"
                onClick={() => onDemote(u)}
              >
                <ShieldOff size={15} />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Hacer administrador"
                title="Hacer administrador"
                onClick={() => onPromote(u)}
              >
                <ShieldCheck size={15} />
              </button>
            )}
            <button
              type="button"
              aria-label="Eliminar usuario"
              title="Eliminar usuario"
              onClick={() => onDelete(u)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        rowKey={(u) => u.id}
        loading={loading}
        loadingLabel="Cargando personas…"
        empty="No hay personas para mostrar."
        sort={sort}
        onSort={onSort}
        wrapClassName="pub-table-wrap"
      />
      {!loading && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          desde={desde}
          hasta={hasta}
          onPage={onPage}
        />
      )}
    </>
  );
}
