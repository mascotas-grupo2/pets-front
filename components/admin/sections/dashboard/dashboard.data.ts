import {
  PawPrint,
  Users,
  CalendarCheck,
  MessageSquare,
  Megaphone,
  FileText,
  ClipboardCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { Tone } from "../../ui/types";
import type { Solicitud } from "../solicitudes/solicitudes.data";

/**
 * Datos mock del dashboard. Aislados de la presentación: cuando exista el
 * backend, sólo se reemplaza este módulo por las llamadas reales.
 *
 * Nota: `SOLICITUDES` ahora usa el shape genérico `Solicitud` que espera la UI,
 * con campos compatibles con la respuesta de `GET /adoptions/admin/paged`.
 */

export type Stat = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: Tone;
};

export const STATS: Stat[] = [
  {
    label: "Mascotas activas",
    value: "128",
    hint: "Ver todas",
    icon: PawPrint,
    tone: "violet",
  },
  {
    label: "Solicitudes",
    value: "24",
    hint: "Ver todas",
    icon: Users,
    tone: "green",
  },
  {
    label: "Seguimientos hoy",
    value: "7",
    hint: "Ver todas",
    icon: CalendarCheck,
    tone: "amber",
  },
  {
    label: "Publicaciones",
    value: "18",
    hint: "Ver todas",
    icon: Megaphone,
    tone: "pink",
  },
  {
    label: "Mensajes sin leer",
    value: "5",
    hint: "Ver todas",
    icon: MessageSquare,
    tone: "blue",
  },
];

export type Compat = { pct: number; label: string };

/**
 * SOLICITUDES: ahora exporta mocks en el mismo shape `Solicitud` que consume la UI.
 * Campos clave:
 * - `id` (string)
 * - `userName`, `userEmail`, `userPhoto`
 * - `petName`, `petPhoto`
 * - `compatPct`, `compatLabel`
 * - `estado` (código con guiones bajos como en backend: e.g. "NUEVA")
 * - `fecha` (string display)
 *
 * Cuando la API esté disponible simplemente reemplazá este array por los datos
 * mapeados desde `getAdminAdoptions().items`.
 */
export const SOLICITUDES: Solicitud[] = [
  {
    id: "1",
    userName: "Juan Pérez",
    userEmail: "jperez@email.com",
    userPhoto: null,
    petName: "Toby",
    petPhoto: null,
    compatPct: 92,
    compatLabel: "Excelente",
    estado: "EN_EVALUACION",
    fecha: "20/05/2026",
    // campos opcionales para detalle (vacíos en el mock)
    messages: [],
    history: [],
    files: [],
  },
  {
    id: "2",
    userName: "María Gómez",
    userEmail: "maria@email.com",
    userPhoto: null,
    petName: "Luna",
    petPhoto: null,
    compatPct: 72,
    compatLabel: "Buena",
    estado: "ENTREVISTA_PENDIENTE",
    fecha: "20/05/2026",
    messages: [],
    history: [],
    files: [],
  },
  {
    id: "3",
    userName: "Laura Martínez",
    userEmail: "laura@email.com",
    userPhoto: null,
    petName: "Simba",
    petPhoto: null,
    compatPct: 65,
    compatLabel: "Buena",
    estado: "NUEVA",
    fecha: "19/05/2026",
    messages: [],
    history: [],
    files: [],
  },
  {
    id: "4",
    userName: "Carlos Ruiz",
    userEmail: "cruiz@email.com",
    userPhoto: null,
    petName: "Nina",
    petPhoto: null,
    compatPct: 45,
    compatLabel: "Baja",
    estado: "DESCARTADA",
    fecha: "19/05/2026",
    messages: [],
    history: [],
    files: [],
  },
  {
    id: "5",
    userName: "Ana López",
    userEmail: "ana@email.com",
    userPhoto: null,
    petName: "Coco",
    petPhoto: null,
    compatPct: 88,
    compatLabel: "Excelente",
    estado: "EN_EVALUACION",
    fecha: "18/05/2026",
    messages: [],
    history: [],
    files: [],
  },
];

