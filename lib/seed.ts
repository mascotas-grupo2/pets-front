import { Pet } from "@/types/pet";

export const seedPets: Pet[] = [
  {
    id: "seed-1",
    name: "Toby",
    photo: "/images/pet-dog.jpg",
    description:
      "Labrador color marrón, muy amigable. Lleva collar rojo y chapita con nombre.",
    animalType: "perro",
    date: "2026-04-05",
    location: "Av. Corrientes 1234, CABA",
    contactPhone: "+54 11 5555-1234",
    contactEmail: "familia.toby@example.com",
    createdAt: "2026-04-05T10:00:00Z",
  },
  {
    id: "seed-2",
    name: "Luna",
    photo: "/images/pet-cat.jpg",
    description:
      "Gata siamesa de ojos celestes. Responde al nombre de Luna y es muy sociable.",
    animalType: "gato",
    date: "2026-04-08",
    location: "Parque Centenario, CABA",
    contactPhone: "+54 11 5555-5678",
    contactEmail: "hola.luna@example.com",
    createdAt: "2026-04-08T15:30:00Z",
  },
];
