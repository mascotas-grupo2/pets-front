import { AnimalType } from "@/types/pet";

export type YesNo = "si" | "no" | "";
export type YesNoNA = "si" | "no" | "na" | "";

export type LivingSituation =
  | ""
  | "casa"
  | "departamento"
  | "phd"
  | "quinta"
  | "otro";

export type HouseholdSetting = "" | "urbano" | "suburbano" | "rural";
export type ActivityLevel = "" | "tranquilo" | "moderado" | "activo";

export type AdoptForm = {
  petId?: string;
  preferredAnimal: AnimalType | "";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  postcode: string;
  town: string;
  hasGarden: YesNo;
  livingSituation: LivingSituation;
  householdSetting: HouseholdSetting;
  activityLevel: ActivityLevel;
  adults: number;
  children: number;
  visitingChildren: YesNo;
  hasFlatmates: YesNo;
  hasAllergies: YesNo;
  allergies: string;
  otherAnimals: YesNo;
  otherAnimalsDetail: string;
  neutered: YesNoNA;
  vaccinated: YesNoNA;
  experience: string;
  acceptsTerms: boolean;
};

export const adoptInitialValues: AdoptForm = {
  petId: "",
  preferredAnimal: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  postcode: "",
  town: "",
  hasGarden: "",
  livingSituation: "",
  householdSetting: "",
  activityLevel: "",
  adults: 1,
  children: 0,
  visitingChildren: "",
  hasFlatmates: "",
  hasAllergies: "",
  allergies: "",
  otherAnimals: "",
  otherAnimalsDetail: "",
  neutered: "",
  vaccinated: "",
  experience: "",
  acceptsTerms: false,
};
