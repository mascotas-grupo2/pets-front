"use client";

import { Avatar, Box, Typography } from "@mui/material";

interface AvatarCustomProps {
  name: string;
  photo?: string;
  mail?: string;
}

export function AvatarCustom({ name, photo, mail }: AvatarCustomProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar
        src={photo}
        alt={name}
        sx={{
          width: 32,
          height: 32,
          bgcolor: "#f1f5f9",
          fontSize: "0.8rem",
          color: "#64748b",
          fontWeight: 700
        }}
      >
        {name.charAt(0)}
      </Avatar>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "#1e293b", lineHeight: 1.2 }}
        >
          {name}
        </Typography>
        {mail && (
          <Typography
            variant="caption"
            sx={{ color: "#94a3b8", fontSize: "0.75rem" }}
          >
            {mail}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
