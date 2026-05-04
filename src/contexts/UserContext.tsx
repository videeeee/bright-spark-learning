import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  classLevel?: string;
  curriculum?: string;
  subjects?: string[];
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

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        {
          headers: { Authorization: token },
        }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
        }
        throw new Error("Failed to fetch user profile");
      }

      const userData = await res.json();
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Fetch user on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const value: UserContextType = {
    user,
    isLoading,
    error,
    fetchUserProfile,
    logout,
    setUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
