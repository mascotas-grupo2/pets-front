"use client";

import { useMemo } from "react";
import { usePublicaciones } from "../hook/usePublicaciones";
import { useSolicitudes } from "../hook/useSolicitudes";
import { useMascotas } from "../hook/useMascotas";
import { useSeguimientos } from "../hook/useSeguimientos";
import type { AdminPetSummary } from "@/types/pet";

type Opts = { pageSize?: number };

export function useDashboardPreviews({ pageSize = 5 }: Opts = {}) {
  const { visible: pubsVisible, loading: pubsLoading, total: pubsTotal } = usePublicaciones();
  const { visible: solicitudesVisible, loading: solicitudesLoading } = useSolicitudes();
  const { visible: mascotasVisible, loading: mascotasLoading } = useMascotas();
  const { visible: seguimientosVisible, loading: seguimientosLoading } = useSeguimientos();

  const publicaciones = useMemo(() => pubsVisible.slice(0, pageSize), [pubsVisible, pageSize]);
  const solicitudes = useMemo(() => solicitudesVisible.slice(0, pageSize), [solicitudesVisible, pageSize]);
  const mascotas = useMemo<AdminPetSummary[]>(() => mascotasVisible.slice(0, pageSize), [mascotasVisible, pageSize]);
  const seguimientos = useMemo(() => seguimientosVisible.slice(0, pageSize), [seguimientosVisible, pageSize]);

  const loading = pubsLoading || solicitudesLoading || mascotasLoading || seguimientosLoading;

  return {
    publicaciones,
    publicacionesCount: pubsTotal,
    solicitudes,
    mascotas,
    seguimientos,
    loading,
    pubsLoading,
    solicitudesLoading,
    mascotasLoading,
    seguimientosLoading,
  };
}
