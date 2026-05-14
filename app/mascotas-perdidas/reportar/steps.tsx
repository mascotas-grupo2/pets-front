"use client";

import { LocationPicker } from "@/components/location-picker";
import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import { ReportForm } from "@/types/reportar";
import { FormikProps } from "formik";
import { ChangeEvent, useState } from "react";

/** Alias para los props de un paso típico que sólo necesita el formik bag. */
type StepProps = { formik: FormikProps<ReportForm> };

// ───────────────────────────────────────────────────────────────── Inicio ──

export function StartStep() {
  return (
    <>
      <h2 className="wizard-heading">Empecemos</h2>
      <div className="wizard-intro">
        <div className="wizard-intro-avatar">🐾</div>
        <p>
          Para <strong>reportar una mascota perdida</strong> vas a necesitar una
          foto clara, una descripción detallada, dónde se perdió y datos de
          contacto. Te guiamos paso a paso.
        </p>
      </div>
      <p style={{ fontSize: "0.9rem" }}>
        Tip: mientras más información aportes, más fácil será que alguien la
        reconozca.
      </p>
    </>
  );
}

// ────────────────────────────────────────────────────────────────── Datos ──

export function DataStep({ formik }: StepProps) {
  return (
    <>
      <h2 className="wizard-heading">Datos de la mascota</h2>
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Nombre (opcional)</label>
          <input
            className="input"
            type="text"
            name="name"
            value={formik.values.name}
            onChange={(e) => FormikHandleChange(formik, "name", e)}
            placeholder="Ej: Toby"
          />
        </div>

        <div className="field">
          <label className="field-label">Tipo de animal *</label>
          <select
            className="select"
            name="animalType"
            value={formik.values.animalType}
            onChange={(e) => FormikHandleChange(formik, "animalType", e)}
          >
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>
          <ShowError message={FormikHandleError(formik, "animalType")} />
        </div>

        <div className="field full">
          <label className="field-label">Descripción *</label>
          <textarea
            className="textarea"
            name="description"
            value={formik.values.description}
            onChange={(e) => FormikHandleChange(formik, "description", e)}
            placeholder="Color, tamaño, señas particulares, comportamiento…"
          />
          <ShowError message={FormikHandleError(formik, "description")} />
        </div>

        <div className="field">
          <label className="field-label">Fecha en que se perdió *</label>
          <input
            className="input"
            type="date"
            name="date"
            value={formik.values.date}
            onChange={(e) => FormikHandleChange(formik, "date", e)}
          />
          <ShowError message={FormikHandleError(formik, "date")} />
        </div>
        <label className="checkbox-card">
          <input
            type="checkbox"
            checked={formik.values.isOwner}
            onChange={(e) => FormikHandleChange(formik, "isOwner", e)}
          />
          <span className="checkbox-card-icon" aria-hidden>
            😭
          </span>
          <span>Soy dueño de la mascota</span>
        </label>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────── Características ──

export function CharacteristicsStep({ formik }: StepProps) {
  return (
    <>
      <h2 className="wizard-heading">Características</h2>
      <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
        Todos estos datos son opcionales pero ayudan muchísimo a identificar a
        tu mascota.
      </p>
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Raza</label>
          <input
            className="input"
            type="text"
            name="breed"
            value={formik.values.breed}
            onChange={(e) => FormikHandleChange(formik, "breed", e)}
            placeholder="Ej: Labrador, Mestizo"
          />
        </div>

        <div className="field">
          <label className="field-label">Sexo</label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="sex"
                checked={formik.values.sex === "macho"}
                onChange={() => formik.setFieldValue("sex", "macho")}
              />
              Macho
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="sex"
                checked={formik.values.sex === "hembra"}
                onChange={() => formik.setFieldValue("sex", "hembra")}
              />
              Hembra
            </label>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Edad (en meses)</label>
          <input
            className="input"
            type="number"
            min={0}
            name="ageMonths"
            value={formik.values.ageMonths}
            onChange={(e) =>
              formik.setFieldValue(
                "ageMonths",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="Ej: 24"
          />
          <small style={{ color: "var(--gray-500)", fontSize: "0.78rem" }}>
            Si es cachorro, usá meses. 1 año = 12, 2 años = 24.
          </small>
        </div>

        <div className="field">
          <label className="field-label">Color</label>
          <input
            className="input"
            type="text"
            name="color"
            value={formik.values.color}
            onChange={(e) => FormikHandleChange(formik, "color", e)}
            placeholder="Ej: Negro, Atigrado"
          />
        </div>

        <div className="field">
          <label className="field-label">Peso (kg)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.1"
            name="weightKg"
            value={formik.values.weightKg}
            onChange={(e) =>
              formik.setFieldValue(
                "weightKg",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="Ej: 12.5"
          />
        </div>

        <div className="field">
          <label className="field-label">Altura (cm)</label>
          <input
            className="input"
            type="number"
            min={0}
            name="heightCm"
            value={formik.values.heightCm}
            onChange={(e) =>
              formik.setFieldValue(
                "heightCm",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="Ej: 45"
          />
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────── Foto ──

type PhotoStepProps = StepProps & {
  onSelectFile: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function PhotoStep({ formik, onSelectFile }: PhotoStepProps) {
  const { photo } = formik.values;
  const photosArray = Array.isArray(photo) ? photo : photo ? [photo] : [];
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function handleDragStart(e: any, idx: number) {
    setDraggingIndex(idx);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(idx));
    } catch {}
  }

  function handleDragEnd() {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  function handleDragOver(e: any, idx: number) {
    e.preventDefault();
    if (dragOverIndex !== idx) setDragOverIndex(idx);
  }

  function handleDrop(e: any, idx: number) {
    e.preventDefault();
    const srcStr = e.dataTransfer.getData("text/plain");
    const src = Number(srcStr);
    const dest = idx;
    if (!Number.isNaN(src) && src !== dest) {
      const newArr = [...photosArray];
      const [moved] = newArr.splice(src, 1);
      newArr.splice(dest, 0, moved);
      formik.setFieldValue("photo", newArr.length > 0 ? newArr : null);
    }
    handleDragEnd();
  }
  return (
    <>
      <h2 className="wizard-heading">Foto de la mascota</h2>
      <div className="form-grid">
        <div className="field full">
          <label className="file-drop">
            <div className="icon">📷</div>
            <div>
              <strong>{photosArray.length > 0 ? `${photosArray.length} imagen(es) seleccionadas` : "Click para subir una o más imágenes"}</strong>
            </div>
            <div className="hint">PNG, JPG hasta ~5 MB cada una. Podés seleccionar varias.</div>
            <input type="file" accept="image/*" onChange={onSelectFile} multiple />
          </label>
          <ShowError message={FormikHandleError(formik, "photo")} />
          {photosArray.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              {photosArray.map((p, i) => {
                const isDragging = draggingIndex === i;
                const isDragOver = dragOverIndex === i;
                return (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      opacity: isDragging ? 0.5 : 1,
                      transform: isDragOver ? "scale(1.03)" : "none",
                      transition: "transform 120ms ease, opacity 120ms ease",
                      cursor: "grab",
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`Vista previa ${i + 1}`} className="preview" style={{ width: 120, height: 120, objectFit: "cover" }} />
                    <button
                      type="button"
                      aria-label={`Eliminar imagen ${i + 1}`}
                      onClick={() => {
                        const newArr = [...photosArray];
                        newArr.splice(i, 1);
                        formik.setFieldValue("photo", newArr.length > 0 ? newArr : null);
                      }}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 6px",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────── Detalles ──

type BooleanField =
  | "hasCollar"
  | "hasTag"
  | "microchipped"
  | "vaccinated"
  | "neutered"
  | "friendlyWithKids"
  | "trained";

const DETAIL_TOGGLES: { field: BooleanField; label: string; icon: string }[] = [
  { field: "hasCollar", label: "Tiene collar", icon: "🦮" },
  { field: "hasTag", label: "Tiene chapita con nombre", icon: "🏷️" },
  { field: "microchipped", label: "Tiene microchip", icon: "💾" },
  { field: "vaccinated", label: "Está vacunado/a", icon: "💉" },
  { field: "neutered", label: "Está castrado/a", icon: "✂️" },
  { field: "friendlyWithKids", label: "Se lleva bien con chicos", icon: "🧒" },
  { field: "trained", label: "Está entrenado/a", icon: "🎓" },
];

export function DetailsStep({ formik }: StepProps) {
  return (
    <>
      <h2 className="wizard-heading">Detalles y salud</h2>
      <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
        Marcá las casillas que apliquen. Son datos opcionales pero útiles.
      </p>

      <div className="checkbox-grid">
        {DETAIL_TOGGLES.map(({ field, label, icon }) => (
          <label key={field} className="checkbox-card">
            <input
              type="checkbox"
              checked={formik.values[field]}
              onChange={(e) => formik.setFieldValue(field, e.target.checked)}
            />
            <span className="checkbox-card-icon" aria-hidden>
              {icon}
            </span>
            <span>{label}</span>
          </label>
        ))}
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────── Ubicación ──

export function LocationStep({ formik }: StepProps) {
  return (
    <>
      <h2 className="wizard-heading">Dónde se perdió</h2>
      <LocationPicker
        value={formik.values.location}
        onChange={(v) => {
          formik.setFieldValue("location", v);
          formik.setFieldTouched("location", true, false);
        }}
      />
      <div style={{ marginTop: "0.5rem" }}>
        <ShowError message={FormikHandleError(formik, "location")} />
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────── Contacto ──

export function ContactStep({ formik }: StepProps) {
  return (
    <>
      <h2 className="wizard-heading">Contacto</h2>
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Teléfono de contacto *</label>
          <input
            className="input"
            type="text"
            name="contactPhone"
            value={formik.values.contactPhone}
            onChange={(e) => FormikHandleChange(formik, "contactPhone", e)}
            placeholder="+54 11 5555-5555"
          />
          <ShowError message={FormikHandleError(formik, "contactPhone")} />
        </div>

        <div className="field">
          <label className="field-label">Email de contacto *</label>
          <input
            className="input"
            type="email"
            name="contactEmail"
            value={formik.values.contactEmail}
            onChange={(e) => FormikHandleChange(formik, "contactEmail", e)}
            placeholder="tu@email.com"
          />
          <ShowError message={FormikHandleError(formik, "contactEmail")} />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────── Confirmar ──

export function ConfirmStep({ values }: { values: ReportForm }) {
  const hasCharacteristics =
    values.sex ||
    values.breed ||
    values.ageMonths !== "" ||
    values.color ||
    values.weightKg !== "" ||
    values.heightCm !== "";

  return (
    <>
      <h2 className="wizard-heading">Revisá y publicá</h2>
      <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
        Verificá que los datos sean correctos antes de publicar.
      </p>
      <dl className="wizard-review">
        <ReviewItem label="Nombre" value={values.name || "Sin nombre"} />
        <ReviewItem label="Tipo" value={values.animalType} />
        <ReviewItem label="Fecha perdido" value={values.date} />
        <ReviewItem label="Ubicación" value={values.location} />
        <ReviewItem label="Teléfono" value={values.contactPhone} />
        <ReviewItem label="Email" value={values.contactEmail} />
        <ReviewItem label="Descripción" value={values.description} full />
        {hasCharacteristics && (
          <ReviewItem
            label="Características"
            value={[
              values.breed,
              values.sex,
              values.ageMonths !== "" ? `${values.ageMonths} meses` : "",
              values.color,
              values.weightKg !== "" ? `${values.weightKg} kg` : "",
              values.heightCm !== "" ? `${values.heightCm} cm` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
            full
          />
        )}
      </dl>
      {values.photo?.url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={values.photo.url} alt="Vista previa" className="preview" />
      )}
    </>
  );
}

function ReviewItem({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : undefined}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
