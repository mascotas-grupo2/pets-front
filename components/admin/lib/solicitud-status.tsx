import type { Tone } from "../ui/types";
import type { EstadoSolicitud } from "../sections/solicitudes/solicitudes.data";

export function solicitudEstadoTone(estado: EstadoSolicitud): Tone {
  switch (estado) {
    case "NUEVA":
      return "blue";
    case "EN_EVALUACION":
      return "violet";
    case "ENTREVISTA_PENDIENTE":
      return "amber";
    case "ACEPTADA_CON_SEGUIMIENTO":
      return "green";
    case "ACEPTADA":
      return "green";
    case "DESCARTADA":
      return "gray";
    default:
      return "violet";
  }
}

/** Etiquetas legibles de cada estado. */
export const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
  NUEVA: "Nueva",
  EN_EVALUACION: "En evaluación",
  ENTREVISTA_PENDIENTE: "Entrevista pendiente",
  ACEPTADA_CON_SEGUIMIENTO: "Aceptada con seguimiento",
  ACEPTADA: "Aceptada",
  DESCARTADA: "Descartada",
};

/**
 * Cadena lineal de avance. El estado solo puede avanzar al inmediato siguiente;
 * DESCARTADA es una salida de rechazo disponible mientras no sea terminal.
 */
const CADENA: EstadoSolicitud[] = [
  "NUEVA",
  "EN_EVALUACION",
  "ENTREVISTA_PENDIENTE",
  "ACEPTADA_CON_SEGUIMIENTO",
  "ACEPTADA",
];

/** Estados terminales: no admiten más cambios. */
export function esEstadoTerminal(estado: EstadoSolicitud): boolean {
  return estado === "ACEPTADA" || estado === "DESCARTADA";
}

/**
 * Transiciones permitidas desde un estado: solo el siguiente de la cadena + DESCARTADA.
 * Los estados terminales devuelven [].
 */
export function transicionesPermitidas(estado: EstadoSolicitud): EstadoSolicitud[] {
  if (esEstadoTerminal(estado)) return [];
  const idx = CADENA.indexOf(estado);
  const siguiente = idx >= 0 && idx < CADENA.length - 1 ? CADENA[idx + 1] : null;
  const opciones: EstadoSolicitud[] = [];
  if (siguiente) opciones.push(siguiente);
  opciones.push("DESCARTADA");
  return opciones;
}

/**
 * Texto que describe el efecto colateral de pasar a `destino`, para mostrar en el
 * modal de confirmación. Devuelve null si no hay efecto destacable.
 */
export function efectoTransicion(destino: EstadoSolicitud): string | null {
  switch (destino) {
    case "ENTREVISTA_PENDIENTE":
      return "Se reservará la publicación de la mascota y dejará de mostrarse al público. Requiere que la mascota esté en adopción y publicada.";
    case "ACEPTADA_CON_SEGUIMIENTO":
      return "Se crearán automáticamente 3 seguimientos (a 7, 30 y 90 días).";
    case "ACEPTADA":
      return "La mascota quedará marcada como adoptada y la publicación se cerrará. Esta acción es definitiva.";
    case "DESCARTADA":
      return "Se descartará la solicitud. Si tenía la publicación reservada, la mascota volverá a publicarse. Esta acción es definitiva.";
    default:
      return null;
  }
}
