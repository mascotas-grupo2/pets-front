import { render, screen } from "@testing-library/react";
import { EstadoPill, MascotaEstadoPill } from "@/components/admin/lib/pet-status";

describe("EstadoPill", () => {
  it("muestra la etiqueta del estado de publicación", () => {
    render(<EstadoPill status="activo" />);
    expect(screen.getByText("Publicada")).toBeInTheDocument();
  });

  it("renderiza '—' cuando no hay estado", () => {
    render(<EstadoPill status={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("MascotaEstadoPill", () => {
  it("usa el label provisto cuando existe", () => {
    render(<MascotaEstadoPill status="perdido" label="Perdido" />);
    expect(screen.getByText("Perdido")).toBeInTheDocument();
  });

  it("cae al valor de status si no hay label", () => {
    render(<MascotaEstadoPill status="adoptado" />);
    expect(screen.getByText("adoptado")).toBeInTheDocument();
  });

  it("renderiza '—' sin status", () => {
    render(<MascotaEstadoPill />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
