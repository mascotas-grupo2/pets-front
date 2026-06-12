"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAdoptionEvaluation,
  toggleAdoptionCheck,
  addAdoptionNote,
  type AdoptionEvaluationNote,
} from "@/services/adoptions";

/** Checklist por defecto (orden) hasta que responde el back. */
export const EVAL_ITEMS = [
  "Verificó identidad",
  "Consultó sobre vivienda",
  "Evaluó experiencia previa",
  "Revisó situación familiar",
  "Coordinó visita al hogar",
];

/**
 * Evaluación persistida de una solicitud (checklist + impresiones).
 * Compartida por el tab Evaluación de Mensajes y el de Solicitudes.
 */
export function useEvaluacion(adoptionId: number | null | undefined) {
  const [items, setItems] = useState<string[]>(EVAL_ITEMS);
  const [checked, setChecked] = useState<string[]>([]);
  const [notes, setNotes] = useState<AdoptionEvaluationNote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!adoptionId) {
      setChecked([]);
      setNotes([]);
      return;
    }
    setLoading(true);
    getAdoptionEvaluation(adoptionId).then((res) => {
      if (res.ok && res.data) {
        setItems(res.data.items?.length ? res.data.items : EVAL_ITEMS);
        setChecked(res.data.checked ?? []);
        setNotes(res.data.notes ?? []);
      }
      setLoading(false);
    });
  }, [adoptionId]);

  async function toggle(item: string) {
    if (!adoptionId) return;
    const done = !checked.includes(item);
    // Optimista; el back confirma.
    setChecked((prev) => (done ? [...prev, item] : prev.filter((i) => i !== item)));
    const res = await toggleAdoptionCheck(adoptionId, item, done);
    if (res.ok && res.data) setChecked(res.data.checked);
    else toast.error("No se pudo guardar el checklist.");
  }

  async function addNote(text: string): Promise<boolean> {
    if (!adoptionId || !text.trim()) return false;
    const res = await addAdoptionNote(adoptionId, text.trim());
    if (res.ok && res.data) {
      setNotes((prev) => [res.data!, ...prev]);
      return true;
    }
    toast.error("No se pudo guardar la nota.");
    return false;
  }

  return {
    items,
    checked,
    notes,
    loading,
    toggle,
    addNote,
    disabled: !adoptionId,
  };
}
