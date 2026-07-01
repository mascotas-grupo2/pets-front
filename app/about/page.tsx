import { Heart, Users, ShieldCheck, PawPrint } from "lucide-react";

const VALUES = [
  {
    icon: Heart,
    title: "Bienestar animal",
    desc: "Cada publicación tiene un objetivo: que un animal vuelva a estar seguro y cuidado.",
  },
  {
    icon: Users,
    title: "Comunidad abierta",
    desc: "Vecinos, refugios y veterinarias trabajando juntos para amplificar cada caso.",
  },
  {
    icon: ShieldCheck,
    title: "Gratis, sin fines de lucro",
    desc: "No cobramos ni lucramos: la herramienta es y será siempre gratuita.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="container about-hero">
        <div className="about-hero-copy reveal" style={{ animationDelay: "0.05s" }}>
          <span className="adopt-eyebrow">
            <PawPrint size={15} aria-hidden /> Sobre nosotros
          </span>
          <h1>
            Una comunidad para <span className="adopt-hl">reunir</span> mascotas
            con su familia.
          </h1>
          <p style={{ marginBottom: "1.5rem" }}>
            Huellitas Unidas nació en 2026 como un espacio gratuito y abierto
            para que cualquier persona pueda reportar una mascota perdida y
            cualquier vecino pueda ayudarla a volver a casa. Creemos que la
            comunidad es la herramienta más poderosa para resolver estos casos.
          </p>
          <p>
            Trabajamos con voluntarios, refugios y veterinarias locales para
            amplificar cada publicación y acompañar a las familias durante la
            búsqueda.
          </p>
        </div>
        <div className="about-hero-media reveal" style={{ animationDelay: "0.2s" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/about.jpg" alt="Perro feliz" />
        </div>
      </section>

      <section className="section about-values-section">
        <div className="container">
          <div className="section-title">
            <h2>En qué creemos</h2>
            <p>Los principios que guían cada decisión del proyecto.</p>
          </div>
          <div className="about-values">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="about-value">
                  <span className="about-value-icon" aria-hidden>
                    <Icon size={24} />
                  </span>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}
