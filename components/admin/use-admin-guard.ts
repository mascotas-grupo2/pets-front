"use client";

import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAdminGuard() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const isAdmin =
    user.isLoggedIn && (user.role === "admin" || user.role === "superadmin");

  useEffect(() => {
    if (isAdmin) return;

    // Logueado pero no admin: fuera ya.
    if (user.isLoggedIn) {
      router.replace("/");
      return;
    }

    const t = setTimeout(() => router.replace("/login"), 600);
    return () => clearTimeout(t);
  }, [isAdmin, user.isLoggedIn, router]);

  return {
    user,
    isAdmin,
    blocked: !isAdmin,
  };
}
