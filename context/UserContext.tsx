import {
  getUser,
  getUserAuthToken,
  getUserDetails,
} from "@/services/user.info";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { User } from "@/types/user";
import {
  createContext,
  useCallback,
  ReactNode,
  useContext,
  useEffect,
  // useState, // No longer needed
} from "react";

type UserContextProps = {
  userId: number | string;
  name: string;
  adopter: boolean;
  role: string;
  saveUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch(); // Keep dispatch for Redux actions
  const user = useAppSelector((state) => state.user); // Get user state from Redux

  const logout = useCallback(() => {
    localStorage.removeItem("userId");
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
      if (user.id === 0) return logout();
      dispatch({ type: "user/SetUser", payload: user });
      localStorage.setItem("userId", user.id.toString());
    },
    [dispatch, logout],
  );

  useEffect(() => {
    const idFromStorage = localStorage.getItem("userId");

    const hydrate = async () => {
      if (idFromStorage) {
        const response = await getUser(idFromStorage);
        if (response && response.ok && response.data) {
          dispatch({ type: "user/SetUser", payload: response.data });
        }
      } else if (document.cookie.includes("auth_token")) {
        // Si no hay ID en storage pero hay cookie de sesión (SSO)
        const response = await getUserAuthToken();
        if (response?.ok && response.data) {
          saveUser(response.data);
        }
      }
    };

    hydrate();
  }, [dispatch, saveUser]); // Add saveUser to dependencies

  const values: UserContextProps = {
    ...user,
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
