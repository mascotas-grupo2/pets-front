// Refugio que el superadmin está "mirando" (picker del topbar). Se guarda en
// localStorage y el interceptor de axios lo manda como ?refugioId=, de modo que
// el backend scopea las vistas de admin a ese refugio. El backend solo lo
// respeta para superadmin (ver withViewRefugio), así que para otros roles es
// inofensivo. null = "Todos los refugios" (vista agregada).
const KEY = "sa_view_refugio";

export function getViewRefugioId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

export function setViewRefugioId(id: number | null): void {
  if (typeof window === "undefined") return;
  if (id == null) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, String(id));
}
