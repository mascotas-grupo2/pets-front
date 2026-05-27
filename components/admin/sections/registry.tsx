import type { ComponentType, Dispatch, SetStateAction } from "react";
import type { Section } from "../admin-config";
import { DashboardSection } from "./dashboard/dashboard-section";

export interface SectionProps {
  setActive: Dispatch<SetStateAction<Section>>;
}

/**
 * Mapea cada sección con su componente de contenido.
 * Las secciones no listadas caen en el PlaceholderSection (ver AdminPage).
 * Agregar una sección = registrar su componente acá.
 */
export const SECTION_CONTENT: Partial<
  Record<Section, ComponentType<SectionProps>>
> = {
  dashboard: DashboardSection,
};
