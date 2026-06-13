"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSolicitudes } from "../hook/useSolicitudes";
import { SolicitudesStats } from "./SolicitudesStats";
import { SolicitudesFilters } from "./SolicitudesFilters";
import { SolicitudesTable } from "./SolicitudesTable";
import { SolicitudDetail } from "./drawer/detail-solicitud";
import { ConfirmDialog } from "../../ui/confirm-dialog";

export function SolicitudesSection() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requestId = searchParams.get("requestId")?.trim();

  const {
    items,
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
    handleDelete,
    handleUpdateStatus,
  } = useSolicitudes();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pendingDelete = useMemo(
    () => visible.find((s) => s.id === pendingDeleteId) ?? null,
    [visible, pendingDeleteId],
  );

  const matchedSolicitud = useMemo(() => {
    if (!requestId) return null;
    return items.find((item) => item.id === requestId) ?? null;
  }, [items, requestId]);

  const detailSolicitud = useMemo(() => {
    if (!requestId) return null;
    return matchedSolicitud;
  }, [requestId, matchedSolicitud]);

  // Nota: Hemos eliminado el useEffect que llamaba a getAdoptionById aquí
  // porque SolicitudDetail ya gestiona su propia carga de datos.
  // Esto evita la doble petición al abrir el drawer.

  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("requestId");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
  };

  function irAMensajes(userId: string) {
    // Cierra el drawer y redirige a Mensajes abriendo la conversación con el
    // solicitante (la sección la abre/crea a partir del ?user=).
    closeDrawer();
    router.push(`/admin/mensajes?user=${userId}`);
  }

  return (
    <div className="pub">
      <SolicitudesStats counts={counts} loading={loading} estado={estado} onToggle={toggleEstado} />
      <SolicitudesFilters query={query} onQuery={setQuery} estado={estado} onEstado={setEstado} />
      <SolicitudesTable
        data={visible}
        loading={loading}
        sort={sort}
        onSort={setSort}
        onDelete={setPendingDeleteId}
        page={page}
        totalPages={totalPages}
        total={total}
        desde={desde}
        hasta={hasta}
        onPage={setPage}
      />
     {detailSolicitud ? (
  <SolicitudDetail
    solicitud={detailSolicitud}
    onClose={closeDrawer}
    onIrAMensajes={irAMensajes}
    onUpdateStatus={handleUpdateStatus}
  />
) : null}
      {requestId && !detailSolicitud ? (
        <div className="vdrawer-overlay" role="presentation">
          <aside className="vdrawer">
            <div className="vdrawer-head">
              <h2>Cargando solicitud...</h2>
            </div>
            <div className="vdrawer-body">Cargando información de la solicitud.</div>
          </aside>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Eliminar solicitud"
        message={`¿Eliminar la solicitud${
          pendingDelete?.userName ? ` de ${pendingDelete.userName}` : ""
        }? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        danger
        busy={deleting}
        onConfirm={async () => {
          if (!pendingDeleteId) return;
          setDeleting(true);
          await handleDelete(pendingDeleteId);
          setDeleting(false);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
