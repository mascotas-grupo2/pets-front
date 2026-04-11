const GUIDES = [
  {
    title: "Qué hacer en las primeras 24hs",
    desc: "Los pasos clave cuando recién te das cuenta que tu mascota se perdió.",
    img: "/images/guide-1.jpg",
  },
  {
    title: "Cómo preparar un buen reporte",
    desc: "Qué fotos usar, qué datos incluir y cómo redactar la descripción.",
    img: "/images/guide-2.jpg",
  },
  {
    title: "Pegar carteles en el barrio",
    desc: "Consejos para maximizar la visibilidad del aviso físico.",
    img: "/images/guide-3.jpg",
  },
  {
    title: "Usar redes sociales",
    desc: "Cómo difundir tu publicación en grupos locales y llegar a más vecinos.",
    img: "/images/guide-4.jpg",
  },
  {
    title: "Qué hacer si encontraste una",
    desc: "Pasos a seguir si te encontraste con un animal perdido en la calle.",
    img: "/images/guide-5.jpg",
  },
  {
    title: "Prevención: chip, chapita, correa",
    desc: "Medidas simples para reducir el riesgo y facilitar la identificación.",
    img: "/images/guide-6.jpg",
  },
];

export default function CareGuidesPage() {
  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Guías de cuidado</h1>
          <p>Consejos prácticos para buscar, proteger y cuidar a tus mascotas.</p>
        </div>
      </div>

      <div className="container" style={{ marginBottom: "4rem" }}>
        <div className="guide-grid">
          {GUIDES.map((g) => (
            <article key={g.title} className="guide-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="photo" src={g.img} alt={g.title} />
              <div className="body">
                <h3>{g.title}</h3>
                <p>{g.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
