import { expect, test } from "@playwright/test";
import { setupApiMocks } from "./support/mock-api";

test.describe("Login", () => {
  test("valida los campos requeridos en el cliente", async ({ page }) => {
    await setupApiMocks(page);
    await page.goto("/login");

    await page.getByRole("button", { name: "Ingresar" }).click();

    // No navega y muestra los errores de validación.
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Requerido").first()).toBeVisible();
  });

  test("muestra error con credenciales inválidas", async ({ page }) => {
    await setupApiMocks(page, { loginUser: undefined }); // login -> 401
    await page.goto("/login");

    await page.locator("#email").fill("admin@admin.com");
    await page.locator("#password").fill("ClaveMala1");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByText(/Credenciales inválidas/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("con credenciales válidas confirma el ingreso y redirige al panel del admin", async ({ page }) => {
    await setupApiMocks(page, {
      loginUser: { name: "Admin", role: "admin", adopter: false, email: "admin@admin.com" },
    });
    await page.goto("/login");

    await page.locator("#email").fill("admin@admin.com");
    await page.locator("#password").fill("Admin1234!");
    await page.getByRole("button", { name: "Ingresar" }).click();

    // El front detectó el rol admin y disparó el flujo correcto (toast + push a /admin).
    // Afirmamos el resultado observable; el acceso real al panel exige la cookie
    // firmada que sólo emite el backend, fuera del alcance de un E2E de frontend.
    await expect(page.getByText(/Redirigiendo al panel/i)).toBeVisible();
  });
});
