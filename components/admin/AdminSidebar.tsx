"use client";

import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Badge, Button, Divider
} from "@mui/material";
import {
  Dashboard, Pets, People, BarChart, Message, AddCircle,
  HistoryEdu, Settings, AssignmentTurnedIn, LocalHospital,
  Campaign, ChevronLeft, Logout
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { text: "Dashboard",      icon: <Dashboard />,         path: "/admin" },
  { text: "Mascotas",       icon: <Pets />,              path: "/admin/mascotas" },
  { text: "Solicitudes",    icon: <AssignmentTurnedIn />, path: "/admin/solicitudes",  badge: 8  },
  { text: "Seguimientos",   icon: <LocalHospital />,     path: "/admin/seguimientos" },
  { text: "Publicaciones",  icon: <Campaign />,          path: "/admin/publicaciones", badge: 12 },
  { text: "Mensajes",       icon: <Message />,           path: "/admin/mensajes",      badge: 3  },
  { text: "Personas",       icon: <People />,            path: "/admin/usuarios" },
  { text: "Historias",      icon: <HistoryEdu />,        path: "/admin/historias" },
  { text: "Reportes",       icon: <BarChart />,          path: "/admin/reportes" },
  { text: "Configuración",  icon: <Settings />,          path: "/admin/configuracion" },
];

const DRAWER_OPEN  = 280;
const DRAWER_CLOSE = 72;

export function AdminSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const w = open ? DRAWER_OPEN : DRAWER_CLOSE;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: w,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: w,
          transition: "width 0.25s ease",
          overflowX: "hidden",
          borderRight: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Logo ── */}
      <Box sx={{ px: open ? 3 : 1.5, pt: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5, minHeight: 72 }}>
        <Box sx={{ width: 40, height: 40, bgcolor: "#6366f1", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
          <Pets />
        </Box>
        {open && (
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#6366f1", lineHeight: 1 }}>Huellitas</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#1e293b", lineHeight: 1 }}>Unidas</Typography>
          </Box>
        )}
      </Box>

      {/* ── Nueva publicación ── */}
      <Box sx={{ px: open ? 2 : 1, mb: 2 }}>
        <Button
          fullWidth
          startIcon={open ? <AddCircle /> : undefined}
          sx={{
            bgcolor: "#eff6ff",
            color: "#2563eb",
            boxShadow: "none",
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.88rem",
            borderRadius: "10px",
            justifyContent: open ? "flex-start" : "center",
            px: open ? 2 : 0,
            py: 1.25,
            minWidth: 0,
            "&:hover": { bgcolor: "#dbeafe", boxShadow: "none" },
          }}
        >
          {open ? "Nueva publicación" : <AddCircle />}
        </Button>
      </Box>

      {/* ── Menu ── */}
      <List sx={{ px: 1, flex: 1 }}>
        {MENU_ITEMS.map((item) => {
          const active = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: "block", mb: 0.25 }}>
              <Link href={item.path} style={{ textDecoration: "none" }}>
                <ListItemButton
                  selected={active}
                  sx={{
                    borderRadius: "10px",
                    justifyContent: open ? "initial" : "center",
                    px: open ? 1.75 : 1,
                    py: 1,
                    color: active ? "#6366f1" : "#64748b",
                    "&.Mui-selected": { bgcolor: "#f5f3ff" },
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : "auto",
                      justifyContent: "center",
                      color: "inherit",
                    }}
                  >
                    <Badge
                      badgeContent={!open ? item.badge : 0}
                      color="error"
                      variant="dot"
                    >
                      {item.icon}
                    </Badge>
                  </ListItemIcon>

                  {open && (
                    <>
                      <ListItemText
                        primary={item.text}
                        slotProps={{ primary: { sx: { fontSize: "0.88rem", fontWeight: active ? 700 : 500 } } }}
                      />
                      {item.badge && (
                        <Box sx={{ ml: 1, px: 1, py: 0.15, borderRadius: "6px", bgcolor: active ? "#ede9fe" : "#f1f5f9", color: active ? "#6366f1" : "#64748b", fontSize: "0.72rem", fontWeight: 700, lineHeight: "20px" }}>
                          {item.badge}
                        </Box>
                      )}
                    </>
                  )}
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#f1f5f9", mx: 1 }} />

      {/* ── Cerrar sesión ── */}
      <Box sx={{ p: 1 }}>
        <ListItemButton
          sx={{
            borderRadius: "10px",
            justifyContent: open ? "initial" : "center",
            px: open ? 1.75 : 1,
            py: 1,
            color: "#64748b",
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : "auto", justifyContent: "center", color: "inherit" }}>
            <Logout />
          </ListItemIcon>
          {open && <ListItemText primary="Cerrar sesión" slotProps={{ primary: { sx: { fontSize: "0.88rem", fontWeight: 500 } } }} />}
        </ListItemButton>
      </Box>

      {/* ── Colapsar ── */}
      <Box sx={{ p: 1, pb: 2 }}>
        <ListItemButton
          onClick={onToggle}
          sx={{
            borderRadius: "10px",
            justifyContent: open ? "initial" : "center",
            px: open ? 1.75 : 1,
            py: 1,
            color: "#64748b",
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : "auto", justifyContent: "center", color: "inherit" }}>
            <ChevronLeft sx={{ transform: open ? "none" : "rotate(180deg)", transition: "transform 0.25s" }} />
          </ListItemIcon>
          {open && <ListItemText primary="Colapsar" slotProps={{ primary: { sx: { fontSize: "0.88rem", fontWeight: 500 } } }} />}
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
