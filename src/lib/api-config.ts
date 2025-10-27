// ✅ Vite expose import.meta.env.PROD et import.meta.env.VITE_*
const IS_PROD = import.meta.env.PROD;

// Met ton backend si tu l’héberges ailleurs ;
// si front+back sont sur le même domaine, laisse vide ("") pour chemins relatifs.
const PROD_BASE = import.meta.env.VITE_API_URL || "";

// ✅ Base API correcte pour Vite
export const API_BASE = IS_PROD ? PROD_BASE : "http://localhost:5000";

// ✅ Headers communs (inchangé)
export const fetchConfig = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

// ✅ Pour axios si besoin
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
