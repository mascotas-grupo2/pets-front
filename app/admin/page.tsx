"use client";

import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Grid,
  IconButton
} from "@mui/material";
import Link from "next/link";
import {
  Pets, Assignment, EventRepeat, Email, Warning, ChevronRight
} from "@mui/icons-material";
import { GenericTable, TableColumn, PageConfig } from "@/components/admin/GenericTable";
import { useState } from "react";
import { AvatarCustom } from "@/components/admin/AvatarCustom";

export default function AdminDashboardPage() {
  const [pageConfig, setPageConfig] = useState<PageConfig>({ size: 5, index: 0 });

  // Estos datos vendrían de un servicio consolidado de estadísticas
  const stats = [
    {
      label: "Mascotas",
      value: "1,240",
      icon: <Pets color="primary" />,
      color: "#e3f2fd",
    },
    {
      label: "Solicitudes activas",
      value: "48",
      icon: <Assignment color="success" />,
      color: "#e8f5e9",
    },
    {
      label: "Seguimientos hoy",
      value: "12",
      icon: <EventRepeat color="secondary" />,
      color: "#f3e5f5",
    },
    {
      label: "Mensajes",
      value: "5",
      icon: <Email color="info" />,
      color: "#e1f5fe",
    },
    {
      label: "Reportes nuevos",
      value: "3",
      icon: <Warning color="error" />,
      color: "#ffebee",
    },
  ];

  const requestColumns: TableColumn<any>[] = [
    { header: "Usuario", key: "user", render: (row) => <AvatarCustom name={row.user} mail={row.mail} /> },
    { header: "Mascota", key: "pet", render: (row) => <AvatarCustom name={row.pet} photo={row.petPhoto} /> },
    { header: "Compatibilidad", key: "match", render: (row) => <Typography sx={{ color: '#10b981', fontWeight: 700 }}>{row.match}</Typography> },
    { header: "Estado", key: "status", render: (row) => <Chip label={row.status} size="small" color={row.color} sx={{ fontWeight: 600, borderRadius: 1.5 }} /> },
    { header: "", key: "actions", align: "right", render: () => <IconButton size="small"><ChevronRight /></IconButton> }
  ];

  const scheduleColumns: TableColumn<any>[] = [
    { header: "Mascota", key: "pet", render: (row) => <AvatarCustom name={row.pet} photo={row.petPhoto} /> },
    { header: "Tipo", key: "type" },
    { header: "Fecha y Hora", key: "date" },
    { header: "Estado", key: "status", render: (row) => <Chip label={row.status} size="small" variant="outlined" sx={{ fontWeight: 600, color: '#6366f1', borderColor: '#e0e7ff' }} /> },
    { header: "", key: "actions", align: "right", render: () => <IconButton size="small"><ChevronRight /></IconButton> }
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Panel de Control
      </Typography>

      {/* Cards de Resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
            <Card
              sx={{ borderRadius: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: stat.color,
                    display: "flex",
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Grid de Tablas */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Solicitudes recientes</Typography>
            <Link href="/admin/solicitudes" passHref><Button size="small">Ver todas</Button></Link>
          </Box>
          <GenericTable
            columns={requestColumns}
            data={[
              { user: "Juan Pérez", mail: "jperez@email.com", pet: "Toby", petPhoto: "/images/pet-1.jpg", match: "92%", status: "En evaluación", color: "info" },
              { user: "María Gómez", mail: "maria@email.com", pet: "Luna", petPhoto: "/images/pet-2.jpg", match: "72%", status: "Entrevista", color: "warning" },
            ]}
            totalCount={48}
            pageConfig={pageConfig}
            onPageChange={setPageConfig}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Seguimientos próximos</Typography>
            <Link href="/admin/seguimientos" passHref><Button size="small">Ver todas</Button></Link>
          </Box>
          <GenericTable
            columns={scheduleColumns}
            data={[
              { pet: "Toby", petPhoto: "/images/pet-1.jpg", type: "Control general", date: "Hoy 15:00", status: "Programada" },
              { pet: "Luna", petPhoto: "/images/pet-2.jpg", type: "Visita hogar", date: "Mañana 10:00", status: "Programada" },
            ]}
            totalCount={12}
            pageConfig={pageConfig}
            onPageChange={setPageConfig}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
