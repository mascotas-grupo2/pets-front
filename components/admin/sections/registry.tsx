import type { ComponentType } from "react";
import type { Section, SectionProps } from "../admin-config";
import { DashboardSection } from "./dashboard/dashboard-section";
import { PublicacionSection } from "./publicacion/publicacion-section";

export const SECTION_CONTENT: Partial<
  Record<Section, ComponentType<SectionProps>>
> = {
  dashboard: DashboardSection,
  publicacion: PublicacionSection,
};
