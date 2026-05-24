"use client";

import {
  AssignmentTurnedIn,
  BarChart,
  Campaign, ChevronLeft,
  Dashboard,
  HistoryEdu,
  LocalHospital,
  Logout,
  Message,
  People,
  Pets,
  Settings,
    } from "@mui/icons-material";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import {
  Box,
  Drawer,
  Typography
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { text: "Dashboard",     icon: <Dashboard fontSize="small" />,         path: "/admin"                                  },
  { text: "Mascotas",      icon: <Pets fontSize="small" />,              path: "/admin/mascotas"                         },
  { text: "Solicitudes",   icon: <AssignmentTurnedIn fontSize="small" />,path: "/admin/solicitudes",  badge: 8            },
  { text: "Seguimientos",  icon: <LocalHospital fontSize="small" />,     path: "/admin/seguimientos"                     },
  { text: "Publicaciones", icon: <Campaign fontSize="small" />,          path: "/admin/publicaciones", badge: 12          },
  { text: "Mensajes",      icon: <Message fontSize="small" />,           path: "/admin/mensajes",      badge: 3           },
  { text: "Personas",      icon: <People fontSize="small" />,            path: "/admin/usuarios"                         },
  { text: "Historias",     icon: <HistoryEdu fontSize="small" />,        path: "/admin/historias"                        },
  { text: "Reportes",      icon: <BarChart fontSize="small" />,          path: "/admin/reportes"                         },
  { text: "Configuración", icon: <Settings fontSize="small" />,          path: "/admin/configuracion"                    },
];

const W_OPEN  = 260;
const W_CLOSE = 68;

export function AdminSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? W_OPEN : W_CLOSE,
        flexShrink: 0,
        transition: "width 0.25s ease",
        "& .MuiDrawer-paper": {
          width: open ? W_OPEN : W_CLOSE,
          transition: "width 0.25s ease",
          overflowX: "hidden",
          borderRight: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        },
      }}
    >
      {/* ── Logo ── */}
      <Box sx={{
        height: 72,
        px: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexShrink: 0,
        borderBottom: "1px solid #f1f5f9",
      }}>
        <Box sx={{
          width: 38, height: 38,
          bgcolor: "#6366f1",
          borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff",
          flexShrink: 0,
        }}>
          <Pets sx={{ fontSize: 20 }} />
        </Box>
        {open && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#6366f1", lineHeight: 1.1, whiteSpace: "nowrap" }}>
              Huellitas
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#1e293b", lineHeight: 1.1, whiteSpace: "nowrap" }}>
              Unidas
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Nueva publicación ── */}
      <Box sx={{ px: 1.5, py: 1.5, flexShrink: 0 }}>
        <Box
          component={Link}
          href="/admin/publicaciones/nueva"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: open ? 1.5 : 1,
            py: 1,
            borderRadius: "9px",
            bgcolor: "#eff6ff",
            color: "#2563eb",
            textDecoration: "none",
            justifyContent: open ? "flex-start" : "center",
            "&:hover": { bgcolor: "#dbeafe" },
            transition: "background 0.15s",
          }}
        >
          <AddCircleOutlineOutlinedIcon sx={{ fontSize: 20, flexShrink: 0 }} />
          {open && (
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
              Nueva publicación
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Menu ── */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", px: 1 }}>
        {MENU_ITEMS.map((item) => {
          const active = pathname === item.path;
          return (
            <Link key={item.text} href={item.path} style={{ textDecoration: "none" }}>
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.25,
                height: 40,
                borderRadius: "9px",
                mb: 0.25,
                bgcolor: active ? "#f5f3ff" : "transparent",
                color: active ? "#6366f1" : "#64748b",
                justifyContent: open ? "flex-start" : "center",
                "&:hover": { bgcolor: active ? "#f5f3ff" : "#f8fafc" },
                transition: "background 0.12s",
                cursor: "pointer",
              }}>
                {/* Ícono — con dot cuando está colapsado y hay badge */}
                <Box sx={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Box sx={{ color: "inherit", display: "flex" }}>{item.icon}</Box>
                  {!open && item.badge && (
                    <Box sx={{
                      position: "absolute",
                      top: -3, right: -3,
                      width: 7, height: 7,
                      borderRadius: "50%",
                      bgcolor: "#ef4444",
                    }} />
                  )}
                </Box>

                {open && (
                  <>
                    <Typography sx={{
                      flex: 1,
                      fontSize: "0.875rem",
                      fontWeight: active ? 700 : 500,
                      color: "inherit",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}>
                      {item.text}
                    </Typography>
                    {item.badge && (
                      <Box sx={{
                        px: 0.75, py: 0.1,
                        borderRadius: "5px",
                        bgcolor: active ? "#ede9fe" : "#f1f5f9",
                        color: active ? "#6366f1" : "#94a3b8",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        lineHeight: "18px",
                        minWidth: 20,
                        textAlign: "center",
                      }}>
                        {item.badge}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Link>
          );
        })}
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ flexShrink: 0, borderTop: "1px solid #f1f5f9", px: 1, py: 1 }}>
        {/* Cerrar sesión */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.25,
          px: 1.25, height: 40, borderRadius: "9px",
          color: "#64748b",
          justifyContent: open ? "flex-start" : "center",
          "&:hover": { bgcolor: "#f8fafc", cursor: "pointer" },
          transition: "background 0.12s",
          mb: 0.25,
        }}>
          <Logout sx={{ fontSize: 18, flexShrink: 0 }} />
          {open && (
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap" }}>
              Cerrar sesión
            </Typography>
          )}
        </Box>

        {/* Colapsar */}
        <Box
          onClick={onToggle}
          sx={{
            display: "flex", alignItems: "center", gap: 1.25,
            px: 1.25, height: 40, borderRadius: "9px",
            color: "#64748b",
            justifyContent: open ? "flex-start" : "center",
            "&:hover": { bgcolor: "#f8fafc", cursor: "pointer" },
            transition: "background 0.12s",
          }}
        >
          <ChevronLeft sx={{
            fontSize: 18,
            flexShrink: 0,
            transform: open ? "none" : "rotate(180deg)",
            transition: "transform 0.25s",
          }} />
          {open && (
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap" }}>
              Colapsar
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
