/** Edad en meses → texto legible ("3 meses" / "2 años"). "—" si no hay dato. */
export function formatEdad(months?: number) {
  if (!months || months <= 0) return "—";
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "año" : "años"}`;
}
