export type AnimalType = "perro" | "gato" | "otro";

export type Pet = {
  id: string;
  name?: string;
  photo: string;
  description: string;
  animalType: AnimalType;
  date: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
};
