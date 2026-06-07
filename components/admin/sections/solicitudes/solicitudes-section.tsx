"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSolicitudes } from "../hook/useSolicitudes";
import { SolicitudesStats } from "./SolicitudesStats";
import { SolicitudesFilters } from "./SolicitudesFilters";
import { SolicitudesTable } from "./SolicitudesTable";
import { SolicitudDetail } from "./drawer/detail-solicitud";

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

  function irAMensajes(solicitudId: string) {
  // Cierra el drawer y redirige a mensajes con el hilo abierto
  closeDrawer();
  router.push(`/admin/mensajes?conversacion=${solicitudId}`);
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
        onDelete={handleDelete}
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
    </div>
  );
}
