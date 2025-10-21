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
    console.log('SplashPublicationService.create called with data:', data);

    const token = localStorage.getItem("token");
    console.log('Token from localStorage:', token ? 'present' : 'null/empty');

    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const formData = new FormData();
    const titleJson = JSON.stringify(data.title);
    const descriptionJson = data.description ? JSON.stringify(data.description) : null;

    console.log('Title JSON:', titleJson);
    console.log('Description JSON:', descriptionJson);

    formData.append("title", titleJson);
    if (descriptionJson) {
      formData.append("description", descriptionJson);
    }
    if (data.image) {
      console.log('Image file:', data.image.name, 'size:', data.image.size);
      formData.append("image", data.image);
    } else {
      console.log('No image provided');
    }

    console.log('Sending request to:', `${API_BASE}/api/splash-publications`);

    const response = await fetch(`${API_BASE}/api/splash-publications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = "Erreur lors de la création";
      try {
        const error = await response.json();
        console.log('Error response:', error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (e) {
        console.log('Could not parse error response');
        const text = await response.text();
        console.log('Error response text:', text);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Success response:', result);
    return result;
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
    formData.append("title", JSON.stringify(data.title));
    if (data.description) {
      formData.append("description", JSON.stringify(data.description));
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