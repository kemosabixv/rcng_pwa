import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient, User, AuthResponse } from "../utils/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    profession?: string,
    company?: string,
    phone?: string,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);

    try {
      // Check if we have a token
      const token = apiClient.getToken();

      if (token) {
        // Verify token and get user data
        const response = await apiClient.getCurrentUser();

        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Token is invalid, clear it
          apiClient.clearToken();
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        setUser(response.data.user);
        return {};
      } else {
        // Return the specific error message from the API response
        return { error: response.error || "Failed to sign in" };
      }
    } catch (error) {
      console.error("Sign in error:", error);
      // For network/unexpected errors, show a generic message
      return { error: "Network error - please check your connection" };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    profession?: string,
    company?: string,
    phone?: string,
  ) => {
    try {
      setLoading(true);

      const response = await apiClient.register({
        name,
        email,
        password,
        password_confirmation: password,
        profession,
        company,
        phone,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        return {};
      } else {
        // Handle validation errors
        if (response.errors) {
          const errorMessages = Object.values(response.errors).flat();
          return { error: errorMessages.join(", ") };
        }
        return { error: response.error || "Failed to create account" };
      }
    } catch (error) {
      console.error("Sign up error:", error);
      return { error: "Failed to create account" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Call logout endpoint
      await apiClient.logout();

      // Clear user state
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear local state even if server request fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = () => {
    return apiClient.getToken();
  };

  const isAuthenticated = () => {
    return apiClient.isAuthenticated() && !!user;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getAccessToken,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
