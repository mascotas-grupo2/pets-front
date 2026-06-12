import * as Yup from "yup";

const regex_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regex_phone = /^[\d+\-\s()]+$/;

export const adoptStartSchema = Yup.object({
  petId: Yup.string(),
  firstName: Yup.string().min(2, "Mínimo 2 caracteres").required("Requerido"),
  lastName: Yup.string().min(2, "Mínimo 2 caracteres").required("Requerido"),
  email: Yup.string()
    .matches(regex_email, "Email inválido")
    .email("Email inválido")
    .required("Requerido"),
  phone: Yup.string()
    .matches(regex_phone, "Teléfono inválido")
    .required("Requerido"),
  // Cuando se solicita una mascota puntual (petId presente) el selector de
  // "qué mascota querés adoptar" se oculta, así que no debe ser obligatorio.
  preferredAnimal: Yup.string().when("petId", {
    is: (petId?: string) => !!petId,
    then: (schema) => schema,
    otherwise: (schema) => schema.required("Requerido"),
  }),
  acceptsTerms: Yup.boolean().oneOf([true], "Debés aceptar los términos"),
});

export const adoptAddressSchema = Yup.object({
  addressLine1: Yup.string().required("Requerido"),
  postcode: Yup.string().required("Requerido"),
  town: Yup.string().required("Requerido"),
});

export const adoptHomeSchema = Yup.object({
  hasGarden: Yup.string().required("Requerido"),
  livingSituation: Yup.string().required("Requerido"),
  householdSetting: Yup.string().required("Requerido"),
  activityLevel: Yup.string().required("Requerido"),
});

export const adoptRoommateSchema = Yup.object({
  adults: Yup.number()
    .min(1, "Al menos un adulto debe vivir en el hogar")
    .required("Requerido"),
  children: Yup.number().min(0).required("Requerido"),
  visitingChildren: Yup.string().required("Requerido"),
  hasFlatmates: Yup.string().required("Requerido"),
});

export const adoptOtherAnimalsSchema = Yup.object({
  hasAllergies: Yup.string().required("Requerido"),
  otherAnimals: Yup.string().required("Requerido"),
  neutered: Yup.string().required("Requerido"),
  vaccinated: Yup.string().required("Requerido"),
});

export const adoptFullSchema = (step: number) => {
  const schemas = [
    adoptStartSchema,
    adoptAddressSchema,
    adoptHomeSchema,
    adoptRoommateSchema,
    adoptOtherAnimalsSchema,
    null,
  ];
  return schemas[step];
};
