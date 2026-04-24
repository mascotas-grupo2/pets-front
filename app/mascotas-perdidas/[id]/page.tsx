"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Pet } from "@/types/pet";
import { getPets } from "@/lib/storage";

function formatAge(months?: number): string {
  if (!months) return "—";
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (rest === 0) return `${years} ${years === 1 ? "año" : "años"}`;
  return `${years} a ${rest} m`;
}

export default function PetDetailPage() {
  const params = useParams<{ id: string }>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    setPets(getPets());
  }, []);

  const pet = useMemo(
    () => pets.find((p) => p.id === params.id),
    [pets, params.id],
  );

  const similar = useMemo(() => {
    if (!pet) return [];
    const others = pets.filter((p) => p.id !== pet.id);
    const sameType = others.filter((p) => p.animalType === pet.animalType);
    const rest = others.filter((p) => p.animalType !== pet.animalType);
    return [...sameType, ...rest].slice(0, 4);
  }, [pets, pet]);

  if (pets.length === 0) {
    return (
      <main>
        <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  if (!pet) {
    return (
      <main>
        <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
          <h1>Mascota no encontrada</h1>
          <p style={{ marginBottom: "2rem" }}>
            Esta publicación no existe o fue eliminada.
          </p>
          <Link href="/mascotas-perdidas" className="btn btn-primary">
            Volver al listado
          </Link>
        </div>
      </main>
    );
  }

  const animalLabel =
    pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1);
  const photos = pet.photos && pet.photos.length > 0 ? pet.photos : [pet.photo];
  const mainPhoto = activePhoto ?? photos[0];

  const specs = [
    { icon: "⚥", label: "Sexo", value: pet.sex ? (pet.sex === "macho" ? "Macho" : "Hembra") : "—" },
    { icon: "🏷️", label: "Raza", value: pet.breed ?? "—" },
    { icon: "🎂", label: "Edad", value: formatAge(pet.ageMonths) },
    { icon: "🎨", label: "Color", value: pet.color ?? "—" },
    { icon: "⚖️", label: "Peso", value: pet.weightKg ? `${pet.weightKg} kg` : "—" },
    { icon: "📏", label: "Altura", value: pet.heightCm ? `${pet.heightCm} cm` : "—" },
  ];

  const checklist = [
    { label: "Se lleva bien con chicos", value: pet.friendlyWithKids },
    { label: "Vacunado/a", value: pet.vaccinated },
    { label: "Entrenado/a", value: pet.trained },
    { label: "Castrado/a", value: pet.neutered },
    { label: "Tiene chapita con nombre", value: pet.hasTag },
    { label: "Tiene microchip", value: pet.microchipped },
  ];

  return (
    <main>
      <div className="container pet-detail-wrap">
        {/* Breadcrumb */}
        <nav className="pet-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Inicio</Link>
          <span className="pet-breadcrumb-sep" aria-hidden>&gt;</span>
          <Link href="/mascotas-perdidas">Mascotas perdidas</Link>
          <span className="pet-breadcrumb-sep" aria-hidden>&gt;</span>
          <span>{pet.name ?? animalLabel}</span>
        </nav>

        {/* Header */}
        <header className="pet-detail-header">
          <h1>¡Hola humano!</h1>
          <div className="pet-detail-identity">
            <div className="pet-detail-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pet.photo} alt={pet.name ?? animalLabel} />
            </div>
            <div className="pet-detail-identity-body">
              <h2>
                {pet.name ?? animalLabel}
                <span className="pet-detail-idnum">
                  Pet ID: {pet.id.toUpperCase()}
                </span>
              </h2>
              <p className="pet-detail-country">
                <span className="pet-detail-flag" aria-hidden>🇦🇷</span>
                Argentina
              </p>
              <p className="pet-detail-place">
                <span aria-hidden>📍</span>
                {pet.location}
              </p>
            </div>
          </div>
        </header>

        {/* Main grid */}
        <div className="pet-detail-grid">
          <div className="pet-detail-col-main">
            <div className="pet-detail-hero">
              <span className="pet-badge">En adopción</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainPhoto} alt={pet.name ?? animalLabel} />
            </div>

            {photos.length > 1 && (
              <div className="pet-detail-thumbs">
                {photos.map((src) => (
                  <button
                    key={src}
                    type="button"
                    className={`pet-detail-thumb${mainPhoto === src ? " active" : ""}`}
                    onClick={() => setActivePhoto(src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}

            <div className="pet-detail-specs">
              {specs.map((s) => (
                <div key={s.label} className="pet-detail-spec">
                  <span className="pet-detail-spec-icon" aria-hidden>
                    {s.icon}
                  </span>
                  <span className="pet-detail-spec-label">{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>

            <table className="pet-vacc-table">
              <thead>
                <tr>
                  <th>Edad</th>
                  <th>8va semana</th>
                  <th>14va semana</th>
                  <th>22va semana</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Vacunado</th>
                  <td>
                    Séxtuple
                    <br />
                    Moquillo
                    <br />
                    Leptospirosis
                  </td>
                  <td>
                    Séxtuple
                    <br />
                    Parvovirus
                    <br />
                    Leptospirosis
                  </td>
                  <td>
                    Séxtuple
                    <br />
                    Antirrábica
                    <br />
                    Leptospirosis
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <aside className="pet-detail-col-side">
            <section className="pet-detail-story">
              <h2>Historia de {pet.name ?? animalLabel}</h2>
              <p>{pet.description}</p>

              <ul className="pet-detail-checklist">
                {checklist.map((item) => (
                  <li key={item.label}>
                    <span
                      className={`pet-detail-check${item.value ? " ok" : item.value === false ? " no" : ""}`}
                      aria-hidden
                    >
                      {item.value === true ? "✓" : item.value === false ? "✗" : "—"}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="pet-detail-cta">
              <p>¿Te interesa adoptar?</p>
              <Link
                href={{
                  pathname: "/adoptar/solicitar",
                  query: {
                    pet: pet.id,
                    name: pet.name ?? animalLabel,
                  },
                }}
                className="btn btn-primary"
              >
                Empezar
              </Link>
            </section>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="pet-detail-similar">
            <div className="section-title">
              <h2>Reportes similares</h2>
              <p>Otras mascotas del mismo tipo que aún buscan su familia.</p>
            </div>
            <ul className="similar-grid">
              {similar.map((p) => (
                <li key={p.id} className="similar-card">
                  <div className="similar-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.photo} alt={p.name ?? ""} />
                  </div>
                  <h3>{p.name ?? p.animalType}</h3>
                  <p>{p.sex === "macho" ? "Macho" : p.sex === "hembra" ? "Hembra" : "—"}</p>
                  <p className="similar-breed">{p.breed ?? p.animalType}</p>
                  <Link
                    href={`/mascotas-perdidas/${p.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    Ver más info
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
