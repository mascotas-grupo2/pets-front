"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { SECTION_MAP, type Section } from "@/components/admin/admin-config";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminFooter } from "@/components/admin/admin-footer";
import { useAdminGuard } from "@/components/admin/use-admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { blocked } = useAdminGuard();
  const params = useParams();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  // Obtenemos la sección directamente de los parámetros de la URL
  const activeSection = (params.id as Section) || "dashboard";

  // El superadmin solo gestiona la plataforma: Personas y Refugios. Cualquier
  // otra sección se le oculta (y si llega por URL directa, se lo redirige).
  const role = useAppSelector((state) => state.user.role);
  const isSuperadmin = role === "superadmin";
  const allowedForSuperadmin =
    activeSection === "personas" || activeSection === "refugios";

  useEffect(() => {
    if (isSuperadmin && !allowedForSuperadmin) {
      router.replace("/admin/refugios");
    }
  }, [isSuperadmin, allowedForSuperadmin, router]);

  const meta = useMemo(() =>
    SECTION_MAP[activeSection] || SECTION_MAP["dashboard"], [activeSection]);

  if (blocked) return null;
  if (isSuperadmin && !allowedForSuperadmin) return null;

  return (
    <div className="admin-shell">
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="admin-main">
        <AdminTopbar
          title={meta?.title || "Administración"}
          subtitle={meta?.subtitle || ""}
        />

        <main className="admin-content">
          {children}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
