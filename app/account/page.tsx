"use client";

import { PetCard } from "@/components/pet-card";
import { convertLocalMonthYear } from "@/components/utils/helpers";
import { useUserContext } from "@/context/UserContext";
import { getIdsPets } from "@/services/mascotas.pets";
import { getUserDetails } from "@/services/user.info";
import { Pet } from "@/types/pet";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserDetails } from "../../types/user-details";

export default function AccountPage() {
  const { userId } = useUserContext();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    if (!userId) return;
    getUserDetails(userId).then((res) => {
      if (res && res.ok) {
        setUserDetails(res.data);
      }
    });
  }, [userId]);
  useEffect(() => {
    if (userDetails) {
      const ids = userDetails.reports.map((p) => p.id);
      getIdsPets(ids).then((pets) => {
        if (pets && pets.ok && pets.data) {
          setPets(pets.data);
        }
      });
    }
  }, [userDetails]);

  const statusReports =
    userDetails?.reports.filter((r) => r.status == "perdido").length || 0;
  return (
    userDetails && (
      <main>
        <div className="container account-layout">
          <aside className="account-nav">
            <Link href="/account" className="active">
              Perfil
            </Link>
            <Link href="/account">Mis reportes</Link>
            <Link href="/account">Mensajes</Link>
            <Link href="/account">Notificaciones</Link>
            <Link href="/account">Configuración</Link>
            <Link href="/">Cerrar sesión</Link>
          </aside>

          <div className="account-body">
            <div className="account-profile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={userDetails.photo || ""} alt="User Photo" />
              <div>
                <h2>
                  {userDetails.firstName} {userDetails.lastName}
                </h2>
                <p>
                  {userDetails.email || ""} · {userDetails.addressLine1}{" "}
                  {userDetails.addressLine2
                    ? `, ${userDetails.addressLine2}`
                    : ""}
                </p>
                <p style={{ marginTop: "0.5rem" }}>
                  Miembro desde {convertLocalMonthYear(userDetails.created_at)}{" "}
                  · {statusReports} publicaciones activas
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
    )
  );
}
