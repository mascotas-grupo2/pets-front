const FAQS = [
  {
    q: "¿Cuánto cuesta publicar una mascota perdida?",
    a: "Es completamente gratis. La plataforma se sostiene con voluntarios y donaciones.",
  },
  {
    q: "¿Necesito crear una cuenta para reportar?",
    a: "No. Podés publicar sin registrarte. Solo necesitamos un contacto (teléfono o email) para que te puedan escribir si la ven.",
  },
  {
    q: "¿Cómo hago para que más gente vea mi publicación?",
    a: "Compartí el link del reporte en tus redes sociales y grupos del barrio. Cuanta más difusión, más posibilidades de encontrarla.",
  },
  {
    q: "¿Qué hago si encontré una mascota que no es mía?",
    a: "Buscá primero en el listado si alguien la reportó. Si no, podés crear una publicación aclarando que la encontraste, así la familia puede contactarte.",
  },
  {
    q: "¿Puedo editar o eliminar mi publicación?",
    a: "Sí. Si creaste cuenta, desde tu perfil podés gestionarlas. Si no, escribinos y la damos de baja.",
  },
  {
    q: "¿Guardan mis datos personales?",
    a: "Solo el contacto que vos querés mostrar en la publicación. No compartimos tus datos con terceros.",
  },
  {
    q: "¿Cuánto tiempo se mantiene activa una publicación?",
    a: "Por defecto 60 días. Podés extenderla si la mascota sigue sin aparecer.",
  },
];

export default function FAQPage() {
  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Preguntas frecuentes</h1>
          <p>Todo lo que necesitás saber para reportar y buscar mascotas perdidas.</p>
        </div>
      </div>

      <div className="container" style={{ marginBottom: "4rem" }}>
        <div className="faq-list">
          {FAQS.map((item, i) => (
            <details key={i} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
