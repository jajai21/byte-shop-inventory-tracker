
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
  verifyTwoFactor: (email: string, verificationCode: string) => Promise<boolean>;
  resendVerificationCode: (email: string) => Promise<void>;
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
      // For demo, we'll simulate a pending 2FA verification
      const users = JSON.parse(localStorage.getItem('byteshop_users') || '[]');
      const foundUser = users.find((u: User) => u.email === email && u.password === password);
      
      if (foundUser) {
        // Instead of immediately logging in, we'll simulate a 2FA flow
        // Store the email temporarily for the verification step
        localStorage.setItem('byteshop_pending_email', email);
        
        // Simulate sending verification code (in real app, this would be done by backend)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem(`byteshop_verification_${email}`, verificationCode);
        
        toast.success("Verification code sent to your email");
        console.log("Verification code (for demo):", verificationCode); // In real app, this would be sent via email/SMS
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

  const verifyTwoFactor = async (email: string, verificationCode: string): Promise<boolean> => {
    try {
      // In a real app, this would validate the code with the backend
      const storedCode = localStorage.getItem(`byteshop_verification_${email}`);
      
      if (storedCode === verificationCode) {
        // Verification successful, complete the login process
        const users = JSON.parse(localStorage.getItem('byteshop_users') || '[]');
        const foundUser = users.find((u: User) => u.email === email);
        
        if (foundUser) {
          setUser(foundUser);
          setIsAuthenticated(true);
          localStorage.setItem('byteshop_user', JSON.stringify(foundUser));
          localStorage.removeItem('byteshop_pending_email');
          localStorage.removeItem(`byteshop_verification_${email}`);
          toast.success("Logged in successfully");
          return true;
        }
      }
      
      toast.error("Invalid verification code");
      return false;
    } catch (error) {
      toast.error("Verification failed");
      return false;
    }
  };

  const resendVerificationCode = async (email: string): Promise<void> => {
    // Generate a new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`byteshop_verification_${email}`, verificationCode);
    
    toast.success("Verification code resent to your email");
    console.log("New verification code (for demo):", verificationCode);
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
      
      // Instead of auto-login, require 2FA verification
      localStorage.setItem('byteshop_pending_email', email);
      
      // Simulate sending verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`byteshop_verification_${email}`, verificationCode);
      
      toast.success("Account created! Verification code sent to your email");
      console.log("Verification code (for demo):", verificationCode);
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
      isAuthenticated, 
      verifyTwoFactor,
      resendVerificationCode
    }}>
      {children}
    </AuthContext.Provider>
  );
};
