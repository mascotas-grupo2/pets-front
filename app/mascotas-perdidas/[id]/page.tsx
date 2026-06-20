"use client";

import { useUserContext } from "@/context/UserContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getIdPets, getAllPets, claimPet } from "@/services/mascotas.pets";
import {
  getMyAdoptions,
  getPetCompatibility,
  type PetCompatibility,
} from "@/services/adoptions";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CatLoader } from "@/components/cat-loader";
import { PetComments } from "@/components/pet-comments";
import handleToast from "@/components/utils/toast";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  SendHorizonal,
} from "lucide-react";

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
  const { adopter, isLoggedIn } = useUserContext();
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Si el usuario ya envió una solicitud para esta mascota, deshabilitamos el CTA.
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  // Compatibilidad usuario↔mascota (solo logueado).
  const [compat, setCompat] = useState<PetCompatibility | null>(null);

  const pet = useAppSelector((state) => state.pet);
  const pets = useAppSelector((state) => state.allPets);
  const user = useAppSelector((state) => state.user);

  // El dueño verificado puede editar; el creador original solo ve.
  const isVerifiedOwner =
    !!user.isLoggedIn &&
    user.id != null &&
    pet?.ownerUserId === user.id;
  const isOriginalCreator =
    !!user.isLoggedIn &&
    user.id != null &&
    pet?.userId === user.id &&
    pet?.ownerUserId != null &&
    pet?.ownerUserId !== user.id;
  // Para mostrar botones de reclamo y otros: "es dueño" = creador original O dueño verificado.
  const isOwner = isVerifiedOwner || isOriginalCreator;
  const canEdit = isVerifiedOwner;

  useEffect(() => {
    if (!id) return;
    getIdPets(id)
      .then((res) => {
        if (res && res.ok && res.data != null) {
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
      requestAnimationFrame(() => setAlreadyApplied(false));
      return;
    }
    getMyAdoptions()
      .then((res) => {
        if (res && res.ok && Array.isArray(res.data)) {
          requestAnimationFrame(() => setAlreadyApplied(res.data.some((a) => a.petId === id)));
        }
      })
      .catch(() => {});
  }, [id, user.isLoggedIn]);

  // Compatibilidad: solo si el usuario está logueado y la mascota está en adopción.
  useEffect(() => {
    if (!id || !user.isLoggedIn) {
      requestAnimationFrame(() => setCompat(null));
      return;
    }
    getPetCompatibility(id)
      .then((res) => {
        if (res.ok && res.data) requestAnimationFrame(() => setCompat(res.data));
      })
      .catch(() => {});
  }, [id, user.isLoggedIn]);

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

  // Estilo local para la nota de rol (no está en globals.css)
  const roleNoteStyle: React.CSSProperties = {
    fontSize: "0.85rem",
    color: "var(--text-muted, #6b7280)",
    marginTop: "0.5rem",
    padding: "0.5rem 0.75rem",
    background: "rgba(59,130,246,0.08)",
    borderRadius: "6px",
    border: "1px solid rgba(59,130,246,0.2)",
  };

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
          {canEdit && (
            <Link
              href={`/mascotas-perdidas/${pet.id}/editar`}
              className="btn btn-outline btn-sm pet-edit-btn"
            >
              <Pencil size={16} aria-hidden /> Editar publicación
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
              {(isOriginalCreator || isVerifiedOwner) && pet.ownerUserId != null && pet.ownerUserId !== pet.userId && (
                <p style={roleNoteStyle}>
                  {isOriginalCreator
                    ? "📌 Sos el creador original de esta publicación. El dueño verificado puede editar el contenido."
                    : "📌 Sos el dueño verificado de esta mascota. El creador original solo puede visualizarla."}
                </p>
              )}
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
              {pet.isOwner && (
                <span
                  className="pet-badge"
                  style={{ left: "auto", right: "12px", background: "var(--primary-600)" }}
                >
                  CON DUEÑO
                </span>
              )}
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

            <div className="pet-vacc-wrap">
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

            {compat && compat.score != null && pet.status === "en adopción" && (
              <section className="pet-detail-cta pet-compat">
                <h3 style={{ margin: "0 0 0.75rem" }}>Compatibilidad</h3>
                <div className="pet-compat-head">
                  <span className="pet-compat-score">
                    {Math.round(compat.score)}%
                  </span>
                  <span className="pet-compat-label">
                    {compat.score >= 75
                      ? "Alta"
                      : compat.score >= 50
                        ? "Moderada"
                        : "Baja"}
                  </span>
                </div>
                {compat.factors.length > 0 && (
                  <ul className="pet-compat-factors">
                    {compat.factors.slice(0, 6).map((f, i) => (
                      <li key={i} className={f.isPositive ? "ok" : "no"}>
                        <span aria-hidden>{f.isPositive ? "✓" : "✗"}</span>
                        {f.label}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Contacto del refugio (visible para todos) */}
            {(pet.status === "perdido" || pet.status === "encontrado") && (
              <section className="pet-detail-contact">
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Phone size={18} aria-hidden /> Contactá al refugio
                </h3>
                <p>Si tenés información, comunicate con el refugio:</p>
                <div className="pet-detail-contact-actions">
                  {pet.contactPhone && (
                    <a
                      className="btn btn-outline btn-sm"
                      href={`tel:${pet.contactPhone}`}
                    >
                      <Phone size={16} aria-hidden /> Llamar al refugio
                    </a>
                  )}
                  {pet.contactEmail && (
                    <a
                      className="btn btn-outline btn-sm"
                      href={`mailto:${pet.contactEmail}`}
                    >
                      <Mail size={16} aria-hidden /> Email al refugio
                    </a>
                  )}
                  {user.isLoggedIn && (
                    <Link
                      className="btn btn-primary btn-sm"
                      href="/account?tab=messages"
                    >
                      <MessageCircle size={16} aria-hidden /> Enviar mensaje al
                      refugio
                    </Link>
                  )}
                </div>
              </section>
            )}

            {/* Formulario de reclamo (visible para estados activos, solo si no es el dueño) */}
            {/* {!isOwner &&
              pet.status !== "adoptado" &&
              pet.status !== "devuelta al dueño" && (
                <ClaimForm petId={pet.id} />
              )} */}
            {isLoggedIn ? (
              !isOwner &&
              !pet.isOwner &&
              pet.status !== "adoptado" &&
              pet.status !== "devuelta al dueño" && <ClaimForm petId={pet.id} />
            ) : (
              !pet.isOwner &&
              pet.status !== "adoptado" &&
              pet.status !== "devuelta al dueño" && (
              <div className="tooltip-container">
                <button disabled className="btn btn-primary btn-sm">
                  <Bell size={16} aria-hidden />
                  ¿Creés que es tu mascota?
                </button>
                <span
                  className="tooltip-content"
                >
                  Necesitás iniciar sesión
                </span>
              </div>
              )
            )}

            {pet.status === "en adopción" && (
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
            )}

            {pet.status === "en tránsito" && !isOwner && (
              <section className="pet-detail-cta">
                <p>¿Podés darle un hogar temporal?</p>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted, #6b7280)",
                    margin: "0 0 0.75rem",
                  }}
                >
                  El tránsito es un hogar <strong>temporal</strong> mientras la
                  mascota espera una familia definitiva (no es adopción).
                </p>
                <Link
                  href={{
                    pathname: "/adoptar/solicitar",
                    query: {
                      pet: pet.id,
                      name: pet.name ?? detail.animalLabel,
                      modo: "transito",
                    },
                  }}
                  className="btn btn-primary"
                >
                  Ofrecerme de tránsito
                </Link>
              </section>
            )}

            {(pet.status === "adoptado" ||
              pet.status === "en tratamiento médico" ||
              pet.status === "devuelta al dueño") && (
              <section className="pet-detail-cta">
                <p>
                  {pet.status === "adoptado"
                    ? "🎉 Esta mascota ya encontró familia."
                    : pet.status === "devuelta al dueño"
                      ? "🐾 Esta mascota fue devuelta a su familia."
                      : "🏥 Esta mascota está en tratamiento médico."}
                </p>
              </section>
            )}
          </aside>
        </div>

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

        <PetComments petId={pet.id} />
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

/** Reclamo automático de mascota para usuarios logueados. */
function ClaimForm({ petId }: { petId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const user = useAppSelector((state) => state.user);

  if (submitted) {
    return (
      <section className="pet-detail-claim pet-detail-claim--done">
        <h3>
          <CheckCircle2 size={18} aria-hidden /> Reclamo enviado
        </h3>
        <p>
          El refugio recibió tu información y se comunicará con vos para
          coordinar el reencuentro. No compartimos tus datos de forma pública.
        </p>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await claimPet(petId, {
        claimantName: user.name || user.email || "Usuario",
        claimantPhone: "", // backend detecta usuario autenticado por el token
        description: "Reclamo automático desde mi cuenta.",
      });
      if (res.ok) {
        setSubmitted(true);
        handleToast(
          "success",
          "Reclamo registrado. El refugio se comunicará con vos.",
        );
      } else {
        handleToast("error", res.error ?? "No se pudo enviar el reclamo.");
      }
    } catch {
      handleToast("error", "Error al enviar el reclamo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pet-detail-claim">
      <form
        onSubmit={handleSubmit}
        className="claim-form"
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <p style={{ margin: 0 }}>
          ¿Creés que esta mascota es tuya? El refugio verificará tu reclamo y
          se comunicará con vos.
        </p>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={submitting}
        >
          <Bell size={16} aria-hidden />{" "}
          {submitting ? "Enviando…" : "Sí, es mi mascota"}
        </button>
      </form>
    </section>
  );
}
