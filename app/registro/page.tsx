"use client";

import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { useAppDispatch } from "@/redux/hooks";
import { register } from "@/services/auth.register";
import { RegisterForm } from "@/types/register";
import { registerValidationSchema } from "@/validation/register";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const formik = useFormik<RegisterForm>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      if (!acceptTerms) {
        handleToast("error", "Tenés que aceptar los términos y condiciones.");
        return;
      }
      try {
        const userData = await register(values.name, values.email, values.password);
        if (userData) {
          handleToast("success", "Registro exitoso. Redirigiendo...");
          dispatch({ type: "SET_USER", payload: userData });
          router.push("/account");
        } else {
          handleToast("error", "No se pudo crear la cuenta. Intentá de nuevo.");
        }
      } catch (error) {
        console.error(error);
        handleToast("error", "Ocurrió un error al intentar registrarte.");
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
              alt="Registrate ahora en Huellitas Unidas"
              className="auth-visual-img"
            />
          </div>
        </aside>

        <section className="auth-form-panel">
          <h1>Crea tu cuenta</h1>

          <form className="auth-form" onSubmit={formik.handleSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="name">
                Nombre
              </label>
              <div className="input-icon">
                <span className="input-icon-leading" aria-hidden>
                  👤
                </span>
                <input
                  id="name"
                  className="input"
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={(e) => FormikHandleChange(formik, "name", e)}
                  placeholder="Tu nombre"
                />
              </div>
              <ShowError message={FormikHandleError(formik, "name")} />
            </div>

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

            <div className="field">
              <label className="field-label" htmlFor="password">
                Contraseña
              </label>
              <div className="input-icon">
                <span className="input-icon-leading" aria-hidden>
                  🔑
                </span>
                <input
                  id="password"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={(e) => FormikHandleChange(formik, "password", e)}
                  name="password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="input-icon-trailing"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <ShowError message={FormikHandleError(formik, "password")} />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="confirmPassword">
                Confirmar contraseña
              </label>
              <div className="input-icon">
                <span className="input-icon-leading" aria-hidden>
                  🔑
                </span>
                <input
                  id="confirmPassword"
                  className="input"
                  type={showConfirm ? "text" : "password"}
                  value={formik.values.confirmPassword}
                  onChange={(e) =>
                    FormikHandleChange(formik, "confirmPassword", e)
                  }
                  name="confirmPassword"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="input-icon-trailing"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={
                    showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              <ShowError message={FormikHandleError(formik, "confirmPassword")} />
            </div>

            <label className="terms">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>
                Acepto los{" "}
                <Link href="#" className="terms-link">
                  Términos y Condiciones
                </Link>
              </span>
            </label>

            <button type="submit" className="btn btn-primary btn-lg">
              Crear cuenta
            </button>
          </form>

          <div className="auth-divider">
            <span>O registrate con</span>
          </div>

          <div className="auth-social">
            <button type="button" className="auth-social-btn" aria-label="Google">
              <span aria-hidden>G</span>
            </button>
            <button type="button" className="auth-social-btn" aria-label="Facebook">
              <span aria-hidden>f</span>
            </button>
          </div>

          <div className="divider">
            ¿Ya tenés cuenta? <Link href="/login">Ingresar</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
