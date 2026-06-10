"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Seguimiento } from "./seguimientos.data";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type Props = {
  /** Fecha de referencia (hoy). */
  now: Date;
  /** Todos los seguimientos cargados (para marcar días y armar la agenda). */
  items: Seguimiento[];
};

/** Devuelve la cantidad de días del mes y el offset (lunes = 0) del día 1. */
function monthGrid(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0 = domingo
  const offset = (firstDow + 6) % 7; // lunes = 0
  return { daysInMonth, offset };
}

/** Clave AAAA-MM-DD para comparar fechas sin la hora. */
function dayKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function SeguimientosCalendar({ now, items }: Props) {
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  // Día seleccionado (por defecto, hoy).
  const [selected, setSelected] = useState(
    dayKey(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  const { daysInMonth, offset } = monthGrid(viewYear, viewMonth);

  // Medianoche de hoy: todo lo anterior queda deshabilitado.
  const todayStart = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);

  // Mapa día (AAAA-MM-DD) → seguimientos de ese día.
  const byDay = useMemo(() => {
    const map = new Map<string, Seguimiento[]>();
    for (const s of items) {
      const d = new Date(s.appointmentAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = dayKey(d.getFullYear(), d.getMonth(), d.getDate());
      const list = map.get(key);
      if (list) list.push(s);
      else map.set(key, [s]);
    }
    return map;
  }, [items]);

  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prevMonth() {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }
  function nextMonth() {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const todayKey = dayKey(now.getFullYear(), now.getMonth(), now.getDate());

  // Agenda del día seleccionado.
  const agenda = useMemo(
    () =>
      (byDay.get(selected) ?? [])
        .slice()
        .sort((a, b) => a.horaLabel.localeCompare(b.horaLabel)),
    [byDay, selected],
  );

  const [selY, selM, selD] = selected.split("-").map(Number);
  const isSelToday = selected === todayKey;
  const agendaTitle = isSelToday
    ? `Hoy · ${now.getDate()} de ${MONTHS[now.getMonth()].toLowerCase()}`
    : `${selD} de ${MONTHS[selM - 1].toLowerCase()} de ${selY}`;

  return (
    <aside className="seg-side">
      <div className="seg-cal">
        <div className="seg-cal-head">
          <button type="button" className="seg-cal-nav" aria-label="Mes anterior" onClick={prevMonth}>
            <ChevronLeft size={16} />
          </button>
          <span className="seg-cal-title">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button type="button" className="seg-cal-nav" aria-label="Mes siguiente" onClick={nextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="seg-cal-grid">
          {WEEKDAYS.map((d, i) => (
            <span key={`w-${i}`} className="seg-cal-dow">
              {d}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={`e-${i}`} className="seg-cal-cell is-empty" />;

            const key = dayKey(viewYear, viewMonth, day);
            const cellDate = new Date(viewYear, viewMonth, day);
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const isPast = cellDate < todayStart; // solo días ≥ hoy son seleccionables
            const hasEvents = byDay.has(key);

            const cls = [
              "seg-cal-cell",
              "is-day",
              isSelected ? "is-selected" : "",
              isToday && !isSelected ? "is-today" : "",
              hasEvents && !isSelected ? "has-events" : "",
              isPast ? "is-disabled" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={`d-${day}`}
                type="button"
                className={cls}
                disabled={isPast}
                aria-pressed={isSelected}
                aria-label={`${day} de ${MONTHS[viewMonth]}`}
                onClick={() => setSelected(key)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="seg-agenda">
        <h3 className="seg-agenda-title">{agendaTitle}</h3>
        {agenda.length === 0 ? (
          <p className="seg-agenda-empty">
            {isSelToday ? "Sin citas para hoy." : "Sin citas para este día."}
          </p>
        ) : (
          <ul className="seg-agenda-list">
            {agenda.map((s) => (
              <li key={s.id} className="seg-agenda-item">
                <span className="seg-agenda-time">{s.horaLabel}</span>
                <span className="seg-agenda-text">
                  <strong>{s.petName}</strong>
                  <span className="seg-agenda-sub">{s.tipo}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
