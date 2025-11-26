// API Configuration
export const API_CONFIG = {
  BASE_URL:
    "https://whitecaroot-backend.onrender.com/" /* || "http://localhost:5000" */,
  TIMEOUT: 30000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
  },

  // Companies
  COMPANIES: {
    GET: (slug: string) => `/api/companies/${slug}`,
    UPDATE: (slug: string) => `/api/companies/${slug}`,
    GET_THEME: (slug: string) => `/api/companies/${slug}/theme`,
    UPDATE_THEME: (slug: string) => `/api/companies/${slug}/theme`,
    UPLOAD: (slug: string) => `/api/companies/${slug}/upload`,
  },

  // Sections
  SECTIONS: {
    GET_ALL: (slug: string) => `/api/companies/${slug}/sections`,
    CREATE: (slug: string) => `/api/companies/${slug}/sections`,
    UPDATE: (slug: string, id: string) =>
      `/api/companies/${slug}/sections/${id}`,
    DELETE: (slug: string, id: string) =>
      `/api/companies/${slug}/sections/${id}`,
    REORDER: (slug: string) => `/api/companies/${slug}/sections/reorder`,
  },

  // Jobs
  JOBS: {
    GET_ALL: (slug: string) => `/api/companies/${slug}/jobs`,
    GET_ONE: (slug: string, jobSlug: string) =>
      `/api/companies/${slug}/jobs/${jobSlug}`,
    GET_ALL_ADMIN: (slug: string) => `/api/companies/${slug}/jobs/all`,
    CREATE: (slug: string) => `/api/companies/${slug}/jobs`,
    UPDATE: (slug: string, id: string) => `/api/companies/${slug}/jobs/${id}`,
    DELETE: (slug: string, id: string) => `/api/companies/${slug}/jobs/${id}`,
    TOGGLE_PUBLISH: (slug: string, id: string) =>
      `/api/companies/${slug}/jobs/${id}/publish`,
  },
};
