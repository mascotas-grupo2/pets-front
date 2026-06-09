"use client";

import { useEffect, useState } from "react";
import { getAdoptionDetail } from "../../../../services/adoptions.services";
import { toast } from "sonner";

export function useSolicitudDetail(id: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAdoptionDetail(id);
      if (!res || !res.ok || !res.data) {
        toast.error("Error al cargar la solicitud");
      } else {
        setData(res.data);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  return { data, loading };
}
