import type { ReactNode } from "react";

type Props = {
  label: string;
  /** Valor formateado para mostrar en modo lectura. */
  value: ReactNode;
  editing: boolean;
  /** Input / select a mostrar en modo edición. */
  children: ReactNode;
};

/**
 * Alterna entre mostrar un valor como texto (modo lectura)
 * o renderizar el control hijo (modo edición).
 * Elimina el doble bloque if/else del drawer.
 */
export function EditableField({ label, value, editing, children }: Props) {
  if (!editing && (value === null || value === undefined || value === "")) {
    return null;
  }

  return (
    <div className="vdrawer-field">
      <span className="vdrawer-field-label">{label}</span>
      {editing ? (
        <div className="vdrawer-field-control">{children}</div>
      ) : (
        <span className="vdrawer-field-value">{value}</span>
      )}
    </div>
  );
}
