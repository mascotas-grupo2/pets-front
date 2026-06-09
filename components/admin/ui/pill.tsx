import type { Tone } from "./types";

type PillProps = {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
};

/** Etiqueta de estado redondeada (En evaluación, Publicada, etc.). */
export function Pill({ tone = "gray", children, className }: PillProps) {
  return <span className={`pill tone-${tone}${className ? ` ${className}` : ""}`}>{children}</span>;
}
