"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pet } from "@/types/pet";
import { getPets } from "@/lib/storage";
import { PetCard } from "@/components/pet-card";

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    setPets(getPets());
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <h1>
              Reunilos con su <span className="accent">Familia</span>
            </h1>
            <p>
              Huellitas Unidas es una comunidad para reportar y encontrar
              mascotas perdidas. Cargá una publicación con foto y ubicación,
              compartila, y ayudá a que vuelvan a casa.
            </p>
            <div className="hero-actions">
              <Link
                href="/mascotas-perdidas/reportar"
                className="btn btn-primary btn-lg"
              >
                Reportar mascota perdida
              </Link>
              <Link
                href="/mascotas-perdidas"
                className="btn btn-outline btn-lg"
              >
                Ver publicaciones
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero.svg" alt="Huellitas Unidas" />
          </div>
        </div>
      </section>

      {/* Pet grid preview */}
      <section className="section" style={{ background: "var(--surface-alt)" }}>
        <div className="container">
          <div className="section-title">
            <h2>Últimos reportes</h2>
            <p>
              Mascotas perdidas reportadas por la comunidad. ¿Viste alguna?
              Contactá a la familia.
            </p>
          </div>
          {pets.length === 0 ? (
            <p style={{ textAlign: "center" }}>No hay mascotas reportadas aún.</p>
          ) : (
            <ul className="pet-grid">
              {pets.slice(0, 8).map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </ul>
          )}
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/mascotas-perdidas" className="btn btn-outline">
              Ver todas
            </Link>
          </div>
        </div>
      </section>

      {/* Steps / how it works */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>¿Cómo funciona?</h2>
            <p>En 3 pasos podés ayudar a que una mascota vuelva a casa.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-icon">📸</div>
              <h3>Reportá</h3>
              <p>
                Cargá una foto, descripción, ubicación y datos de contacto.
                La publicación aparece en el listado.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">🔍</div>
              <h3>Buscá</h3>
              <p>
                Explorá las mascotas reportadas cerca tuyo. Filtrá por tipo
                de animal y zona.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">🤝</div>
              <h3>Reuní</h3>
              <p>
                Si reconocés a una mascota, contactá a la familia por
                teléfono o mail directamente desde la publicación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ background: "var(--surface-alt)" }}>
        <div className="container">
          <div className="section-title">
            <h2>Historias felices</h2>
            <p>Familias que reunieron a sus mascotas gracias a la comunidad.</p>
          </div>
          <div className="testimonials">
            <div className="testimonial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="avatar" src="/images/avatar-1.jpg" alt="María" />
              <div className="stars">★★★★★</div>
              <p>
                “Perdimos a Rocco en la plaza y lo encontraron al día
                siguiente gracias a esta comunidad. Eternamente agradecidos.”
              </p>
              <h4>María G.</h4>
            </div>
            <div className="testimonial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="avatar" src="/images/avatar-2.jpg" alt="Juan" />
              <div className="stars">★★★★★</div>
              <p>
                “Una vecina vio el aviso y nos avisó por teléfono. Michi
                volvió sano y salvo después de 3 días.”
              </p>
              <h4>Juan P.</h4>
            </div>
            <div className="testimonial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="avatar" src="/images/avatar-3.jpg" alt="Carla" />
              <div className="stars">★★★★★</div>
              <p>
                “Es muy fácil publicar y compartir. En pocas horas ya
                teníamos respuestas concretas.”
              </p>
              <h4>Carla R.</h4>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Preguntas frecuentes</h2>
            <p>Dudas habituales sobre reportar y buscar mascotas perdidas.</p>
          </div>
          <div className="faq-list">
            <details className="faq-item">
              <summary>¿Cuánto cuesta publicar?</summary>
              <p>Es completamente gratis. La comunidad se sostiene por voluntarios.</p>
            </details>
            <details className="faq-item">
              <summary>¿Puedo publicar sin registrarme?</summary>
              <p>
                Sí, podés reportar una mascota perdida sin crear cuenta.
                Solo necesitamos un contacto para que te puedan escribir.
              </p>
            </details>
            <details className="faq-item">
              <summary>¿Qué hago si encontré una mascota?</summary>
              <p>
                Buscá en el listado si alguien la reportó. Si no,
                contactanos y te ayudamos a difundirla.
              </p>
            </details>
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/faq" className="btn btn-ghost">
              Ver todas las preguntas →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
