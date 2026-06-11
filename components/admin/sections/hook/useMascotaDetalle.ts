"use client";

import { useEffect, useState } from "react";
import { listPetNotes } from "@/services/mascotas.pets";
import { getFollowups, type FollowupItem } from "@/services/followups";
import { getAdminAdoptions } from "@/services/adoptions";
import type { PetNote } from "@/types/pet";

type Compat = { promedio: number | null; solicitudes: number };

export function useMascotaDetalle(petId: string) {
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState<PetNote[]>([]);
  const [proximo, setProximo] = useState<FollowupItem | null>(null);
  const [compat, setCompat] = useState<Compat>({
    promedio: null,
    solicitudes: 0,
  });

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    Promise.all([
      listPetNotes(petId),
      getFollowups({ petId, pageSize: 50 }),
      getAdminAdoptions({ petId, pageSize: 50 }),
    ]).then(([notesRes, fuRes, adRes]) => {
      if (cancel) return;

      if (notesRes.ok && notesRes.data) setNotas(notesRes.data);

      // Próximo seguimiento: el siguiente turno a futuro; si no hay, el más reciente.
      if (fuRes.ok && fuRes.data) {
        const now = Date.now();
        const ordenados = fuRes.data.items
          .filter((f) => f.petId === petId)
          .sort(
            (a, b) =>
              new Date(a.appointmentAt).getTime() -
              new Date(b.appointmentAt).getTime(),
          );
        const futuro = ordenados.find(
          (f) => new Date(f.appointmentAt).getTime() >= now,
        );
        setProximo(futuro ?? ordenados[ordenados.length - 1] ?? null);
      }

      // Compatibilidad promedio de las solicitudes de esta mascota.
      if (adRes.ok && adRes.data) {
        const items = adRes.data.items.filter((a) => a.petId === petId);
        const scores = items
          .map((a) => a.compatibilityScore)
          .filter((s): s is number => typeof s === "number");
        const promedio = scores.length
          ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length)
          : null;
        setCompat({ promedio, solicitudes: items.length });
      }

      setLoading(false);
    });
    return () => {
      cancel = true;
    };
  }, [petId]);

  return { loading, notas, proximo, compat };
}
