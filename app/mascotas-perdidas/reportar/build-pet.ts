import { Pet } from "@/types/pet";
import { ReportForm } from "@/types/reportar";

/**
 * Toma los valores del wizard y arma el objeto `Pet` que se persiste en el
 * listado. Omite los campos opcionales vacíos para que el detalle los muestre
 * como "—" en vez de cadenas vacías o `0`.
 */
export function buildPetFromReport(values: ReportForm): Pet {
  return {
    id: `local-${Date.now()}`,
    status: "perdido",
    photos: [],
    createdAt: new Date().toISOString(),

    name: values.name || undefined,
    animalType: values.animalType,
    description: values.description,
    date: values.date,

    photo: Array.isArray(values.photo)
      ? values.photo[0]?.url ?? null
      : typeof values.photo === "string"
      ? values.photo
      : values.photo?.url ?? null,
    photos: Array.isArray(values.photo) ? values.photo.map((p) => p.url) : [],

    location: values.location,
    contactPhone: values.contactPhone,
    contactEmail: values.contactEmail,

    sex: values.sex || undefined,
    breed: values.breed || undefined,
    ageMonths: toOptionalNumber(values.ageMonths),
    color: values.color || undefined,
    weightKg: toOptionalNumber(values.weightKg),
    heightCm: toOptionalNumber(values.heightCm),

    hasCollar: values.hasCollar || undefined,
    hasTag: values.hasTag || undefined,
    microchipped: values.microchipped || undefined,
    vaccinated: values.vaccinated || undefined,
    neutered: values.neutered || undefined,
    friendlyWithKids: values.friendlyWithKids || undefined,
    trained: values.trained || undefined,
  };
}

function toOptionalNumber(v: number | ""): number | undefined {
  return v === "" ? undefined : v;
}
