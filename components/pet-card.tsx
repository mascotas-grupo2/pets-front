import { Pet } from "@/types/pet";

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <li className="pet-card">
      <div className="pet-photo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pet.photo} alt={pet.name ?? pet.description} />
        <span className="pet-badge">Perdido</span>
      </div>
      <div className="pet-body">
        <h3 className="pet-title">
          {pet.name ?? pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1)}
        </h3>
        <p className="pet-desc">{pet.description}</p>
        <div className="pet-meta">
          <span>📍 {pet.location}</span>
          <span>📅 {pet.date}</span>
        </div>
        <div className="pet-card-footer">
          <span>{pet.contactPhone}</span>
          <a href={`mailto:${pet.contactEmail}`}>Contactar →</a>
        </div>
      </div>
    </li>
  );
}
