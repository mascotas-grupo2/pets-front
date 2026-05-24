"use client";

import { Typography, Box, Button, Grid, IconButton, Avatar } from "@mui/material";
import Link from "next/link";
import {
  Pets, AssignmentTurnedIn, CalendarMonth, MarkEmailUnread,
  Campaign, ChevronRight, Visibility, Edit, MoreVert,
} from "@mui/icons-material";
import { AvatarCustom } from "@/components/modules/AvatarCustom";

// ─── Layout constants ─────────────────────────────────────────────────────────
const ROW_H   = 60;   // altura de cada fila de datos
const HEAD_H  = 38;   // altura del header de columnas
const ROWS    = 5;    // siempre 5 filas visibles
const TABLE_H = HEAD_H + ROW_H * ROWS; // altura total fija

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface RequestRow    { userName: string; userMail: string; userPhoto?: string; petName: string; petPhoto?: string; match: string; matchQuality: string; status: string; date: string }
interface ScheduleRow   { petName: string; petPhoto?: string; type: string; dateTime: string; adopter: string; status: string }
interface PublicationRow { title: string; subtitle: string; photo?: string; date: string; status: string; views: number }
interface ActivityRow   { icon: React.ReactNode; iconBg: string; iconColor: string; title: string; subtitle: string; time: string }

// ─── Datos ────────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Mascotas",            sublabel: "En total",          value: "128", icon: <Pets sx={{ fontSize: 28 }} />,               iconBg: "#ede9fe", iconColor: "#7c3aed" },
  { label: "Solicitudes activas", sublabel: "En evaluación",     value: "18",  icon: <AssignmentTurnedIn sx={{ fontSize: 28 }} />,  iconBg: "#dcfce7", iconColor: "#16a34a" },
  { label: "Seguimientos hoy",    sublabel: "Citas programadas", value: "7",   icon: <CalendarMonth sx={{ fontSize: 28 }} />,       iconBg: "#fef3c7", iconColor: "#d97706" },
  { label: "Mensajes sin leer",   sublabel: "Nuevos mensajes",   value: "3",   icon: <MarkEmailUnread sx={{ fontSize: 28 }} />,     iconBg: "#dbeafe", iconColor: "#2563eb" },
  { label: "Publicaciones nuevas",sublabel: "Por revisar",       value: "12",  icon: <Campaign sx={{ fontSize: 28 }} />,            iconBg: "#fce7f3", iconColor: "#db2777" },
];

const REQUESTS: RequestRow[] = [
  { userName: "Juan Pérez",     userMail: "jperez@email.com", userPhoto: "/images/user-1.jpg", petName: "Toby",  petPhoto: "/images/pet-1.jpg", match: "92%", matchQuality: "Excelente", status: "En evaluación",        date: "20/05/2026" },
  { userName: "María Gómez",    userMail: "maria@email.com",  userPhoto: "/images/user-2.jpg", petName: "Luna",  petPhoto: "/images/pet-2.jpg", match: "72%", matchQuality: "Buena",     status: "Entrevista pendiente", date: "20/05/2026" },
  { userName: "Laura Martínez", userMail: "laura@email.com",  userPhoto: "/images/user-3.jpg", petName: "Simba", petPhoto: "/images/pet-3.jpg", match: "65%", matchQuality: "Buena",     status: "Nueva",                date: "19/05/2026" },
  { userName: "Carlos Ruiz",    userMail: "cruz@email.com",   userPhoto: "/images/user-4.jpg", petName: "Nina",  petPhoto: "/images/pet-4.jpg", match: "45%", matchQuality: "Baja",      status: "Descartada",           date: "19/05/2026" },
  { userName: "Ana López",      userMail: "ana@email.com",    userPhoto: "/images/user-5.jpg", petName: "Coco",  petPhoto: "/images/pet-5.jpg", match: "88%", matchQuality: "Excelente", status: "En evaluación",        date: "18/05/2026" },
];

