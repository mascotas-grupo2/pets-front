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

/**
 * Config y datos del dashboard.
 * - `STATS`: definición de las cards (label/ícono/tono). Los VALORES son reales,
 *   vienen de `getDashboardStats()` en DashboardStatCards.
 * - `ACTIVIDAD`: actividad reciente. TODAVÍA mock: falta un endpoint de feed en
 *   el backend para reemplazarla por datos reales.
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
