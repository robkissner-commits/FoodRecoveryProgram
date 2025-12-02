import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  setUserRole: (role: 'admin' | 'reporter' | 'driver' | 'both') => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock user - always logged in for MVP
  const [user, setUser] = useState<User>({
    id: 1,
    email: 'demo@iona.edu',
    role: 'admin',
    name: 'Demo User',
    phone: '555-0000',
    active: true,
    created_at: new Date().toISOString(),
  });

  const setUserRole = (role: 'admin' | 'reporter' | 'driver' | 'both') => {
    setUser({
      ...user,
      role: role,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    });
  };

  const value = {
    user,
    setUserRole,
    isAuthenticated: true,
    isLoading: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
