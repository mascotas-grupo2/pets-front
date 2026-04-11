import { Pet } from "@/types/pet";
import { seedPets } from "./seed";

const KEY = "pets-lost";
const VERSION_KEY = "pets-lost-version";
const SEED_VERSION = "2";

export function getPets(): Pet[] {
  if (typeof window === "undefined") return seedPets;
  const storedVersion = window.localStorage.getItem(VERSION_KEY);
  if (storedVersion !== SEED_VERSION) {
    window.localStorage.setItem(KEY, JSON.stringify(seedPets));
    window.localStorage.setItem(VERSION_KEY, SEED_VERSION);
    return seedPets;
  }
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(seedPets));
    return seedPets;
  }
  try {
    return JSON.parse(raw) as Pet[];
  } catch {
    window.localStorage.setItem(KEY, JSON.stringify(seedPets));
    return seedPets;
  }
}

export function addPet(pet: Pet): void {
  const pets = getPets();
  const next = [pet, ...pets];
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function resetPets(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
