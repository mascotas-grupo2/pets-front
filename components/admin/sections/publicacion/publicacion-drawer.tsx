"use client";

import { useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Pill } from "../../ui/pill";
import type {
  AdminPetSummary,
  AnimalType,
  Pet,
  PetMedicalStatus,
  PetSex,
  PetStatus,
} from "@/types/pet";

type Props = {
  pet: AdminPetSummary;
  busy: boolean;
  /** Cuando es true, el drawer muestra el formulario editable en vez del detalle. */
  editing: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSave: (patch: Partial<Pet>) => void;
};

/** Campos editables del formulario (el resto del Pet no se toca al guardar). */
type EditForm = Pick<
  Pet,
  | "name"
  | "status"
  | "animalType"
  | "sex"
  | "breed"
  | "ageMonths"
  | "color"
  | "weightKg"
  | "heightCm"
  | "medicalStatus"
  | "hasCollar"
  | "hasTag"
  | "microchipped"
  | "neutered"
  | "vaccinated"
  | "friendlyWithKids"
  | "trained"
  | "description"
  | "location"
  | "contactEmail"
  | "contactPhone"
>;

type Setter = (
  key: keyof EditForm,
  value: string | number | boolean | undefined,
) => void;

const STATUS_OPTS: PetStatus[] = [
  "perdido",
  "encontrado",
  "en tránsito",
  "en tratamiento médico",
  "en adopción",
  "adoptado",
];
const TYPE_OPTS: AnimalType[] = ["perro", "gato", "otro"];
const SEX_OPTS: PetSex[] = ["macho", "hembra"];
const MED_OPTS: PetMedicalStatus[] = [
  "sano",
  "en evaluación",
  "en tratamiento",
  "post-operatorio",
  "recuperándose",
  "crítico",
];

