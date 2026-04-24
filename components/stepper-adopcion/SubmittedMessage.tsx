import React from "react";
import { FormStepper, StepDef } from "../form-stepper";
import { useRouter } from "next/router";

const SubmittedMessage = ({steps}: {steps: StepDef[]}) => {
    const router = useRouter();
  return (
  <main>
    <div className="page-title">
      <div className="container">
        <h1>¡Gracias por aplicar!</h1>
        <p>Nos pondremos en contacto una vez que revisemos tu perfil.</p>
      </div>
    </div>
    <div className="container">
      <div className="wizard-card" style={{ textAlign: "center" }}>
        <FormStepper steps={steps} current={steps.length - 1} />
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
)}
export default SubmittedMessage;