const SCHEDULES: ScheduleRow[] = [
  { petName: "Toby",  petPhoto: "/images/pet-1.jpg", type: "Control general",       dateTime: "Hoy 15:00",   adopter: "Juan Pérez",     status: "Programada" },
  { petName: "Luna",  petPhoto: "/images/pet-2.jpg", type: "Visita de seguimiento", dateTime: "21/05 10:00", adopter: "María Gómez",    status: "Programada" },
  { petName: "Simba", petPhoto: "/images/pet-3.jpg", type: "Vacuna antirrábica",    dateTime: "22/05 11:30", adopter: "Laura Martínez", status: "Programada" },
  { petName: "Nina",  petPhoto: "/images/pet-4.jpg", type: "Control veterinario",   dateTime: "23/05 09:00", adopter: "Carlos Ruiz",    status: "Programada" },
  { petName: "Coco",  petPhoto: "/images/pet-5.jpg", type: "Visita de seguimiento", dateTime: "25/05 16:00", adopter: "Ana López",      status: "Programada" },
];

const PUBLICATIONS: PublicationRow[] = [
  { title: "Toby busca hogar",       subtitle: "Perro · Macho · 3 años", photo: "/images/pet-1.jpg", date: "20/05/2026", status: "Publicada",   views: 156 },
  { title: "Luna, gata cariñosa",    subtitle: "Gato · Hembra · 2 años", photo: "/images/pet-2.jpg", date: "20/05/2026", status: "Publicada",   views: 98  },
  { title: "Simba en adopción",      subtitle: "Perro · Macho · 4 años", photo: "/images/pet-3.jpg", date: "19/05/2026", status: "En revisión", views: 0   },
  { title: "Nina, dulce compañera",  subtitle: "Perra · Hembra · 1 año", photo: "/images/pet-4.jpg", date: "19/05/2026", status: "Rechazada",   views: 0   },
];

const ACTIVITY: ActivityRow[] = [
  { icon: <AssignmentTurnedIn sx={{ fontSize: 17 }} />, iconBg: "#ede9fe", iconColor: "#7c3aed", title: "Nueva solicitud para Toby",     subtitle: "Juan Pérez solicitó adoptar a Toby",          time: "Hace 10 min" },
  { icon: <CalendarMonth sx={{ fontSize: 17 }} />,      iconBg: "#fef3c7", iconColor: "#d97706", title: "Seguimiento completado",         subtitle: "Control general de Luna completado",           time: "Hace 1 h"    },
  { icon: <MarkEmailUnread sx={{ fontSize: 17 }} />,    iconBg: "#dbeafe", iconColor: "#2563eb", title: "Nuevo mensaje",                  subtitle: "María Gómez te envió un mensaje",              time: "Hace 2 h"    },
  { icon: <Campaign sx={{ fontSize: 17 }} />,           iconBg: "#fce7f3", iconColor: "#db2777", title: "Nueva publicación",              subtitle: "Publicación de Simba creada",                  time: "Hace 3 h"    },
  { icon: <Pets sx={{ fontSize: 17 }} />,               iconBg: "#dcfce7", iconColor: "#16a34a", title: "Usuario registrado",             subtitle: "Laura Martínez se registró en la plataforma",  time: "Hace 5 h"    },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "En evaluación":        { bg: "#dbeafe", color: "#1d4ed8" },
  "Entrevista pendiente": { bg: "#fef9c3", color: "#a16207" },
  "Nueva":                { bg: "#dcfce7", color: "#15803d" },
  "Descartada":           { bg: "#f1f5f9", color: "#64748b" },
  "Programada":           { bg: "#ede9fe", color: "#6d28d9" },
  "Publicada":            { bg: "#dcfce7", color: "#15803d" },
  "En revisión":          { bg: "#fef9c3", color: "#a16207" },
  "Rechazada":            { bg: "#fee2e2", color: "#b91c1c" },
};

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function StatusBadge({ label }: { label: string }) {
  const s = STATUS_STYLE[label] ?? { bg: "#f1f5f9", color: "#64748b" };
  return (
    <Box sx={{
      display: "inline-flex",
      px: 1.25, py: 0.4,
      borderRadius: "7px",
      bgcolor: s.bg,
      color: s.color,
      fontSize: "0.74rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
      width: "fit-content",
    }}>
      {label}
    </Box>
  );
}

// Header completamente separado de la tabla — libre, sin card
function SectionHeader({ title, href, linkLabel = "Ver todas" }: { title: string; href: string; linkLabel?: string }) {
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 1.25,       // espacio entre título y tabla
      px: 0.5,        // alineación visual con el contenido de la tabla
    }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.97rem", color: "#1e293b" }}>
        {title}
      </Typography>
      <Link href={href} passHref>
        <Button
          size="small"
          sx={{ color: "#6366f1", fontWeight: 600, fontSize: "0.78rem", textTransform: "none", minWidth: 0, p: 0 }}
        >
          {linkLabel}
        </Button>
      </Link>
    </Box>
  );
}

