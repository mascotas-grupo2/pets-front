import { AnimalType } from "@/types/pet";

export type ReportForm = {
  name: string;
  description: string;
  animalType: AnimalType;
  date: string;
  photo: { file: File; url: string; name: string } | null;
  location: string;
  contactPhone: string;
  contactEmail: string;
};
