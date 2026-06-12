import type { FormikProps } from "formik";
import { EditableField } from "./EditableField";
import type {
  AdminPetSummary,
  AnimalType,
  Pet,
  PetMedicalStatus,
  PetSex,
} from "@/types/pet";

// ── Opciones ─────────────────────────────────────────────────────────────────

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

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Tipo exportado (lo usa el drawer para Formik) ─────────────────────────────

export type EditForm = Pick<
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

export function toInitial(p: AdminPetSummary): EditForm {
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

// ── Helpers internos ──────────────────────────────────────────────────────────

type F = FormikProps<EditForm>;

function TextInput({
  field,
  type = "text",
  formik,
}: {
  field: keyof EditForm;
  type?: "text" | "number" | "email" | "tel";
  formik: F;
}) {
  const raw = formik.values[field];
  return (
    <input
      className="vdrawer-input"
      type={type}
      value={raw === undefined || raw === null ? "" : String(raw)}
      onChange={(e) => {
        const v = e.target.value;
        formik.setFieldValue(
          field,
          type === "number" ? (v === "" ? undefined : Number(v)) : v,
        );
      }}
    />
  );
}

function SelectInput({
  field,
  options,
  formik,
}: {
  field: keyof EditForm;
  options: readonly string[];
  formik: F;
}) {
  return (
    <select
      className="vdrawer-select"
      value={(formik.values[field] as string) ?? ""}
      onChange={(e) => formik.setFieldValue(field, e.target.value)}
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
  );
}

function BoolSelect({ field, formik }: { field: keyof EditForm; formik: F }) {
  return (
    <select
      className="vdrawer-select"
      value={formik.values[field] === true ? "true" : "false"}
      onChange={(e) => formik.setFieldValue(field, e.target.value === "true")}
    >
      <option value="true">Sí</option>
      <option value="false">No</option>
    </select>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

type Props = {
  formik: F;
};

/**
 * Formulario de edición del drawer.
 * Recibe el formik ya inicializado desde el drawer shell.
 * No maneja submit ni acciones — eso queda en el drawer.
 */
export function PublicacionEditForm({ formik }: Props) {
  return (
    <>
      <section className="vdrawer-section">
        <h3>Datos del animal</h3>

        <EditableField label="Nombre" value="" editing>
          <TextInput field="name" formik={formik} />
        </EditableField>

        {/* El Estado del animal lo define quien publica; el admin no lo edita. */}
        <EditableField
          label="Estado"
          editing={false}
          value={
            <span className="vdrawer-readonly">
              {formik.values.status ? cap(String(formik.values.status)) : "—"}
              <small>No editable</small>
            </span>
          }
        >
          {null}
        </EditableField>

        <EditableField label="Especie" value="" editing>
          <SelectInput field="animalType" options={TYPE_OPTS} formik={formik} />
        </EditableField>

        <EditableField label="Sexo" value="" editing>
          <SelectInput field="sex" options={SEX_OPTS} formik={formik} />
        </EditableField>

        <EditableField label="Raza" value="" editing>
          <TextInput field="breed" formik={formik} />
        </EditableField>

        <EditableField label="Edad (meses)" value="" editing>
          <TextInput field="ageMonths" type="number" formik={formik} />
        </EditableField>

        <EditableField label="Color" value="" editing>
          <TextInput field="color" formik={formik} />
        </EditableField>

        <EditableField label="Peso (kg)" value="" editing>
          <TextInput field="weightKg" type="number" formik={formik} />
        </EditableField>

        <EditableField label="Altura (cm)" value="" editing>
          <TextInput field="heightCm" type="number" formik={formik} />
        </EditableField>

        <EditableField label="Estado de salud" value="" editing>
          <SelectInput
            field="medicalStatus"
            options={MED_OPTS}
            formik={formik}
          />
        </EditableField>
      </section>

      <section className="vdrawer-section">
        <h3>Características</h3>

        <EditableField label="Collar" value="" editing>
          <BoolSelect field="hasCollar" formik={formik} />
        </EditableField>

        <EditableField label="Chapa" value="" editing>
          <BoolSelect field="hasTag" formik={formik} />
        </EditableField>

        <EditableField label="Microchip" value="" editing>
          <BoolSelect field="microchipped" formik={formik} />
        </EditableField>

        <EditableField label="Castrado" value="" editing>
          <BoolSelect field="neutered" formik={formik} />
        </EditableField>

        <EditableField label="Vacunado" value="" editing>
          <BoolSelect field="vaccinated" formik={formik} />
        </EditableField>

        <EditableField label="Bueno con niños" value="" editing>
          <BoolSelect field="friendlyWithKids" formik={formik} />
        </EditableField>

        <EditableField label="Entrenado" value="" editing>
          <BoolSelect field="trained" formik={formik} />
        </EditableField>
      </section>

      <section className="vdrawer-section">
        <h3>Descripción</h3>
        <textarea
          className="vdrawer-textarea"
          rows={4}
          value={formik.values.description ?? ""}
          onChange={(e) => formik.setFieldValue("description", e.target.value)}
        />
      </section>

      <section className="vdrawer-section">
        <h3>Ubicación y contacto</h3>

        <EditableField label="Ubicación" value="" editing>
          <TextInput field="location" formik={formik} />
        </EditableField>

        <EditableField label="Email" value="" editing>
          <TextInput field="contactEmail" type="email" formik={formik} />
        </EditableField>

        <EditableField label="Teléfono" value="" editing>
          <TextInput field="contactPhone" type="tel" formik={formik} />
        </EditableField>
      </section>
    </>
  );
}
