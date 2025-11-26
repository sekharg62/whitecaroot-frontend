import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export interface Job {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  description: string;
  workplace: string;
  location: string;
  department: string;
  job_type: string;
  seniority: string;
  salary: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  company_name: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  jobType?: string;
  department?: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  workplace?: string;
  location?: string;
  department?: string;
  jobType?: string;
  seniority?: string;
  salary?: string;
  isPublished?: boolean;
}

export interface UpdateJobData extends Partial<CreateJobData> {}

class JobService {
  async getJobs(slug: string, filters?: JobFilters): Promise<Job[]> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.jobType) params.append("jobType", filters.jobType);
    if (filters?.department) params.append("department", filters.department);

    const queryString = params.toString();
    const url = `${API_ENDPOINTS.JOBS.GET_ALL(slug)}${
      queryString ? "?" + queryString : ""
    }`;

    const response = await apiClient.get(url);
    return response.data.jobs;
  }

  async getJob(slug: string, jobSlug: string): Promise<Job> {
    const response = await apiClient.get(
      API_ENDPOINTS.JOBS.GET_ONE(slug, jobSlug)
    );
    return response.data.job;
  }

  async getAllJobsAdmin(slug: string): Promise<Job[]> {
    const response = await apiClient.get(
      API_ENDPOINTS.JOBS.GET_ALL_ADMIN(slug)
    );
    return response.data.jobs;
  }

  async createJob(slug: string, data: CreateJobData): Promise<Job> {
    const response = await apiClient.post(
      API_ENDPOINTS.JOBS.CREATE(slug),
      data
    );
    return response.data.job;
  }

  async updateJob(slug: string, id: string, data: UpdateJobData): Promise<Job> {
    const response = await apiClient.put(
      API_ENDPOINTS.JOBS.UPDATE(slug, id),
      data
    );
    return response.data.job;
  }

  async deleteJob(slug: string, id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.JOBS.DELETE(slug, id));
  }

  async togglePublish(
    slug: string,
    id: string,
    isPublished: boolean
  ): Promise<Job> {
    const response = await apiClient.patch(
      API_ENDPOINTS.JOBS.TOGGLE_PUBLISH(slug, id),
      {
        isPublished,
      }
    );
    return response.data.job;
  }
}

export default new JobService();
