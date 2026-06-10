import { act, renderHook } from "@testing-library/react";
import { usePagination } from "@/components/admin/lib/use-pagination";

const items = Array.from({ length: 25 }, (_, i) => i + 1);

describe("usePagination", () => {
  it("calcula totalPages y la primera página", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.total).toBe(25);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.pageItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.current.desde).toBe(1);
    expect(result.current.hasta).toBe(10);
  });

  it("cambia de página y recorta el slice correcto", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
    expect(result.current.pageItems).toEqual([21, 22, 23, 24, 25]);
    expect(result.current.desde).toBe(21);
    expect(result.current.hasta).toBe(25);
  });

  it("limita la página al máximo disponible", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.setPage(99));
    expect(result.current.page).toBe(3);
  });

  it("maneja una lista vacía", () => {
    const { result } = renderHook(() => usePagination([] as number[], 10));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.total).toBe(0);
    expect(result.current.desde).toBe(0);
    expect(result.current.hasta).toBe(0);
    expect(result.current.pageItems).toEqual([]);
  });
});
