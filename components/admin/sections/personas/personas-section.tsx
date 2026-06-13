"use client";

import { useState } from "react";
import { usePersonas } from "../hook/usePersonas";
import { PersonasStats } from "./PersonasStats";
import { PersonasFilters } from "./PersonasFilters";
import { PersonasTable } from "./PersonasTable";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import type { AdminUser } from "@/services/user.admin";

type PendingAction = {
  type: "promote" | "demote" | "delete";
  user: AdminUser;
};

const ACTION_COPY: Record<
  PendingAction["type"],
  { title: string; message: (name: string) => string; confirmLabel: string; danger: boolean }
> = {
  promote: {
    title: "Promover a administrador",
    message: (n) => `¿Promover a "${n}" como administrador? Va a tener acceso al panel.`,
    confirmLabel: "Sí, promover",
    danger: false,
  },
  demote: {
    title: "Quitar administrador",
    message: (n) => `¿Quitar el rol de administrador a "${n}"?`,
    confirmLabel: "Sí, quitar",
    danger: false,
  },
  delete: {
    title: "Eliminar usuario",
    message: (n) =>
      `¿Eliminar a "${n}"? Se borran sus publicaciones, solicitudes, mensajes y notificaciones. Esta acción no se puede deshacer.`,
    confirmLabel: "Sí, eliminar",
    danger: true,
  },
};

/** Gestión de usuarios y adoptantes: conteos, búsqueda/filtros y tabla. */
export function PersonasSection() {
  const {
    visible,
    loading,
    counts,
    query,
    setQuery,
    tipo,
    setTipo,
    sort,
    setSort,
    page,
    setPage,
    totalPages,
    total,
    desde,
    hasta,
    handlePromote,
    handleDemote,
    handleDelete,
  } = usePersonas();

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);

  async function onConfirm() {
    if (!pending) return;
    setBusy(true);
    const fn =
      pending.type === "promote"
        ? handlePromote
        : pending.type === "demote"
          ? handleDemote
          : handleDelete;
    await fn(pending.user);
    setBusy(false);
    setPending(null);
  }

  const copy = pending ? ACTION_COPY[pending.type] : null;

  return (
    <div className="pub mascotas personas">
      <PersonasStats counts={counts} loading={loading} tipo={tipo} onTipo={setTipo} />

      <PersonasFilters
        query={query}
        onQuery={setQuery}
        tipo={tipo}
        onTipo={setTipo}
      />

      <PersonasTable
        data={visible}
        loading={loading}
        sort={sort}
        onSort={setSort}
        page={page}
        totalPages={totalPages}
        total={total}
        desde={desde}
        hasta={hasta}
        onPage={setPage}
        onPromote={(u) => setPending({ type: "promote", user: u })}
        onDemote={(u) => setPending({ type: "demote", user: u })}
        onDelete={(u) => setPending({ type: "delete", user: u })}
      />

      <ConfirmDialog
        open={pending != null}
        title={copy?.title ?? ""}
        message={copy && pending ? copy.message(pending.user.name) : ""}
        confirmLabel={copy?.confirmLabel ?? "Sí"}
        cancelLabel="Cancelar"
        danger={copy?.danger}
        busy={busy}
        onConfirm={onConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
