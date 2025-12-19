import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AdminRoute({ children }) {
  const { auth } = useAuth();

  if (auth?.user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
