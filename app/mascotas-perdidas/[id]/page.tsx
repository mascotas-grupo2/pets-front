"use client";

import { useUserContext } from "@/context/UserContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getIdPets, getAllPets } from "@/services/mascotas.pets";
import {
  getMyAdoptions,
  getMyPetCompatibility,
  type PetCompatibility,
} from "@/services/adoptions";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CatLoader } from "@/components/cat-loader";
import { PetCardActions } from "@/components/pet-card-actions";
import { PetComments } from "@/components/pet-comments";
import { Share2, Eye } from "lucide-react";

function formatAge(months?: number): string {
  if (!months) return "—";
  if (months < 12) return `${months} meses`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (rest === 0) return `${years} ${years === 1 ? "año" : "años"}`;
  return `${years} a ${rest} m`;
}

function compatTone(pct: number) {
  if (pct >= 75) return { stroke: "#22c55e", label: "tone-green" };
  if (pct >= 50) return { stroke: "#f59e0b", label: "tone-amber" };
  return { stroke: "#ef4444", label: "tone-red" };
}

function compatLabel(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Alta";
  if (score >= 65) return "Buena";
  if (score >= 50) return "Moderada";
  return "Baja";
}

function CompatCircle({ pct }: { pct: number }) {
  const tone = compatTone(pct);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="sdet-compat-circle-wrap">
      <svg width="136" height="136" viewBox="0 0 136 136">
        <circle
          cx="68"
          cy="68"
          r={r}
          fill="none"
          stroke="var(--gray-100)"
          strokeWidth="10"
        />
        <circle
          cx="68"
          cy="68"
          r={r}
          fill="none"
          stroke={tone.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="sdet-compat-inner">
        <span className="sdet-compat-value">{pct}%</span>
        <span className={`sdet-compat-sublabel ${tone.label}`}>
          {compatLabel(pct)}
        </span>
      </div>
    </div>
  );
}

