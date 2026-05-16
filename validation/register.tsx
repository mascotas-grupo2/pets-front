import * as Yup from "yup";
const regex_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regex_password =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]:;"'<>,.?/\\|`~]).{8,}$/;

export const registerValidationSchema = Yup.object({
  name: Yup.string().min(2, "Mínimo 2 caracteres").required("Requerido"),
  email: Yup.string()
    .matches(regex_email, "Email inválido")
    .email("Email inválido")
    .required("Requerido"),
  password: Yup.string()
    .matches(
      regex_password,
      "Debe tener mayúscula, minúscula, número, símbolo y mínimo 8 caracteres",
    )
    .min(8, "Mínimo 8 caracteres")
    .required("Requerido"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Requerido"),
});
