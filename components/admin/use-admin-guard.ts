"use client";

import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirige a "/" si el usuario está logueado y no es admin.
 * El chequeo real de permisos lo hace el backend (`requireAdmin`):
 * este hook es sólo UX para no mostrar la pantalla.
 */
export function useAdminGuard() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    if (user.isLoggedIn && user.role !== "admin") {
      router.replace("/");
    }
  }, [user, router]);

  return {
    user,
    isAdmin: user.role === "admin",
    blocked: user.isLoggedIn && user.role !== "admin",
  };
}
