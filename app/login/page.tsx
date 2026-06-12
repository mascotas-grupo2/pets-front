"use client";

import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { useUserContext } from "@/context/UserContext";
import { login } from "@/services/auth.login";
import { LoginForm } from "@/types/login";
import { loginValidationSchema } from "@/validation/login";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Importar toast de sonner

export default function LoginPage() {
  const router = useRouter();
  const { saveUser } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogged, setKeepLogged] = useState(true);

  const formik = useFormik<LoginForm>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        const userData = await login(values.email, values.password);
        if (userData?.ok) {
          // Mapear userData.data a tipo User si es necesario, asumiendo que login devuelve User
          saveUser(userData.data);
          const isAdmin = userData.data?.role === "admin";
          handleToast(
            "success",
            isAdmin
              ? "¡Ingreso exitoso! Redirigiendo al panel..."
              : "¡Ingreso exitoso! Redirigiendo a tu cuenta...",
          );
          router.push(isAdmin ? "/admin" : "/account");
        } else {
          if (userData?.status === 403) {
            handleToast("error", "Verificá tu email antes de iniciar sesión.");
            return;
          }
          handleToast(
            "error",
            "Credenciales inválidas. Por favor, intentá de nuevo.",
          );
        }
      } catch {
        toast.error("Ocurrió un error al intentar ingresar.");
      }
    },
  });

  // Manejar errores de SSO desde la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ssoError = urlParams.get("error");
    if (ssoError) {
      toast.error(`Error de autenticación: ${ssoError.replace(/_/g, " ")}`);
      router.replace("/login"); // Limpiar la URL
    }
  }, [router]);

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/sso?provider=${provider}`;
  };

  return (
    <main className="auth-wrap">
      <div className="auth-card auth-card-split auth-card-reverse">
        <section className="auth-form-panel">
          <h1>Ingresar a Huellitas Unidas</h1>

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

            <div className="auth-row">
              <label className="terms">
                <input
                  type="checkbox"
                  checked={keepLogged}
                  onChange={(e) => setKeepLogged(e.target.checked)}
                />
                <span>Mantener sesión iniciada</span>
              </label>
              <Link href="/forgot-password" className="terms-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg">
              Ingresar
            </button>
          </form>

          <div className="auth-divider">
            <span>O ingresá con</span>
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
            ¿No tenés cuenta? <Link href="/registro">Registrate</Link>
          </div>
        </section>

        <aside className="auth-visual">
          <div className="auth-visual-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/auth-cat.png"
              alt="Ingresá a Huellitas Unidas"
              className="auth-visual-img"
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
