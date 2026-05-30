import { expect, test } from "@playwright/test";
import { makeLostPet, setupApiMocks } from "./support/mock-api";

test.describe("Página de inicio", () => {
  test("muestra el hero y permite ir a los reportes", async ({ page }) => {
    await setupApiMocks(page, { pets: [] });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("oportunidad");

    await page.getByRole("link", { name: "Ver reportes" }).click();
    await expect(page).toHaveURL(/\/mascotas-perdidas$/);
  });

  test("muestra el estado vacío cuando no hay mascotas", async ({ page }) => {
    await setupApiMocks(page, { pets: [] });
    await page.goto("/");
    await expect(page.getByText("Todavía no hay mascotas reportadas.")).toBeVisible();
  });

  test("renderiza las tarjetas de mascotas que vienen del backend", async ({ page }) => {
    await setupApiMocks(page, {
      pets: [
        makeLostPet({ id: "p1", name: "Firulais" }),
        makeLostPet({ id: "p2", name: "Michi", animalType: "gato" }),
      ],
    });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Firulais" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Michi" })).toBeVisible();
  });
});
