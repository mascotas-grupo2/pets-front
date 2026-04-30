import { ReportForm } from "@/types/reportar";
import {
  reportContactSchema,
  reportDataSchema,
  reportLocationSchema,
  reportPhotoSchema,
} from "@/validation/reportar";
import type { Schema } from "yup";

export type WizardStep = {
  key: string;
  label: string;
  icon: string;
  /** Si es `null`, el paso avanza sin validar. */
  schema: Schema | null;
  /** Campos que se marcan como `touched` al avanzar, para mostrar errores. */
  fields: readonly (keyof ReportForm)[];
};

export const STEPS: readonly WizardStep[] = [
  { key: "start", label: "Inicio", icon: "→", schema: null, fields: [] },
  {
    key: "data",
    label: "Datos",
    icon: "❓",
    schema: reportDataSchema,
    fields: ["name", "animalType", "description", "date"],
  },
  {
    key: "characteristics",
    label: "Características",
    icon: "💡",
    schema: null,
    fields: [],
  },
  {
    key: "photo",
    label: "Foto",
    icon: "📷",
    schema: reportPhotoSchema,
    fields: ["photo"],
  },
  { key: "details", label: "Detalles", icon: "📝", schema: null, fields: [] },
  {
    key: "location",
    label: "Ubicación",
    icon: "📍",
    schema: reportLocationSchema,
    fields: ["location"],
  },
  {
    key: "contact",
    label: "Contacto",
    icon: "✉️",
    schema: reportContactSchema,
    fields: ["contactPhone", "contactEmail"],
  },
  { key: "confirm", label: "Confirmar", icon: "✓", schema: null, fields: [] },
];

export const LAST_STEP_INDEX = STEPS.length - 1;

export const INITIAL_VALUES: ReportForm = {
  userId: 0,
  name: "",
  animalType: "perro",
  isOwner: false,
  description: "",
  date: new Date().toISOString().split("T")[0] || "",

  sex: "",
  breed: "",
  ageMonths: "",
  color: "",
  weightKg: "",
  heightCm: "",

  photo: null,
  location: "",

  hasCollar: false,
  hasTag: false,
  microchipped: false,
  vaccinated: false,
  neutered: false,
  friendlyWithKids: false,
  trained: false,

  contactPhone: "",
  contactEmail: "",
};
