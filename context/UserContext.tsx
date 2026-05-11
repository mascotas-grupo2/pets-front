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

type UserContextProps = {
  isLoggedIn: boolean;
  adopter: boolean;
  saveUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const logout = useCallback(() => {
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "id_token_hint=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    dispatch({ type: "user/Logout" });
    localStorage.removeItem("user_persistence");
    window.location.href = "/"; // Redirect al home tras logout
  }, [dispatch]);

  const saveUser = useCallback(
    (user: User | null) => {
      if (!user) return;

      localStorage.setItem("user_persistence", JSON.stringify(user));
      dispatch({ type: "user/SetUser", payload: user });
    },
    [dispatch],
  );

  /**
   * Valida la integridad de los datos locales sin necesidad de consultar
   * el perfil completo al backend (JIT verification).
   */
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

      // 3. Verificación de Seguridad
      if (
        typeof document !== "undefined" &&
        (document.cookie.includes("auth_token") ||
          document.cookie.includes("id_token_hint"))
      ) {
        if (saved) {
          const localUser = JSON.parse(saved) as User;
          if (localUser.signature) {
            const check = await verifyUserSignature(localUser);
            if (!check.valid) {
              console.error("Firma inválida o datos manipulados.");
              logout();
              return;
            }
            return;
          }
        }

        // Si no había datos guardados pero hay cookies, pedimos el usuario por primera vez
        const response = await getUser();
        if (response?.ok && response.data) saveUser(response.data);
        else logout();

      } else if (saved) {
        logout();
      }
    }
  }, [dispatch, saveUser, logout]);

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
    logout,
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
