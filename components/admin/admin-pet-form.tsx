"use client";

import {
  PET_MEDICAL_STATUS_OPTIONS,
  PET_STATUS_OPTIONS,
} from "@/lib/admin/pet-status";
import { Pet, PetMedicalStatus, PetSex, PetStatus } from "@/types/pet";
import Link from "next/link";
import { useState } from "react";

type Editable = {
  status: PetStatus;
  medicalStatus: PetMedicalStatus;
  name: string;
  location: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  reward: string;
  sex: PetSex | "";
  breed: string;
  ageMonths: string;
  color: string;
  weightKg: string;
  heightCm: string;
  vaccinated: boolean;
  neutered: boolean;
  microchipped: boolean;
  hasCollar: boolean;
  hasTag: boolean;
  friendlyWithKids: boolean;
  trained: boolean;
};

const CHECKBOX_FIELDS: { key: keyof Editable; label: string }[] = [
  { key: "vaccinated", label: "Vacunado/a" },
  { key: "neutered", label: "Castrado/a" },
  { key: "microchipped", label: "Microchip" },
  { key: "hasCollar", label: "Con collar" },
  { key: "hasTag", label: "Con chapa" },
  { key: "friendlyWithKids", label: "Bueno con chicos" },
  { key: "trained", label: "Entrenado/a" },
];

function toEditable(pet: Pet): Editable {
  return {
    status: pet.status,
    medicalStatus: pet.medicalStatus ?? "sano",
    name: pet.name ?? "",
    location: pet.location,
    description: pet.description,
    contactPhone: pet.contactPhone,
    contactEmail: pet.contactEmail,
    reward: (pet as Pet & { reward?: string }).reward ?? "",
    sex: pet.sex ?? "",
    breed: pet.breed ?? "",
    ageMonths: pet.ageMonths != null ? String(pet.ageMonths) : "",
    color: pet.color ?? "",
    weightKg: pet.weightKg != null ? String(pet.weightKg) : "",
    heightCm: pet.heightCm != null ? String(pet.heightCm) : "",
    vaccinated: !!pet.vaccinated,
    neutered: !!pet.neutered,
    microchipped: !!pet.microchipped,
    hasCollar: !!pet.hasCollar,
    hasTag: !!pet.hasTag,
    friendlyWithKids: !!pet.friendlyWithKids,
    trained: !!pet.trained,
  };
}

function toPatch(form: Editable): Partial<Pet> {
  const optionalNumber = (v: string) => {
    const t = v.trim();
    if (t === "") return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  };
  const patch: Partial<Pet> & { reward?: string } = {
    status: form.status,
    medicalStatus: form.medicalStatus,
    name: form.name.trim() || undefined,
    location: form.location.trim(),
    description: form.description.trim(),
    contactPhone: form.contactPhone.trim(),
    contactEmail: form.contactEmail.trim(),
    sex: form.sex || undefined,
    breed: form.breed.trim() || undefined,
    color: form.color.trim() || undefined,
    ageMonths: optionalNumber(form.ageMonths),
    weightKg: optionalNumber(form.weightKg),
    heightCm: optionalNumber(form.heightCm),
    vaccinated: form.vaccinated,
    neutered: form.neutered,
    microchipped: form.microchipped,
    hasCollar: form.hasCollar,
    hasTag: form.hasTag,
    friendlyWithKids: form.friendlyWithKids,
    trained: form.trained,
    reward: form.reward.trim() || undefined,
  };
  return patch;
}

type Props = {
  pet: Pet;
  saving: boolean;
  onSubmit: (patch: Partial<Pet>) => void;
};

export function AdminPetForm({ pet, saving, onSubmit }: Props) {
  const [form, setForm] = useState<Editable>(() => toEditable(pet));

  const set = <K extends keyof Editable>(key: K, value: Editable[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(toPatch(form));
  };

  return (
    <form className="admin-edit-form" onSubmit={handleSubmit}>
      <section className="admin-card">
        <h2>Estado de la mascota</h2>
        <p className="admin-card-hint">
          Cambiar el estado afecta cómo aparece la publicación en la web
          pública.
        </p>

        <div className="admin-fields-grid">
          <div className="field">
            <label className="field-label" htmlFor="pet-status">
              Estado de publicación
            </label>
            <select
              id="pet-status"
              className="select"
              value={form.status}
              onChange={(e) => set("status", e.target.value as PetStatus)}
            >
              {PET_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="pet-medical-status">
              Estado médico
            </label>
            <select
              id="pet-medical-status"
              className="select"
              value={form.medicalStatus}
              onChange={(e) =>
                set("medicalStatus", e.target.value as PetMedicalStatus)
              }
            >
              {PET_MEDICAL_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h2>Datos generales</h2>
        <div className="admin-fields-grid">
          <Field id="pet-name" label="Nombre">
            <input
              id="pet-name"
              className="input"
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field id="pet-location" label="Ubicación">
            <input
              id="pet-location"
              className="input"
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label" htmlFor="pet-description">
              Descripción
            </label>
            <textarea
              id="pet-description"
              className="textarea"
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <Field id="pet-sex" label="Sexo">
            <select
              id="pet-sex"
              className="select"
              value={form.sex}
              onChange={(e) => set("sex", e.target.value as PetSex | "")}
            >
              <option value="">—</option>
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
          </Field>
          <Field id="pet-breed" label="Raza">
            <input
              id="pet-breed"
              className="input"
              type="text"
              value={form.breed}
              onChange={(e) => set("breed", e.target.value)}
            />
          </Field>
          <Field id="pet-age" label="Edad (meses)">
            <input
              id="pet-age"
              className="input"
              type="number"
              min={0}
              value={form.ageMonths}
              onChange={(e) => set("ageMonths", e.target.value)}
            />
          </Field>
          <Field id="pet-color" label="Color">
            <input
              id="pet-color"
              className="input"
              type="text"
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
            />
          </Field>
          <Field id="pet-weight" label="Peso (kg)">
            <input
              id="pet-weight"
              className="input"
              type="number"
              min={0}
              step="0.1"
              value={form.weightKg}
              onChange={(e) => set("weightKg", e.target.value)}
            />
          </Field>
          <Field id="pet-height" label="Altura (cm)">
            <input
              id="pet-height"
              className="input"
              type="number"
              min={0}
              step="0.1"
              value={form.heightCm}
              onChange={(e) => set("heightCm", e.target.value)}
            />
          </Field>
          <Field id="pet-phone" label="Teléfono de contacto">
            <input
              id="pet-phone"
              className="input"
              type="text"
              value={form.contactPhone}
              onChange={(e) => set("contactPhone", e.target.value)}
            />
          </Field>
          <Field id="pet-email" label="Email de contacto">
            <input
              id="pet-email"
              className="input"
              type="email"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
            />
          </Field>
          <Field id="pet-reward" label="Recompensa">
            <input
              id="pet-reward"
              className="input"
              type="text"
              placeholder="Opcional"
              value={form.reward}
              onChange={(e) => set("reward", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="admin-card">
        <h2>Salud y características</h2>
        <div className="admin-checks-grid">
          {CHECKBOX_FIELDS.map(({ key, label }) => (
            <label key={key} className="admin-check">
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={(e) => set(key, e.target.checked as Editable[typeof key])}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="admin-form-actions">
        <Link href="/admin/mascotas-perdidas" className="btn btn-outline">
          Cancelar
        </Link>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}
