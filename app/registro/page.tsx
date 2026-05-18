"use client";

import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { useUserContext } from "@/context/UserContext";
import { register } from "@/services/auth.register";
import { RegisterForm } from "@/types/register";
import { registerValidationSchema } from "@/validation/register";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Importar toast de sonner

export default function RegisterPage() {
  const router = useRouter();
  const { saveUser } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const passwordChecks = (pass: string) => ({
    length: pass.length >= 8,
    lower: /[a-z]/.test(pass),
    upper: /[A-Z]/.test(pass),
    digit: /\d/.test(pass),
    symbol: /[!@#$%^&*()_+\-={}[\]:;"'<>,.?/\\|`~]/.test(pass),
  });

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    const c = passwordChecks(pass);
    return Number(c.length) + Number(c.lower) + Number(c.upper) + Number(c.digit) + Number(c.symbol);
  };

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
        toast.error("Tenés que aceptar los términos y condiciones.");
        return;
      }
      try {
        const res = await register(values.name, values.email, values.password);
        if (res && res.ok && res.data) {
          handleToast(
            "success",
            "¡Cuenta creada! Verifique su casilla de correo electrónico para ingresar.",
          );
          setIsRegistered(true);
        } else {
          handleToast("error", "¡Error al registrarse!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Ocurrió un error al intentar registrarte.");
      }
    },
  });

  // Manejar errores de SSO desde la URL (similar a login)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ssoError = urlParams.get("error");
    if (ssoError) {
      toast.error(`Error de autenticación: ${ssoError.replace(/_/g, " ")}`);
      router.replace("/registro"); // Limpiar la URL
    }
  }, [router]);

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/sso?provider=${provider}`;
  };

  const strength = getPasswordStrength(formik.values.password);
  const checks = passwordChecks(formik.values.password);
  const strengthColors = [
    "#e0e0e0",
    "#ff4d4f",
    "#ff7a45",
    "#ffa940",
    "#73d13d",
    "#52c41a",
  ];
  const strengthLabels = ["", "Muy débil", "Débil", "Aceptable", "Segura", "Muy segura"];

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
          {isRegistered ? (
            <div className="registration-success" style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
              <h1>¡Casi listo!</h1>
              <p style={{ margin: "1.5rem 0", color: "var(--gray-600)", lineHeight: "1.6" }}>
                Hemos enviado un enlace de activación a <strong>{formik.values.email}</strong>.
                Por favor, revisá tu casilla de correo (y la carpeta de spam) para verificar tu cuenta.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: '2rem' }}>
                <Link href="/login" className="btn btn-primary btn-lg">
                  Ir al Inicio de Sesión
                </Link>
                <button
                  type="button"
                  className="btn-link btn-ghost-link btn-sm"
                  onClick={() => setIsRegistered(false)}
                  style={{ marginTop: '1rem' }}
                >
                  ¿Te equivocaste de correo? Volver a intentar
                </button>
              </div>
            </div>
          ) : (
            <>
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
              {formik.values.password && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div
                    style={{
                      height: "4px",
                      width: "100%",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(strength / 5) * 100}%`,
                        backgroundColor: strengthColors[strength],
                        transition:
                          "width 0.3s ease, background-color 0.3s ease",
                      }}
                    />
                  </div>
                  <small
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--gray-600)",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Seguridad de contraseña:{" "}
                    <strong>{strengthLabels[strength]}</strong>
                  </small>
                </div>
              )}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0.5rem 0 0 0",
                  fontSize: "0.75rem",
                  lineHeight: "1.4",
                }}
                aria-label="Requisitos de la contraseña"
              >
                {[
                  { ok: checks.length, label: "Mínimo 8 caracteres" },
                  { ok: checks.upper, label: "Una letra mayúscula" },
                  { ok: checks.lower, label: "Una letra minúscula" },
                  { ok: checks.digit, label: "Un número" },
                  { ok: checks.symbol, label: "Un símbolo (! @ # $ % & * …)" },
                ].map((r) => (
                  <li
                    key={r.label}
                    style={{
                      color: r.ok ? "#52c41a" : "var(--gray-600)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <span aria-hidden>{r.ok ? "✓" : "○"}</span>
                    <span>{r.label}</span>
                  </li>
                ))}
              </ul>
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
              <ShowError
                message={FormikHandleError(formik, "confirmPassword")}
              />
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
            <button
              type="button"
              className="auth-social-btn"
              aria-label="Google"
              onClick={() => handleSocialLogin("google")}
            >
              <span aria-hidden>G</span>
            </button>
            <button
              type="button"
              className="auth-social-btn"
              aria-label="Facebook"
              onClick={() => handleSocialLogin("facebook")}
            >
              <span aria-hidden>f</span>
            </button>
          </div>

          <div className="divider">
            ¿Ya tenés cuenta? <Link href="/login">Ingresar</Link>
          </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
