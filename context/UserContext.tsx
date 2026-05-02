import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUser } from "@/services/user.info";
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
    window.location.href = "/"; // Redirect al home tras logout
  }, [dispatch]);

  const saveUser = useCallback(
    (user: User | null) => {
      if (!user) return;
      dispatch({ type: "user/SetUser", payload: user });
    },
    [dispatch],
  );

  useEffect(() => {
    const hydrate = async () => {
      // Hidratamos si existe el token de acceso (manual/sso) o el hint de SSO
      if (
        document.cookie.includes("auth_token") ||
        document.cookie.includes("id_token_hint")
      ) {
        const response = await getUser();
        if (response?.ok && response.data) {
          saveUser(response.data);
        } else {
          logout(); // Si hay cookies pero el token no es válido, limpiamos
        }
      }
    };

    hydrate();
  }, [dispatch, saveUser]);

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
