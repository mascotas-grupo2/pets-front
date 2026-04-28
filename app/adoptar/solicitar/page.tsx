"use client";

import { FormStepper, StepDef } from "@/components/form-stepper";
import StepAddress from "@/components/stepper-adopcion/StepAddress";
import StepAnimals from "@/components/stepper-adopcion/StepAnimals";
import StepConfirm from "@/components/stepper-adopcion/StepConfirm";
import StepHome from "@/components/stepper-adopcion/StepHome";
import StepRoommate from "@/components/stepper-adopcion/StepRoommate";
import StepStart from "@/components/stepper-adopcion/StepStart";
import SubmittedMessage from "@/components/stepper-adopcion/SubmittedMessage";
import { ErrorGeneric } from "@/components/utils/catchErrors";
import handleToast from "@/components/utils/toast";
import { useUserContext } from "@/context/UserContext";
import { submitAdoption } from "@/services/adopt.pets";
import { getUserDetails } from "@/services/user.info";
import { AdoptForm, adoptInitialValues } from "@/types/adoptar";
import { adoptFullSchema } from "@/validation/adoptar";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const STEPS: StepDef[] = [
  { key: "start", label: "Inicio", icon: "→" },
  { key: "address", label: "Dirección", icon: "📍" },
  { key: "home", label: "Hogar", icon: "🏠" },
  { key: "roommate", label: "Convivientes", icon: "👨‍👩‍👧" },
  { key: "animals", label: "Otras mascotas", icon: "🐾" },
  { key: "confirm", label: "Confirmar", icon: "✓" },
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
  return (
    <Suspense fallback={null}>
      <AdoptarSolicitarContent />
    </Suspense>
  );
}

function AdoptarSolicitarContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userId } = useUserContext();
  const searchParams = useSearchParams();
  const targetPetId = searchParams.get("pet") ?? "";
  const targetPetName = searchParams.get("name") ?? "";
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik<AdoptForm>({
    enableReinitialize: true,
    initialValues: { ...adoptInitialValues, userId },
    validationSchema: adoptFullSchema(step),
    onSubmit: async (values) => {
      try {
        const res = await submitAdoption(values);
        if (!res) return;
        if (res.ok) {
          dispatch({ type: "user/setFormAdoption", payload: res.data });
          handleToast("success", "¡Solicitud enviada con éxito!");
          setSubmitted(true);
        } else {
          handleToast(
            "error",
            `Error (${res.status}): No se pudo enviar la solicitud.`,
          );
        }
      } catch (error) {
        ErrorGeneric(error);
      }
    },
  });

  useEffect(() => {
    if (!userId) return;
    getUserDetails(userId).then((res) => {
      if (res && res.ok) {
        const { reports, messages, notifications, created_at, ...rest } =
          res.data;
        const data = Object.entries(rest).filter(([_, v]) => {
          return v != null;
        });
        data.forEach(([k, v]) => {
          
          v = v === null ? "" : v;
          formik.setFieldValue(
            k,
            k == "userId" && typeof v == "string" ? parseInt(v) : v,
          );
        });
      }
    });
  }, [userId]);

  async function handleNext() {
    const fields = STEP_FIELDS[step] ?? [];
    fields.forEach((f) => formik.setFieldTouched(f, true, false));
    try {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length == 0) {
        formik.setErrors({});
        formik.setTouched({});
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
      } else {
        handleToast(
          "error",
          "Por favor corregí los errores antes de continuar.",
        );
      }
    } catch (error) {
      console.error("Error de validación:", error);
      handleToast("error", "Por favor corregí los errores antes de continuar.");
      return;
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  if (submitted) {
    return <SubmittedMessage steps={STEPS} />;
  }

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>
            {targetPetName
              ? `Solicitud para adoptar a ${targetPetName}`
              : "Solicitud de adopción"}
          </h1>
          <p>Contanos un poco sobre vos para poder emparejarte mejor.</p>
        </div>
      </div>

      <div className="container">
        {targetPetId && (
          <div className="adopt-target-chip">
            Aplicando a <strong>{targetPetName || targetPetId}</strong>
            {" · "}
            <a
              href={`/mascotas-perdidas/${targetPetId}`}
              style={{ color: "var(--primary-500)", fontWeight: 600 }}
            >
              Ver publicación
            </a>
          </div>
        )}
        <FormStepper steps={STEPS} current={step} />

        <form
          className="wizard-card"
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
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
                onClick={() => formik.handleSubmit()}
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
