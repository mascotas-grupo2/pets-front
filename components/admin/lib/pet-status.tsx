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
