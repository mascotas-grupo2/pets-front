"use client";

import handleToast from "@/components/utils/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getIdPets, updatePet } from "@/services/mascotas.pets";
import { Pet, PetSex, PetStatus } from "@/types/pet";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS: PetStatus[] = [
  "perdido",
  "encontrado",
  "en tránsito",
  "en tratamiento médico",
  "en adopción",
  "adoptado",
];

const CHECKS: { key: keyof FormState; label: string; icon: string }[] = [
  { key: "hasCollar", label: "Tiene collar", icon: "🦮" },
  { key: "hasTag", label: "Tiene chapita", icon: "🏷️" },
  { key: "microchipped", label: "Tiene microchip", icon: "💾" },
  { key: "vaccinated", label: "Vacunado/a", icon: "💉" },
  { key: "neutered", label: "Castrado/a", icon: "✂️" },
  { key: "friendlyWithKids", label: "Se lleva bien con chicos", icon: "🧒" },
  { key: "trained", label: "Entrenado/a", icon: "🎓" },
];

type FormState = {
  name: string;
  status: PetStatus;
  description: string;
  date: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  sex: PetSex | "";
  breed: string;
  ageMonths: string;
  color: string;
  weightKg: string;
  heightCm: string;
  hasCollar: boolean;
  hasTag: boolean;
  microchipped: boolean;
  vaccinated: boolean;
  neutered: boolean;
  friendlyWithKids: boolean;
  trained: boolean;
};

function petToForm(pet: Pet): FormState {
  return {
    name: pet.name ?? "",
    status: pet.status,
    description: pet.description ?? "",
    date: pet.date ?? "",
    location: pet.location ?? "",
    contactPhone: pet.contactPhone ?? "",
    contactEmail: pet.contactEmail ?? "",
    sex: pet.sex ?? "",
    breed: pet.breed ?? "",
    ageMonths: pet.ageMonths != null ? String(pet.ageMonths) : "",
    color: pet.color ?? "",
    weightKg: pet.weightKg != null ? String(pet.weightKg) : "",
    heightCm: pet.heightCm != null ? String(pet.heightCm) : "",
    hasCollar: !!pet.hasCollar,
    hasTag: !!pet.hasTag,
    microchipped: !!pet.microchipped,
    vaccinated: !!pet.vaccinated,
    neutered: !!pet.neutered,
    friendlyWithKids: !!pet.friendlyWithKids,
    trained: !!pet.trained,
  };
}

