// src/types.ts
export interface Request {
  id: string;
  type: string;
  status?: string;
  data?: any;
  name?: string;
  created_at?: string;
  updated_at?: string;
  rejected_at?: string | null;
  sent_at?: string | null; // ✅ ici
  assignedTo?: string;
  details?: {
    documentLabel?: string;
    codeDossier?: string;
    accidentDate?: string;
    [key: string]: any;
  };
}

export interface SplashPublication {
  id: number;
  userId: number;
  title: { [key: string]: string }; // { fr: "Titre FR", en: "Title EN", nl: "Titel NL" }
  description?: { [key: string]: string };
  image: string;
  publishedAt: string;
  updatedAt: string;
  is_active: boolean;
  // Joined fields
  firstName?: string;
  lastName?: string;
}

export interface SplashPublicationForm {
  title: { [key: string]: string };
  description: { [key: string]: string };
  image?: File;
}

export interface SplashPublicationListResponse {
  publications: SplashPublication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ActiveSplashPublication {
  id: number;
  title: { [key: string]: string }; // { fr: "Titre FR", en: "Title EN", nl: "Titel NL" }
  description?: { [key: string]: string };
  image: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
  userId?: number;
}

export type ActiveSplashPublicationResponse = ActiveSplashPublication | { active: false };
