import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/* ---------- global fetch rewrite (aucun autre fichier nécessaire) ---------- */
(() => {
  const env: any =
    (typeof import.meta !== "undefined" && (import.meta as any).env) || {};

  // Lis l’unique variable de ton .env (tu la changeras pour la prod)
  const API_BASE =
    env.VITE_API_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000`;

  // Domaines “prod” à réécrire vers API_BASE (comma-separated dans .env)
  const PROD_ORIGINS = String(env.VITE_REWRITE_PROD_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function rewriteUrl(input: RequestInfo | URL): string | URL {
    try {
      const u = new URL(String(input));
      if (PROD_ORIGINS.includes(u.origin)) {
        return `${API_BASE}${u.pathname}${u.search}${u.hash}`;
      }
      return u.toString();
    } catch {
      // Chemins relatifs -> on ne touche pas
      return input as string;
    }
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const rewritten = rewriteUrl(input);
    // Si init.credentials est explicitement défini, le respecter, sinon utiliser "include"
    const finalInit: RequestInit = { 
      credentials: "include", 
      ...init,
      // Ne pas override si credentials est explicitement défini dans init
      ...(init?.credentials !== undefined ? { credentials: init.credentials } : {})
    };
    return originalFetch(rewritten as any, finalInit);
  }) as typeof window.fetch;

  // Optionnel : résoudre les images /uploads/... venant de la DB
  (window as any).__resolveMediaUrl = (val?: string) => {
    if (!val) return "/fallback.png";
    if (/^https?:\/\//i.test(val)) return val;
    if (val.startsWith("/uploads/")) return `${API_BASE}${val}`;
    return val;
  };
})();

/* ----------------------------- boot de l’app ------------------------------ */
createRoot(document.getElementById("root")!).render(<App />);
