export type AdoptionMessage = {
  id: string;
  senderRole: "admin" | "user";
  text: string;
  timestamp: string; // iso or readable string
};

export type AdoptionHistoryItem = {
  id: string;
  type: string; // "solicitud" | "mensaje" | "archivo" | "comentario" | ...
  text: string;
  timestamp: string; // display date
};

export type AdoptionFile = {
  id: string;
  name: string;
  label?: string;
  category?: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string; // display date
  status?: "pendiente" | "aprobado" | "rechazado";
  url?: string;
};
export type CompatibilityFactor = {
  criteria: string;
  applicantValue: string;
  petValue: string;
  scoreImpact: number;
  isPositive: boolean;
  label: string;
};

export type AdoptionDetail = {
  id: number;
  status: string;
  statusLabel: string;
  compatibilityScore: number | null;
  compatibilityFactors?: CompatibilityFactor[];
  createdAt: string;

  // form fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  postcode: string;
  town: string;
  adults?: number | null;
  children?: number | null;
  allergies?: string | null;
  otherAnimalsDetail?: string | null;
  experience?: string | null;

  // catalog labels
  preferredAnimalLabel?: string | null;
  hasGardenLabel?: string | null;
  livingSituationLabel?: string | null;
  householdSettingLabel?: string | null;
  activityLevelLabel?: string | null;
  visitingChildrenLabel?: string | null;
  hasFlatmatesLabel?: string | null;
  otherAnimalsLabel?: string | null;
  neuteredLabel?: string | null;
  vaccinatedLabel?: string | null;

  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  user: {
    id: number;
    name: string;
    email: string;
    photo: string | null;
  } | null;

  pet: {
    id: string;
    name?: string | null;
    photo?: string | null;
    animalTypeId?: number | null;
    statusId?: number | null;
    reportStatusId?: number | null;
  } | null;

  messages: AdoptionMessage[];
  history: AdoptionHistoryItem[];
  files: AdoptionFile[];
};
