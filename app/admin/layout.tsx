"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminGuard } from "@/components/admin/use-admin-guard";
import { Box } from "@mui/material";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { blocked } = useAdminGuard();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (blocked) return null;

  return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        {/* Sidebar Lateral */}
        <AdminSidebar
          open={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: { sm: `calc(100% - ${isSidebarOpen ? 280 : 80}px)` },
            transition: 'width 0.3s ease'
          }}
        >
          {/* Header Superior */}
        <AdminHeader />

          {/* Contenido de la Página */}
          <Box sx={{ p: 3, flexGrow: 1 }}>
            {children}
          </Box>
        </Box>
      </Box>
  );
}
