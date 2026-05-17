import { PetMedicalStatus, PetNoteKind, PetStatus } from "@/types/pet";

export const PET_STATUS_OPTIONS: { value: PetStatus; label: string }[] = [
  { value: "perdido", label: "Perdido" },
  { value: "encontrado", label: "Encontrado" },
  { value: "en tránsito", label: "En tránsito" },
  { value: "en tratamiento médico", label: "En tratamiento médico" },
  { value: "en adopción", label: "En adopción" },
  { value: "adoptado", label: "Adoptado" },
];

export const PET_STATUS_CHIP_CLASS: Record<PetStatus, string> = {
  perdido: "admin-chip admin-chip-perdido",
  encontrado: "admin-chip admin-chip-encontrado",
  "en tránsito": "admin-chip admin-chip-transito",
  "en tratamiento médico": "admin-chip admin-chip-medico",
  "en adopción": "admin-chip admin-chip-adopcion",
  adoptado: "admin-chip admin-chip-adoptado",
};

export const PET_MEDICAL_STATUS_OPTIONS: {
  value: PetMedicalStatus;
  label: string;
}[] = [
  { value: "sano", label: "Sano" },
  { value: "en evaluación", label: "En evaluación" },
  { value: "en tratamiento", label: "En tratamiento" },
  { value: "post-operatorio", label: "Post-operatorio" },
  { value: "recuperándose", label: "Recuperándose" },
  { value: "crítico", label: "Crítico" },
];

export const PET_MEDICAL_CHIP_CLASS: Record<PetMedicalStatus, string> = {
  sano: "admin-chip admin-chip-encontrado",
  "en evaluación": "admin-chip admin-chip-transito",
  "en tratamiento": "admin-chip admin-chip-medico",
  "post-operatorio": "admin-chip admin-chip-medico",
  "recuperándose": "admin-chip admin-chip-adopcion",
  "crítico": "admin-chip admin-chip-perdido",
};

export const PET_NOTE_KIND_OPTIONS: { value: PetNoteKind; label: string }[] = [
  { value: "general", label: "General" },
  { value: "medica", label: "Médica" },
  { value: "adopcion", label: "Adopción" },
];

export const PET_NOTE_KIND_LABEL: Record<PetNoteKind, string> = {
  general: "General",
  medica: "Médica",
  adopcion: "Adopción",
};
