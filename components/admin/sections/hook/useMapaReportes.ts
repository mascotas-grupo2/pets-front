"use client";

import { useCallback, useEffect, useState } from "react";
import { getMapaReportes } from "@/services/metrics";
import type { AnimalType, Pet, PetStatus } from "@/types/pet";

const ANIMAL_TYPES: AnimalType[] = ["perro", "gato", "otro"];

/**
 * Carga las ubicaciones del mapa (endpoint scopeado al refugio + reportes
 * públicos) y las normaliza a objetos `Pet`, para poder reutilizar el mismo
 * componente de mapa (`PetsMap`) que se usa en los reportes públicos.
 */
export function useMapaReportes(params?: { estado?: string; especie?: string }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const estado = params?.estado;
  const especie = params?.especie;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMapaReportes({ estado, especie });
    const list = res.ok && res.data ? res.data.data : [];
    setPets(
      list.map(
        (u) =>
          ({
            id: u.id,
            name: u.nombre ?? null,
            animalType: (ANIMAL_TYPES.includes(u.especie as AnimalType)
              ? u.especie
              : "otro") as AnimalType,
            status: u.estado as PetStatus,
            photos: u.photos ?? (u.foto ? [u.foto] : []),
            latitud: u.lat,
            longitud: u.lng,
            refugioId: u.refugioId ?? null,
            location: u.nombre ?? "",
          }) as unknown as Pet,
      ),
    );
    setLoading(false);
  }, [estado, especie]);

  useEffect(() => {
    void load();
  }, [load]);

  return { pets, loading, reload: load };
}
