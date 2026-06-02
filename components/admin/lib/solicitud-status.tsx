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
