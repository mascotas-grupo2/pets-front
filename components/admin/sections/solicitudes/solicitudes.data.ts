import { AdoptionFile, AdoptionHistoryItem, AdoptionMessage } from "@/types/adoption-detail";

export type EstadoSolicitud =
  | "NUEVA"
  | "EN_EVALUACION"
  | "ENTREVISTA_PENDIENTE"
  | "ACEPTADA_CON_SEGUIMIENTO"
  | "ACEPTADA"
  | "DESCARTADA";

export type Solicitud = {
  id: string;
  userName: string;
  userEmail: string;
  userPhoto?: string | null;
  petName?: string | null;
  petPhoto?: string | null;
  compatPct: number;
  compatLabel: string;
  estado: "NUEVA" | "EN_EVALUACION" | "ENTREVISTA_PENDIENTE" | "ACEPTADA_CON_SEGUIMIENTO" | "ACEPTADA" | "DESCARTADA";
  fecha: string;

  // detail fields (optional, populated when fetching detail)
  messages?: AdoptionMessage[];
  history?: AdoptionHistoryItem[];
  files?: AdoptionFile[];
};

export const SOLICITUDES: Solicitud[] = [
  {
    id: "1",
    userName: "Juan Pérez",
    userEmail: "jperez@email.com",
    petName: "Toby",
    userPhoto: "https://randomuser.me/api/portraits/men/1.jpg",
    petPhoto: "https://randomuser.me/api/portraits/dogs/1.jpg",
    compatPct: 92,
    compatLabel: "Alta",
    estado: "NUEVA",
    fecha: "20/05/2026",
  },
  {
    id: "2",
    userName: "María Gómez",
    userEmail: "maria@email.com",
    petName: "Luna",
    userPhoto: "https://randomuser.me/api/portraits/men/2.jpg",
    petPhoto: "https://randomuser.me/api/portraits/dogs/2.jpg",
    compatPct: 76,
    compatLabel: "Buena",
    estado: "EN_EVALUACION",
    fecha: "19/05/2026",
  },
  {
    id: "3",
    userName: "Carlos Ruiz",
    userEmail: "cruiz@email.com",
    petName: "Simba",
    userPhoto: "https://randomuser.me/api/portraits/men/3.jpg",
    petPhoto: "https://randomuser.me/api/portraits/dogs/3.jpg",
    compatPct: 64,
    compatLabel: "Moderada",
    estado: "ENTREVISTA_PENDIENTE",
    fecha: "18/05/2026",
  },
  {
    id: "4",
    userName: "Ana López",
    userEmail: "ana@email.com",
    petName: "Nina",
    userPhoto: "https://randomuser.me/api/portraits/men/4.jpg",
    petPhoto: "https://randomuser.me/api/portraits/dogs/4.jpg",
    compatPct: 88,
    compatLabel: "Alta",
    estado: "ACEPTADA_CON_SEGUIMIENTO",
    fecha: "18/05/2026",
  },
  {
    id: "5",
    userName: "Laura Martínez",
    userEmail: "laura@email.com",
    petName: "Coco",
    userPhoto: "https://randomuser.me/api/portraits/men/5.jpg",
    petPhoto: "https://randomuser.me/api/portraits/dogs/5.jpg",
    compatPct: 95,
    compatLabel: "Excelente",
    estado: "ACEPTADA",
    fecha: "17/05/2026",
  },
  {
    id: "6",
    userName: "Ricardo Silva",
    userEmail: "rsilva@email.com",
    petName: "Milo",
    userPhoto: "https://randomuser.me/api/portraits/men/6.jpg",
    petPhoto: "https://randomuser.me/api/portraits/dogs/6.jpg",
    compatPct: 42,
    compatLabel: "Baja",
    estado: "DESCARTADA",
    fecha: "16/05/2026",
  },
];
