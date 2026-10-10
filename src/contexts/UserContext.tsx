import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "@/lib/api";

export interface UserProfile {
  _id: string;
  name: string;
  displayName?: string;
  email: string;
  classLevel?: string;
  curriculum?: string;
  subjects?: string[];
  companion?: "solin" | "pyro" | "aqua" | "lumi" | "verdi";
  settings?: {
    dailyReminders?: boolean;
    streakAlerts?: boolean;
    newContent?: boolean;
    weeklyReport?: boolean;
  };
  totalXp?: number;
  currentStreak?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUserProfile: () => Promise<void>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userData = await api.get<UserProfile>("/api/auth/me");
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      const message = err instanceof ApiError ? err.message : "Failed to load user profile";
      setError(message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  // Listen for unauthorized 401 events from api client
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      navigate("/login");
    };

    window.addEventListener("learnquest:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("learnquest:unauthorized", handleUnauthorized);
    };
  }, [navigate]);

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const value: UserContextType = {
    user,
    isLoading,
    error,
    fetchUserProfile,
    logout,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
