import { render, screen } from "@testing-library/react";
import { PetCard } from "@/components/pet-card";
import { makePet } from "@/test/factories";

const basePet = makePet({ id: "abc-123" });

describe("PetCard", () => {
  it("muestra nombre, descripción, ubicación y fecha", () => {
    render(<PetCard pet={basePet} />);
    expect(screen.getByRole("heading", { name: "Firulais" })).toBeInTheDocument();
    expect(screen.getByText(/Perro mediano marrón/)).toBeInTheDocument();
    expect(screen.getByText(/Palermo, CABA/)).toBeInTheDocument();
    expect(screen.getByText(/2026-01-10/)).toBeInTheDocument();
  });

  it("enlaza al detalle de la mascota por id", () => {
    render(<PetCard pet={basePet} />);
    const links = screen.getAllByRole("link");
    expect(links.some((a) => a.getAttribute("href") === "/mascotas-perdidas/abc-123")).toBe(true);
  });

  it("muestra el badge de estado en mayúsculas", () => {
    render(<PetCard pet={basePet} />);
    expect(screen.getByText("PERDIDO")).toBeInTheDocument();
  });

  it("usa el tipo de animal capitalizado como título cuando no hay nombre", () => {
    render(<PetCard pet={{ ...basePet, name: undefined }} />);
    expect(screen.getByRole("heading", { name: "Perro" })).toBeInTheDocument();
  });

  it("usa la imagen por defecto cuando no hay fotos", () => {
    render(<PetCard pet={{ ...basePet, photos: null }} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/pet-dog.png");
  });

  it("muestra el estado del reporte solo si showReportStatus está activo", () => {
    const { rerender } = render(
      <PetCard pet={{ ...basePet, reportStatus: "pendiente" }} />,
    );
    expect(screen.queryByText("Pendiente de revisión")).not.toBeInTheDocument();

    rerender(<PetCard pet={{ ...basePet, reportStatus: "pendiente" }} showReportStatus />);
    expect(screen.getByText("Pendiente de revisión")).toBeInTheDocument();
  });
});
