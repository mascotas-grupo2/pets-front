import { CatLoader } from "@/components/cat-loader";

type LoadingProps = {
  /** Texto que acompaña al loader. */
  label?: string;
  /** Clase extra opcional para el contenedor. */
  className?: string;
};

/** Indicador de carga reutilizable: gatito animado + texto. */
export function Loading({ label = "CARGANDO", className }: LoadingProps) {
  return <CatLoader label={label} variant="inline" className={className} />;
}