export type Seguimiento = {
  mascota: string;
  tipo: string;
  fechaHora: string;
  adoptante: string;
};

export const SEGUIMIENTOS: Seguimiento[] = [
  {
    mascota: "Toby",
    tipo: "Control general",
    fechaHora: "Hoy 15:00",
    adoptante: "Juan Pérez",
  },
  {
    mascota: "Luna",
    tipo: "Visita de seguimiento",
    fechaHora: "21/05 10:00",
    adoptante: "María Gómez",
  },
  {
    mascota: "Simba",
    tipo: "Vacuna antirrábica",
    fechaHora: "22/05 11:30",
    adoptante: "Laura Martínez",
  },
  {
    mascota: "Nina",
    tipo: "Control veterinario",
    fechaHora: "23/05 09:00",
    adoptante: "Carlos Ruiz",
  },
  {
    mascota: "Coco",
    tipo: "Visita de seguimiento",
    fechaHora: "25/05 16:00",
    adoptante: "Ana López",
  },
];

export type Publicacion = {
  titulo: string;
  detalle: string;
  tipo: string;
  fecha: string;
  estado: { label: string; tone: Tone };
  vistas: number;
};

export const PUBLICACIONES: Publicacion[] = [
  {
    titulo: "Toby busca hogar",
    detalle: "Perro · Macho · 3 años",
    tipo: "En adopción",
    fecha: "20/05/2026",
    estado: { label: "Publicada", tone: "green" },
    vistas: 156,
  },
  {
    titulo: "Luna, gata cariñosa",
    detalle: "Gato · Hembra · 2 años",
    tipo: "En adopción",
    fecha: "20/05/2026",
    estado: { label: "Publicada", tone: "green" },
    vistas: 98,
  },
  {
    titulo: "Simba en adopción",
    detalle: "Perro · Macho · 4 años",
    tipo: "En adopción",
    fecha: "19/05/2026",
    estado: { label: "En revisión", tone: "amber" },
    vistas: 0,
  },
  {
    titulo: "Nina, dulce compañera",
    detalle: "Perra · Hembra · 1 año",
    tipo: "En adopción",
    fecha: "19/05/2026",
    estado: { label: "Rechazada", tone: "red" },
    vistas: 0,
  },
];

export type Actividad = {
  icon: LucideIcon;
  tone: Tone;
  titulo: string;
  detalle: string;
  tiempo: string;
};

export const ACTIVIDAD: Actividad[] = [
  {
    icon: FileText,
    tone: "violet",
    titulo: "Nueva solicitud para Toby",
    detalle: "Juan Pérez solicitó adoptar a Toby",
    tiempo: "Hace 10 min",
  },
  {
    icon: ClipboardCheck,
    tone: "green",
    titulo: "Seguimiento completado",
    detalle: "Control general de Luna completado",
    tiempo: "Hace 1 h",
  },
  {
    icon: MessageSquare,
    tone: "blue",
    titulo: "Nuevo mensaje",
    detalle: "María Gómez te envió un mensaje",
    tiempo: "Hace 2 h",
  },
  {
    icon: Megaphone,
    tone: "pink",
    titulo: "Nueva publicación",
    detalle: "Publicación de Simba creada",
    tiempo: "Hace 3 h",
  },
  {
    icon: UserPlus,
    tone: "amber",
    titulo: "Usuario registrado",
    detalle: "Laura Martínez se registró en la plataforma",
    tiempo: "Hace 5 h",
  },
];

/** Color de la compatibilidad según el porcentaje. */
export function compatTone(pct: number): Tone {
  if (pct >= 85) return "green";
  if (pct >= 60) return "amber";
  return "red";
}

/** Iniciales para los avatares (máx. 2 letras). */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
