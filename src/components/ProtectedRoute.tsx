import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null; // Décode le token JWT

  if (!token || !user || user.role !== "superadmin") {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
