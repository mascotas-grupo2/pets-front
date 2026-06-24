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

/** Días de gracia tras el vencimiento antes de que la publicación se oculte
 *  del público (debe coincidir con EXPIRY_GRACE_DAYS del backend). */
const EXPIRY_GRACE_DAYS = 15;

/**
 * Estado de vencimiento de una publicación para la tabla del admin:
 * "Vencida · oculta" (fuera de gracia), "Vencida" (en gracia), "Vence en Nd"
 * (ámbar si está por vencer ≤7d), o los días restantes en gris. "—" si no vence.
 */
export function VencimientoPill({
  expiresAt,
  daysLeft,
  expired,
}: {
  expiresAt?: string | null;
  daysLeft?: number | null;
  expired?: boolean;
}) {
  if (!expiresAt || daysLeft == null) return <>—</>;
  if (expired) {
    const oculta = daysLeft < -EXPIRY_GRACE_DAYS;
    return <Pill tone="red">{oculta ? "Vencida · oculta" : "Vencida"}</Pill>;
  }
  if (daysLeft <= 7) {
    return <Pill tone="amber">{`Vence en ${daysLeft} d`}</Pill>;
  }
  return <Pill tone="gray">{`${daysLeft} d`}</Pill>;
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
  "devuelta al dueño": "Devuelta al dueño",
};

export const PET_STATUS_TRANSITIONS: Record<PetStatus, PetStatus[]> = {
  perdido: ["encontrado"],
  encontrado: ["en tránsito", "en tratamiento médico", "en adopción"],
  "en tránsito": ["en tratamiento médico", "en adopción"],
  "en tratamiento médico": ["en tránsito", "en adopción"],
  "en adopción": ["adoptado"],
  adoptado: [],
  "devuelta al dueño": [],
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
