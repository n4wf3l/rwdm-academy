// ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  let user = null;

  if (token) {
    try {
      user = JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      console.error("Token invalide:", error);
      localStorage.removeItem("token");
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }

  if (!user || !["admin", "superadmin", "owner"].includes(user.role)) {
    if (location.pathname !== "/auth") {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    return null;
  }

  return children;
};

export default ProtectedRoute;
