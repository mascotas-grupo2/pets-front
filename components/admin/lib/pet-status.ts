import type { PetReportStatus } from "@/types/pet";
import type { Tone } from "../ui/types";

export const ESTADO_META: Record<
  PetReportStatus,
  { label: string; tone: Tone }
> = {
  pendiente: { label: "Nueva", tone: "violet" },
  activo: { label: "Publicada", tone: "green" },
  rechazado: { label: "Rechazada", tone: "red" },
  finalizado: { label: "Finalizada", tone: "gray" },
};
