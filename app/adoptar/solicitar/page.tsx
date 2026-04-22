"use client";

import { FormStepper, StepDef } from "@/components/form-stepper";
import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { submitAdoption } from "@/services/adopt.pets";
import { AdoptForm, adoptInitialValues } from "@/types/adoptar";
import {
  adoptAddressSchema,
  adoptFullSchema,
  adoptHomeSchema,
  adoptOtherAnimalsSchema,
  adoptRoommateSchema,
  adoptStartSchema,
} from "@/validation/adoptar";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS: StepDef[] = [
  { key: "start", label: "Inicio", icon: "→" },
  { key: "address", label: "Dirección", icon: "📍" },
  { key: "home", label: "Hogar", icon: "🏠" },
  { key: "roommate", label: "Convivientes", icon: "👨‍👩‍👧" },
  { key: "animals", label: "Otras mascotas", icon: "🐾" },
  { key: "confirm", label: "Confirmar", icon: "✓" },
];

const STEP_SCHEMAS = [
  adoptStartSchema,
  adoptAddressSchema,
  adoptHomeSchema,
  adoptRoommateSchema,
  adoptOtherAnimalsSchema,
  null,
];

const STEP_FIELDS: (keyof AdoptForm)[][] = [
  [
    "preferredAnimal",
    "firstName",
    "lastName",
    "email",
    "phone",
    "acceptsTerms",
  ],
  ["addressLine1", "addressLine2", "postcode", "town"],
  ["hasGarden", "livingSituation", "householdSetting", "activityLevel"],
  ["adults", "children", "visitingChildren", "hasFlatmates"],
  [
    "allergies",
    "otherAnimals",
    "otherAnimalsDetail",
    "neutered",
    "vaccinated",
    "experience",
  ],
  [],
];

