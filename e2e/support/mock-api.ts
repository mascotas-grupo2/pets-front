import type { Page, Route } from "@playwright/test";

/**
 * Mocks de la API para los E2E. Interceptan el proxy del front (`/api/proxy/**`)
 * para que los tests no toquen el backend real.
 *
 * Cualquier endpoint no contemplado responde vacío (GET) o 401 (resto), así las
 * páginas de destino nunca quedan colgadas esperando la red.
 */
export type LostPet = {
  id: string;
  name?: string;
  status: string;
  description: string;
  animalType: string;
  date: string;
  location: string;
  photos: string[] | null;
  reportStatus?: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
};

export function makeLostPet(over: Partial<LostPet> = {}): LostPet {
  return {
    id: "pet-1",
    name: "Firulais",
    status: "perdido",
    description: "Perro mediano marrón, muy amistoso",
    animalType: "perro",
    date: "2026-01-10",
    location: "Palermo, CABA",
    photos: ["/images/pet-dog.png"],
    reportStatus: "activo",
    contactPhone: "1122334455",
    contactEmail: "dueno@example.com",
    createdAt: "2026-01-10T10:00:00Z",
    ...over,
  };
}

type Options = {
  /** Mascotas que devuelve GET /mascotas/. Por defecto, lista vacía. */
  pets?: LostPet[];
  /** Usuario devuelto por un login exitoso. Si se omite, el login responde 401. */
  loginUser?: { name: string; role: string; adopter: boolean; email?: string };
};

export async function setupApiMocks(page: Page, options: Options = {}) {
  const { pets = [], loginUser } = options;

  await page.route("**/api/proxy/**", (route: Route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    if (method === "GET" && /\/api\/proxy\/mascotas\/?(\?|$)/.test(url)) {
      return route.fulfill({ json: pets });
    }

    if (method === "POST" && url.includes("/api/proxy/auth/login")) {
      return loginUser
        ? route.fulfill({ status: 200, json: loginUser })
        : route.fulfill({ status: 401, json: { message: "Credenciales inválidas" } });
    }

    // Fallback: siempre 200 para no disparar el interceptor de 401 del front
    // (que forzaría un redirect a /login). GET -> lista vacía, resto -> objeto.
    return route.fulfill({ status: 200, json: method === "GET" ? [] : {} });
  });
}
