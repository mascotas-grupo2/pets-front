import type { ComponentType } from "react";
import type { Section, SectionProps } from "../admin-config";
import { DashboardSection } from "./dashboard/dashboard-section";
import { PublicacionSection } from "./publicacion/publicacion-section";
import { MascotasSection } from "./mascotas/mascotas-section";
import { PersonasSection } from "./personas/personas-section";
import { SolicitudesSection } from "./solicitudes/solicitudes-section";
import { SeguimientosSection } from "./seguimientos/seguimientos-section";
import MensajesSection from "./mensajes/mensajes-section";

export const SECTION_CONTENT: Partial<
  Record<Section, ComponentType<SectionProps>>
> = {
  dashboard: DashboardSection,
  publicacion: PublicacionSection,
  mascotas: MascotasSection,
  solicitudes: SolicitudesSection,
  seguimientos: SeguimientosSection,
  personas: PersonasSection,
  mensajes: MensajesSection,
};