// Cabecera de columnas — dentro de la tabla
const TH_SX = {
  fontSize: "0.68rem",
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
};

// Wrapper con altura fija
function TableBox({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      overflow: "hidden",
      bgcolor: "#fff",
      height: TABLE_H,
      display: "flex",
      flexDirection: "column",
    }}>
      {children}
    </Box>
  );
}

// Fila vacía de relleno
function BlankRow({ gridCols, last }: { gridCols: string; last: boolean }) {
  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: gridCols,
      height: ROW_H,
      px: 2,
      borderBottom: last ? "none" : "1px solid #f8fafc",
    }} />
  );
}

// ─── Tablas ───────────────────────────────────────────────────────────────────

const C_REQ = "2fr 1.1fr 1fr 1.5fr 0.9fr 28px";
const C_SCH = "1.3fr 1.6fr 1.1fr 1.3fr 1fr 28px";
const C_PUB = "2.5fr 1fr 1fr 0.6fr 76px";

function RequestsTable() {
  const rows = [...REQUESTS];
  while (rows.length < ROWS) rows.push(null as any);
  return (
    <TableBox>
      <Box sx={{ display: "grid", gridTemplateColumns: C_REQ, height: HEAD_H, px: 2, alignItems: "center", borderBottom: "1px solid #f1f5f9", flexShrink: 0, gap: 1 }}>
        {["Usuario", "Mascota", "Compatibilidad", "Estado", "Fecha", ""].map(h => <Typography key={h} sx={TH_SX}>{h}</Typography>)}
      </Box>
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {rows.map((r, i) =>
          r ? (
            <Box key={i} sx={{ display: "grid", gridTemplateColumns: C_REQ, height: ROW_H, px: 2, gap: 1, alignItems: "center", borderBottom: i < ROWS - 1 ? "1px solid #f8fafc" : "none", "&:hover": { bgcolor: "#f8fafc" }, transition: "background 0.12s" }}>
              <AvatarCustom name={r.userName} mail={r.userMail} photo={r.userPhoto} />
              <AvatarCustom name={r.petName} photo={r.petPhoto} />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.86rem", color: r.matchQuality === "Excelente" ? "#10b981" : r.matchQuality === "Buena" ? "#f59e0b" : "#ef4444" }}>{r.match}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{r.matchQuality}</Typography>
              </Box>
              <StatusBadge label={r.status} />
              <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>{r.date}</Typography>
              <IconButton size="small" sx={{ color: "#cbd5e1", p: 0.25 }}><ChevronRight sx={{ fontSize: 18 }} /></IconButton>
            </Box>
          ) : <BlankRow key={i} gridCols={C_REQ} last={i === ROWS - 1} />
        )}
      </Box>
    </TableBox>
  );
}

function ScheduleTable() {
  const rows = [...SCHEDULES];
  while (rows.length < ROWS) rows.push(null as any);
  return (
    <TableBox>
      <Box sx={{ display: "grid", gridTemplateColumns: C_SCH, height: HEAD_H, px: 2, alignItems: "center", borderBottom: "1px solid #f1f5f9", flexShrink: 0, gap: 1 }}>
        {["Mascota", "Tipo", "Fecha y Hora", "Adoptante", "Estado", ""].map(h => <Typography key={h} sx={TH_SX}>{h}</Typography>)}
      </Box>
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {rows.map((r, i) =>
          r ? (
            <Box key={i} sx={{ display: "grid", gridTemplateColumns: C_SCH, height: ROW_H, px: 2, gap: 1, alignItems: "center", borderBottom: i < ROWS - 1 ? "1px solid #f8fafc" : "none", "&:hover": { bgcolor: "#f8fafc" }, transition: "background 0.12s" }}>
              <AvatarCustom name={r.petName} photo={r.petPhoto} />
              <Typography sx={{ fontSize: "0.82rem", color: "#1e293b" }}>{r.type}</Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "#1e293b" }}>{r.dateTime}</Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "#1e293b" }}>{r.adopter}</Typography>
              <StatusBadge label={r.status} />
              <IconButton size="small" sx={{ color: "#cbd5e1", p: 0.25 }}><ChevronRight sx={{ fontSize: 18 }} /></IconButton>
            </Box>
          ) : <BlankRow key={i} gridCols={C_SCH} last={i === ROWS - 1} />
        )}
      </Box>
    </TableBox>
  );
}

