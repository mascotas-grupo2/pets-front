"use client";

import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import { useUserContext } from "@/context/UserContext";
import { useAppDispatch } from "@/redux/hooks";
import { register } from "@/services/auth.register";
import { User } from "@/types/user";
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

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    return score;
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
          // Mapear res.data a tipo User si es necesario, asumiendo que register devuelve User
          saveUser(res.data as User); 
          toast.success("Registro exitoso. Redirigiendo...");
          router.push("/account");
        } else {
          toast.error("No se pudo crear la cuenta. Intentá de nuevo.");
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
      toast.error(`Error de autenticación: ${ssoError.replace(/_/g, ' ')}`);
      router.replace("/registro"); // Limpiar la URL
    }
  }, [router]);

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/sso?provider=${provider}`;
  };

  const strength = getPasswordStrength(formik.values.password);
  const strengthColors = ["#e0e0e0", "#ff4d4f", "#ffa940", "#faad14", "#52c41a"];
  const strengthLabels = ["", "Muy débil", "Débil", "Segura", "Muy segura"];

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
                        width: `${(strength / 4) * 100}%`,
                        backgroundColor: strengthColors[strength],
                        transition: "width 0.3s ease, background-color 0.3s ease",
                      }}
                    />
                  </div>
                  <small style={{ fontSize: "0.75rem", color: "var(--gray-600)", marginTop: "4px", display: "block" }}>
                    Seguridad de contraseña: <strong>{strengthLabels[strength]}</strong>
                  </small>
                </div>
              )}
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
        </section>
      </div>
    </main>
  );
}
