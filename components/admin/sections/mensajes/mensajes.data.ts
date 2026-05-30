/**
 * Datos mock de la vista de Mensajes. Aislados de la presentación: cuando exista
 * el backend, sólo se reemplaza este módulo por las llamadas reales.
 */

/** Canal de la conversación: con un usuario/adoptante o interno (equipo). */
export type CanalMensaje = "usuario" | "interno";

/** Autor de un mensaje desde la óptica del admin: "yo" (admin) u "otro". */
export type AutorMensaje = "yo" | "otro";

/** Pestañas del detalle de una conversación. */
export type SubTab = "mensajes" | "perfil" | "evaluacion" | "notas";

export type Mensaje = {
  id: string;
  autor: AutorMensaje;
  texto: string;
  /** Marca temporal ya formateada, ej. "23/05/2026 10:15". */
  hora: string;
};

export type Conversacion = {
  id: string;
  nombre: string;
  /** Bajada corta en la lista, ej. "Solicitud de Luna". */
  contexto: string;
  /** Asunto largo en la cabecera del chat, ej. "Solicitud de adopción de Luna". */
  asunto: string;
  canal: CanalMensaje;
  /** Hora/fecha del último mensaje tal como se muestra en la lista. */
  hora: string;
  noLeidos: number;
  perfil: { email: string; telefono: string; mascota: string };
  mensajes: Mensaje[];
};

export const CONVERSACIONES: Conversacion[] = [
  {
    id: "maria-gomez",
    nombre: "María Gómez",
    contexto: "Solicitud de Luna",
    asunto: "Solicitud de adopción de Luna",
    canal: "usuario",
    hora: "10:30",
    noLeidos: 2,
    perfil: { email: "maria@email.com", telefono: "11 2233-4455", mascota: "Luna" },
    mensajes: [
      {
        id: "m1",
        autor: "otro",
        texto: "Hola! Me gustaría saber más sobre Luna y coordinar una entrevista.",
        hora: "23/05/2026 10:15",
      },
      {
        id: "m2",
        autor: "yo",
        texto: "¡Hola María! Claro, Luna está disponible. Podemos coordinar una entrevista 😊",
        hora: "23/05/2026 10:20",
      },
      {
        id: "m3",
        autor: "otro",
        texto: "Perfecto, tengo disponibilidad mañana a las 16 hs.",
        hora: "23/05/2026 10:30",
      },
    ],
  },
  {
    id: "juan-perez",
    nombre: "Juan Pérez",
    contexto: "Seguimiento de Toby",
    asunto: "Seguimiento de Toby",
    canal: "usuario",
    hora: "Ayer",
    noLeidos: 0,
    perfil: { email: "jperez@email.com", telefono: "11 3344-5566", mascota: "Toby" },
    mensajes: [
      { id: "m1", autor: "otro", texto: "Toby se está adaptando muy bien a la casa.", hora: "22/05/2026 18:00" },
      { id: "m2", autor: "yo", texto: "¡Qué buena noticia! Gracias por el update.", hora: "22/05/2026 18:10" },
    ],
  },
  {
    id: "laura-martinez",
    nombre: "Laura Martínez",
    contexto: "Adopción de Simba",
    asunto: "Adopción de Simba",
    canal: "usuario",
    hora: "Ayer",
    noLeidos: 2,
    perfil: { email: "laura@email.com", telefono: "11 4455-6677", mascota: "Simba" },
    mensajes: [
      { id: "m1", autor: "otro", texto: "¿Necesitan algún documento adicional para la adopción?", hora: "22/05/2026 12:00" },
    ],
  },
  {
    id: "equipo-veterinario",
    nombre: "Equipo Veterinario",
    contexto: "Caso de Nina",
    asunto: "Caso clínico de Nina",
    canal: "interno",
    hora: "25/05",
    noLeidos: 6,
    perfil: { email: "vet@refugio.org", telefono: "Interno", mascota: "Nina" },
    mensajes: [
      { id: "m1", autor: "otro", texto: "Nina necesita control post-operatorio esta semana.", hora: "25/05/2026 09:00" },
    ],
  },
  {
    id: "ana-lopez",
    nombre: "Ana López",
    contexto: "Consulta general",
    asunto: "Consulta general",
    canal: "usuario",
    hora: "20/05",
    noLeidos: 5,
    perfil: { email: "ana@email.com", telefono: "11 5566-7788", mascota: "—" },
    mensajes: [
      { id: "m1", autor: "otro", texto: "¿Cómo es el proceso de adopción?", hora: "20/05/2026 11:00" },
    ],
  },
];

/** Iniciales para los avatares (máx. 2 letras). */
export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  );
}

/** Total de mensajes sin leer en un conjunto de conversaciones. */
export function totalNoLeidos(convs: Conversacion[]): number {
  return convs.reduce((acc, c) => acc + c.noLeidos, 0);
}
