"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUser } from "@/services/user.info";
import { verifyUserSignature } from "@/services/auth.verify";
import { User } from "@/types/user";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { logout } from "@/services/auth.login";
import { ErrorGeneric } from "@/components/utils/catchErrors";

type UserContextProps = {
  isLoggedIn: boolean;
  adopter: boolean;
  saveUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const logoutSession = useCallback(async () => {
    try {
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "id_token_hint=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      await logout();
      dispatch({ type: "user/Logout" });
      localStorage.removeItem("user_persistence");
      window.location.href = "/";
    } catch (error) {
      ErrorGeneric(error);
    }
  }, [dispatch]);

  const saveUser = useCallback(
    (user: User | null) => {
      if (!user) return;
      localStorage.setItem("user_persistence", JSON.stringify(user));
      dispatch({ type: "user/SetUser", payload: user });
    },
    [dispatch],
  );

  const hydrate = useCallback(async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_persistence");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as User;
          dispatch({ type: "user/SetUser", payload: parsed });
        } catch (e) {
          localStorage.removeItem("user_persistence");
        }
      }

      // Verificamos qué cookies existen (refresh_token puede ser httpOnly
      const hasAuthToken = document.cookie.includes("auth_token");
      const hasIdTokenHint = document.cookie.includes("id_token_hint");

      if (saved) {
        const localUser = JSON.parse(saved) as User;
        if (localUser.signature && (hasAuthToken || hasIdTokenHint)) {
          const check = await verifyUserSignature(localUser);
          if (!check.valid) {
            console.error("Firma inválida o datos manipulados.");
            await logoutSession();
            return;
          }
          // Tenemos firma válida Y token de acceso visible → todo ok
          return;
        }

        //   automático si existe refresh_token en cookies httpOnly.
        const response = await getUser();
        if (response?.ok && response.data) {
          saveUser(response.data);
        } else {
          await logoutSession();
        }
      } else if (hasAuthToken || hasIdTokenHint) {
        // Hay token de acceso pero no hay saved → obtener datos
        const response = await getUser();
        if (response?.ok && response.data) saveUser(response.data);
        else await logoutSession();
      }
    }
  }, [dispatch, saveUser, logoutSession]);

  useEffect(() => {
    // Hidratación inicial al cargar la página
    hydrate();

    // Listener para detectar cambios desde otras pestañas o manipulaciones en consola
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_persistence") {
        hydrate();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [hydrate]);

  const values: UserContextProps = {
    isLoggedIn: user.isLoggedIn,
    adopter: user.adopter,
    saveUser,
    logout: logoutSession,
  };
  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
