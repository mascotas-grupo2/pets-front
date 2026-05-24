"use client";

import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Button, Box, Typography, Badge
} from "@mui/material";
import {
  Dashboard, Pets, People, BarChart, Message, MenuOpen,
  HistoryEdu, Settings, AddCircle, AssignmentTurnedIn, LocalHospital,
  Campaign, ChevronLeft
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Mascotas', icon: <Pets />, path: '/admin/mascotas' },
  { text: 'Solicitudes', icon: <AssignmentTurnedIn />, path: '/admin/solicitudes', badge: 18 },
  { text: 'Seguimientos', icon: <LocalHospital />, path: '/admin/seguimientos', badge: 7 },
  { text: 'Publicaciones', icon: <Campaign />, path: '/admin/publicaciones', badge: 12 },
  { text: 'Mensajes', icon: <Message />, path: '/admin/mensajes', badge: 3 },
  { text: 'Personas', icon: <People />, path: '/admin/usuarios' },
  { text: 'Historias', icon: <HistoryEdu />, path: '/admin/historias' },
  { text: 'Reportes', icon: <BarChart />, path: '/admin/reportes' },
  { text: 'Configuración', icon: <Settings />, path: '/admin/configuracion' },
];

export function AdminSidebar({ open, onToggle }: { open: boolean, onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 280 : 80,
        '& .MuiDrawer-paper': {
          width: open ? 280 : 80,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          borderRight: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          color: '#64748b'
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 32, height: 32, bgcolor: '#6366f1', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Pets fontSize="small" />
        </Box>
        {open && (
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>
            Huellitas Unidas
          </Typography>
        )}
      </Box>

      <Box sx={{ px: 2, mb: 4, mt: 1 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddCircle />}
          sx={{
            bgcolor: '#eff6ff',
            color: '#2563eb',
            boxShadow: 'none',
            justifyContent: open ? 'flex-start' : 'center',
            minWidth: 0,
            p: open ? '12px 20px' : '12px',
            '&:hover': { bgcolor: '#dbeafe', boxShadow: 'none' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          {open && "Nueva publicación"}
        </Button>
      </Box>

      <List sx={{ px: 1 }}>
        {MENU_ITEMS.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Link href={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton
                selected={pathname === item.path}
                sx={{
                  borderRadius: 2,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  color: pathname === item.path ? '#6366f1' : 'inherit',
                  '&.Mui-selected': {
                    bgcolor: '#f5f3ff',
                    color: '#6366f1',
                    '& .MuiListItemIcon-root': { color: '#6366f1' }
                  },
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                  <Badge badgeContent={open ? 0 : item.badge} color="error" variant="dot">
                    {item.icon}
                  </Badge>
                </ListItemIcon>
                {open && <ListItemText
                  primary={item.text}
                  slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 500 } } }}
                />}
                {open && item.badge && (
                  <Badge badgeContent={item.badge} color="primary" sx={{
                    '& .MuiBadge-badge': { bgcolor: '#f5f3ff', color: '#6366f1', fontWeight: 700 }
                  }} />
                )}
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <ListItemButton onClick={onToggle} sx={{ borderRadius: 2, justifyContent: open ? 'initial' : 'center' }}>
          <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto' }}>
            <ChevronLeft sx={{ transform: open ? 'none' : 'rotate(180deg)' }} />
          </ListItemIcon>
          {open && <ListItemText primary="Colapsar" slotProps={{ primary: { sx: { fontSize: '0.9rem' } } }} />}
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