function initialForm(p: AdminPetSummary): EditForm {
  return {
    name: p.name ?? "",
    status: p.status,
    animalType: p.animalType,
    sex: p.sex,
    breed: p.breed ?? "",
    ageMonths: p.ageMonths,
    color: p.color ?? "",
    weightKg: p.weightKg,
    heightCm: p.heightCm,
    medicalStatus: p.medicalStatus,
    hasCollar: p.hasCollar,
    hasTag: p.hasTag,
    microchipped: p.microchipped,
    neutered: p.neutered,
    vaccinated: p.vaccinated,
    friendlyWithKids: p.friendlyWithKids,
    trained: p.trained,
    description: p.description ?? "",
    location: p.location ?? "",
    contactEmail: p.contactEmail ?? "",
    contactPhone: p.contactPhone ?? "",
  };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const yesNo = (v?: boolean | null) =>
  v === true ? "Sí" : v === false ? "No" : null;

/** Fila de detalle (solo lectura). */
function Field({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="vdrawer-field">
      <span className="vdrawer-field-label">{label}</span>
      <span className="vdrawer-field-value">{value}</span>
    </div>
  );
}

/** Input de texto (o número) con label apilado arriba. */
function TextRow({
  label,
  field,
  type = "text",
  form,
  set,
}: {
  label: string;
  field: keyof EditForm;
  type?: "text" | "number" | "email" | "tel";
  form: EditForm;
  set: Setter;
}) {
  const raw = form[field];
  return (
    <label className="vdrawer-edit-field">
      <span className="vdrawer-edit-label">{label}</span>
      <input
        className="vdrawer-input"
        type={type}
        value={raw === undefined || raw === null ? "" : String(raw)}
        onChange={(e) => {
          const v = e.target.value;
          set(field, type === "number" ? (v === "" ? undefined : Number(v)) : v);
        }}
      />
    </label>
  );
}

/** Desplegable con opciones de un valor de unión (tipo, sexo, etc.). */
function SelectRow({
  label,
  field,
  options,
  form,
  set,
}: {
  label: string;
  field: keyof EditForm;
  options: readonly string[];
  form: EditForm;
  set: Setter;
}) {
  return (
    <label className="vdrawer-edit-field">
      <span className="vdrawer-edit-label">{label}</span>
      <select
        className="vdrawer-select"
        value={(form[field] as string) ?? ""}
        onChange={(e) => set(field, e.target.value)}
      >
        <option value="" disabled>
          Seleccionar…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {cap(o)}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Desplegable Sí/No para un campo booleano. */
function BoolRow({
  label,
  field,
  form,
  set,
}: {
  label: string;
  field: keyof EditForm;
  form: EditForm;
  set: Setter;
}) {
  return (
    <label className="vdrawer-edit-field">
      <span className="vdrawer-edit-label">{label}</span>
      <select
        className="vdrawer-select"
        value={form[field] === true ? "true" : "false"}
        onChange={(e) => set(field, e.target.value === "true")}
      >
        <option value="true">Sí</option>
        <option value="false">No</option>
      </select>
    </label>
  );
}

/**
 * Panel lateral derecho: detalle de una publicación o su formulario de edición.
 * El form se inicializa desde la prop; el padre lo remonta vía `key` para resetear.
 */
export function PublicacionDrawer({
  pet,
  busy,
  editing,
  onClose,
  onApprove,
  onReject,
  onSave,
}: Props) {
  const photo = pet.photos?.[0] ?? pet.photo ?? null;
  const creatorName = pet.ownerName ?? "Anónimo";
  const creatorEmail = pet.ownerEmail ?? pet.contactEmail;

  const [form, setForm] = useState<EditForm>(() => initialForm(pet));
  const set: Setter = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="vdrawer-overlay" onClick={onClose}>
      <aside
        className="vdrawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${editing ? "Editar" : "Detalle de"} ${pet.name ?? "publicación"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="vdrawer-head">
          <h2>
            {editing
              ? `Editar: ${pet.name ?? "publicación"}`
              : pet.name ?? "Sin nombre"}
          </h2>
          <button
            type="button"
            className="vdrawer-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="vdrawer-body">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="vdrawer-photo" src={photo} alt={pet.name ?? ""} />
          )}

          {editing ? (
            <>
              <section className="vdrawer-section">
                <h3>Datos del animal</h3>
                <TextRow label="Nombre" field="name" form={form} set={set} />
                <SelectRow
                  label="Tipo"
                  field="status"
                  options={STATUS_OPTS}
                  form={form}
                  set={set}
                />
                <SelectRow
                  label="Especie"
                  field="animalType"
                  options={TYPE_OPTS}
                  form={form}
                  set={set}
                />
                <SelectRow
                  label="Sexo"
                  field="sex"
                  options={SEX_OPTS}
                  form={form}
                  set={set}
                />
                <TextRow label="Raza" field="breed" form={form} set={set} />
                <TextRow
                  label="Edad (meses)"
                  field="ageMonths"
                  type="number"
                  form={form}
                  set={set}
                />
                <TextRow label="Color" field="color" form={form} set={set} />
                <TextRow
                  label="Peso (kg)"
                  field="weightKg"
                  type="number"
                  form={form}
                  set={set}
                />
                <TextRow
                  label="Altura (cm)"
                  field="heightCm"
                  type="number"
                  form={form}
                  set={set}
                />
                <SelectRow
                  label="Estado de salud"
                  field="medicalStatus"
                  options={MED_OPTS}
                  form={form}
                  set={set}
                />
              </section>

              <section className="vdrawer-section">
                <h3>Características</h3>
                <BoolRow label="Collar" field="hasCollar" form={form} set={set} />
                <BoolRow label="Chapa" field="hasTag" form={form} set={set} />
                <BoolRow
                  label="Microchip"
                  field="microchipped"
                  form={form}
                  set={set}
                />
                <BoolRow label="Castrado" field="neutered" form={form} set={set} />
                <BoolRow
                  label="Vacunado"
                  field="vaccinated"
                  form={form}
                  set={set}
                />
                <BoolRow
                  label="Bueno con niños"
                  field="friendlyWithKids"
                  form={form}
                  set={set}
                />
                <BoolRow label="Entrenado" field="trained" form={form} set={set} />
              </section>

              <section className="vdrawer-section">
                <h3>Descripción</h3>
                <textarea
                  className="vdrawer-textarea"
                  rows={4}
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                />
              </section>

              <section className="vdrawer-section">
                <h3>Ubicación y contacto</h3>
                <TextRow
                  label="Ubicación"
                  field="location"
                  form={form}
                  set={set}
                />
                <TextRow
                  label="Email"
                  field="contactEmail"
                  type="email"
                  form={form}
                  set={set}
                />
                <TextRow
                  label="Teléfono"
                  field="contactPhone"
                  type="tel"
                  form={form}
                  set={set}
                />
              </section>
            </>
          ) : (
            <>
              <div className="vdrawer-pills">
                {pet.status && (
                  <Pill tone="violet">{pet.statusLabel ?? pet.status}</Pill>
                )}
                <Pill tone="amber">{pet.reportStatusLabel ?? "Pendiente"}</Pill>
              </div>

              <section className="vdrawer-section">
                <h3>Creado por</h3>
                <Field label="Nombre" value={creatorName} />
                <Field label="Email" value={creatorEmail} />
              </section>

              <section className="vdrawer-section">
                <h3>Datos del animal</h3>
                <Field label="Tipo" value={pet.animalTypeLabel ?? pet.animalType} />
                <Field label="Sexo" value={pet.sexLabel ?? pet.sex} />
                <Field label="Raza" value={pet.breed} />
                <Field label="Edad (meses)" value={pet.ageMonths} />
                <Field label="Color" value={pet.color} />
                <Field label="Peso (kg)" value={pet.weightKg} />
                <Field label="Altura (cm)" value={pet.heightCm} />
                <Field
                  label="Estado de salud"
                  value={pet.medicalStatusLabel ?? pet.medicalStatus}
                />
              </section>

              <section className="vdrawer-section">
                <h3>Características</h3>
                <Field label="Collar" value={yesNo(pet.hasCollar)} />
                <Field label="Chapa" value={yesNo(pet.hasTag)} />
                <Field label="Microchip" value={yesNo(pet.microchipped)} />
                <Field label="Castrado" value={yesNo(pet.neutered)} />
                <Field label="Vacunado" value={yesNo(pet.vaccinated)} />
                <Field label="Bueno con niños" value={yesNo(pet.friendlyWithKids)} />
                <Field label="Entrenado" value={yesNo(pet.trained)} />
              </section>

              {pet.description && (
                <section className="vdrawer-section">
                  <h3>Descripción</h3>
                  <p className="vdrawer-desc">{pet.description}</p>
                </section>
              )}

              <section className="vdrawer-section">
                <h3>Ubicación y fecha</h3>
                <Field label="Ubicación" value={pet.location} />
                <Field label="Fecha" value={pet.date} />
              </section>

              <section className="vdrawer-section">
                <h3>Contacto</h3>
                <Field label="Email" value={pet.contactEmail} />
                <Field label="Teléfono" value={pet.contactPhone} />
              </section>
            </>
          )}
        </div>

        <footer className="vdrawer-foot">
          {editing ? (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={busy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onSave(form)}
                disabled={busy}
              >
                <Check size={16} aria-hidden /> {busy ? "Guardando…" : "Guardar"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onReject}
                disabled={busy}
              >
                <X size={16} aria-hidden /> Rechazar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onApprove}
                disabled={busy}
              >
                <Check size={16} aria-hidden /> {busy ? "Procesando…" : "Aprobar"}
              </button>
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}
