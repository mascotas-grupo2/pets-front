import { render, screen } from "@testing-library/react";
import { Brand } from "@/components/brand";

describe("Brand", () => {
  it("renderiza el enlace al home con su aria-label", () => {
    render(<Brand />);
    const link = screen.getByRole("link", { name: "Huellitas Unidas" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("muestra el nombre de la marca", () => {
    render(<Brand />);
    expect(screen.getByText("Huellitas")).toBeInTheDocument();
    expect(screen.getByText("Unidas")).toBeInTheDocument();
  });
});
