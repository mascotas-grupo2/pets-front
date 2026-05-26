"use client";

import { useState } from "react";
import { SECTION_MAP, type Section } from "@/components/admin/admin-config";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminFooter } from "@/components/admin/admin-footer";
import { SECTION_CONTENT } from "@/components/admin/sections/registry";
import { PlaceholderSection } from "@/components/admin/sections/placeholder-section";
import { useAdminGuard } from "@/components/admin/use-admin-guard";

export default function AdminPage() {
  const { blocked } = useAdminGuard();
  const [active, setActive] = useState<Section>("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  if (blocked) return null;

  const meta = SECTION_MAP[active];
  const Content = SECTION_CONTENT[active];

  return (
    <div className="admin-shell">
      <AdminSidebar
        active={active}
        onSelect={setActive}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="admin-main">
        <AdminTopbar title={meta.title} subtitle={meta.subtitle} />

        <main className="admin-content">
          {Content ? <Content /> : <PlaceholderSection title={meta.title} />}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
