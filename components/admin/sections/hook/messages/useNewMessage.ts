"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";
import { sendMessage } from "@/services/messages.services";
import { getAdminUsers } from "@/services/user.admin";

export interface UserItem {
  id: number;
  name: string;
  email?: string;
  photo?: string;
  role?: string;
}

export function useNewMessage(existingUserIds: number[]) {
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [results, setResults] = useState<UserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingUsers(true);

      try {
        const res = await getAdminUsers({ search });

        if (res.ok && res.data) {
          const blocked = new Set(existingUserIds);
          // Trae usuarios Y admins (sin filtro de rol); excluye los que ya
          // tienen conversación abierta para no duplicar.
          setResults(
            res.data.items
              .filter((u) => !blocked.has(u.id))
              .map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                photo: u.photo ?? undefined,
                role: u.role,
              })),
          );
        }
      } finally {
        setLoadingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, existingUserIds]);

  async function sendFirstMessage() {
    if (!selectedUser) {
      return null;
    }

    const res = await sendMessage(selectedUser.id, message);

    if (!res.ok) {
      toast.error("No se pudo enviar el mensaje");
      return null;
    }

    return selectedUser;
  }

  return {
    search,
    setSearch,
    results,
    selectedUser,
    setSelectedUser,

    message,
    setMessage,
    loadingUsers,

    sendFirstMessage,
  };
}
