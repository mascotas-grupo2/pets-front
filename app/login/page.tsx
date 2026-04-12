"use client";

import {
  FormikHandleChange,
  FormikHandleError,
} from "@/components/utils/FormikHelper";
import ShowError from "@/components/utils/ShowError";
import handleToast from "@/components/utils/toast";
import { useAppDispatch } from "@/redux/hooks";
import { login } from "@/services/service.login";
import { LoginForm } from "@/types/login";
import { loginValidationSchema } from "@/validation/login";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const formik = useFormik<LoginForm>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      console.log(values);
      try {
        const userData = await login(values.email, values.password);
        if (userData) {
          handleToast(
            "success",
            "¡Ingreso exitoso! Redirigiendo a tu cuenta...",
          );
          dispatch({ type: "SET_USER", payload: userData });
          router.push("/account");
        } else {
          handleToast(
            "error",
            "Credenciales inválidas. Por favor, intentá de nuevo.",
          );
        }
      } catch (error) {
        console.error(error);
        handleToast("error", "Ocurrió un error al intentar ingresar.");
      }
    },
  });

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <h1>Ingresar</h1>
        <p className="sub">Bienvenido de nuevo a Furry Friends</p>
        <form className="auth-form" onSubmit={formik.handleSubmit}>
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
          <button type="submit" className="btn btn-primary btn-lg">
            Ingresar
          </button>
        </form>
        <div className="divider">
          ¿No tenés cuenta? <Link href="/login">Registrate</Link>
        </div>
      </div>
    </main>
  );
}
