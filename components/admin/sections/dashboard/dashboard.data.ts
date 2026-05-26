import {
  PawPrint,
  Users,
  CalendarCheck,
  MessageSquare,
  Megaphone,
  FileText,
  ClipboardCheck,
  ClipboardList,
  Home,
  DollarSign,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { Tone } from "../../ui/types";

/**
 * Datos mock del dashboard. Aislados de la presentación: cuando exista el
 * backend, sólo se reemplaza este módulo por las llamadas reales.
 */

export type Stat = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: Tone;
};

export const STATS: Stat[] = [
  { label: "Mascotas", value: "128", hint: "En total", icon: PawPrint, tone: "violet" },
  { label: "Solicitudes activas", value: "18", hint: "En evaluación", icon: Users, tone: "green" },
  { label: "Seguimientos hoy", value: "7", hint: "Citas programadas", icon: CalendarCheck, tone: "amber" },
  { label: "Mensajes sin leer", value: "3", hint: "Nuevos mensajes", icon: MessageSquare, tone: "blue" },
  { label: "Publicaciones nuevas", value: "12", hint: "Por revisar", icon: Megaphone, tone: "pink" },
];

export type Compat = { pct: number; label: string };

export type Solicitud = {
  usuario: string;
  email: string;
  mascota: string;
  compat: Compat;
  estado: { label: string; tone: Tone };
  fecha: string;
};

export const SOLICITUDES: Solicitud[] = [
  { usuario: "Juan Pérez", email: "jperez@email.com", mascota: "Toby", compat: { pct: 92, label: "Buena" }, estado: { label: "En evaluación", tone: "violet" }, fecha: "20/05/2026" },
  { usuario: "María Gómez", email: "maria@email.com", mascota: "Luna", compat: { pct: 72, label: "Buena" }, estado: { label: "Entrevista pendiente", tone: "amber" }, fecha: "20/05/2026" },
  { usuario: "Laura Martínez", email: "laura@email.com", mascota: "Simba", compat: { pct: 65, label: "Buena" }, estado: { label: "Nueva", tone: "blue" }, fecha: "19/05/2026" },
  { usuario: "Carlos Ruiz", email: "cruiz@email.com", mascota: "Nina", compat: { pct: 45, label: "Baja" }, estado: { label: "Descartada", tone: "gray" }, fecha: "19/05/2026" },
  { usuario: "Ana López", email: "ana@email.com", mascota: "Coco", compat: { pct: 88, label: "Excelente" }, estado: { label: "En evaluación", tone: "violet" }, fecha: "18/05/2026" },
];

export type Seguimiento = {
  mascota: string;
  tipo: string;
  fechaHora: string;
  adoptante: string;
};

export const SEGUIMIENTOS: Seguimiento[] = [
  { mascota: "Toby", tipo: "Control general", fechaHora: "Hoy 15:00", adoptante: "Juan Pérez" },
  { mascota: "Luna", tipo: "Visita de seguimiento", fechaHora: "21/05 10:00", adoptante: "María Gómez" },
  { mascota: "Simba", tipo: "Vacuna antirrábica", fechaHora: "22/05 11:30", adoptante: "Laura Martínez" },
  { mascota: "Nina", tipo: "Control veterinario", fechaHora: "23/05 09:00", adoptante: "Carlos Ruiz" },
  { mascota: "Coco", tipo: "Visita de seguimiento", fechaHora: "25/05 16:00", adoptante: "Ana López" },
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
  { titulo: "Toby busca hogar", detalle: "Perro · Macho · 3 años", tipo: "En adopción", fecha: "20/05/2026", estado: { label: "Publicada", tone: "green" }, vistas: 156 },
  { titulo: "Luna, gata cariñosa", detalle: "Gato · Hembra · 2 años", tipo: "En adopción", fecha: "20/05/2026", estado: { label: "Publicada", tone: "green" }, vistas: 98 },
  { titulo: "Simba en adopción", detalle: "Perro · Macho · 4 años", tipo: "En adopción", fecha: "19/05/2026", estado: { label: "En revisión", tone: "amber" }, vistas: 0 },
  { titulo: "Nina, dulce compañera", detalle: "Perra · Hembra · 1 año", tipo: "En adopción", fecha: "19/05/2026", estado: { label: "Rechazada", tone: "red" }, vistas: 0 },
];

export type Actividad = {
  icon: LucideIcon;
  tone: Tone;
  titulo: string;
  detalle: string;
  tiempo: string;
};

export const ACTIVIDAD: Actividad[] = [
  { icon: FileText, tone: "violet", titulo: "Nueva solicitud para Toby", detalle: "Juan Pérez solicitó adoptar a Toby", tiempo: "Hace 10 min" },
  { icon: ClipboardCheck, tone: "green", titulo: "Seguimiento completado", detalle: "Control general de Luna completado", tiempo: "Hace 1 h" },
  { icon: MessageSquare, tone: "blue", titulo: "Nuevo mensaje", detalle: "María Gómez te envió un mensaje", tiempo: "Hace 2 h" },
  { icon: Megaphone, tone: "pink", titulo: "Nueva publicación", detalle: "Publicación de Simba creada", tiempo: "Hace 3 h" },
  { icon: UserPlus, tone: "amber", titulo: "Usuario registrado", detalle: "Laura Martínez se registró en la plataforma", tiempo: "Hace 5 h" },
];

export type Cita = {
  mascota: string;
  tipo: string;
  fecha: string;
  hora: string;
  tone: Tone;
};

export const CITAS: Cita[] = [
  { mascota: "Bella", tipo: "Vacunación", fecha: "26 Mayo", hora: "10:00 AM", tone: "violet" },
  { mascota: "Thor", tipo: "Revisión General", fecha: "27 Mayo", hora: "2:30 PM", tone: "blue" },
  { mascota: "Mia", tipo: "Esterilización", fecha: "28 Mayo", hora: "9:00 AM", tone: "pink" },
  { mascota: "Rocky", tipo: "Control", fecha: "29 Mayo", hora: "11:00 AM", tone: "amber" },
];

export type Costo = {
  categoria: string;
  pct: string;
  monto: string;
  icon: LucideIcon;
  tone: Tone;
};

export const COSTOS: Costo[] = [
  { categoria: "Alimentación", pct: "40% del total", monto: "$980", icon: PawPrint, tone: "violet" },
  { categoria: "Veterinaria", pct: "35% del total", monto: "$850", icon: ClipboardList, tone: "green" },
  { categoria: "Mantenimiento", pct: "15% del total", monto: "$370", icon: Home, tone: "amber" },
  { categoria: "Otros", pct: "10% del total", monto: "$250", icon: DollarSign, tone: "pink" },
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
