"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pet } from "@/types/pet";
import { getPets } from "@/lib/storage";
import { PetCard } from "@/components/pet-card";

export default function AccountPage() {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    setPets(getPets());
  }, []);

  return (
    <main>
      <div className="container account-layout">
        <aside className="account-nav">
          <Link href="/account" className="active">Perfil</Link>
          <Link href="/account">Mis reportes</Link>
          <Link href="/account">Mensajes</Link>
          <Link href="/account">Notificaciones</Link>
          <Link href="/account">Configuración</Link>
          <Link href="/">Cerrar sesión</Link>
        </aside>

        <div className="account-body">
          <div className="account-profile">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/avatar-1.jpg" alt="Camila" />
            <div>
              <h2>Camila Bertolani</h2>
              <p>camila@example.com · CABA, Argentina</p>
              <p style={{ marginTop: "0.5rem" }}>
                Miembro desde abril 2026 · 2 publicaciones activas
              </p>
            </div>
          </div>

          <h3 style={{ marginBottom: "1rem" }}>Mis reportes recientes</h3>
          {pets.length === 0 ? (
            <p>Todavía no publicaste ninguna mascota.</p>
          ) : (
            <ul className="pet-grid">
              {pets.slice(0, 4).map((p) => (
                <PetCard key={p.id} pet={p} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
