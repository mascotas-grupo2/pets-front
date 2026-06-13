import React, { useEffect, useState } from "react";
import { PetCard } from "../pet-card";
import { AnimalType, Pet, PetStatus } from "@/types/pet";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { deletePet, resolvePet } from "@/services/mascotas.pets";
import handleToast from "@/components/utils/toast";

interface MyReportsViewProps {
  pets: Pet[];
  /** Se llama tras eliminar para que la cuenta recargue los datos. */
  onChange?: () => void;
}

export default function MyReportsView({ pets, onChange }: MyReportsViewProps) {
  const [statusFilter, setStatusFilter] = useState<PetStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AnimalType | "all">("all");
  const [list, setList] = useState<Pet[]>(pets);
  const [toDelete, setToDelete] = useState<Pet | null>(null);
  const [toResolve, setToResolve] = useState<Pet | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setList(pets);
  }, [pets]);

  async function onConfirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    const res = await deletePet(String(toDelete.id));
    setBusy(false);
    if (res.ok) {
      handleToast("success", "Publicación eliminada.");
      setList((prev) => prev.filter((p) => p.id !== toDelete.id));
      setToDelete(null);
      onChange?.();
    } else {
      handleToast("error", res.error ?? "No se pudo eliminar la publicación.");
    }
  }

  async function onConfirmResolve() {
    if (!toResolve) return;
    setBusy(true);
    const res = await resolvePet(String(toResolve.id));
    setBusy(false);
    if (res.ok) {
      handleToast("success", "¡Genial! Marcamos la publicación como resuelta.");
      setToResolve(null);
      onChange?.();
    } else {
      handleToast("error", res.error ?? "No se pudo cerrar la publicación.");
    }
  }

  const filteredPets = list.filter((p) => {
    const statusMatch = statusFilter === "all" || p.status === statusFilter;
    const typeMatch = typeFilter === "all" || p.animalType === typeFilter;
    return statusMatch && typeMatch;
  });

  return (
    <div className="my-reports-section">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          marginBottom: "2rem",
        }}
      >
        <div
          className="section-title"
          style={{ textAlign: "left", marginBottom: "2rem" }}
        >
          <h2>Mis Reportes</h2>
          <p style={{ marginLeft: "0" }}>
            Gestioná y filtrá tus publicaciones activas.
          </p>
        </div>

        <div
          className="filters-bar"
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div className="field" style={{ marginBottom: 0, minWidth: "180px" }}>
            <label>Estado</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as PetStatus | "all")
              }
            >
              <option value="all">Todos los estados</option>
              <option value="perdido">Perdidos</option>
              <option value="en adopción">En adopción</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: "180px" }}>
            <label>Tipo de animal</label>
            <select
              className="input"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as AnimalType | "all")
              }
            >
              <option value="all">Todos los tipos</option>
              <option value="perro">Perros</option>
              <option value="gato">Gatos</option>
              <option value="otro">Otros</option>
            </select>
          </div>
        </div>
      </div>

      {filteredPets.length === 0 ? (
        <p
          className="empty-state"
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "var(--gray-50)",
            borderRadius: "8px",
          }}
        >
          No se encontraron reportes con los filtros seleccionados.
        </p>
      ) : (
        <ul className="pet-grid">
          {filteredPets.map((p) => (
            <PetCard
              key={p.id}
              pet={p}
              showReportStatus
              manageable
              onDelete={(pet) => setToDelete(pet)}
              onResolve={(pet) => setToResolve(pet)}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete != null}
        title="Eliminar publicación"
        message={`¿Seguro que querés eliminar ${
          toDelete?.name ?? "esta publicación"
        }? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="No"
        danger
        busy={busy}
        onConfirm={onConfirmDelete}
        onCancel={() => setToDelete(null)}
      />

      <ConfirmDialog
        open={toResolve != null}
        title="Marcar como aparecida"
        message={`¿${
          toResolve?.name ?? "Tu mascota"
        } apareció? Vamos a cerrar la publicación (deja de mostrarse en el listado).`}
        confirmLabel="Sí, apareció"
        cancelLabel="No"
        busy={busy}
        onConfirm={onConfirmResolve}
        onCancel={() => setToResolve(null)}
      />
    </div>
  );
}
