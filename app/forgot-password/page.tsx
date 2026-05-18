"use client";

import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { forgotPassword } from "@/services/auth.login";
import { useFormik } from "formik";
import Link from "next/link";
import { useState } from "react";
import * as Yup from "yup";

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Email inválido")
        .required("El email es requerido"),
    }),
    onSubmit: async (values) => {
      try {
        // Aquí se llamaría al servicio de backend para enviar el correo de recuperación
        console.log("Solicitando recuperación para:", values.email);
        await forgotPassword(values.email);
        handleToast(
          "success",
          "Si el correo está registrado, recibirás instrucciones en breve.",
        );
        setIsSent(true);
      } catch (error) {
        handleToast("error", "Ocurrió un error al procesar la solicitud.");
      }
    },
  });

  return (
    <main className="auth-wrap">
      <div className="auth-card auth-card-split">
        <aside className="auth-visual">
          <div className="auth-visual-art">
            <img
              src="/images/auth-dog.png"
              alt="Recuperar contraseña"
              className="auth-visual-img"
            />
          </div>
        </aside>

        <section className="auth-form-panel">
          {isSent ? (
            <div
              className="registration-success"
              style={{ textAlign: "center", padding: "2rem 0" }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📩</div>
              <h1>Revisá tu correo</h1>
              <p
                style={{
                  margin: "1.5rem 0",
                  color: "var(--gray-600)",
                  lineHeight: "1.6",
                }}
              >
                Hemos enviado las instrucciones para restablecer tu contraseña a{" "}
                <strong>{formik.values.email}</strong>. No olvides revisar la
                carpeta de spam.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  marginTop: "2rem",
                }}
              >
                <Link href="/login" className="btn btn-primary btn-lg">
                  Volver al Inicio de Sesión
                </Link>
                <button
                  type="button"
                  className="btn-link btn-ghost-link btn-sm"
                  onClick={() => setIsSent(false)}
                >
                  Intentar con otro correo
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1>Recuperar contraseña</h1>
              <p style={{ color: "var(--gray-600)", marginBottom: "2rem" }}>
                Ingresá tu email y te enviaremos un enlace para que puedas
                generar una nueva contraseña.
              </p>

              <form className="auth-form" onSubmit={formik.handleSubmit}>
                <div className="field">
                  <label className="field-label" htmlFor="email">
                    Email
                  </label>
                  <div className="input-icon">
                    <span className="input-icon-leading" aria-hidden>
                      ✉️
                    </span>
                    <input
                      id="email"
                      className="input"
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={(e) => FormikHandleChange(formik, "email", e)}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <ShowError message={FormikHandleError(formik, "email")} />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ marginTop: "1rem" }}
                >
                  Enviar instrucciones
                </button>
              </form>

              <div className="divider" style={{ marginTop: "2.5rem" }}>
                ¿Te acordaste de la clave? <Link href="/login">Ingresar</Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
