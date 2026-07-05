"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

type Opt<V> = { value: V; label: string; disabled?: boolean };

type Props<V extends string | number> = {
  id?: string;
  value: V | "";
  options: Opt<V>[];
  placeholder: string;
  onChange: (value: V) => void;
  /** Muestra un buscador arriba de la lista (útil para listas largas). */
  searchable?: boolean;
  disabled?: boolean;
  /** Ocupa todo el ancho disponible como flex item (para filas con botón al lado). */
  grow?: boolean;
};

/**
 * Dropdown propio compartido (reemplaza al <select> nativo, que renderiza el listado feo del
 * SO). Buscable, accesible por teclado y consistente con el design system.
 */
export function ComboSelect<V extends string | number>({
  id,
  value,
  options,
  placeholder,
  onChange,
  searchable = true,
  disabled = false,
  grow = false,
}: Props<V>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;
  const filtered =
    searchable && query.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : options;

  // Cerrar al hacer click afuera.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Al abrir: foco en el buscador y reset.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, searchable]);

  function choose(v: V) {
    onChange(v);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open && (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[active];
      if (opt && !opt.disabled) choose(opt.value);
    }
  }

  return (
    <div
      className={`seg-combo${grow ? " seg-combo--grow" : ""}`}
      ref={rootRef}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        id={id}
        disabled={disabled}
        className={`seg-combo-btn${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className={selected ? "seg-combo-val" : "seg-combo-ph"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} aria-hidden className="seg-combo-caret" />
      </button>

      {open && (
        <div className="seg-combo-pop" role="listbox">
          {searchable && (
            <div className="seg-combo-search">
              <Search size={14} aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Buscar…"
                aria-label="Buscar opción"
              />
            </div>
          )}
          <ul className="seg-combo-list">
            {filtered.length === 0 ? (
              <li className="seg-combo-empty">Sin resultados</li>
            ) : (
              filtered.map((o, i) => {
                const isSel = o.value === value;
                return (
                  <li key={String(o.value)}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={o.disabled}
                      disabled={o.disabled}
                      className={`seg-combo-opt${isSel ? " is-selected" : ""}${
                        i === active ? " is-active" : ""
                      }`}
                      onMouseEnter={() => !o.disabled && setActive(i)}
                      onClick={() => !o.disabled && choose(o.value)}
                    >
                      <span>{o.label}</span>
                      {isSel && <Check size={15} aria-hidden />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
