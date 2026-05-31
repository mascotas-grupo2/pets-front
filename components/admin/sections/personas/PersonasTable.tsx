"use client";

import { Eye, Pencil, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "../../ui/data-table";
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
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  onPage: (n: number) => void;
};

export function PersonasTable({ data, loading, page, totalPages, total, desde, hasta, onPage }: Props) {
  function placeholder() { toast.info("Próximamente."); }

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "Nombre",
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
    { key: "email", label: "Email", tdClassName: "dash-muted", render: (u) => u.email },
    {
      key: "tipo",
      label: "Tipo",
      render: (u) => {
        const meta = TIPO_META[categoriaUsuario(u) as Exclude<TipoFiltro, "todos">];
        return <Pill tone={meta.tone}>{meta.label}</Pill>;
      },
    },
    { key: "actividad", label: "Última actividad", tdClassName: "dash-muted", render: (u) => fecha(u.createdAt) },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      tdClassName: "dash-cell-action",
      render: () => (
        <div className="dash-row-actions">
          <button type="button" aria-label="Ver" title="Ver" onClick={placeholder}>
            <Eye size={15} />
          </button>
          <button type="button" aria-label="Editar" title="Editar" onClick={placeholder}>
            <Pencil size={15} />
          </button>
          <button type="button" aria-label="Más" title="Más" onClick={placeholder}>
            <MoreVertical size={15} />
          </button>
        </div>
      ),
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
