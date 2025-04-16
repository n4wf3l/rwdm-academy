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
