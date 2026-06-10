import userEvent from "@testing-library/user-event";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { makeUser } from "@/test/factories";
import { renderWithStore, screen } from "@/test/render";

// Componente sonda mínimo que lee y escribe el store mediante los hooks tipados.
function UserProbe() {
  const name = useAppSelector((s) => s.user.name);
  const dispatch = useAppDispatch();
  return (
    <div>
      <span data-testid="name">{name || "(anónimo)"}</span>
      <button onClick={() => dispatch({ type: "user/SetUser", payload: makeUser({ name: "Nora" }) })}>
        set
      </button>
    </div>
  );
}

describe("hooks de Redux (useAppSelector / useAppDispatch)", () => {
  it("lee el estado precargado del store", () => {
    renderWithStore(<UserProbe />, { preloadedState: { user: makeUser({ name: "Ema" }) } });
    expect(screen.getByTestId("name")).toHaveTextContent("Ema");
  });

  it("despacha una acción y refleja el nuevo estado", async () => {
    renderWithStore(<UserProbe />);
    expect(screen.getByTestId("name")).toHaveTextContent("(anónimo)");
    await userEvent.click(screen.getByRole("button", { name: "set" }));
    expect(screen.getByTestId("name")).toHaveTextContent("Nora");
  });
});
