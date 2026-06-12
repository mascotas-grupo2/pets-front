import type { PetReportStatus, PetStatus } from "@/types/pet";
import type { Tone } from "../ui/types";
import { Pill } from "../ui/pill";

export const ESTADO_META: Record<
  PetReportStatus,
  { label: string; tone: Tone }
> = {
  pendiente: { label: "Nueva", tone: "violet" },
  activo: { label: "Publicada", tone: "green" },
  rechazado: { label: "Rechazada", tone: "red" },
  finalizado: { label: "Finalizada", tone: "gray" },
  reservada: { label: "Reservada", tone: "blue" },
};

export function EstadoPill({ status }: { status?: PetReportStatus | null }) {
  const meta = status ? ESTADO_META[status] : null;
  return meta ? <Pill tone={meta.tone}>{meta.label}</Pill> : <>—</>;
}

const STATUS_TONE: Partial<Record<PetStatus, Tone>> = {
  "en adopción": "green",
  adoptado: "gray",
  perdido: "red",
  encontrado: "blue",
  "en tránsito": "amber",
  "en tratamiento médico": "violet",
};

export function MascotaEstadoPill({
  status,
  label,
}: {
  status?: PetStatus;
  label?: string;
}) {
  if (!status) return <>—</>;
  return <Pill tone={STATUS_TONE[status] ?? "violet"}>{label ?? status}</Pill>;
}

export const PET_STATUS_LABELS: Record<PetStatus, string> = {
  perdido: "Perdido",
  encontrado: "En refugio",
  "en tránsito": "En tránsito",
  "en tratamiento médico": "En tratamiento médico",
  "en adopción": "En adopción",
  adoptado: "Adoptado",
};

export const PET_STATUS_TRANSITIONS: Record<PetStatus, PetStatus[]> = {
  perdido: ["encontrado"],
  encontrado: ["en tránsito", "en tratamiento médico", "en adopción"],
  "en tránsito": ["en tratamiento médico", "en adopción"],
  "en tratamiento médico": ["en tránsito", "en adopción"],
  "en adopción": ["adoptado"],
  adoptado: [],
};

export function esEstadoMascotaTerminal(status: PetStatus): boolean {
  return PET_STATUS_TRANSITIONS[status]?.length === 0;
}

export function transicionesMascotaPermitidas(status: PetStatus): PetStatus[] {
  return PET_STATUS_TRANSITIONS[status] ?? [];
}

export function transicionMascotaValida(
  desde: PetStatus,
  hacia: PetStatus,
): boolean {
  if (desde === hacia) return true;
  return transicionesMascotaPermitidas(desde).includes(hacia);
}
