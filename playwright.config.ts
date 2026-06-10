import { defineConfig, devices } from "@playwright/test";

/**
 * E2E del frontend. Los tests mockean la red (`/api/proxy/**`) con page.route,
 * así NO dependen de que el backend esté levantado: son deterministas.
 *
 * Playwright levanta `next dev` automáticamente (o reusa el que ya tengas).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
