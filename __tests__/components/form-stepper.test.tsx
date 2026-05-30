import { render, screen } from "@testing-library/react";
import { FormStepper, type StepDef } from "@/components/form-stepper";

const steps: StepDef[] = [
  { key: "a", label: "Datos", icon: <span>1</span> },
  { key: "b", label: "Fotos", icon: <span>2</span> },
  { key: "c", label: "Contacto", icon: <span>3</span> },
];

describe("FormStepper", () => {
  it("renderiza un item por paso con sus etiquetas", () => {
    render(<FormStepper steps={steps} current={0} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Datos")).toBeInTheDocument();
    expect(screen.getByText("Fotos")).toBeInTheDocument();
    expect(screen.getByText("Contacto")).toBeInTheDocument();
  });

  it("marca los pasos como done/active/pending según current", () => {
    render(<FormStepper steps={steps} current={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0].className).toContain("done");
    expect(items[1].className).toContain("active");
    expect(items[2].className).toContain("pending");
  });
});
