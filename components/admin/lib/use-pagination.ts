"use client";

import { useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;

  const pageItems = useMemo(
    () => items.slice(start, start + pageSize),
    [items, start, pageSize],
  );

  return {
    page: current,
    setPage,
    totalPages,
    pageItems,
    total,
    desde: total === 0 ? 0 : start + 1,
    hasta: Math.min(start + pageSize, total),
  };
}
