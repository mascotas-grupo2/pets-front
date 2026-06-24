"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { SECTION_MAP, type Section } from "@/components/admin/admin-config";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminFooter } from "@/components/admin/admin-footer";
import { useAdminGuard } from "@/components/admin/use-admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { blocked } = useAdminGuard();
  const params = useParams();
  const [collapsed, setCollapsed] = useState(false);
  // Obtenemos la sección directamente de los parámetros de la URL
  const activeSection = (params.id as Section) || "dashboard";

  const meta = useMemo(() =>
    SECTION_MAP[activeSection] || SECTION_MAP["dashboard"], [activeSection]);

  if (blocked) return null;

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
