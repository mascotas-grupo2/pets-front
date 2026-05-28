import type { PetReportStatus } from "@/types/pet";
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
