"use client";

import Link from "next/link";

export default function AdoptarLandingPage() {
  return (
    <main>
      <div className="page-title">
        <div className="container">
          <h1>Adoptar una mascota</h1>
          <p>
            Completá nuestro formulario y te contactamos para conocer a tu futura
            compañera.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginBottom: "4rem" }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <p>
            Adoptar es un compromiso a largo plazo. Para emparejarte con la
            mascota ideal necesitamos algunos datos sobre tu hogar, tu
            familia y las mascotas con las que convivís.
          </p>
          <p>
            El proceso toma unos pocos minutos y podés guardar el progreso
            entre pasos.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <Link href="/adoptar/solicitar" className="btn btn-primary btn-lg">
              Empezar solicitud
            </Link>
            <Link href="/mascotas-perdidas" className="btn btn-outline btn-lg">
              Ver mascotas
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
