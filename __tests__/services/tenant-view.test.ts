import { getViewRefugioId, setViewRefugioId } from "@/services/tenant-view";

describe("tenant-view (superadmin refugio picker)", () => {
  beforeEach(() => window.localStorage.clear());

  it("sin selección devuelve null", () => {
    expect(getViewRefugioId()).toBeNull();
  });

  it("persiste y lee el refugio seleccionado", () => {
    setViewRefugioId(7);
    expect(getViewRefugioId()).toBe(7);
  });

  it("seleccionar null ('Todos') limpia la selección", () => {
    setViewRefugioId(7);
    setViewRefugioId(null);
    expect(getViewRefugioId()).toBeNull();
  });

  it("un valor no numérico guardado se ignora (null)", () => {
    window.localStorage.setItem("sa_view_refugio", "abc");
    expect(getViewRefugioId()).toBeNull();
  });
});
