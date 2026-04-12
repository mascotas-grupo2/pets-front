import * as Yup from "yup";
const regex_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regex_number = /^[\d+\-]+$/;
export const reportValidationSchema = Yup.object({
  description: Yup.string()
    .min(10, "Mínimo 10 caracteres")
    .required("Requerido"),
  animalType: Yup.string().required("Requerido"),
  date: Yup.string().required("Requerido"),
  location: Yup.string().required("Requerido"),
  contactPhone: Yup.string()
    .matches(regex_number, "Teléfono inválido")
    .required("Requerido"),
  contactEmail: Yup.string()
    .matches(regex_email, "Email inválido")
    .email("Email inválido")
    .required("Requerido"),
  photo: Yup.object({
    name: Yup.string().required("Requerido"),
    file: Yup.string().required("Requerido"),
  }).required("Requerido"),
});
