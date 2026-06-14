"use client";

import { FormStepper } from "@/components/form-stepper";
import handleToast from "@/components/utils/toast";
import { useAppDispatch } from "@/redux/hooks";
import { reportPet } from "@/services/mascotas.report";
import { ReportForm } from "@/types/reportar";
import { reportValidationSchema } from "@/validation/reportar";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { buildPetFromReport } from "./build-pet";
import {
  CharacteristicsStep,
  ConfirmStep,
  ContactStep,
  DataStep,
  DetailsStep,
  LocationStep,
  PhotoStep,
  StartStep,
} from "./steps";
import { INITIAL_VALUES, LAST_STEP_INDEX, STEPS } from "./wizard-config";
import { getUserDetails } from "@/services/user.info";
import { useUserContext } from "@/context/UserContext";

const DRAFT_KEY = "report-draft";

export default function ReportPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useUserContext();
  const [stepIndex, setStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const formik = useFormik<ReportForm>({
    initialValues: INITIAL_VALUES,
    validationSchema: reportValidationSchema,
    onSubmit: async (values) => {
      const pet = buildPetFromReport(values);
      try {
        // optimista: mostrar localmente
        dispatch({ type: "pets/ReportPet", payload: pet });
        const res = await reportPet(values);
        if (res.ok) {
          dispatch({ type: "pets/ReportPet", payload: res.data });
          localStorage.removeItem(DRAFT_KEY);
          handleToast("success", "¡Reporte enviado! Queda pendiente de revisión.");
          setIsDone(true);
        } else {
          handleToast("error", res.error ?? "No se pudo crear la publicación");
        }
      } catch (err) {
        console.warn("Error enviando reporte", err);
        handleToast("error", "No se pudo crear la publicación");
      }
    },
  });

  useEffect(() => {
    if (!isLoggedIn) return;

    getUserDetails().then((res) => {
      if (res && res.ok) {
        formik.setValues((prev) => ({
          ...prev,
          contactEmail: prev.contactEmail || res.data.email || "",
          contactPhone: prev.contactPhone || res.data.phone || "",
        }));
      }
    });
  }, [isLoggedIn]);

  // Borrador: restaurar al entrar y autoguardar (sin las fotos, que son archivos).
  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) : null;
    if (raw) {
      try {
        formik.setValues((prev) => ({ ...prev, ...JSON.parse(raw) }));
      } catch {
        /* borrador corrupto: lo ignoramos */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { photos: _photos, ...rest } = formik.values;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
  }, [formik.values]);

  function handleSelectFile(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Crear preview URLs sin base64 (usando object URLs)
    const uploads = files.map((file) => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    const existing = formik.values.photos || [];
    formik.setFieldValue("photos", [...existing, ...uploads]);
  }

  async function goToNextStep() {
    const step = STEPS[stepIndex];
    if (!step) return;

    step.fields.forEach((f) => formik.setFieldTouched(f, true, false));

    if (step.schema) {
      try {
        await step.schema.validate(formik.values, { abortEarly: false });
      } catch {
        formik.validateForm();
        return;
      }
    }
    setStepIndex((i) => Math.min(i + 1, LAST_STEP_INDEX));
  }

  function goToPreviousStep() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  if (isDone) {
    return (
      <DoneScreen
        onGoHome={() => router.push("/")}
        onGoToList={() => router.push("/account?tab=reports")}
      />
    );
  }

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === LAST_STEP_INDEX;
  const currentKey = STEPS[stepIndex]?.key ?? "start";

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Reportar mascota perdida</h1>
          <p>Completá los datos para publicarla en el listado.</p>
        </div>
      </div>

      <div className="container">
        <FormStepper steps={STEPS} current={stepIndex} />

        <form
          className="wizard-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isLastStep) goToNextStep();
          }}
        >
          <CurrentStep
            stepKey={currentKey}
            formik={formik}
            onSelectFile={handleSelectFile}
          />

          <div className="wizard-nav">
            <button
              type="button"
              className="btn btn-outline"
              onClick={
                isFirstStep
                  ? () => router.push("/mascotas-perdidas")
                  : goToPreviousStep
              }
            >
              ← {isFirstStep ? "Cancelar" : "Atrás"}
            </button>

            {!isLastStep ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={goToNextStep}
              >
                Continuar →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => formik.handleSubmit()}
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

function CurrentStep({
  stepKey,
  formik,
  onSelectFile,
}: {
  stepKey: string;
  formik: ReturnType<typeof useFormik<ReportForm>>;
  onSelectFile: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  switch (stepKey) {
    case "start":
      return <StartStep />;
    case "data":
      return <DataStep formik={formik} />;
    case "characteristics":
      return <CharacteristicsStep formik={formik} />;
    case "photo":
      return <PhotoStep formik={formik} onSelectFile={onSelectFile} />;
    case "details":
      return <DetailsStep formik={formik} />;
    case "location":
      return <LocationStep formik={formik} />;
    case "contact":
      return <ContactStep formik={formik} />;
    case "confirm":
      return <ConfirmStep values={formik.values} />;
    default:
      return null;
  }
}

function DoneScreen({
  onGoHome,
  onGoToList,
}: {
  onGoHome: () => void;
  onGoToList: () => void;
}) {
  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>¡Reporte enviado!</h1>
          <p>Queda pendiente de revisión antes de aparecer en el listado.</p>
        </div>
      </div>
      <div className="container">
        <div className="wizard-card" style={{ textAlign: "center" }}>
          <FormStepper steps={STEPS} current={LAST_STEP_INDEX} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/illustrations/cat-dog-amico.png"
            alt="Reporte enviado"
            className="wizard-illustration"
          />
          <p style={{ marginBottom: "1.5rem" }}>
            Un administrador va a revisar tu publicación. Cuando se apruebe vas a
            recibir una notificación y va a aparecer en el listado. Mientras
            tanto podés seguirla desde <strong>Mis Reportes</strong>.
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
              onClick={onGoHome}
            >
              Ir al inicio
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onGoToList}
            >
              Ver mis reportes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
