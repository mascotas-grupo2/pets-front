"use client";

import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { useAppDispatch } from "@/redux/hooks";
import { register } from "@/services/service.register";
import { RegisterForm } from "@/types/register";
import { registerValidationSchema } from "@/validation/register";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const formik = useFormik<RegisterForm>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
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
      <div className="auth-card">
        <h1>Registrarme</h1>
        <p className="sub">Creá tu cuenta en Furry Friends</p>
        <form className="auth-form" onSubmit={formik.handleSubmit}>
          <div className="field">
            <label className="field-label">Nombre</label>
            <input
              className="input"
              type="text"
              name="name"
              value={formik.values.name}
              onChange={(e) => FormikHandleChange(formik, "name", e)}
              placeholder="Tu nombre"
            />
            <ShowError message={FormikHandleError(formik, "name")} />
          </div>

          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={formik.values.email}
              onChange={(e) => FormikHandleChange(formik, "email", e)}
              placeholder="tu@email.com"
            />
            <ShowError message={FormikHandleError(formik, "email")} />
          </div>

          <div className="field">
            <label className="field-label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={formik.values.password}
              onChange={(e) => FormikHandleChange(formik, "password", e)}
              name="password"
              placeholder="••••••••"
            />
            <ShowError message={FormikHandleError(formik, "password")} />
          </div>

          <div className="field">
            <label className="field-label">Confirmar contraseña</label>
            <input
              className="input"
              type="password"
              value={formik.values.confirmPassword}
              onChange={(e) => FormikHandleChange(formik, "confirmPassword", e)}
              name="confirmPassword"
              placeholder="••••••••"
            />
            <ShowError message={FormikHandleError(formik, "confirmPassword")} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg">
            Crear cuenta
          </button>
        </form>
        <div className="divider">
          ¿Ya tenés cuenta? <Link href="/login">Ingresar</Link>
        </div>
      </div>
    </main>
  );
}
