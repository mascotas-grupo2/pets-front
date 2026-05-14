import { AnimalType, PetSex } from "@/types/pet";

/**
 * Estado del wizard de "Reportar mascota perdida".
 *
 * Los campos obligatorios son los que validamos por schema.
 * El resto son opcionales y, al guardarse, omitimos los vacíos para que no
 * ensucien el `Pet` final.
 */
export type ReportForm = {
  // Identidad y descripción (paso: Datos)
  name: string;
  animalType: AnimalType;
  description: string;
  date: string;
  isOwner: boolean;

  // Características (paso: Características) — todos opcionales
  sex: PetSex | "";
  breed: string;
  ageMonths: number | "";
  color: string;
  weightKg: number | "";
  heightCm: number | "";

  // Foto (paso: Foto)
  // ahora soporta una o varias fotos
  photo: PhotoUpload | PhotoUpload[] | null;

  // Ubicación (paso: Ubicación)
  location: string;

  // Detalles / salud / temperamento (paso: Detalles) — todos opcionales
  hasCollar: boolean;
  hasTag: boolean;
  microchipped: boolean;
  vaccinated: boolean;
  neutered: boolean;
  friendlyWithKids: boolean;
  trained: boolean;

  // Contacto (paso: Contacto)
  contactPhone: string;
  contactEmail: string;
};

export type PhotoUpload = {
  file: File;
  url: string;
  name: string;
};