export default function PetDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const dispatch = useAppDispatch();
  const { adopter } = useUserContext();
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Si el usuario ya envió una solicitud para esta mascota, deshabilitamos el CTA.
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [compatibility, setCompatibility] = useState<PetCompatibility | null>(
    null,
  );
  const [compatibilityLoading, setCompatibilityLoading] = useState(false);

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

  // Aseguramos tener la lista pública para calcular "reportes similares" aunque
  // se entre directo a la URL del detalle.
  useEffect(() => {
    getAllPets()
      .then((res) => {
        if (res && res.ok && res.data) {
          dispatch({ type: "pets/all_pets", payload: res.data });
        }
      })
      .catch((error) => console.error(error));
  }, [dispatch]);

  // ¿El usuario ya envió una solicitud para esta mascota?
  useEffect(() => {
    if (!id || !user.isLoggedIn) {
      setAlreadyApplied(false);
      return;
    }
    getMyAdoptions()
      .then((res) => {
        if (res && res.ok && Array.isArray(res.data)) {
          setAlreadyApplied(res.data.some((a) => a.petId === id));
        }
      })
      .catch(() => {});
  }, [id, user.isLoggedIn]);

  // Matching visible para mascotas en adopción: se calcula contra el perfil o
  // solicitud más reciente del usuario autenticado.
  useEffect(() => {
    if (!id || !user.isLoggedIn || pet?.status !== "en adopción") {
      setCompatibility(null);
      return;
    }

    let cancelled = false;
    setCompatibilityLoading(true);
    getMyPetCompatibility(id)
      .then((res) => {
        if (!cancelled && res?.ok && res.data) setCompatibility(res.data);
        if (!cancelled && (!res?.ok || !res.data)) setCompatibility(null);
      })
      .catch(() => {
        if (!cancelled) setCompatibility(null);
      })
      .finally(() => {
        if (!cancelled) setCompatibilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, user.isLoggedIn, pet?.status]);

  // Similares = misma especie, que todavía buscan familia (no adoptadas) y
  // distintas a la actual. Sin relleno con otras especies.
  const similar = useMemo(() => {
    if (!pet || !pets) return [];
    return pets
      .filter(
        (p) =>
          p.id !== pet.id &&
          p.animalType === pet.animalType &&
          p.status !== "adoptado",
      )
      .slice(0, 4);
  }, [pets, pet]);

  const detail = useMemo(() => {
    if (!pet) return null;
    const animalLabel =
      pet.animalType.charAt(0).toUpperCase() + pet.animalType.slice(1);
    const photoUrls = (pet.photos as unknown as string[]) || [];
    const mainPhoto =
      activePhoto ?? (photoUrls.length > 0 ? photoUrls[0] : null);

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
        <div className="container" style={{ padding: "4rem 0" }}>
          <CatLoader label="CARGANDO" />
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
                src={
                  (pet.photos?.[0] as unknown as string) ||
                  "/images/avatar-placeholder.svg"
                }
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

            <section className="pet-detail-actions-bar">
              <div className="pet-action-buttons">
                <button
                  type="button"
                  className="btn btn-primary btn-lg pet-action-btn pet-action-btn--share"
                  onClick={() => {
                    const url =
                      typeof window !== "undefined"
                        ? `${window.location.origin}/mascotas-perdidas/${pet.id}`
                        : `/mascotas-perdidas/${pet.id}`;
                    const text = `${pet.name ?? detail.animalLabel} — ${pet.status} en ${pet.location}. Ayudá a difundir 🐾`;
                    if (typeof navigator !== "undefined" && navigator.share) {
                      navigator.share({
                        title: pet.name ?? detail.animalLabel,
                        text,
                        url,
                      });
                    } else {
                      navigator.clipboard.writeText(url);
                    }
                  }}
                  aria-label="Compartir"
                >
                  <Share2 size={18} aria-hidden /> Compartir
                </button>
                {pet.status === "perdido" && (
                  <button
                    type="button"
                    className="btn btn-outline btn-lg pet-action-btn pet-action-btn--sight"
                    onClick={() => {
                      // Dispara el modal de PetCardActions buscando el botón "La vi" en el DOM
                      const sightBtn =
                        document.querySelector<HTMLButtonElement>(
                          '[aria-label*="Reportar que viste"]',
                        );
                      sightBtn?.click();
                    }}
                    aria-label="Reportar avistamiento"
                    style={{
                      border: "1px solid var(--border)",
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "transparent",
                      color: "var(--primary-500)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <Eye size={18} aria-hidden /> Lo vi
                  </button>
                )}
              </div>
            </section>

            {pet.status === "perdido" && (
              <div style={{ display: "none" }}>
                <PetCardActions pet={pet} hideMore />
              </div>
            )}

            {pet.status === "en adopción" && (
              <>
                <section className="pet-detail-story">
                  <p className="sdet-section-label">Compatibilidad</p>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {user.isLoggedIn && compatibility && (
                      <CompatCircle pct={compatibility.score} />
                    )}
                    <ul className="pet-detail-checklist">
                      {!user.isLoggedIn ? (
                        <p className="sdet-empty">
                          Iniciá sesión para ver tu matching con{" "}
                          {pet.name ?? detail.animalLabel}.
                        </p>
                      ) : compatibilityLoading ? (
                        <p className="sdet-empty">Calculando compatibilidad…</p>
                      ) : compatibility ? (
                        compatibility.factors.slice(0, 5).map((item) => (
                          <li key={item.label}>
                            <span
                              className={`pet-detail-check${item.isPositive ? " ok" : item.isPositive === false ? " no" : ""}`}
                              aria-hidden
                            >
                              {item.isPositive === true
                                ? "✓"
                                : item.isPositive === false
                                  ? "✗"
                                  : "—"}
                            </span>
                            <span>{item.label}</span>
                          </li>
                        ))
                      ) : (
                        <li className="sdet-empty">
                          Completá una solicitud o tu perfil de adopción para
                          ver el matching.
                        </li>
                      )}
                    </ul>
                  </div>
                </section>

                <section className="pet-detail-cta">
                  <p>
                    {adopter ? "¿Me querés adoptar?" : "¿Te interesa adoptar?"}
                  </p>
                  {alreadyApplied ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled
                      title="Ya enviaste una solicitud para esta mascota"
                    >
                      Solicitud enviada
                    </button>
                  ) : (
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
                  )}
                </section>
              </>
            )}
          </aside>
        </div>

        <PetComments petId={pet.id} />

        <section className="pet-detail-similar">
          <div className="section-title">
            <h2>Reportes similares</h2>
            <p>Otras mascotas del mismo tipo que aún buscan su familia.</p>
          </div>
          {similar.length === 0 ? (
            <p className="similar-empty">
              No se encontraron reportes similares por ahora.
            </p>
          ) : (
            <ul className="similar-grid">
              {similar.map((p) => (
                <li key={p.id} className="similar-card">
                  <div className="similar-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        (p.photos?.[0] as unknown as string) ||
                        (p.animalType === "gato"
                          ? "/images/pet-cat.jpg"
                          : "/images/pet-dog.jpg")
                      }
                      alt={p.name ? `Foto de ${p.name}` : "Foto de la mascota"}
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
          )}
        </section>
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
