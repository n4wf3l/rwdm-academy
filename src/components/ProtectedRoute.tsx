import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  let user = null;

  if (token) {
    try {
      user = JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      console.error("Invalid token format:", error);
      localStorage.removeItem("token"); // Optionnel : supprimer le token invalide
      return <Navigate to="/auth" replace />;
    }
  }

  if (!user || user.role !== "superadmin") {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
