import apiClient from "./api.client";
import { API_ENDPOINTS } from "../config/api.config";

export interface RegisterData {
  email: string;
  password: string;
  companyName: string;
  fullName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
  company: {
    id: string;
    name: string;
    slug: string;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  }

  async getMe() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  }

  setAuthData(data: AuthResponse) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("company", JSON.stringify(data.company));
  }

  getAuthData() {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    const company = localStorage.getItem("company");

    return {
      token,
      user: user ? JSON.parse(user) : null,
      company: company ? JSON.parse(company) : null,
    };
  }

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }
}

export default new AuthService();
