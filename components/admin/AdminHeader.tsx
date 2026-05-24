"use client";

import { AppBar, Toolbar, Typography, Button, Box, InputBase, Badge, Avatar, IconButton } from "@mui/material";
import { Visibility, Search, NotificationsOutlined, MailOutlined, KeyboardArrowDown } from "@mui/icons-material";
import Link from "next/link";

export function AdminHeader() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e2e8f0',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f1f5f9',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            width: 300
          }}>
            <Search sx={{ color: '#94a3b8', mr: 1, fontSize: 20 }} />
            <InputBase placeholder="Buscar..." sx={{ fontSize: '0.9rem', width: '100%' }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small">
            <Badge badgeContent={2} color="error">
              <NotificationsOutlined sx={{ color: '#64748b' }} />
            </Badge>
          </IconButton>
          <IconButton size="small" sx={{ mr: 2 }}>
            <Badge badgeContent={3} color="primary">
              <MailOutlined sx={{ color: '#64748b' }} />
            </Badge>
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', ml: 1 }}>
            <Avatar src="/images/admin-avatar.jpg" sx={{ width: 35, height: 35 }} />
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                Admin Refugio
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ fontSize: 18, color: '#64748b' }} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
