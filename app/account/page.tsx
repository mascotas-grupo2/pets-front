"use client";

import ProfileView from "@/components/nav-account/account-main";
import MyReportsView from "@/components/nav-account/account-report";
import { useUserContext } from "@/context/UserContext";
import { getIdsPets } from "@/services/mascotas.pets";
import { getUserDetails } from "@/services/user.info";
import { Pet } from "@/types/pet";
import Link from "next/link";
import { useEffect, useState } from "react";
import AccountSettingsForm from "../../components/nav-account/account-settings-form";
import { UserDetails } from "../../types/user-details";

export default function AccountPage() {
  const { isLoggedIn, logout } = useUserContext();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [activeSection, setActiveSection] = useState<
    "profile" | "reports" | "messages" | "notifications" | "settings"
  >("profile");

  useEffect(() => {
    if (!isLoggedIn) return;

    getUserDetails().then((res) => {
      if (res && res.ok) {
        setUserDetails(res.data);
      }
    });
  }, [isLoggedIn, activeSection]);

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

  const activeReports =
    userDetails?.reports.filter((r) => r.status == "perdido").length || 0;

  const getTabClass = (tab: string) => {
    const outline = "btn-link btn-ghost-link btn-sm tab-nav-item";
    const solid = "btn btn-primary btn-sm tab-nav-item";
    return activeSection === tab ? solid : outline;
  };

  return (
    userDetails && (
      <main>
        <div className="container account-layout">
          <aside
            className="account-nav"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <button
              style={{ justifyContent: "flex-start" }}
              className={getTabClass("profile")}
              onClick={() => setActiveSection("profile")}
            >
              🐾 Perfil
            </button>
            <button
              style={{ justifyContent: "flex-start" }}
              className={getTabClass("reports")}
              onClick={() => setActiveSection("reports")}
            >
              📋 Mis reportes
            </button>
            <button
              style={{ justifyContent: "flex-start" }}
              className={getTabClass("messages")}
              onClick={() => setActiveSection("messages")}
            >
              ✉️ Mensajes
            </button>
            <button
              style={{ justifyContent: "flex-start" }}
              className={getTabClass("notifications")}
              onClick={() => setActiveSection("notifications")}
            >
              🔔 Notificaciones
            </button>
            <button
              style={{ justifyContent: "flex-start" }}
              className={getTabClass("settings")}
              onClick={() => setActiveSection("settings")}
            >
              ⚙️ Configuración
            </button>
            <Link
              href="/"
              onClick={async () => await logout()}
              className="btn-link btn-ghost-link btn-sm"
              style={{ marginTop: "1rem", color: "var(--error)" }}
            >
              Cerrar sesión
            </Link>
          </aside>

          <div className="account-body">
            {activeSection === "profile" && (
              <>
                <ProfileView
                  setUserDetails={setUserDetails}
                  userDetails={userDetails}
                  activeReports={activeReports}
                  pets={pets}
                />
              </>
            )}
            {activeSection === "reports" && <MyReportsView pets={pets} />}
            {activeSection === "settings" && (
              <AccountSettingsForm userDetails={userDetails}/>
            )}
          </div>
        </div>
      </main>
    )
  );
}
