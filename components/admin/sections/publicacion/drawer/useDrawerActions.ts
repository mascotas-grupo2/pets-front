"use client";

import { useState } from "react";
import type { AdminPetSummary, Pet } from "@/types/pet";

type Actions = {
  handleApprove: (id: string) => Promise<boolean>;
  handleReject: (id: string, reason?: string) => Promise<boolean>;
  handleFinalize: (id: string) => Promise<boolean>;
  handleDelete: (id: string, reason?: string) => Promise<boolean>;
  handleConfirmReturn: (id: string, returnedTo: string) => Promise<boolean>;
  handleSave: (id: string, patch: Partial<Pet>) => Promise<boolean>;
};

/**
 * Encapsula el estado de carga y los handlers del drawer.
 * Recibe las funciones del hook principal para no duplicar lógica de fetch.
 */
export function useDrawerActions(pet: AdminPetSummary, actions: Actions, onClose: () => void) {
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<boolean>, closeOnSuccess = true): Promise<boolean> {
    setBusy(true);
    try {
      const ok = await fn();
      if (ok && closeOnSuccess) onClose();
      return ok;
    } finally {
      setBusy(false);
    }
  }

  function approve() {
    return run(() => actions.handleApprove(pet.id));
  }

  function reject(reason: string) {
    return run(() => actions.handleReject(pet.id, reason));
  }

  function finalize() {
    return run(() => actions.handleFinalize(pet.id));
  }

  function remove(reason: string) {
    return run(() => actions.handleDelete(pet.id, reason));
  }

  function confirmReturn(returnedTo: string) {
    return run(() => actions.handleConfirmReturn(pet.id, returnedTo));
  }

  function save(patch: Partial<Pet>) {
    // No cierra el drawer al guardar, solo actualiza
    return run(() => actions.handleSave(pet.id, patch), false);
  }

  return { busy, approve, reject, finalize, remove, confirmReturn, save };
}
