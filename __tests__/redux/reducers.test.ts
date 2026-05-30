import rootReducer, { AppAction } from "@/redux/reducers";
import { makeUser } from "@/test/factories";

const baseUser = makeUser({ id: 7 });

describe("rootReducer", () => {
  it("devuelve el estado inicial", () => {
    const state = rootReducer(undefined, { type: "@@INIT" } as unknown as AppAction);
    expect(state.user.isLoggedIn).toBe(false);
    expect(state.allPets).toEqual([]);
    expect(state.pet).toBeNull();
    expect(state.report_pet).toEqual({});
  });

  it("user/SetUser marca isLoggedIn y guarda los datos", () => {
    const state = rootReducer(undefined, { type: "user/SetUser", payload: baseUser });
    expect(state.user).toMatchObject({
      isLoggedIn: true,
      id: 7,
      name: "Lucía",
      adopter: true,
      role: "user",
    });
  });

  it("user/Logout restablece el estado inicial del usuario", () => {
    const logged = rootReducer(undefined, { type: "user/SetUser", payload: baseUser });
    const out = rootReducer(logged, { type: "user/Logout" });
    expect(out.user.isLoggedIn).toBe(false);
    expect(out.user.name).toBe("");
  });

  it("pets/all_pets reemplaza la lista de mascotas", () => {
    const pets = [{ id: "1" }, { id: "2" }] as never;
    const state = rootReducer(undefined, { type: "pets/all_pets", payload: pets });
    expect(state.allPets).toHaveLength(2);
  });

  it("pets/pet guarda la mascota seleccionada", () => {
    const pet = { id: "42" } as never;
    const state = rootReducer(undefined, { type: "pets/pet", payload: pet });
    expect(state.pet).toEqual({ id: "42" });
  });

  it("pets/ReportPet guarda el payload del reporte", () => {
    const state = rootReducer(undefined, { type: "pets/ReportPet", payload: { foo: "bar" } });
    expect(state.report_pet).toEqual({ foo: "bar" });
  });
});