export default function EditPetPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const [pet, setPet] = useState<Pet | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    getIdPets(id)
      .then((res) => {
        if (ignore) return;
        if (res && res.ok && res.data) {
          setPet(res.data);
          setForm(petToForm(res.data));
        }
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [id]);

  const isOwner = useMemo(
    () => !!user.isLoggedIn && user.id != null && pet?.userId === user.id,
    [user.isLoggedIn, user.id, pet?.userId],
  );

  // El que no es dueño no edita: lo devolvemos al detalle.
  useEffect(() => {
    if (!loading && pet && !isOwner) {
      router.replace(`/mascotas-perdidas/${id}`);
    }
  }, [loading, pet, isOwner, id, router]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const required: [keyof FormState, string][] = [
      ["description", "la descripción"],
      ["date", "la fecha"],
      ["location", "la ubicación"],
      ["contactPhone", "el teléfono de contacto"],
      ["contactEmail", "el email de contacto"],
    ];
    for (const [key, label] of required) {
      if (!String(form[key]).trim()) {
        handleToast("error", `Completá ${label}.`);
        return;
      }
    }

    const patch: Partial<Pet> = {
      status: form.status,
      description: form.description.trim(),
      date: form.date.trim(),
      location: form.location.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      hasCollar: form.hasCollar,
      hasTag: form.hasTag,
      microchipped: form.microchipped,
      vaccinated: form.vaccinated,
      neutered: form.neutered,
      friendlyWithKids: form.friendlyWithKids,
      trained: form.trained,
    };
    if (form.name.trim()) patch.name = form.name.trim();
    if (form.sex) patch.sex = form.sex;
    if (form.breed.trim()) patch.breed = form.breed.trim();
    if (form.color.trim()) patch.color = form.color.trim();
    if (form.ageMonths !== "") patch.ageMonths = Number(form.ageMonths);
    if (form.weightKg !== "") patch.weightKg = Number(form.weightKg);
    if (form.heightCm !== "") patch.heightCm = Number(form.heightCm);

    setSaving(true);
    const res = await updatePet(id, patch);
    setSaving(false);

    if (res.ok && res.data) {
      dispatch({ type: "pets/pet", payload: res.data });
      handleToast("success", "Publicación actualizada.");
      router.push(`/mascotas-perdidas/${id}`);
    } else {
      handleToast("error", "No se pudo guardar. Intentá de nuevo.");
    }
  }

  if (loading) {
    return (
      <main>
        <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  if (!pet || !form || !isOwner) {
    return (
      <main>
        <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
          <p>Redirigiendo...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container" style={{ padding: "2rem 0", maxWidth: 760 }}>
        <nav className="pet-breadcrumb" aria-label="Breadcrumb">
          <Link href="/mascotas-perdidas">Mascotas perdidas</Link>
          <span className="pet-breadcrumb-sep" aria-hidden>&gt;</span>
          <Link href={`/mascotas-perdidas/${id}`}>{pet.name ?? "Detalle"}</Link>
          <span className="pet-breadcrumb-sep" aria-hidden>&gt;</span>
          <span>Editar</span>
        </nav>

        <h1 style={{ marginBottom: "0.5rem" }}>Editar publicación</h1>
        <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>
          Modificá los datos de tu mascota publicada.
        </p>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Nombre</label>
              <input className="input" type="text" value={form.name}
                onChange={(e) => set("name", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Estado *</label>
              <select className="select" value={form.status}
                onChange={(e) => set("status", e.target.value as PetStatus)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="field full">
              <label className="field-label">Descripción *</label>
              <textarea className="textarea" value={form.description}
                onChange={(e) => set("description", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Fecha *</label>
              <input className="input" type="text" value={form.date}
                onChange={(e) => set("date", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Ubicación *</label>
              <input className="input" type="text" value={form.location}
                onChange={(e) => set("location", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Teléfono de contacto *</label>
              <input className="input" type="text" value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Email de contacto *</label>
              <input className="input" type="email" value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Sexo</label>
              <select className="select" value={form.sex}
                onChange={(e) => set("sex", e.target.value as PetSex | "")}>
                <option value="">—</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label">Raza</label>
              <input className="input" type="text" value={form.breed}
                onChange={(e) => set("breed", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Edad (meses)</label>
              <input className="input" type="number" min={0} value={form.ageMonths}
                onChange={(e) => set("ageMonths", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Color</label>
              <input className="input" type="text" value={form.color}
                onChange={(e) => set("color", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Peso (kg)</label>
              <input className="input" type="number" min={0} step="0.1" value={form.weightKg}
                onChange={(e) => set("weightKg", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Altura (cm)</label>
              <input className="input" type="number" min={0} step="0.1" value={form.heightCm}
                onChange={(e) => set("heightCm", e.target.value)} />
            </div>
          </div>

          <div className="checkbox-grid" style={{ marginTop: "1rem" }}>
            {CHECKS.map((c) => (
              <label key={c.key} className="checkbox-card">
                <input
                  type="checkbox"
                  checked={form[c.key] as boolean}
                  onChange={(e) => set(c.key, e.target.checked as never)}
                />
                <span className="checkbox-card-icon" aria-hidden>{c.icon}</span>
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          <div className="form-actions" style={{ marginTop: "1.5rem" }}>
            <Link href={`/mascotas-perdidas/${id}`} className="btn btn-outline">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
