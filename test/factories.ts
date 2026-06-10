/**
 * Fábricas de datos para tests. Cada una devuelve un objeto válido por defecto
 * y permite sobrescribir solo los campos que importan al test (patrón builder).
 */
import type { AdminUser } from "@/services/user.admin";
import type { Pet } from "@/types/pet";
import type { User } from "@/types/user";

export function makePet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: "pet-1",
    name: "Firulais",
    status: "perdido",
    photos: ["/images/firu.png"],
    description: "Perro mediano marrón, muy amistoso",
    animalType: "perro",
    date: "2026-01-10",
    location: "Palermo, CABA",
    contactPhone: "1122334455",
    contactEmail: "dueno@example.com",
    createdAt: "2026-01-10T10:00:00Z",
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    isLoggedIn: true,
    id: 1,
    name: "Lucía",
    email: "lucia@example.com",
    adopter: true,
    role: "user",
    signature: "sig-abc",
    ...overrides,
  };
}

export function makeAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: 1,
    name: "Admin",
    email: "admin@admin.com",
    role: "admin",
    roleId: 502,
    adopter: false,
    emailVerified: true,
    ssoProvider: null,
    photo: null,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}
