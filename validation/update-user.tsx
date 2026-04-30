import * as Yup from "yup";

const regex_phone = /^[\d+\-\s()]+$/;

export const validationSchemaUpdateUserDetails = (adopter: boolean) =>
  Yup.object({
    firstName: Yup.string().required("El nombre es obligatorio"),
    ...(adopter && {
      lastName: Yup.string().required("El apellido es obligatorio"),
      phone: Yup.string()
        .matches(regex_phone, "Teléfono inválido")
        .required("El teléfono es obligatorio"),
      addressLine1: Yup.string().required("La dirección es obligatoria"),
      addressLine2: Yup.string().required("Este campo es obligatorio"),
      postcode: Yup.string().required("El código postal es obligatorio"),
      town: Yup.string().required("La ciudad es obligatoria"),
      livingSituation: Yup.string().required("Requerido"),
      householdSetting: Yup.string().required("Requerido"),
      activityLevel: Yup.string().required("Requerido"),
      adults: Yup.number().required("Requerido").min(1, "Mínimo 1"),
      children: Yup.number().required("Requerido").min(0),
      allergies: Yup.string().required("Requerido"),
      otherAnimalsDetail: Yup.string(),
      hasGarden: Yup.boolean().required("Requerido"),
      visitingChildren: Yup.boolean().required("Requerido"),
      hasFlatmates: Yup.boolean().required("Requerido"),
      otherAnimals: Yup.boolean().required("Requerido"),
      neutered: Yup.boolean().required("Requerido"),
      vaccinated: Yup.boolean().required("Requerido"),
    }),
  });
