"use client";

import { useState, useEffect } from "react";
import { X, BookOpen, ArrowRight, PawPrint } from "lucide-react";

const GUIDES = [
  {
    title: "Qué hacer en las primeras 24hs",
    desc: "Los pasos clave cuando recién te das cuenta que tu mascota se perdió.",
    img: "/images/guide-1.jpg",
    content: [
      "Mantené la calma: es fundamental para actuar con rapidez y claridad.",
      "Recorré la zona: buscá en un radio de 5 a 10 manzanas, llamándolo por su nombre.",
      "Avisá a los vecinos: consultá con encargados de edificios y comercios cercanos.",
      "Publicá el reporte: subí la foto y ubicación exacta a nuestra plataforma cuanto antes.",
      "Contactá veterinarias: a veces la gente lleva a los animales encontrados a la clínica más próxima.",
    ],
  },
  {
    title: "Cómo preparar un buen reporte",
    desc: "Qué fotos usar, qué datos incluir y cómo redactar la descripción.",
    img: "/images/guide-2.jpg",
    content: [
      "Foto clara: usá una imagen donde se vea bien la cara y señas particulares del cuerpo.",
      "Ubicación precisa: indicá calles exactas o puntos de referencia donde se lo vio por última vez.",
      "Descripción detallada: mencioná si tenía collar, chapita, o alguna marca o cicatriz única.",
      "Carácter: aclará si es asustadizo o amigable para que quien lo vea sepa cómo acercarse.",
      "Contacto directo: asegurate de que tu teléfono esté bien escrito para recibir avisos al instante.",
    ],
  },
  {
    title: "Pegar carteles en el barrio",
    desc: "Consejos para maximizar la visibilidad del aviso físico.",
    img: "/images/guide-3.jpg",
    content: [
      "Título grande: la palabra 'PERDIDO' debe leerse desde varios metros de distancia.",
      "Foto a color: ayuda muchísimo más que una en blanco y negro para identificar el pelaje.",
      "Protección: poné los carteles dentro de folios plásticos o usá cinta ancha para protegerlos de la lluvia.",
      "Puntos estratégicos: paradas de colectivos, plazas, pet shops y veterinarias del barrio.",
      "Retirá los carteles: una vez que lo encuentres, recordá limpiar los espacios públicos.",
    ],
  },
  {
    title: "Usar redes sociales",
    desc: "Cómo difundir tu publicación en grupos locales y llegar a más vecinos.",
    img: "/images/guide-4.jpg",
    content: [
      "Grupos de barrio: publicá en los grupos de Facebook de tu zona específica.",
      "Historias de Instagram: pedí a tus amigos que compartan la publicación y etiquetanos.",
      "Hashtags locales: usá etiquetas como #MascotasPerdidas[TuCiudad] para segmentar el alcance.",
      "WhatsApp: compartí el link del reporte en los grupos de vecinos y familiares.",
      "Actualizá el estado: si tenés pistas nuevas, comentá tu propio posteo para que vuelva a subir.",
    ],
  },
  {
    title: "Qué hacer si encontraste una",
    desc: "Pasos a seguir si te encontraste con un animal perdido en la calle.",
    img: "/images/guide-5.jpg",
    content: [
      "Seguridad: acercate con cuidado para no asustarlo y llevalo a un lugar seguro.",
      "Revisá identificación: buscá chapitas en el collar o llevalo a una veterinaria para ver si tiene microchip.",
      "Publicá como 'Encontrado': subí el reporte aclarando que lo tenés vos a resguardo.",
      "Pedí pruebas: si alguien reclama ser el dueño, pedí fotos previas o carnet de vacunación.",
      "Hogar temporal: si no podés tenerlo, buscá ayuda en refugios locales o tránsito vecinal.",
    ],
  },
  {
    title: "Prevención: chip, chapita, correa",
    desc: "Medidas simples para reducir el riesgo y facilitar la identificación.",
    img: "/images/guide-6.jpg",
    content: [
      "Chapita obligatoria: siempre debe llevar un teléfono de contacto grabado.",
      "Uso de correa: nunca lo sueltes en lugares abiertos o con mucho tránsito, por más obediente que sea.",
      "Microchip: consultá con tu veterinario sobre este método de identificación permanente.",
      "Fotos actuales: guardá fotos de tu mascota de frente y perfil por si llegaras a necesitarlas.",
      "Cerraduras seguras: revisá que no haya huecos en rejas o puertas que queden mal cerradas.",
    ],
  },
];

export default function CareGuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<(typeof GUIDES)[0] | null>(
    null,
  );

  // Cerrar el modal con Escape + bloquear el scroll del body mientras está abierto.
  useEffect(() => {
    if (!selectedGuide) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedGuide(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedGuide]);

  return (
    <main>
      <div className="page-title">
        <div className="container">
          <span className="adopt-eyebrow">
            <PawPrint size={15} aria-hidden /> Aprendé y prevení
          </span>
          <h1>Guías de cuidado</h1>
          <p>
            Consejos prácticos para buscar, proteger y cuidar a tus mascotas.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginBottom: "4rem" }}>
        <div className="guide-grid">
          {GUIDES.map((g, i) => (
            <article
              key={g.title}
              className="guide-card guide-card-anim"
              style={{ animationDelay: `${i * 0.07}s` }}
              role="button"
              tabIndex={0}
              aria-label={`Leer guía: ${g.title}`}
              onClick={() => setSelectedGuide(g)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedGuide(g);
                }
              }}
            >
              <div className="guide-photo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="photo" src={g.img} alt={g.title} />
              </div>
              <div className="body">
                <h3>{g.title}</h3>
                <p>{g.desc}</p>
                <span className="guide-card-link">
                  Leer guía completa <ArrowRight size={15} aria-hidden />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedGuide && (
        <div className="modal-overlay" onClick={() => setSelectedGuide(null)}>
          <div
            className="modal-content auth-card guide-modal guide-modal-anim"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedGuide.title}
          >
            <div className="guide-modal-header">
              <h2>{selectedGuide.title}</h2>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setSelectedGuide(null)}
              >
                <X size={20} aria-hidden />
              </button>
            </div>

            <div className="guide-modal-intro">
              <div className="guide-modal-icon" aria-hidden>
                <BookOpen size={20} />
              </div>
              <p>{selectedGuide.desc}</p>
            </div>

            <ul className="guide-modal-list">
              {selectedGuide.content.map((item, index) => (
                <li key={index}>
                  <span className="dot" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="guide-modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => setSelectedGuide(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
