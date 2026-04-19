export default function AboutPage() {
  return (
    <main>
      <section className="container about-hero">
        <div>
          <h1>
            Una comunidad para <span style={{ color: "var(--primary-500)" }}>reunir</span> mascotas con su familia.
          </h1>
          <p style={{ marginBottom: "1.5rem" }}>
            Huellitas Unidas nació en 2026 como un espacio gratuito y abierto
            para que cualquier persona pueda reportar una mascota perdida y
            cualquier vecino pueda ayudarla a volver a casa. Creemos que la
            comunidad es la herramienta más poderosa para resolver estos
            casos.
          </p>
          <p>
            Trabajamos con voluntarios, refugios y veterinarias locales para
            amplificar cada publicación y acompañar a las familias durante
            la búsqueda.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/about.jpg" alt="Perro feliz" />
      </section>

      <section className="section" style={{ background: "var(--surface-alt)" }}>
        <div className="container">
          <div className="section-title">
            <h2>Nuestro equipo</h2>
            <p>Voluntarios comprometidos con el bienestar animal.</p>
          </div>
          <div className="team-grid">
            {[
              { name: "María López", role: "Fundadora", img: "/images/avatar-1.jpg" },
              { name: "Carlos Pérez", role: "Veterinario", img: "/images/avatar-2.jpg" },
              { name: "Lucía Gómez", role: "Voluntaria", img: "/images/avatar-3.jpg" },
              { name: "Diego Ruiz", role: "Desarrollo", img: "/images/avatar-4.jpg" },
            ].map((m) => (
              <div key={m.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.name} />
                <h4>{m.name}</h4>
                <span>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
