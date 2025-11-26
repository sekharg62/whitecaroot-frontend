import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export interface Section {
  id: string;
  company_id: string;
  title: string;
  content: string;
  section_type: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSectionData {
  title: string;
  content: string;
  sectionType?: string;
  isVisible?: boolean;
}

export interface UpdateSectionData {
  title?: string;
  content?: string;
  sectionType?: string;
  isVisible?: boolean;
}

class SectionService {
  async getSections(slug: string): Promise<Section[]> {
    const response = await apiClient.get(API_ENDPOINTS.SECTIONS.GET_ALL(slug));
    return response.data.sections;
  }

  async createSection(slug: string, data: CreateSectionData): Promise<Section> {
    const response = await apiClient.post(
      API_ENDPOINTS.SECTIONS.CREATE(slug),
      data
    );
    return response.data.section;
  }

  async updateSection(
    slug: string,
    id: string,
    data: UpdateSectionData
  ): Promise<Section> {
    const response = await apiClient.put(
      API_ENDPOINTS.SECTIONS.UPDATE(slug, id),
      data
    );
    return response.data.section;
  }

  async deleteSection(slug: string, id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SECTIONS.DELETE(slug, id));
  }

  async reorderSections(slug: string, sectionIds: string[]): Promise<void> {
    await apiClient.put(API_ENDPOINTS.SECTIONS.REORDER(slug), { sectionIds });
  }
}

export default new SectionService();
