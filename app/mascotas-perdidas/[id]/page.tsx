"use client";

import { useUserContext } from "@/context/UserContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getIdPets } from "@/services/mascotas.pets";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function formatAge(months?: number): string {
  if (!months) return "—";
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (rest === 0) return `${years} ${years === 1 ? "año" : "años"}`;
  return `${years} a ${rest} m`;
}

export default function PetDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const dispatch = useAppDispatch();
  const { adopter } = useUserContext();
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pet = useAppSelector((state) => state.pet);
  const pets = useAppSelector((state) => state.allPets);
  const user = useAppSelector((state) => state.user);

  const isOwner =
    !!user.isLoggedIn && user.id != null && pet?.userId === user.id;

  useEffect(() => {
    if (!id) return;
    getIdPets(id)
      .then((res) => {
        if (res && res.ok && res.data) {
          dispatch({ type: "pets/pet", payload: res.data });
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [id, dispatch]);

  const similar = useMemo(() => {
    if (!pet || !pets) return null;
    const others = pets.filter((p) => p.id !== pet.id);
    const sameType = others.filter((p) => p.animalType === pet.animalType);
    const rest = others.filter((p) => p.animalType !== pet.animalType);
    return [...sameType, ...rest].slice(0, 4);
  }, [pets, pet]);

  const detail = useMemo(() => {
    if (!pet) return null;
    const animalLabel =
      pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1);
    const photoUrls = (pet.photos as unknown as string[]) || [];
    const mainPhoto = activePhoto ?? (photoUrls.length > 0 ? photoUrls[0] : null);

    const specs = [
      {
        icon: "⚥",
        label: "Sexo",
        value: pet.sex ? (pet.sex === "macho" ? "Macho" : "Hembra") : "—",
      },
      { icon: "🏷️", label: "Raza", value: pet.breed ?? "—" },
      { icon: "🎂", label: "Edad", value: formatAge(pet.ageMonths) },
      { icon: "🎨", label: "Color", value: pet.color ?? "—" },
      {
        icon: "⚖️",
        label: "Peso",
        value: pet.weightKg ? `${pet.weightKg} kg` : "—",
      },
      {
        icon: "📏",
        label: "Altura",
        value: pet.heightCm ? `${pet.heightCm} cm` : "—",
      },
    ];

    const checklist = [
      { label: "Se lleva bien con chicos", value: pet.friendlyWithKids },
      { label: "Vacunado/a", value: pet.vaccinated },
      { label: "Entrenado/a", value: pet.trained },
      { label: "Castrado/a", value: pet.neutered },
      { label: "Tiene chapita con nombre", value: pet.hasTag },
      { label: "Tiene microchip", value: pet.microchipped },
    ];
    return { animalLabel, photos: photoUrls, mainPhoto, specs, checklist };
  }, [pet, activePhoto]);

  if (loading) {
    return (
      <main>
        <div
          className="container"
          style={{ padding: "4rem 0", textAlign: "center" }}
        >
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  return pet && detail ? (
    <main>
      <div className="container pet-detail-wrap">
        {/* Breadcrumb */}
        <nav className="pet-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Inicio</Link>
          <span className="pet-breadcrumb-sep" aria-hidden>
            &gt;
          </span>
          <Link href="/mascotas-perdidas">Mascotas perdidas</Link>
          <span className="pet-breadcrumb-sep" aria-hidden>
            &gt;
          </span>
          <span>{pet.name ?? detail.animalLabel}</span>
        </nav>

        {/* Header */}
        <header className="pet-detail-header">
          {isOwner && (
            <Link
              href={`/mascotas-perdidas/${pet.id}/editar`}
              className="btn btn-outline btn-sm pet-edit-btn"
            >
              ✏️ Editar publicación
            </Link>
          )}
          <h1>¡Hola humano!</h1>
          <div className="pet-detail-identity">
            <div className="pet-detail-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={(pet.photos?.[0] as unknown as string) || "/images/avatar-placeholder.svg"}
                alt={pet.name ?? detail.animalLabel}
              />
            </div>
            <div className="pet-detail-identity-body">
              <h2>
                {pet.name ?? detail.animalLabel}
                <span className="pet-detail-idnum">
                  Pet ID: {pet.id.toUpperCase()}
                </span>
              </h2>
              <p className="pet-detail-country">
                <span className="pet-detail-flag" aria-hidden>
                  🇦🇷
                </span>
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
              <span className="pet-badge">
                {pet.status.toLocaleUpperCase()}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detail.mainPhoto || "/images/avatar-placeholder.svg"}
                alt={pet.name ?? detail.animalLabel}
              />
            </div>

            {detail.photos.length > 1 && (
              <div className="pet-detail-thumbs">
                {detail.photos.map((src) => (
                  <button
                    key={src}
                    type="button"
                    className={`pet-detail-thumb${detail.mainPhoto === src ? " active" : ""}`}
                    onClick={() => setActivePhoto(src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src || ""} alt="" />
                  </button>
                ))}
              </div>
            )}

            <div className="pet-detail-specs">
              {detail.specs.map((s) => (
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
              <h2>Historia de {pet.name ?? detail.animalLabel}</h2>
              <p>{pet.description}</p>

              <ul className="pet-detail-checklist">
                {detail.checklist.map((item) => (
                  <li key={item.label}>
                    <span
                      className={`pet-detail-check${item.value ? " ok" : item.value === false ? " no" : ""}`}
                      aria-hidden
                    >
                      {item.value === true
                        ? "✓"
                        : item.value === false
                          ? "✗"
                          : "—"}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            {adopter && pet.status === "en adopción" && (
              <section className="pet-detail-cta">
                <p>¿Me querés adoptar?</p>
                <Link
                  href={{
                    pathname: "/adoptar/solicitar",
                    query: {
                      pet: pet.id,
                      name: pet.name ?? detail.animalLabel,
                    },
                  }}
                  className="btn btn-primary"
                >
                  Empezar
                </Link>
              </section>
            )}
             {!adopter && (
              <section className="pet-detail-cta">
                <p>¿Te interesa adoptar?</p>
                <Link
                  href={{
                    pathname: "/adoptar/solicitar",
                    query: {
                      pet: pet.id,
                      name: pet.name ?? detail.animalLabel,
                    },
                  }}
                  className="btn btn-primary"
                >
                  Empezar
                </Link>
              </section>
            )}
          </aside>
        </div>

        {similar && (
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
                    <img
                      src={(p.photos?.[0] as unknown as string) || "/images/avatar-placeholder.svg"}
                      alt={p.name ?? ""}
                    />
                  </div>
                  <h3>{p.name ?? p.animalType}</h3>
                  <p>
                    {p.sex === "macho"
                      ? "Macho"
                      : p.sex === "hembra"
                        ? "Hembra"
                        : "—"}
                  </p>
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
  ) : (
    <main>
      <div
        className="container"
        style={{ padding: "4rem 0", textAlign: "center" }}
      >
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
