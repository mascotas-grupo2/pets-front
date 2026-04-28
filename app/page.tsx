"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pet } from "@/types/pet";
import { PetCard } from "@/components/pet-card";
import { getAllPets } from "@/services/mascotas.pets";
import { useDispatch } from "react-redux";
import { useUserContext } from "@/context/UserContext";

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const { userId } = useUserContext();
  const dispatch = useDispatch();

  useEffect(() => {
    getAllPets()
      .then((res) => {
        if (res && res.ok && res.data) {
          const pets = res.data;
          setPets(pets);
          dispatch({ type: "pets/all_pets", payload: pets });
        }
      })
      .catch((error) => console.error(error));
  }, [dispatch]);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <h1>
              Dales una segunda <br />
              <span className="accent">oportunidad</span>
            </h1>
            <p>
              Huellitas Unidas es la comunidad que reúne familias y mascotas
              perdidas. Publicá un reporte con foto y ubicación, compartilo y
              ayudá a que vuelvan a casa.
            </p>
            <div className="hero-actions">
              {userId ? (
                <Link
                  href="/mascotas-perdidas/reportar"
                  className="btn btn-primary btn-lg"
                >
                  Reportar ahora
                </Link>
              ) : (
                <div className="tooltip-container">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                  >
                    Reportar ahora
                  </button>
                  <span className="tooltip-content">
                    Necesitás iniciar sesión
                  </span>
                </div>
              )}
              <Link
                href="/mascotas-perdidas"
                className="btn btn-outline btn-lg"
              >
                Ver reportes
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <span className="hero-paw hero-paw-1" aria-hidden>
              🐾
            </span>
            <span className="hero-paw hero-paw-2" aria-hidden>
              🐾
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero.svg" alt="Mascotas de Huellitas Unidas" />
          </div>
        </div>
      </section>

      {/* Pets showcase */}
      <section className="section" style={{ background: "var(--surface-alt)" }}>
        <div className="container">
          <div className="section-title">
            <h2>Mirá algunos de nuestros reportes</h2>
            <p>
              Mascotas reportadas por la comunidad. Si reconocés a alguna,
              contactá a su familia directamente.
            </p>
          </div>
          {pets.length === 0 ? (
            <p style={{ textAlign: "center" }}>
              Todavía no hay mascotas reportadas.
            </p>
          ) : (
            <ul className="pet-grid">
              {pets.slice(0, 4).map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </ul>
          )}
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/mascotas-perdidas" className="btn btn-primary">
              Ver todos los reportes
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>
              Reportá o buscá una mascota en solo{" "}
              <span className="accent">3 pasos</span>
            </h2>
          </div>
          <div className="steps steps-connected">
            <div className="step">
              <div className="step-icon">📝</div>
              <h3>Reportá</h3>
              <p>
                Cargá una foto, descripción, ubicación y datos de contacto. Tu
                publicación queda online en segundos.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">🔍</div>
              <h3>Buscá</h3>
              <p>
                Explorá las mascotas reportadas cerca tuyo. Filtrá por tipo de
                animal, zona y fecha.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">🤝</div>
              <h3>Reuní</h3>
              <p>
                Si reconocés a una mascota, contactá a su familia por teléfono o
                mail desde la publicación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pet News / Guías */}
      <section className="section" style={{ background: "var(--surface-alt)" }}>
        <div className="container">
          <div className="section-title">
            <h2>Noticias y guías</h2>
            <p>Consejos para cuidar a tu mascota y prevenir que se pierda.</p>
          </div>
          <div className="guide-grid">
            <article className="guide-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="photo" src="/images/guide-1.jpg" alt="Razas" />
              <div className="body">
                <h3>Razas y comportamiento</h3>
                <p>
                  Qué tener en cuenta sobre cada raza para mantenerlas seguras y
                  felices...
                </p>
                <Link href="/care-guides" className="guide-card-link">
                  Leer más
                </Link>
              </div>
            </article>
            <article className="guide-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="photo"
                src="/images/guide-2.jpg"
                alt="Entrenamiento"
              />
              <div className="body">
                <h3>Entrenamiento básico</h3>
                <p>
                  Rutinas simples para enseñarle a tu mascota a volver cuando la
                  llamás...
                </p>
                <Link href="/care-guides" className="guide-card-link">
                  Leer más
                </Link>
              </div>
            </article>
            <article className="guide-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="photo"
                src="/images/guide-3.jpg"
                alt="Prevención"
              />
              <div className="body">
                <h3>Prevenir pérdidas</h3>
                <p>
                  Chapas, microchip y buenas prácticas que hacen la diferencia
                  cuando más importa...
                </p>
                <Link href="/care-guides" className="guide-card-link">
                  Leer más
                </Link>
              </div>
            </article>
            <article className="guide-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="photo" src="/images/guide-4.jpg" alt="Conducta" />
              <div className="body">
                <h3>Conducta felina</h3>
                <p>
                  Por qué se escapan los gatos y qué podés hacer para que se
                  sientan en casa...
                </p>
                <Link href="/care-guides" className="guide-card-link">
                  Leer más
                </Link>
              </div>
            </article>
          </div>
          <div className="guide-filters">
            <Link href="/care-guides" className="filter-chip">
              Noticias de gatos
            </Link>
            <Link href="/care-guides" className="filter-chip">
              Noticias de perros
            </Link>
          </div>
        </div>
      </section>

      {/* Coexistence */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>
              Convivencia pacífica{" "}
              <span className="accent">humanos y animales</span>
            </h2>
          </div>
          <div className="coexistence">
            <div className="coexistence-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/about.jpg" alt="Convivencia humana y animal" />
            </div>
            <div className="coexistence-grid">
              <article className="coex-card">
                <header>
                  <span className="coex-paw" aria-hidden>
                    🐾
                  </span>
                  <h4>Vínculo emocional</h4>
                </header>
                <p>
                  El lazo entre las familias y sus mascotas está hecho de
                  cariño, rutina y compañía incondicional.
                </p>
                <span className="coex-silhouette" aria-hidden>
                  🐈
                </span>
              </article>
              <article className="coex-card">
                <header>
                  <span className="coex-paw" aria-hidden>
                    🐾
                  </span>
                  <h4>Comunicación</h4>
                </header>
                <p>
                  Aprendemos a leer a nuestras mascotas: un ladrido, un maullido
                  o una mirada pueden decirlo todo.
                </p>
                <span className="coex-silhouette" aria-hidden>
                  🐕
                </span>
              </article>
              <article className="coex-card">
                <header>
                  <span className="coex-paw" aria-hidden>
                    🐾
                  </span>
                  <h4>Niños y mascotas</h4>
                </header>
                <p>
                  Crecer con una mascota fortalece la empatía, el sentido de
                  responsabilidad y los vínculos afectivos.
                </p>
                <span className="coex-silhouette" aria-hidden>
                  🐶
                </span>
              </article>
              <article className="coex-card">
                <header>
                  <span className="coex-paw" aria-hidden>
                    🐾
                  </span>
                  <h4>Salud</h4>
                </header>
                <p>
                  Convivir con animales está asociado a menos estrés, mejor
                  estado de ánimo y hábitos más saludables.
                </p>
                <span className="coex-silhouette" aria-hidden>
                  🐱
                </span>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ background: "var(--surface-alt)" }}>
        <div className="container">
          <div className="section-title">
            <h2>Lo que dice la comunidad</h2>
            <p>Familias que reencontraron a sus mascotas gracias a la red.</p>
          </div>
          <div className="testimonials">
            <div className="testimonial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="avatar" src="/images/avatar-1.jpg" alt="María" />
              <div className="stars">★★★★★</div>
              <p>
                “Perdimos a Rocco en la plaza y lo encontramos al día siguiente
                gracias a esta comunidad.”
              </p>
              <h4>María G.</h4>
            </div>
            <div className="testimonial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="avatar" src="/images/avatar-2.jpg" alt="Juan" />
              <div className="stars">★★★★★</div>
              <p>
                “Una vecina vio el aviso y nos llamó. Michi volvió sano y salvo
                después de 3 días.”
              </p>
              <h4>Juan P.</h4>
            </div>
            <div className="testimonial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="avatar" src="/images/avatar-3.jpg" alt="Carla" />
              <div className="stars">★★★★★</div>
              <p>
                “Muy fácil de publicar. En pocas horas ya teníamos pistas
                concretas.”
              </p>
              <h4>Carla R.</h4>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Preguntas frecuentes</h2>
            <p>Dudas comunes según lo que estés buscando hacer.</p>
          </div>
          <div className="faq-cards">
            <Link href="/faq" className="faq-card">
              <div className="faq-card-icon">🐶</div>
              <h3>FAQ para dueños</h3>
              <p>
                Qué hacer cuando se pierde una mascota, cómo publicar un reporte
                y qué datos son más útiles.
              </p>
              <span className="faq-card-link">Ver respuestas →</span>
            </Link>
            <Link href="/faq" className="faq-card">
              <div className="faq-card-icon">🤝</div>
              <h3>FAQ para rescatistas</h3>
              <p>
                Cómo ayudar si encontraste una mascota, buenas prácticas para
                contactar familias y difundir.
              </p>
              <span className="faq-card-link">Ver respuestas →</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
