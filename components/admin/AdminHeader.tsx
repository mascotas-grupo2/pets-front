"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Badge,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  NotificationsOutlined,
  MailOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Panel de administración",
    subtitle: "Resumen general del refugio",
  },
  "/admin/mascotas": {
    title: "Mascotas",
    subtitle: "Gestión de animales en el refugio",
  },
  "/admin/solicitudes": {
    title: "Solicitudes",
    subtitle: "Solicitudes de adopción en evaluación",
  },
  "/admin/seguimientos": {
    title: "Seguimientos",
    subtitle: "Control de citas y visitas programadas",
  },
  "/admin/publicaciones": {
    title: "Publicaciones",
    subtitle: "Publicaciones activas y en revisión",
  },
  "/admin/mensajes": {
    title: "Mensajes",
    subtitle: "Bandeja de entrada del refugio",
  },
  "/admin/usuarios": {
    title: "Personas",
    subtitle: "Usuarios registrados en la plataforma",
  },
  "/admin/historias": {
    title: "Historias",
    subtitle: "Historias de adopciones exitosas",
  },
  "/admin/reportes": {
    title: "Reportes",
    subtitle: "Estadísticas y métricas del refugio",
  },
  "/admin/configuracion": {
    title: "Configuración",
    subtitle: "Ajustes generales de la plataforma",
  },
};

export function AdminHeader() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? {
    title: "Panel de administración",
    subtitle: "Resumen general del refugio",
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#f8fafc",
        borderBottom: "none",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3, py: 1.5, minHeight: "72px !important" }}>
        {/* Título y subtítulo de la página */}
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "#1e293b", fontSize: "1.4rem", lineHeight: 1.2 }}
          >
            {meta.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#94a3b8", fontSize: "0.85rem", mt: 0.25 }}
          >
            {meta.subtitle}
          </Typography>
        </Box>

        {/* Acciones del header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton size="small" sx={{ color: "#64748b" }}>
            <Badge badgeContent={6} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>

          <IconButton size="small" sx={{ color: "#64748b", mr: 1 }}>
            <Badge badgeContent={3} color="primary">
              <MailOutlined />
            </Badge>
          </IconButton>

          {/* Perfil */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              pl: 1,
              borderLeft: "1px solid #e2e8f0",
            }}
          >
            <Avatar
              src="/images/admin-avatar.jpg"
              sx={{ width: 36, height: 36 }}
            />
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  lineHeight: 1.2,
                }}
              >
                Admin Refugio
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ fontSize: 18, color: "#64748b" }} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
