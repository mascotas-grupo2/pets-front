import Link from "next/link";
import { Pet } from "@/types/pet";

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <li className="pet-card">
      <Link href={`/mascotas-perdidas/${pet.id}`} className="pet-photo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Array.isArray(pet.photos) && pet.photos.length > 0 ? pet.photos[0] : "/images/pet-dog.png"} alt={pet.name ?? pet.description} />
        <span className="pet-badge">{pet.status && pet.status.toLocaleUpperCase() || "PERDIDO"}</span>
      </Link>
      <div className="pet-body">
        <h3 className="pet-title">
          {pet.name ??
            pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1)}
        </h3>
        <p className="pet-desc">{pet.description}</p>
        <div className="pet-meta">
          <span>📍 {pet.location}</span>
          <span>📅 {pet.date}</span>
        </div>
        <div className="pet-card-footer">
          <Link href={`/mascotas-perdidas/${pet.id}`} className="pet-card-cta">
            Ver más info →
          </Link>
        </div>
      </div>
    </li>
  );
}
