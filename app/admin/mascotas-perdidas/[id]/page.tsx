"use client";

import { AdminPetForm } from "@/components/admin/admin-pet-form";
import { AdminPetNotes } from "@/components/admin/admin-pet-notes";
import { useAdminGuard } from "@/components/admin/use-admin-guard";
import handleToast from "@/components/utils/toast";
import {
  createPetNote,
  getIdPets,
  listPetNotes,
  updatePet,
} from "@/services/mascotas.pets";
import { Pet, PetNote, PetNoteKind } from "@/types/pet";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPetEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const { blocked } = useAdminGuard();

  const [pet, setPet] = useState<Pet | null>(null);
  const [notes, setNotes] = useState<PetNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getIdPets(id), listPetNotes(id)])
      .then(([petRes, notesRes]) => {
        if (petRes?.ok && petRes.data) setPet(petRes.data);
        if (notesRes?.ok && notesRes.data) setNotes(notesRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (patch: Partial<Pet>) => {
    if (!pet) return;
    setSaving(true);
    const res = await updatePet(pet.id, patch);
    setSaving(false);
    if (res.ok && res.data) {
      setPet(res.data);
      handleToast("success", "Mascota actualizada correctamente.");
    } else {
      handleToast("error", "No se pudo guardar. Revisá los datos.");
    }
  };

  const handleAddNote = async (
    text: string,
    kind: PetNoteKind,
  ): Promise<boolean> => {
    if (!pet) return false;
    setSavingNote(true);
    const res = await createPetNote(pet.id, text, kind);
    setSavingNote(false);
    if (res.ok && res.data) {
      setNotes((prev) => [res.data as PetNote, ...prev]);
      handleToast("success", "Nota agregada.");
      return true;
    }
    handleToast("error", "No se pudo agregar la nota.");
    return false;
  };

  if (blocked) return null;

  if (loading) {
    return (
      <main>
        <div
          className="container"
          style={{ padding: "4rem 0", textAlign: "center" }}
        >
          <p>Cargando…</p>
        </div>
      </main>
    );
  }

  if (!pet) {
    return (
      <main>
        <div
          className="container"
          style={{ padding: "4rem 0", textAlign: "center" }}
        >
          <h1>Mascota no encontrada</h1>
          <Link
            href="/admin/mascotas-perdidas"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Volver al panel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container" style={{ padding: "2rem 0" }}>
        <nav className="pet-breadcrumb" aria-label="Breadcrumb">
          <Link href="/admin/mascotas-perdidas">Panel de admin</Link>
          <span className="pet-breadcrumb-sep" aria-hidden>
            &gt;
          </span>
          <span>{pet.name ?? pet.animalType}</span>
        </nav>

        <header className="admin-edit-header">
          <div className="admin-edit-avatar">
            {pet.photos && pet.photos.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pet.photos[0]} alt={pet.name ?? ""} />
            ) : (
              <span aria-hidden>🐾</span>
            )}
          </div>
          <div>
            <h1>{pet.name ?? "(Sin nombre)"}</h1>
            <p className="admin-edit-meta">
              <span style={{ textTransform: "capitalize" }}>
                {pet.animalType}
              </span>{" "}
              · ID {pet.id.slice(0, 8).toUpperCase()} · Reportado{" "}
              {new Date(pet.createdAt).toLocaleDateString("es-AR")}
            </p>
          </div>
          <Link
            href={`/mascotas-perdidas/${pet.id}`}
            className="btn btn-outline btn-sm"
            target="_blank"
          >
            Ver publicación pública
          </Link>
        </header>

        <div className="admin-edit-grid">
          <AdminPetForm pet={pet} saving={saving} onSubmit={handleSave} />
          <aside className="admin-edit-side">
            <AdminPetNotes
              notes={notes}
              saving={savingNote}
              onAdd={handleAddNote}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
