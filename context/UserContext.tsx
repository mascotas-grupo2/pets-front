import { getUser } from "@/services/user.info";
import { User } from "@/types/login";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
type UserContextProps = {
  userId: number;
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
  const [user, setUser] = useState({
    userId: 0,
    name: "",
    adopter: false,
    role: "",
  });

  useEffect(() => {
    const idFromStorage = localStorage.getItem("userId");
    if (idFromStorage) {
      getUser(idFromStorage).then((response) => {
        if (response && response.ok) {
          const userData = response.data;
          setUser({
            userId: userData.id,
            name: userData.name,
            adopter: userData.adopter,
            role: userData.role,
          });
        }
      });
    }
  }, []);

  const saveUser = (user: User | null) => {
    if (!user) return;
    if (user.id === 0) {
      return logout();
    }

    setUser({ ...user, userId: user.id });
    localStorage.setItem("userId", user.id.toString());
  };

  const update = (user: User | null) => {
    if (!user) return;
    if (user.id === 0) {
      return logout();
    }

    setUser({ ...user, userId: user.id });
    localStorage.setItem("userId", user.id.toString());
  };

  const logout = () => {
    if (user.userId) {
      localStorage.removeItem("userId");
      setUser({
        userId: 0,
        name: "",
        adopter: false,
        role: "",
      });
      return;
    }
  };

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
