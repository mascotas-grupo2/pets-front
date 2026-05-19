"use client";

import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { resetPassword } from "@/services/auth.login";
import { useFormik } from "formik";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";

export default function ResetPasswordPage() {
  const params = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    return (
      Number(c.length) +
      Number(c.lower) +
      Number(c.upper) +
      Number(c.digit) +
      Number(c.symbol)
    );
  };

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Mínimo 8 caracteres")
        .required("La contraseña es requerida"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
        .required("Confirmar contraseña es requerido"),
    }),
    onSubmit: async (values) => {
      const token = params.id as string;
      const res = await resetPassword(token, values.password);

      if (res?.ok) {
        handleToast("success", "Contraseña actualizada correctamente.");
        setIsSuccess(true);
      } else {
        handleToast("error", "El enlace ha expirado o es inválido.");
      }
    },
  });

  const strength = getPasswordStrength(formik.values.password);
  const checks = passwordChecks(formik.values.password);
  const strengthColors = ["#e0e0e0", "#ff4d4f", "#ff7a45", "#ffa940", "#73d13d", "#52c41a"];
  const strengthLabels = ["", "Muy débil", "Débil", "Aceptable", "Segura", "Muy segura"];

  return (
    <main className="auth-wrap">
      <div className="auth-card auth-card-split">
        <aside className="auth-visual">
          <div className="auth-visual-art">
            <img
              src="/images/auth-dog.png"
              alt="Nueva contraseña"
              className="auth-visual-img"
            />
          </div>
        </aside>

        <section className="auth-form-panel">
          {isSuccess ? (
            <div className="registration-success" style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h1>¡Todo listo!</h1>
              <p style={{ margin: "1.5rem 0", color: "var(--gray-600)" }}>
                Tu contraseña ha sido actualizada. Ahora podés ingresar con tus nuevas credenciales.
              </p>
              <Link href="/login" className="btn btn-primary btn-lg">
                Ir al Inicio de Sesión
              </Link>
            </div>
          ) : (
            <>
              <h1>Nueva contraseña</h1>
              <p style={{ color: "var(--gray-600)", marginBottom: "2rem" }}>
                Elegí una contraseña segura que no hayas usado anteriormente.
              </p>

              <form className="auth-form" onSubmit={formik.handleSubmit}>
                <div className="field">
                  <label className="field-label" htmlFor="password">Nueva Contraseña</label>
                  <div className="input-icon">
                    <span className="input-icon-leading" aria-hidden>🔑</span>
                    <input
                      id="password"
                      className="input"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formik.values.password}
                      onChange={(e) => FormikHandleChange(formik, "password", e)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="input-icon-trailing"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {formik.values.password && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <div style={{ height: "4px", width: "100%", backgroundColor: "#f0f0f0", borderRadius: "2px" }}>
                        <div style={{
                          height: "100%",
                          width: `${(strength / 5) * 100}%`,
                          backgroundColor: strengthColors[strength],
                          transition: "all 0.3s"
                        }} />
                      </div>
                      <small style={{ fontSize: "0.75rem", color: "var(--gray-600)", marginTop: "4px", display: "block" }}>
                        Seguridad: <strong>{strengthLabels[strength]}</strong>
                      </small>
                    </div>
                  )}

                  <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem", fontSize: "0.75rem" }}>
                    {[
                      { ok: checks.length, label: "Mínimo 8 caracteres" },
                      { ok: checks.upper, label: "Una mayúscula" },
                      { ok: checks.digit, label: "Un número" },
                      { ok: checks.symbol, label: "Un símbolo" },
                    ].map((r) => (
                      <li key={r.label} style={{ color: r.ok ? "#52c41a" : "var(--gray-600)", display: "flex", gap: "0.4rem" }}>
                        <span>{r.ok ? "✓" : "○"}</span> {r.label}
                      </li>
                    ))}
                  </ul>
                  <ShowError message={FormikHandleError(formik, "password")} />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <div className="input-icon">
                    <span className="input-icon-leading" aria-hidden>🔑</span>
                    <input
                      id="confirmPassword"
                      className="input"
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formik.values.confirmPassword}
                      onChange={(e) => FormikHandleChange(formik, "confirmPassword", e)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="input-icon-trailing"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <ShowError message={FormikHandleError(formik, "confirmPassword")} />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }}>
                  Restablecer contraseña
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
