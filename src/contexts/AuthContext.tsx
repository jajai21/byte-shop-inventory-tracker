
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on component mount
    const storedUser = localStorage.getItem('byteshop_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app with Supabase, you'd validate against the backend
      const users = JSON.parse(localStorage.getItem('byteshop_users') || '[]');
      const foundUser = users.find((u: User) => u.email === email && u.password === password);
      
      if (foundUser) {
        setUser(foundUser);
        setIsAuthenticated(true);
        localStorage.setItem('byteshop_user', JSON.stringify(foundUser));
        toast.success("Logged in successfully");
        return true;
      } else {
        toast.error("Invalid email or password");
        return false;
      }
    } catch (error) {
      toast.error("Login failed");
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, you'd send this to a backend
      const users = JSON.parse(localStorage.getItem('byteshop_users') || '[]');
      
      // Check if user already exists
      if (users.some((u: User) => u.email === email)) {
        toast.error("User already exists");
        return false;
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        email,
        password
      };
      
      users.push(newUser);
      localStorage.setItem('byteshop_users', JSON.stringify(users));
      
      // Auto-login after signup
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('byteshop_user', JSON.stringify(newUser));
      
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      toast.error("Signup failed");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('byteshop_user');
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
