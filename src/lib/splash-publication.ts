// src/lib/splash-publication.ts
import { API_BASE, fetchConfig } from "./api-config";
import {
  SplashPublication,
  SplashPublicationForm,
  SplashPublicationListResponse,
  ActiveSplashPublicationResponse,
} from "../types";

export class SplashPublicationService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      ...fetchConfig.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async getList(
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ): Promise<SplashPublicationListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await fetch(
      `${API_BASE}/api/splash-publications?${params}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des publications");
    }

    return response.json();
  }

  static async create(data: SplashPublicationForm): Promise<{ id: number }> {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) {
      formData.append("description", data.description);
    }
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await fetch(`${API_BASE}/api/splash-publications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de la création");
    }

    return response.json();
  }

  static async getById(id: number): Promise<SplashPublication> {
    const response = await fetch(
      `${API_BASE}/api/splash-publications/${id}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Publication non trouvée");
    }

    return response.json();
  }

  static async update(
    id: number,
    data: Partial<SplashPublicationForm>
  ): Promise<void> {
    const formData = new FormData();
    formData.append("title", data.title || "");
    if (data.description) {
      formData.append("description", data.description);
    }
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await fetch(
      `${API_BASE}/api/splash-publications/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de la mise à jour");
    }
  }

  static async delete(id: number): Promise<void> {
    const response = await fetch(
      `${API_BASE}/api/splash-publications/${id}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression");
    }
  }

  static async toggleActive(id: number): Promise<{ is_active: boolean }> {
    const response = await fetch(
      `${API_BASE}/api/splash-publications/${id}/toggle`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors du changement de statut");
    }

    return response.json();
  }

  static async getActivePublication(): Promise<ActiveSplashPublicationResponse> {
    const response = await fetch(
      `${API_BASE}/api/splash-publications/active`
    );

    if (!response.ok) {
      return { active: false };
    }

    return response.json();
  }
}