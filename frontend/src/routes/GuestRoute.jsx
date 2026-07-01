import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";

export default function GuestRoute() {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) return <Spinner fullPage />;
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <Outlet />;
}