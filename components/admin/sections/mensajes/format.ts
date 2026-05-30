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

const dm = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
const hm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const esMismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Hora resumida para la lista: "10:30" hoy, "Ayer", o "dd/mm" si es más viejo. */
export function horaCorta(iso: string | null, now: Date = new Date()): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (esMismoDia(d, now)) return hm(d);
  const ayer = new Date(now);
  ayer.setDate(now.getDate() - 1);
  if (esMismoDia(d, ayer)) return "Ayer";
  return dm(d);
}

/** Fecha completa para la burbuja: "dd/mm/aaaa hh:mm". */
export function horaMensaje(iso: string): string {
  const d = new Date(iso);
  return `${dm(d)}/${d.getFullYear()} ${hm(d)}`;
}
