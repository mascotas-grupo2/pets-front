import {
  Home,
  ShieldCheck,
  PawPrint,
  FileText,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Users,
  BookOpen,
  DollarSign,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type Section =
  | "dashboard"
  | "publicacion"
  | "mascotas"
  | "solicitudes"
  | "seguimientos"
  | "reportes"
  | "mensajes"
  | "personas"
  | "historias"
  | "costos"
  | "configuracion";

/** Props que recibe cada sección. Permite saltar a otra (ej. dashboard → publicación). */
export type SectionProps = {
  onNavigate?: (section: Section) => void;
};

export type SectionDef = {
  id: Section;
  /** Etiqueta del item en el menú lateral. */
  label: string;
  icon: LucideIcon;
  /** Título mostrado en el topbar. */
  title: string;
  /** Subtítulo mostrado en el topbar. */
  subtitle: string;
  /** Contador opcional junto al item del menú. */
  badge?: number;
};

/**
 * Fuente de verdad de las secciones del panel.
 * Agregar una sección = agregar una entrada acá (+ registrar su contenido en sections/registry).
 */
export const SECTIONS: SectionDef[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    title: "Panel de administración",
    subtitle: "Resumen general del refugio",
  },
  {
    id: "publicacion",
    label: "Publicaciones",
    icon: ShieldCheck,
    title: "Publicaciones",
    subtitle: "Gestioná las publicaciones del refugio",
  },
  {
    id: "mascotas",
    label: "Mascotas",
    icon: PawPrint,
    title: "Mascotas",
    subtitle: "Listado de todas las mascotas del refugio",
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    icon: FileText,
    title: "Solicitudes",
    subtitle: "Solicitudes de adopción",
  },
  {
    id: "seguimientos",
    label: "Seguimientos",
    icon: ClipboardList,
    title: "Seguimientos",
    subtitle: "Controles y visitas programadas",
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: BarChart3,
    title: "Reportes",
    subtitle: "Métricas y estadísticas",
  },
  {
    id: "mensajes",
    label: "Mensajes",
    icon: MessageSquare,
    title: "Mensajes",
    subtitle: "Conversaciones con usuarios e internos",
  },
  {
    id: "personas",
    label: "Personas",
    icon: Users,
    title: "Personas",
    subtitle: "Usuarios y adoptantes",
  },
  {
    id: "historias",
    label: "Historias",
    icon: BookOpen,
    title: "Historias",
    subtitle: "Historias de adopción",
  },
  {
    id: "costos",
    label: "Costos",
    icon: DollarSign,
    title: "Costos",
    subtitle: "Gastos del refugio",
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    title: "Configuración",
    subtitle: "Ajustes del panel",
  },
];

/** Acceso O(1) a la definición de una sección por su id. */
export const SECTION_MAP = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s]),
) as Record<Section, SectionDef>;
