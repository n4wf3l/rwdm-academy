// API Configuration - Hybride DEV/PROD
//
// Configuration automatique des appels API :
// - Développement : utilise http://localhost:5000
// - Production : utilise VITE_API_URL si définie, sinon chemins relatifs (/api/...)
//
// Cela permet de déployer le frontend et backend sur le même domaine (chemins relatifs)
// ou sur des domaines différents (via variable d'environnement).

// API configuration for the application
export const API_BASE =
  process.env.NODE_ENV === "production"
    ? (import.meta.env.VITE_API_URL || "") // Utilise la variable d'environnement ou chemins relatifs par défaut
    : "http://localhost:5000"; // En développement

// Fetch configuration with authorization
export const fetchConfig = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

// Axios configuration (if needed)
export const getAxiosConfig = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Function to resolve media URLs
export const resolveMediaUrl = (path: string | null | undefined): string => {
  if (!path) return "/placeholder-image.jpg"; // Default placeholder

  // If it's already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // If it starts with /uploads/, convert to API endpoint
  if (path.startsWith("/uploads/")) {
    const imageName = path.replace("/uploads/", "");
    // Use API_BASE which handles both dev and prod environments automatically
    return `${API_BASE}/api/image/${imageName}`;
  }

  // Otherwise, assume it's a relative path and prepend API_BASE
  return `${API_BASE}${path}`;
};
