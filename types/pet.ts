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
  adoptionInterestCount: number;
  medicalNoteCount: number;
  generalNoteCount: number;
  lastNoteAt: string | null;
};

export type Pet = {
  id: string;
  ownerId?: number;
  name?: string;
  status: PetStatus;
  medicalStatus?: PetMedicalStatus;
  photo: string | null;
  photos?: string[];
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
