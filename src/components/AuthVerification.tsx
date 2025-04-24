"use client";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthVerification() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const currentPath = location.pathname;
      const isAuthPage = currentPath === "/login" || currentPath === "/verify";

      if (isAuthenticated) {
        // If on login or verify and already logged in, go to home
        if (currentPath === "/login" || currentPath === "/verify") {
          navigate("/");
        }
      } else {
        // Not authenticated, only protect non-auth routes
        if (!isAuthPage) {
          navigate("/login");
        }
      }

      setCheckingAuth(false);
    }
  }, [isAuthenticated, isLoading, location, navigate]);

  if (isLoading || checkingAuth) {
    return null; // You could show a spinner here if desired
  }

  return null;
}
