// API configuration for the application
export const API_BASE =
  process.env.NODE_ENV === "production"
    ? "" // En production, utilisez des chemins relatifs
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
    // In development, use relative path for Vite proxy
    // In production, use full API_BASE path
    return process.env.NODE_ENV === "production"
      ? `${API_BASE}/api/image/${imageName}`
      : `/api/image/${imageName}`;
  }

  // Otherwise, assume it's a relative path and prepend API_BASE
  return `${API_BASE}${path}`;
};
