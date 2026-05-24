"use client";

import { Avatar, Box, Typography } from "@mui/material";

interface AvatarCustomProps {
  name: string;
  photo?: string;
  mail?: string;
}

const AVATAR_PALETTES: { bg: string; color: string }[] = [
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#dcfce7", color: "#15803d" },
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#ffedd5", color: "#9a3412" },
  { bg: "#e0f2fe", color: "#0369a1" },
];

function getPalette(name: string) {
  return AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];
}

export function AvatarCustom({ name, photo, mail }: AvatarCustomProps) {
  const { bg, color } = getPalette(name);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <Avatar
        src={photo}
        alt={name}
        sx={{
          width: 36,
          height: 36,
          bgcolor: bg,
          color,
          fontSize: "0.8rem",
          fontWeight: 700,
          flexShrink: 0,
          border: "1.5px solid #f1f5f9",
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.84rem", color: "#1e293b", lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </Typography>
        {mail && (
          <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
            {mail}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
