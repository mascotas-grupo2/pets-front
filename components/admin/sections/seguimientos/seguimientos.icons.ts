import {
  CalendarClock,
  Stethoscope,
  Home,
  AlertTriangle,
  ClipboardCheck,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { FOLLOWUP_TYPE } from "./seguimientos.data";

/** Ícono por tipo de seguimiento (compartido entre el alta y el detalle). */
export const TYPE_ICON: Record<number, LucideIcon> = {
  [FOLLOWUP_TYPE.programado]: CalendarClock,
  [FOLLOWUP_TYPE.medico]: Stethoscope,
  [FOLLOWUP_TYPE.visita]: Home,
  [FOLLOWUP_TYPE.urgente]: AlertTriangle,
  [FOLLOWUP_TYPE.control]: ClipboardCheck,
  [FOLLOWUP_TYPE.postAdopcion]: Heart,
};
