export type AnimalType = "perro" | "gato" | "otro";
export type PetSex = "macho" | "hembra";
export type PetStatus =
  | "perdido"
  | "encontrado"
  | "en tránsito"
  | "en tratamiento médico"
  | "en adopción"
  | "adoptado";

export type PetMedicalStatus =
  | "sano"
  | "en evaluación"
  | "en tratamiento"
  | "post-operatorio"
  | "recuperándose"
  | "crítico";

export type PetReportStatus =
  | "pendiente"
  | "activo"
  | "finalizado"
  | "rechazado"
  | "reservada";

export type PetNoteKind = "general" | "medica" | "adopcion";

export type PetNote = {
  id: string;
  petId: string;
  authorId: number | null;
  authorName: string | null;
  text: string;
  kind: PetNoteKind;
  createdAt: string;
};

export type AdminPetSummary = Pet & {
  medicalStatus: PetMedicalStatus;
  /** Usuario registrado que creó la publicación (null si fue anónimo). */
  ownerName: string | null;
  ownerEmail: string | null;
  /** True si la publicación fue creada por un admin (solo esas son editables). */
  ownerIsAdmin?: boolean;
  adoptionInterestCount: number;
  medicalNoteCount: number;
  generalNoteCount: number;
  lastNoteAt: string | null;
};

export type Pet = {
  id: string;
  ownerId?: number;
  userId?: number;
  name?: string;
  status: PetStatus;
  medicalStatus?: PetMedicalStatus;
  /** Estado de validación de la publicación (lo controla el admin). */
  reportStatus?: PetReportStatus;
  reportStatusLabel?: string;
  /** Motivo del último rechazo (solo se incluye en publicaciones rechazadas). */
  rejectionReason?: string;
  statusLabel?: string;
  sexLabel?: string;
  medicalStatusLabel?: string;
  photo?: string | null;
  photos: string[] | null;
  animalTypeLabel?: string;
  description: string;
  animalType: AnimalType;
  date: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  sex?: PetSex;
  breed?: string;
  ageMonths?: number;
  color?: string;
  weightKg?: number;
  heightCm?: number;
  hasCollar?: boolean;
  hasTag?: boolean;
  microchipped?: boolean;
  neutered?: boolean;
  vaccinated?: boolean;
  vaccineType?: {
    8: string[];
    14: string[];
    22: string[];
  };
  friendlyWithKids?: boolean;
  trained?: boolean;
};
