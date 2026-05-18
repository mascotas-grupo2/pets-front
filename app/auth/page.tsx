"use client";

import handleToast from "@/components/utils/toast";
import { useUserContext } from "@/context/UserContext";
import { confirmEmailVerification } from "@/services/auth.register";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveUser } = useUserContext();
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "failed"
  >("verifying");

  useEffect(() => {
    const token = searchParams.get("token");

    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("failed");
        handleToast(
          "error",
          "Token de verificación no encontrado.",
        );
        router.replace("/login?error=no_verification_token");
        return;
      }
      const userData = await confirmEmailVerification(token);

      if (userData?.ok) {
        saveUser(userData.data);
        setVerificationStatus("success");
        handleToast(
          "success",
          "¡Email verificado exitosamente! Redirigiendo a tu cuenta...",
        );
      } else {
        setVerificationStatus("failed");
        handleToast(
          "error",
          "Error al verificar el email. El token podría ser inválido o haber expirado.",
        );
        router.replace("/login?error=email_verification_failed");
      }
    };

    verifyEmail();
  }, [searchParams, router, saveUser]);

  const request = {
    success: {
      title: "Email verificado.",
      text: "La comunidad ya puede ayudarte.",
      textbot: "Bienvenido a Huellitas Unidas.",
      icon: "success",
    },
    failed: {
      title: "Verificación fallida.",
      text: "El token de verificación podría ser inválido o haber expirado.",
      textbot: "Por favor, intenta de nuevo.",
      icon: "error",
    },
    verifying: {
      title: "Verificando tu email...",
      text: "Ya casi terminamos",
      textbot: "Por favor, espera mientras procesamos tu solicitud.",
      icon: "info",
    },
  };

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>{request[verificationStatus].title}</h1>
          <p>{request[verificationStatus].text}</p>
        </div>
      </div>
      <div className="container">
        <div style={{ textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/illustrations/cat-dog-amico.png"
            alt="Reporte enviado"
            className="wizard-illustration"
          />
          <p style={{ marginBottom: "1.5rem" }}>
            {request[verificationStatus].textbot}
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
              className="btn btn-primary btn-sm"
              disabled={verificationStatus === "verifying"}
              onClick={() => router.push("/")}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
