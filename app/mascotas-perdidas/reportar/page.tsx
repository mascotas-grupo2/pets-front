"use client";

import { FormStepper } from "@/components/form-stepper";
import handleToast from "@/components/utils/toast";
import { useAppDispatch } from "@/redux/hooks";
import { reportPet } from "@/services/mascotas.report";
import { ReportForm } from "@/types/reportar";
import { reportValidationSchema } from "@/validation/reportar";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
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

export default function ReportPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [stepIndex, setStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const formik = useFormik<ReportForm>({
    initialValues: INITIAL_VALUES,
    validationSchema: reportValidationSchema,
    onSubmit: async (values) => {
      const pet = buildPetFromReport(values);

      try {
        const res = await reportPet(pet);
        if (res && res.ok) {
          dispatch({ type: "pets/ReportPet", payload: res.data });
          handleToast("success", "¡Publicación creada con éxito!");
          setIsDone(true);
        }
      } catch (err) {
        console.warn("No se pudo persistir localmente", err);
      }
    },
  });

  function handleSelectFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      formik.setFieldValue("photo", {
        file,
        name: file.name,
        url: reader.result as string,
      });
    reader.readAsDataURL(file);
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
        onGoToList={() => router.push("/mascotas-perdidas")}
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
            if (isLastStep) formik.handleSubmit();
            else goToNextStep();
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
          <h1>¡Publicación enviada!</h1>
          <p>La comunidad ya puede ayudarte a encontrar a tu mascota.</p>
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
              onClick={onGoHome}
            >
              Ir al inicio
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onGoToList}
            >
              Ver reportes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
