import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url?: string;
  banner_url?: string;
  primary_color?: string;
  secondary_color?: string;
  video_url?: string;
}

export interface CompanyTheme {
  id: string;
  company_id: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  secondary_color: string;
  video_url: string | null;
}

export interface UpdateThemeData {
  primaryColor?: string;
  secondaryColor?: string;
  videoUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

class CompanyService {
  async getCompany(slug: string): Promise<Company> {
    const response = await apiClient.get(API_ENDPOINTS.COMPANIES.GET(slug));
    return response.data.company;
  }

  async updateCompany(
    slug: string,
    data: { name?: string; description?: string }
  ) {
    const response = await apiClient.put(
      API_ENDPOINTS.COMPANIES.UPDATE(slug),
      data
    );
    return response.data.company;
  }

  async getTheme(slug: string): Promise<CompanyTheme> {
    const response = await apiClient.get(
      API_ENDPOINTS.COMPANIES.GET_THEME(slug)
    );
    return response.data.theme;
  }

  async updateTheme(slug: string, data: UpdateThemeData) {
    const response = await apiClient.put(
      API_ENDPOINTS.COMPANIES.UPDATE_THEME(slug),
      data
    );
    return response.data.theme;
  }

  async uploadImage(slug: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post(
      API_ENDPOINTS.COMPANIES.UPLOAD(slug),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }
}

export default new CompanyService();
