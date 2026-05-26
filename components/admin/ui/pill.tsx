import type { Tone } from "./types";

type PillProps = {
  tone: Tone;
  children: React.ReactNode;
};

/** Etiqueta de estado redondeada (En evaluación, Publicada, etc.). */
export function Pill({ tone, children }: PillProps) {
  return <span className={`pill tone-${tone}`}>{children}</span>;
}
