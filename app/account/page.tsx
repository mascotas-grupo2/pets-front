"use client";

import ProfileView from "@/components/nav-account/account-main";
import MyReportsView from "@/components/nav-account/account-report";
import { useUserContext } from "@/context/UserContext";
import { getIdsPets } from "@/services/mascotas.pets";
import { getUserDetails } from "@/services/user.info";
import { Pet } from "@/types/pet";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AccountSettingsForm from "../../components/nav-account/account-settings-form";
import { CatLoader } from "@/components/cat-loader";
import { UserDetails } from "../../types/user-details";
import { MessagesPanel } from "@/components/messages/messages-panel";
import { NotificationsView } from "@/components/notifications/NotificationsView";
import { useNotifications } from "@/components/notifications/useNotifications";
import {
  User,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

const ACCOUNT_TABS = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "reports", label: "Mis reportes", icon: FileText },
  { id: "messages", label: "Mensajes", icon: MessageSquare },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "settings", label: "Configuración", icon: Settings },
] as const;

function AccountPageContent() {
  const { isLoggedIn, logout } = useUserContext();
  const { unread } = useNotifications();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [activeSection, setActiveSection] = useState<
    "profile" | "reports" | "messages" | "notifications" | "settings"
  >("profile");
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Permite abrir un tab (y una conversación) por URL, ej. desde una notificación:
  // /account?tab=messages&user=42
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialUserId = searchParams.get("user")
    ? Number(searchParams.get("user"))
    : undefined;
  useEffect(() => {
    const valid = ["profile", "reports", "messages", "notifications", "settings"];
    if (tabParam && valid.includes(tabParam)) {
      setActiveSection(tabParam as typeof activeSection);
    }
  }, [tabParam]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoadError(false);
    getUserDetails()
      .then((res) => {
        if (res && res.ok) setUserDetails(res.data);
        else setLoadError(true);
      })
      .catch(() => setLoadError(true));
  }, [isLoggedIn, activeSection, reloadKey]);

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

  if (!isLoggedIn) {
    return (
      <main className="container" style={{ padding: "3rem 0", textAlign: "center" }}>
        <p>Iniciá sesión para ver tu cuenta.</p>
      </main>
    );
  }
  if (loadError) {
    return (
      <main className="container" style={{ padding: "3rem 0", textAlign: "center" }}>
        <p>No pudimos cargar tu cuenta.</p>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ marginTop: "1rem" }}
          onClick={() => setReloadKey((k) => k + 1)}
        >
          Reintentar
        </button>
      </main>
    );
  }
  if (!userDetails) {
    return (
      <main className="container" style={{ padding: "3rem 0" }}>
        <CatLoader label="CARGANDO" />
      </main>
    );
  }

  return (
    userDetails && (
      <main>
        <div className="container account-layout">
          <aside className="account-nav" aria-label="Mi cuenta">
            {ACCOUNT_TABS.map((t) => {
              const Icon = t.icon;
              const active = activeSection === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`account-nav-item${active ? " is-active" : ""}`}
                  onClick={() => setActiveSection(t.id)}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} aria-hidden />
                  <span>{t.label}</span>
                  {t.id === "notifications" && unread > 0 && (
                    <span className="account-nav-badge">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>
              );
            })}
            <Link
              href="/"
              onClick={async () => await logout()}
              className="account-nav-item account-nav-logout"
            >
              <LogOut size={18} aria-hidden />
              <span>Cerrar sesión</span>
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
            {activeSection === "messages" && (
              <div className="account-messages">
                <MessagesPanel initialUserId={initialUserId} />
              </div>
            )}
            {activeSection === "notifications" && <NotificationsView />}
            {activeSection === "settings" && (
              <AccountSettingsForm userDetails={userDetails}/>
            )}
          </div>
        </div>
      </main>
    )
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageContent />
    </Suspense>
  );
}
