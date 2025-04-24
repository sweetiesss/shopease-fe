"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type User = {
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

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Token found in localStorage:", !!token);

      if (token) {
        try {
          const decoded = jwtDecode<{
            sub: string;
            role: "ADMIN" | "CUSTOMER";
          }>(token);

          setUser({
            email: decoded.sub,
            role: decoded.role,
          });
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

  useEffect(() => {
    checkAuth();
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/login");
  };

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
