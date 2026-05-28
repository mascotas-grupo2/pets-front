import type { ReactNode } from "react";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { Loading } from "./loading";

export type SortDir = "asc" | "desc";
export type TableSort = { key: string; dir: SortDir };

export type Column<T> = {
  /** Identificador único de la columna (también clave de orden si es sortable). */
  key: string;
  /** Encabezado visible. Omitir en columnas sin título (ej. acciones). */
  label?: string;
  /** Etiqueta accesible cuando la columna no tiene `label` visible. */
  ariaLabel?: string;
  /** Habilita el orden por esta columna (requiere `onSort` en la tabla). */
  sortable?: boolean;
  /** Alineación del contenido de la celda. */
  align?: "left" | "center" | "right";
  /** Clase extra para la celda `<td>`. */
  tdClassName?: string;
  /** Render del contenido de la celda para una fila. */
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  /** Clave estable por fila para el `key` de React. */
  rowKey: (row: T) => string | number;
  /** Muestra una fila de carga (spinner) en lugar de los datos. */
  loading?: boolean;
  loadingLabel?: string;
  /** Contenido a mostrar cuando no hay filas. */
  empty?: ReactNode;
  /** Orden activo (o null). */
  sort?: TableSort | null;
  /** Callback al clickear un encabezado sortable. */
  onSort?: (key: string) => void;
  /** Clase extra para la `<table>` (ej. estilos específicos de una sección). */
  tableClassName?: string;
  /** Clase opcional por fila. */
  rowClassName?: (row: T) => string | undefined;
};

const ALIGN_CLASS: Record<NonNullable<Column<unknown>["align"]>, string> = {
  left: "",
  center: "ta-center",
  right: "ta-right",
};

/**
 * Tabla genérica del panel: encabezados (con orden opcional), estados de
 * carga/vacío integrados y render de celdas por columna. Reutilizada por todas
 * las secciones para no repetir la estructura `<table>` + loading + empty.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  loadingLabel = "Cargando…",
  empty = "No hay datos para mostrar.",
  sort = null,
  onSort,
  tableClassName,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="dash-table-wrap">
      <table className={`dash-table${tableClassName ? ` ${tableClassName}` : ""}`}>
        <thead>
          <tr>
            {columns.map((col) => {
              const alignClass = ALIGN_CLASS[col.align ?? "left"];
              if (col.sortable && onSort) {
                const active = sort?.key === col.key;
                return (
                  <th key={col.key} className={alignClass || undefined}>
                    <button
                      type="button"
                      className={`pub-sort${active ? " active" : ""}`}
                      onClick={() => onSort(col.key)}
                    >
                      {col.label}
                      <span className="pub-sort-arrow" aria-hidden>
                        {active ? (
                          sort?.dir === "asc" ? (
                            <ArrowUp size={13} />
                          ) : (
                            <ArrowDown size={13} />
                          )
                        ) : (
                          <ChevronsUpDown size={13} />
                        )}
                      </span>
                    </button>
                  </th>
                );
              }
              return (
                <th
                  key={col.key}
                  className={alignClass || undefined}
                  aria-label={col.label ? undefined : col.ariaLabel}
                >
                  {col.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="val-state">
                <Loading label={loadingLabel} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="val-state">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className={rowClassName?.(row)}>
                {columns.map((col) => {
                  const alignClass = ALIGN_CLASS[col.align ?? "left"];
                  const cls = [col.tdClassName, alignClass]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <td key={col.key} className={cls || undefined}>
                      {col.render(row)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
