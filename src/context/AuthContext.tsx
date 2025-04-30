import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "../api"; // <-- adjust this import path according to your project structure

type User = {
  id: number;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  checkAuth: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
  checkAuth: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await api.auth.refreshToken();
      const newAccessToken = response.data;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      logout();
      return null;
    }
  };

  const decodeAndSetUser = (token: string) => {
    const decoded = jwtDecode<{
      userId: number;
      sub: string;
      role: "ADMIN" | "CUSTOMER";
      exp: number;
    }>(token);

    setUser({
      id: decoded.userId,
      email: decoded.sub,
      role: decoded.role,
    });
  };

  const checkAuth = async () => {
    try {
      let token = localStorage.getItem("accessToken");
      console.log("Token found in localStorage:", !!token);

      if (token) {
        try {
          const decoded = jwtDecode<{
            exp: number;
          }>(token);

          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp < currentTime) {
            console.log("Access token expired, refreshing...");
            const newToken = await refreshAccessToken();
            if (newToken) {
              decodeAndSetUser(newToken);
            }
          } else {
            decodeAndSetUser(token);
          }
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
          localStorage.removeItem("accessToken");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    (async () => {
      await checkAuth();
      setIsLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