export default function AdoptarSolicitarPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik<AdoptForm>({
    initialValues: adoptInitialValues,
    validationSchema: adoptFullSchema,
    onSubmit: async (values) => {
      try {
        await submitAdoption(values);
        handleToast("success", "¡Solicitud enviada con éxito!");
        setSubmitted(true);
      } catch (err) {
        console.error(err);
        handleToast(
          "error",
          "No pudimos enviar la solicitud. Intentá de nuevo.",
        );
      }
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

  if (submitted) {
    return (
      <main>
        <div className="page-title">
          <div className="container">
            <h1>¡Gracias por aplicar!</h1>
            <p>Nos pondremos en contacto una vez que revisemos tu perfil.</p>
          </div>
        </div>
        <div className="container">
          <div
            className="wizard-card"
            style={{ textAlign: "center" }}
          >
            <FormStepper steps={STEPS} current={STEPS.length - 1} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/illustrations/dog-paw-rafiki.png"
              alt="¡Nos vemos pronto!"
              className="wizard-illustration"
            />
            <p style={{ marginBottom: "1.5rem" }}>
              Queremos asegurarnos de darte la mejor chance de encontrar a la
              mascota ideal para tu familia.
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
                onClick={() => router.push("/account")}
              >
                Ir a mi perfil
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
          <h1>Solicitud de adopción</h1>
          <p>Contanos un poco sobre vos para poder emparejarte mejor.</p>
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
          {step === 0 && <StepStart formik={formik} />}
          {step === 1 && <StepAddress formik={formik} />}
          {step === 2 && <StepHome formik={formik} />}
          {step === 3 && <StepRoommate formik={formik} />}
          {step === 4 && <StepAnimals formik={formik} />}
          {step === 5 && <StepConfirm values={formik.values} />}

          <div className="wizard-nav">
            <button
              type="button"
              className="btn btn-outline"
              onClick={step === 0 ? () => router.push("/adoptar") : handleBack}
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
                {formik.isSubmitting ? "Enviando…" : "Enviar solicitud"}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

type F = ReturnType<typeof useFormik<AdoptForm>>;

function StepStart({ formik }: { formik: F }) {
  return (
    <>
      <h2 className="wizard-heading">Empecemos</h2>
      <div className="wizard-intro">
        <div className="wizard-intro-avatar">🐶</div>
        <p>
          Para aplicar a <strong>adoptar una mascota</strong> necesitamos que
          completes algunos datos. Tardás unos minutos y podés volver a editar
          tu perfil más tarde.
        </p>
      </div>

      <div className="form-grid">
        <div className="field">
          <label className="field-label">Nombre *</label>
          <input
            className="input"
            type="text"
            name="firstName"
            value={formik.values.firstName}
            onChange={(e) => FormikHandleChange(formik, "firstName", e)}
            placeholder="Ej: Samanta"
          />
          <ShowError message={FormikHandleError(formik, "firstName")} />
        </div>

        <div className="field">
          <label className="field-label">Apellido *</label>
          <input
            className="input"
            type="text"
            name="lastName"
            value={formik.values.lastName}
            onChange={(e) => FormikHandleChange(formik, "lastName", e)}
            placeholder="Ej: Smith"
          />
          <ShowError message={FormikHandleError(formik, "lastName")} />
        </div>

        <div className="field">
          <label className="field-label">Email *</label>
          <input
            className="input"
            type="email"
            name="email"
            value={formik.values.email}
            onChange={(e) => FormikHandleChange(formik, "email", e)}
            placeholder="tu@email.com"
          />
          <ShowError message={FormikHandleError(formik, "email")} />
        </div>

        <div className="field">
          <label className="field-label">Teléfono *</label>
          <input
            className="input"
            type="text"
            name="phone"
            value={formik.values.phone}
            onChange={(e) => FormikHandleChange(formik, "phone", e)}
            placeholder="+54 11 5555-5555"
          />
          <ShowError message={FormikHandleError(formik, "phone")} />
        </div>

        <div className="field full">
          <label className="field-label">Qué mascota querés adoptar *</label>
          <select
            className="select"
            name="preferredAnimal"
            value={formik.values.preferredAnimal}
            onChange={(e) => FormikHandleChange(formik, "preferredAnimal", e)}
          >
            <option value="">Seleccionar…</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>
          <ShowError message={FormikHandleError(formik, "preferredAnimal")} />
        </div>

        <div className="field full">
          <label className="terms">
            <input
              type="checkbox"
              checked={formik.values.acceptsTerms}
              onChange={(e) => {
                formik.setFieldValue("acceptsTerms", e.target.checked);
                formik.setFieldTouched("acceptsTerms", true);
              }}
            />
            <span>
              Leí y acepto los términos y la{" "}
              <a href="#" className="terms-link">
                Política de privacidad
              </a>
            </span>
          </label>
          <ShowError message={FormikHandleError(formik, "acceptsTerms")} />
        </div>
      </div>
    </>
  );
}

function StepAddress({ formik }: { formik: F }) {
  return (
    <>
      <h2 className="wizard-heading">Tu dirección</h2>
      <p style={{ fontSize: "0.9rem", marginBottom: "1.25rem" }}>
        Estos datos son necesarios para poder aplicar a una adopción. Podés
        buscar tu dirección en Google Maps y completamos el resto.
      </p>

      <div className="form-grid">
        <div className="field full">
          <label className="field-label">Dirección (línea 1) *</label>
          <input
            className="input"
            type="text"
            name="addressLine1"
            value={formik.values.addressLine1}
            onChange={(e) => FormikHandleChange(formik, "addressLine1", e)}
            placeholder="Calle y número"
          />
          <ShowError message={FormikHandleError(formik, "addressLine1")} />
        </div>

        <div className="field">
          <label className="field-label">Dirección (línea 2)</label>
          <input
            className="input"
            type="text"
            name="addressLine2"
            value={formik.values.addressLine2}
            onChange={(e) => FormikHandleChange(formik, "addressLine2", e)}
            placeholder="Piso, dpto, referencia"
          />
        </div>

        <div className="field">
          <label className="field-label">Código postal *</label>
          <input
            className="input"
            type="text"
            name="postcode"
            value={formik.values.postcode}
            onChange={(e) => FormikHandleChange(formik, "postcode", e)}
            placeholder="Ej: 1425"
          />
          <ShowError message={FormikHandleError(formik, "postcode")} />
        </div>

        <div className="field full">
          <label className="field-label">Ciudad *</label>
          <input
            className="input"
            type="text"
            name="town"
            value={formik.values.town}
            onChange={(e) => FormikHandleChange(formik, "town", e)}
            placeholder="Ej: CABA"
          />
          <ShowError message={FormikHandleError(formik, "town")} />
        </div>
      </div>
    </>
  );
}

function StepHome({ formik }: { formik: F }) {
  return (
    <>
      <h2 className="wizard-heading">Sobre tu hogar</h2>
      <div className="form-grid">
        <div className="field full">
          <label className="field-label">¿Tenés jardín o patio? *</label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="hasGarden"
                checked={formik.values.hasGarden === "si"}
                onChange={() => formik.setFieldValue("hasGarden", "si")}
              />
              Sí
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="hasGarden"
                checked={formik.values.hasGarden === "no"}
                onChange={() => formik.setFieldValue("hasGarden", "no")}
              />
              No
            </label>
          </div>
          <ShowError message={FormikHandleError(formik, "hasGarden")} />
        </div>

        <div className="field">
          <label className="field-label">Tipo de vivienda *</label>
          <select
            className="select"
            name="livingSituation"
            value={formik.values.livingSituation}
            onChange={(e) => FormikHandleChange(formik, "livingSituation", e)}
          >
            <option value="">Seleccionar…</option>
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="phd">PH / Duplex</option>
            <option value="quinta">Quinta</option>
            <option value="otro">Otro</option>
          </select>
          <ShowError message={FormikHandleError(formik, "livingSituation")} />
        </div>

        <div className="field">
          <label className="field-label">Entorno *</label>
          <select
            className="select"
            name="householdSetting"
            value={formik.values.householdSetting}
            onChange={(e) => FormikHandleChange(formik, "householdSetting", e)}
          >
            <option value="">Seleccionar…</option>
            <option value="urbano">Urbano</option>
            <option value="suburbano">Suburbano</option>
            <option value="rural">Rural</option>
          </select>
          <ShowError message={FormikHandleError(formik, "householdSetting")} />
        </div>

        <div className="field full">
          <label className="field-label">Nivel de actividad del hogar *</label>
          <select
            className="select"
            name="activityLevel"
            value={formik.values.activityLevel}
            onChange={(e) => FormikHandleChange(formik, "activityLevel", e)}
          >
            <option value="">Seleccionar…</option>
            <option value="tranquilo">Tranquilo</option>
            <option value="moderado">Moderado</option>
            <option value="activo">Muy activo</option>
          </select>
          <ShowError message={FormikHandleError(formik, "activityLevel")} />
        </div>
      </div>
    </>
  );
}

function StepRoommate({ formik }: { formik: F }) {
  return (
    <>
      <h2 className="wizard-heading">Convivientes</h2>
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Cantidad de adultos *</label>
          <input
            className="input"
            type="number"
            min={0}
            name="adults"
            value={formik.values.adults}
            onChange={(e) =>
              formik.setFieldValue("adults", Number(e.target.value))
            }
          />
          <small style={{ color: "var(--gray-500)", fontSize: "0.8rem" }}>
            Debe vivir al menos un adulto en el hogar
          </small>
          <ShowError message={FormikHandleError(formik, "adults")} />
        </div>

        <div className="field">
          <label className="field-label">Cantidad de niños *</label>
          <input
            className="input"
            type="number"
            min={0}
            name="children"
            value={formik.values.children}
            onChange={(e) =>
              formik.setFieldValue("children", Number(e.target.value))
            }
          />
          <ShowError message={FormikHandleError(formik, "children")} />
        </div>

        <div className="field full">
          <label className="field-label">
            ¿Reciben visitas de niños frecuentemente? *
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="visitingChildren"
                checked={formik.values.visitingChildren === "si"}
                onChange={() =>
                  formik.setFieldValue("visitingChildren", "si")
                }
              />
              Sí
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="visitingChildren"
                checked={formik.values.visitingChildren === "no"}
                onChange={() =>
                  formik.setFieldValue("visitingChildren", "no")
                }
              />
              No
            </label>
          </div>
          <ShowError message={FormikHandleError(formik, "visitingChildren")} />
        </div>

        <div className="field full">
          <label className="field-label">
            ¿Vivís con compañeros de piso o inquilinos? *
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="hasFlatmates"
                checked={formik.values.hasFlatmates === "si"}
                onChange={() => formik.setFieldValue("hasFlatmates", "si")}
              />
              Sí
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="hasFlatmates"
                checked={formik.values.hasFlatmates === "no"}
                onChange={() => formik.setFieldValue("hasFlatmates", "no")}
              />
              No
            </label>
          </div>
          <ShowError message={FormikHandleError(formik, "hasFlatmates")} />
        </div>
      </div>
    </>
  );
}

function StepAnimals({ formik }: { formik: F }) {
  return (
    <>
      <h2 className="wizard-heading">Otras mascotas</h2>
      <div className="form-grid">
        <div className="field full">
          <label className="field-label">
            ¿Alguien del hogar es alérgico a animales?
          </label>
          <textarea
            className="textarea"
            name="allergies"
            value={formik.values.allergies}
            onChange={(e) => FormikHandleChange(formik, "allergies", e)}
            placeholder="Contanos los detalles, si corresponde"
          />
        </div>

        <div className="field full">
          <label className="field-label">
            ¿Hay otras mascotas en tu hogar? *
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="otherAnimals"
                checked={formik.values.otherAnimals === "si"}
                onChange={() => formik.setFieldValue("otherAnimals", "si")}
              />
              Sí
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="otherAnimals"
                checked={formik.values.otherAnimals === "no"}
                onChange={() => formik.setFieldValue("otherAnimals", "no")}
              />
              No
            </label>
          </div>
          <ShowError message={FormikHandleError(formik, "otherAnimals")} />
        </div>

        {formik.values.otherAnimals === "si" && (
          <div className="field full">
            <label className="field-label">
              Detalle: especie, edad y género
            </label>
            <textarea
              className="textarea"
              name="otherAnimalsDetail"
              value={formik.values.otherAnimalsDetail}
              onChange={(e) =>
                FormikHandleChange(formik, "otherAnimalsDetail", e)
              }
              placeholder="Ej: perro, 4 años, macho castrado"
            />
          </div>
        )}

        <div className="field">
          <label className="field-label">¿Están castradas? *</label>
          <div className="radio-row">
            {(["si", "no", "na"] as const).map((v) => (
              <label className="radio-opt" key={v}>
                <input
                  type="radio"
                  name="neutered"
                  checked={formik.values.neutered === v}
                  onChange={() => formik.setFieldValue("neutered", v)}
                />
                {v === "si" ? "Sí" : v === "no" ? "No" : "No aplica"}
              </label>
            ))}
          </div>
          <ShowError message={FormikHandleError(formik, "neutered")} />
        </div>

        <div className="field">
          <label className="field-label">
            ¿Están vacunadas (últimos 12 meses)? *
          </label>
          <div className="radio-row">
            {(["si", "no", "na"] as const).map((v) => (
              <label className="radio-opt" key={v}>
                <input
                  type="radio"
                  name="vaccinated"
                  checked={formik.values.vaccinated === v}
                  onChange={() => formik.setFieldValue("vaccinated", v)}
                />
                {v === "si" ? "Sí" : v === "no" ? "No" : "No aplica"}
              </label>
            ))}
          </div>
          <ShowError message={FormikHandleError(formik, "vaccinated")} />
        </div>

        <div className="field full">
          <label className="field-label">
            Contanos sobre tu experiencia previa con mascotas y el hogar que
            vas a ofrecer
          </label>
          <textarea
            className="textarea"
            name="experience"
            value={formik.values.experience}
            onChange={(e) => FormikHandleChange(formik, "experience", e)}
            placeholder="Tu historia ayuda a encontrar el match ideal"
          />
        </div>
      </div>
    </>
  );
}

function StepConfirm({ values }: { values: AdoptForm }) {
  return (
    <>
      <h2 className="wizard-heading">Revisá y confirmá</h2>
      <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
        Si todo está bien, enviá tu solicitud y nos pondremos en contacto.
      </p>
      <dl className="wizard-review">
        <div>
          <dt>Nombre</dt>
          <dd>
            {values.firstName} {values.lastName}
          </dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{values.email}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{values.phone}</dd>
        </div>
        <div>
          <dt>Mascota preferida</dt>
          <dd>{values.preferredAnimal || "—"}</dd>
        </div>
        <div>
          <dt>Dirección</dt>
          <dd>
            {values.addressLine1}
            {values.addressLine2 ? `, ${values.addressLine2}` : ""} —{" "}
            {values.town} ({values.postcode})
          </dd>
        </div>
        <div>
          <dt>Vivienda</dt>
          <dd>
            {values.livingSituation || "—"} · {values.householdSetting || "—"}
          </dd>
        </div>
        <div>
          <dt>Jardín</dt>
          <dd>{values.hasGarden === "si" ? "Sí" : "No"}</dd>
        </div>
        <div>
          <dt>Nivel de actividad</dt>
          <dd>{values.activityLevel || "—"}</dd>
        </div>
        <div>
          <dt>Adultos / Niños</dt>
          <dd>
            {values.adults} / {values.children}
          </dd>
        </div>
        <div>
          <dt>Otras mascotas</dt>
          <dd>{values.otherAnimals === "si" ? "Sí" : "No"}</dd>
        </div>
      </dl>
    </>
  );
}
