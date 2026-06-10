"use client";

import { useEffect, useState } from "react";
import { getAdoptionById } from "@/services/adoptions";
import type { AdoptionDetail } from "@/types/adoption-detail";
import { toast } from "sonner";

export function useSolicitudDetail(id: string) {
  const [data, setData] = useState<AdoptionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const res = await getAdoptionById(id);
      if (cancelled) return;
      if (!res || !res.ok || !res.data) {
        toast.error("Error al cargar la solicitud");
      } else {
        setData(res.data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading };
}
