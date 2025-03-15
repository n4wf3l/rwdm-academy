
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the shape of the authentication user object
interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: "admin" | "user";
}

// Define the shape of the authentication context
interface AuthContextType {
  authUser: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component to wrap the app and provide auth context
export function AuthProvider({ children }: AuthProviderProps) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem("token");
        if (token) {
          // In a real app, you would validate the token with your backend
          // For now, we'll mock a user if token exists
          setAuthUser({
            id: "1",
            firstName: "Admin",
            lastName: "User",
            email: "admin@rwdm.be",
            profilePicture: "",
            role: "admin",
          });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API here
      // For demo purposes, we'll simulate an API call
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Set the authenticated user
      setAuthUser({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        profilePicture: data.user.profilePicture,
        role: data.user.role,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Simulate API call to logout
      // In a real app, you would call your API to invalidate the token
      localStorage.removeItem("token");
      setAuthUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    authUser,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
