// ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Utiliser useEffect pour afficher des logs à chaque tentative d'accès
  useEffect(() => {}, [location.pathname, allowedRoles]);

  if (!token) {
    console.log("Aucun token trouvé, redirection vers /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  let user = null;
  try {
    const payload = atob(token.split(".")[1]);
    user = JSON.parse(payload);

    // Normalisation du rôle en minuscules
    if (user && user.role) {
      user.role = user.role.toLowerCase();
    }
  } catch (error) {
    console.error("Token JWT invalide:", error);
    localStorage.removeItem("token");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Vérification de base pour tous les utilisateurs admin
  if (!user || !["admin", "superadmin", "owner"].includes(user.role)) {
    console.log("L'utilisateur n'est pas un admin, redirection vers /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Vérification spécifique des rôles autorisés si définis
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.toLowerCase()
    );

    if (!normalizedAllowedRoles.includes(user.role)) {
      console.log(
        `ACCÈS REFUSÉ: ${
          user.role
        } n'est pas dans [${normalizedAllowedRoles.join(", ")}]`
      );
      console.log("Redirection vers /dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
