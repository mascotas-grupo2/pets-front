import * as Yup from "yup";
const regex_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regex_number = /^[\d+\-\s()]+$/;

export const reportDataSchema = Yup.object({
  animalType: Yup.string().required("Requerido"),
  description: Yup.string()
    .min(10, "Mínimo 10 caracteres")
    .required("Requerido"),
  date: Yup.string().required("Requerido"),
});

export const reportPhotoSchema = Yup.object({
  photo: Yup.object({
    name: Yup.string().required("Requerido"),
    file: Yup.mixed().required("Requerido"),
  })
    .nullable()
    .required("Requerido"),
});

export const reportLocationSchema = Yup.object({
  location: Yup.string().required("Requerido"),
});

export const reportContactSchema = Yup.object({
  contactPhone: Yup.string()
    .matches(regex_number, "Teléfono inválido")
    .required("Requerido"),
  contactEmail: Yup.string()
    .matches(regex_email, "Email inválido")
    .email("Email inválido")
    .required("Requerido"),
});

export const reportValidationSchema = reportDataSchema
  .concat(reportPhotoSchema)
  .concat(reportLocationSchema)
  .concat(reportContactSchema);
