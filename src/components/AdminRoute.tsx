"use client";

import type React from "react";

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AdminRouteProps = {
  children: React.ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You could render a loading spinner here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    // Redirect to home page if not authenticated or not an admin
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
