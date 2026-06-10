import { Loader2 } from "lucide-react";

type LoadingProps = {
  /** Texto que acompaña al spinner. */
  label?: string;
  /** Clase extra opcional para el contenedor. */
  className?: string;
};

/** Indicador de carga reutilizable: spinner girando + texto. */
export function Loading({ label = "Cargando…", className }: LoadingProps) {
  return (
    <span className={`ui-loading${className ? ` ${className}` : ""}`}>
      <Loader2 size={16} className="ui-spin" aria-hidden />
      {label}
    </span>
  );
}
