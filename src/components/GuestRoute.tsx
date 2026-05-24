import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "./LoadingScreen";

export function GuestRoute() {
  const { status, isAuthenticated } = useAuth();

  if (status === "loading") {
    return <LoadingScreen label="Preparing the app..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}
