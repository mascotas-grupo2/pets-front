export type AnimalType = "perro" | "gato" | "otro";
export type PetSex = "macho" | "hembra";
export type PetStatus = "perdido" | "en adopción" | "encontrado";

export type Pet = {
  id: string;
  ownerId?: number;
  name?: string;
  status: PetStatus;
  photos: string[];
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