function PublicationsTable() {
  const rows = [...PUBLICATIONS];
  while (rows.length < ROWS) rows.push(null as any);
  return (
    <TableBox>
      <Box sx={{ display: "grid", gridTemplateColumns: C_PUB, height: HEAD_H, px: 2, alignItems: "center", borderBottom: "1px solid #f1f5f9", flexShrink: 0, gap: 1 }}>
        {["Publicación", "Fecha", "Estado", "Vistas", "Acciones"].map(h => <Typography key={h} sx={TH_SX}>{h}</Typography>)}
      </Box>
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {rows.map((r, i) =>
          r ? (
            <Box key={i} sx={{ display: "grid", gridTemplateColumns: C_PUB, height: ROW_H, px: 2, gap: 1, alignItems: "center", borderBottom: i < ROWS - 1 ? "1px solid #f8fafc" : "none", "&:hover": { bgcolor: "#f8fafc" }, transition: "background 0.12s" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <Avatar src={r.photo} variant="rounded" sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "#f1f5f9", flexShrink: 0 }}>
                  <Pets sx={{ fontSize: 16, color: "#94a3b8" }} />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{r.subtitle}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>{r.date}</Typography>
              <StatusBadge label={r.status} />
              <Typography sx={{ fontSize: "0.82rem", color: "#1e293b" }}>{r.views}</Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton size="small" sx={{ color: "#94a3b8", p: 0.3 }}><Visibility sx={{ fontSize: 15 }} /></IconButton>
                <IconButton size="small" sx={{ color: "#94a3b8", p: 0.3 }}><Edit sx={{ fontSize: 15 }} /></IconButton>
                <IconButton size="small" sx={{ color: "#94a3b8", p: 0.3 }}><MoreVert sx={{ fontSize: 15 }} /></IconButton>
              </Box>
            </Box>
          ) : <BlankRow key={i} gridCols={C_PUB} last={i === ROWS - 1} />
        )}
      </Box>
    </TableBox>
  );
}

function ActivityList() {
  const rows = [...ACTIVITY];
  while (rows.length < ROWS) rows.push(null as any);
  return (
    <Box sx={{
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      overflow: "hidden",
      bgcolor: "#fff",
      height: TABLE_H,        // misma altura que las demás tablas
      display: "flex",
      flexDirection: "column",
    }}>
      {rows.map((a, i) =>
        a ? (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.75, flex: 1, px: 2, borderBottom: i < ROWS - 1 ? "1px solid #f8fafc" : "none", "&:hover": { bgcolor: "#f8fafc" }, transition: "background 0.12s" }}>
            <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: a.iconBg, color: a.iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {a.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", lineHeight: 1.3 }}>{a.title}</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>{a.subtitle}</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", flexShrink: 0 }}>{a.time}</Typography>
          </Box>
        ) : (
          <Box key={i} sx={{ flex: 1, borderBottom: i < ROWS - 1 ? "1px solid #f8fafc" : "none" }} />
        )
      )}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Stats cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2 }}>
        {STATS.map((s, i) => (
          <Box key={i} sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "14px", bgcolor: s.iconBg, color: s.iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.73rem", color: "#94a3b8", fontWeight: 500, mb: 0.25 }}>{s.label}</Typography>
              <Typography sx={{ fontSize: "1.85rem", fontWeight: 800, color: "#1e293b", lineHeight: 1.05 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", mt: 0.25 }}>{s.sublabel}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Fila 1 — Solicitudes + Seguimientos */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionHeader title="Solicitudes recientes" href="/admin/solicitudes" />
          <RequestsTable />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionHeader title="Seguimientos próximos" href="/admin/seguimientos" linkLabel="Ver todos" />
          <ScheduleTable />
        </Grid>
      </Grid>

      {/* Fila 2 — Publicaciones + Actividad */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionHeader title="Publicaciones recientes" href="/admin/publicaciones" />
          <PublicationsTable />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionHeader title="Actividad reciente" href="/admin/actividad" linkLabel="Ver todo" />
          <ActivityList />
        </Grid>
      </Grid>

    </Box>
  );
}
