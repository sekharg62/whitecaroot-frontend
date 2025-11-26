import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth.service";
/* import type { AuthResponse } from "../services/auth.service"; */

interface User {
  id: string;
  email: string;
  fullName: string | null;
}

interface Company {
  id: string;
  name: string;
  slug: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    companyName: string,
    fullName?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authData = authService.getAuthData();

        if (authData.token && authData.user && authData.company) {
          // Verify token is still valid
          try {
            await authService.getMe();
            setUser(authData.user);
            setCompany(authData.company);
          } catch (error) {
            // Token invalid, clear data
            authService.logout();
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      authService.setAuthData(response);
      setUser(response.user);
      setCompany(response.company);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  const register = async (
    email: string,
    password: string,
    companyName: string,
    fullName?: string
  ) => {
    try {
      const response = await authService.register({
        email,
        password,
        companyName,
        fullName,
      });
      authService.setAuthData(response);
      setUser(response.user);
      setCompany(response.company);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
