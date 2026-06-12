import type { Tone } from "../../ui/types";
import type { FollowupItem } from "@/services/followups";

/** Estados posibles de un seguimiento (catálogo `followup_status`). */
export const FOLLOWUP_STATUS = {
  pendiente: 1311,
  confirmado: 1312,
  completado: 1313,
} as const;

/** Tipos posibles de un seguimiento (catálogo `followup_type`). */
export const FOLLOWUP_TYPE = {
  programado: 1301,
  medico: 1302,
  visita: 1303,
  urgente: 1304,
  control: 1305,
  postAdopcion: 1306,
} as const;

/** Opciones de tipo de seguimiento (catálogo `followup_type` del back). */
export const TIPO_OPTIONS: { id: number; label: string }[] = [
  { id: FOLLOWUP_TYPE.programado, label: "Programado" },
  { id: FOLLOWUP_TYPE.medico, label: "Médico" },
  { id: FOLLOWUP_TYPE.visita, label: "Visita" },
  { id: FOLLOWUP_TYPE.urgente, label: "Urgente" },
  { id: FOLLOWUP_TYPE.control, label: "Control" },
  { id: FOLLOWUP_TYPE.postAdopcion, label: "Post adopción" },
];

/** Pestañas/Filtros del listado (cards). */
export type SeguimientoTab = "todas" | "pendientes" | "confirmadas" | "completadas";

/** Shape que consume la tabla / agenda del panel. */
export type Seguimiento = {
  id: number;
  petId: string;
  petName: string;
  petPhoto: string | null;
  userId: number;
  responsable: string;
  tipo: string;
  typeId: number;
  estado: string;
  estadoId: number;
  /** Fecha original (ISO) para ordenar/agrupar. */
  appointmentAt: string;
  /** Fecha de creación (ISO), para el detalle. */
  createdAt: string;
  /** Fecha legible relativa: "Hoy 15:00", "Mañana 10:00", "25/05 11:30". */
  fechaLabel: string;
  /** Solo la hora "15:00", para la agenda del día. */
  horaLabel: string;
};

/** Tono de la pill según el estado del seguimiento. */
export function seguimientoEstadoTone(estadoId: number): Tone {
  switch (estadoId) {
    case FOLLOWUP_STATUS.confirmado:
      return "green";
    case FOLLOWUP_STATUS.pendiente:
      return "blue";
    case FOLLOWUP_STATUS.completado:
      return "gray";
    default:
      return "gray";
  }
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function hhmm(d: Date): string {
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** "Hoy 15:00" / "Mañana 10:00" / "25/05 11:30" según cercanía a hoy. */
export function formatAppointment(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (sameDay(d, today)) return `Hoy ${hhmm(d)}`;
  if (sameDay(d, tomorrow)) return `Mañana ${hhmm(d)}`;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm} ${hhmm(d)}`;
}

/**
 * Mapea un followup del backend al shape de la UI. El backend no devuelve
 * nombre/foto de la mascota ni el responsable: se enriquece con los mapas
 * provistos (petId → nombre/foto, userId → nombre).
 */
export function toSeguimiento(
  f: FollowupItem,
  petMap: Map<string, { name: string; photo: string | null }>,
  userMap: Map<number, string>,
  now = new Date(),
): Seguimiento {
  const pet = petMap.get(f.petId);
  const d = new Date(f.appointmentAt);
  return {
    id: f.id,
    petId: f.petId,
    petName: pet?.name ?? "Sin nombre",
    petPhoto: pet?.photo ?? null,
    userId: f.userId,
    responsable: userMap.get(f.userId) ?? `Usuario #${f.userId}`,
    tipo: f.type?.label ?? "—",
    typeId: f.typeId,
    estado: f.status?.label ?? "—",
    estadoId: f.statusId,
    appointmentAt: f.appointmentAt,
    createdAt: f.createdAt,
    fechaLabel: formatAppointment(f.appointmentAt, now),
    horaLabel: Number.isNaN(d.getTime()) ? "" : hhmm(d),
  };
}
