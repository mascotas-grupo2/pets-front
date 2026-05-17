import * as Yup from "yup";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[\d+\-\s()]+$/;

export const reportDataSchema = Yup.object({
  animalType: Yup.string().required("Requerido"),
  description: Yup.string()
    .min(10, "Mínimo 10 caracteres")
    .required("Requerido"),
  date: Yup.string().required("Requerido"),
});

export const photoFileSchema = Yup.object({
  name: Yup.string().required("Requerido"),
  file: Yup.mixed().required("Requerido"),
});

export const reportPhotoSchema = Yup.object({
  photos: Yup.array()
    .of(photoFileSchema)
    .min(1, "Se requiere al menos una foto")
    .required("Se requiere al menos una foto"),
});

export const reportLocationSchema = Yup.object({
  location: Yup.string().required("Requerido"),
});

export const reportContactSchema = Yup.object({
  contactPhone: Yup.string()
    .matches(PHONE_REGEX, "Teléfono inválido")
    .required("Requerido"),
  contactEmail: Yup.string()
    .matches(EMAIL_REGEX, "Email inválido")
    .email("Email inválido")
    .required("Requerido"),
});

/**
 * Esquema combinado para el submit final. Los pasos "Características" y
 * "Detalles" no aportan reglas porque todos sus campos son opcionales.
 */
export const reportValidationSchema = reportDataSchema
  .concat(reportPhotoSchema)
  .concat(reportLocationSchema)
  .concat(reportContactSchema);
