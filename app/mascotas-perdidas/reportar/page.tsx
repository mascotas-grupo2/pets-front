"use client";

import { FormStepper, StepDef } from "@/components/form-stepper";
import { LocationPicker } from "@/components/location-picker";
import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { addPet } from "@/lib/storage";
import { useAppDispatch } from "@/redux/hooks";
import { reportPet } from "@/services/report.pets";
import { Pet } from "@/types/pet";
import { ReportForm } from "@/types/reportar";
import {
  reportContactSchema,
  reportDataSchema,
  reportLocationSchema,
  reportPhotoSchema,
  reportValidationSchema,
} from "@/validation/reportar";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

const STEPS: StepDef[] = [
  { key: "start", label: "Inicio", icon: "→" },
  { key: "data", label: "Datos", icon: "❓" },
  { key: "photo", label: "Foto", icon: "📷" },
  { key: "location", label: "Ubicación", icon: "📍" },
  { key: "contact", label: "Contacto", icon: "✉️" },
  { key: "confirm", label: "Confirmar", icon: "✓" },
];

const STEP_SCHEMAS = [
  null,
  reportDataSchema,
  reportPhotoSchema,
  reportLocationSchema,
  reportContactSchema,
  null,
];

const STEP_FIELDS: (keyof ReportForm)[][] = [
  [],
  ["animalType", "description", "date", "name"],
  ["photo"],
  ["location"],
  ["contactPhone", "contactEmail"],
  [],
];

export default function ReportPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      formik.setFieldValue("photo", {
        file: file,
        name: file.name,
        url: reader.result as string,
      });
    reader.readAsDataURL(file);
  }

  const formik = useFormik<ReportForm>({
    enableReinitialize: true,
    initialValues: {
      name: "",
      description: "",
      animalType: "perro",
      date: new Date().toISOString().split("T")[0] || "",
      photo: null,
      location: "",
      contactPhone: "",
      contactEmail: "",
    },
    validationSchema: reportValidationSchema,
    onSubmit: async (values) => {
      const pet: Pet = {
        id: `local-${Date.now()}`,
        name: values.name || undefined,
        photo: values.photo?.url ?? "",
        description: values.description,
        animalType: values.animalType,
        date: values.date,
        location: values.location,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        createdAt: new Date().toISOString(),
      };

      try {
        addPet(pet);
      } catch (err) {
        console.warn("No se pudo persistir localmente", err);
      }

      dispatch({ type: "REPORT_PET", payload: pet });

      // Best-effort POST al backend; si no hay backend, no rompe el flujo.
      reportPet(values).catch((err) => console.warn("Backend offline", err));

      handleToast("success", "¡Publicación creada con éxito!");
      setDone(true);
    },
  });

  async function handleNext() {
    const schema = STEP_SCHEMAS[step];
    const fields = STEP_FIELDS[step] ?? [];
    fields.forEach((f) => formik.setFieldTouched(f, true, false));

    if (schema) {
      try {
        await schema.validate(formik.values, { abortEarly: false });
      } catch {
        formik.validateForm();
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  if (done) {
    return (
      <main>
        <div className="page-title">
          <div className="container">
            <h1>¡Publicación enviada!</h1>
            <p>La comunidad ya puede ayudarte a encontrar a tu mascota.</p>
          </div>
        </div>
        <div className="container">
          <div className="wizard-card" style={{ textAlign: "center" }}>
            <FormStepper steps={STEPS} current={STEPS.length - 1} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/illustrations/cat-dog-amico.png"
              alt="Reporte enviado"
              className="wizard-illustration"
            />
            <p style={{ marginBottom: "1.5rem" }}>
              Vamos a notificarte ante cualquier avistaje. Mucha suerte.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => router.push("/")}
              >
                Ir al inicio
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => router.push("/mascotas-perdidas")}
              >
                Ver reportes
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Reportar mascota perdida</h1>
          <p>Completá los datos para publicarla en el listado.</p>
        </div>
      </div>

      <div className="container">
        <FormStepper steps={STEPS} current={step} />

        <form
          className="wizard-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (step === STEPS.length - 1) formik.handleSubmit();
            else handleNext();
          }}
        >
          {step === 0 && <StepStart />}
          {step === 1 && <StepData formik={formik} />}
          {step === 2 && (
            <StepPhoto formik={formik} handleFile={handleFile} />
          )}
          {step === 3 && <StepLocation formik={formik} />}
          {step === 4 && <StepContact formik={formik} />}
          {step === 5 && <StepConfirm formik={formik} />}

          <div className="wizard-nav">
            <button
              type="button"
              className="btn btn-outline"
              onClick={
                step === 0
                  ? () => router.push("/mascotas-perdidas")
                  : handleBack
              }
            >
              ← {step === 0 ? "Cancelar" : "Atrás"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Continuar →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Publicando…" : "Publicar"}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

type F = ReturnType<typeof useFormik<ReportForm>>;

function StepStart() {
  return (
    <>
      <h2 className="wizard-heading">Empecemos</h2>
      <div className="wizard-intro">
        <div className="wizard-intro-avatar">🐾</div>
        <p>
          Para <strong>reportar una mascota perdida</strong> vas a necesitar
          una foto clara, una descripción detallada, dónde se perdió y datos
          de contacto. Te guiamos paso a paso.
        </p>
      </div>
      <p style={{ fontSize: "0.9rem" }}>
        Tip: mientras más información aportes, más fácil será que alguien la
        reconozca.
      </p>
    </>
  );
}

function StepData({ formik }: { formik: F }) {
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
      </div>
    </>
  );
}

function StepPhoto({
  formik,
  handleFile,
}: {
  formik: F;
  handleFile: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <h2 className="wizard-heading">Foto de la mascota</h2>
      <div className="form-grid">
        <div className="field full">
          <label className="file-drop">
            <div className="icon">📷</div>
            <div>
              <strong>
                {formik.values.photo?.name || "Click para subir una imagen"}
              </strong>
            </div>
            <div className="hint">PNG, JPG hasta ~5 MB</div>
            <input type="file" accept="image/*" onChange={handleFile} />
          </label>
          <ShowError message={FormikHandleError(formik, "photo")} />
          {formik.values.photo?.url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={formik.values.photo.url}
              alt="Vista previa"
              className="preview"
            />
          )}
        </div>
      </div>
    </>
  );
}

function StepLocation({ formik }: { formik: F }) {
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

function StepContact({ formik }: { formik: F }) {
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

function StepConfirm({ formik }: { formik: F }) {
  const v = formik.values;
  return (
    <>
      <h2 className="wizard-heading">Revisá y publicá</h2>
      <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
        Verificá que los datos sean correctos antes de publicar.
      </p>
      <dl className="wizard-review">
        <div>
          <dt>Nombre</dt>
          <dd>{v.name || "Sin nombre"}</dd>
        </div>
        <div>
          <dt>Tipo</dt>
          <dd>{v.animalType}</dd>
        </div>
        <div>
          <dt>Fecha perdido</dt>
          <dd>{v.date}</dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd>{v.location}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{v.contactPhone}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{v.contactEmail}</dd>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <dt>Descripción</dt>
          <dd>{v.description}</dd>
        </div>
      </dl>
      {v.photo?.url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={v.photo.url} alt="Vista previa" className="preview" />
      )}
    </>
  );
}
