"use client";

import { useCallback, useState } from "react";

/**
 * Estado y cálculos de paginación compartidos por las tablas del panel admin.
 * Centraliza el boilerplate que estaba duplicado idéntico en los 5 hooks de sección.
 *
 * - `page`: página solicitada. En listados paginados server-side es la que se
 *   manda al backend (usar `page`, no `safePage`, para no romper el fetch).
 * - `safePage`: `page` clampeada a `[1, totalPages]`. Para paginación client-side
 *   (slicing de datos ya cargados, ej. seguimientos).
 * - `totalPages`/`desde`/`hasta`: derivados para el texto "mostrando X–Y de Z".
 * - `resetPage()`: vuelve a la página 1 (los setters de filtros lo llaman).
 */
export function usePagination(pageSize: number, total: number) {
  const [page, setPage] = useState(1);
  const resetPage = useCallback(() => setPage(1), []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const desde = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const hasta = Math.min(safePage * pageSize, total);

  return { page, setPage, resetPage, safePage, totalPages, desde, hasta };
}
