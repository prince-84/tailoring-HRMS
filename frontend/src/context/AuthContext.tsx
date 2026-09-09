'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/swal';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: {
    id: number;
    name: string;
    slug: string;
  };
  branch?: {
    id: number;
    name: string;
    code: string;
    city: string;
  };
  employee?: {
    id: number;
    code: string;
    first_name: string;
    last_name: string;
    full_name: string;
    designation?: string;
    department?: string;
    joining_date?: string;
  };
  permissions: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => Promise<void>;
  can: (module: string, action?: string) => boolean;
  hasRole: (roleSlug: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    showToast(`Welcome back, ${newUser.name}!`);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/logout');
      }
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showToast('Logged out successfully', 'info');
      router.push('/login');
    }
  };

  const can = (module: string, action = 'view'): boolean => {
    if (!user) return false;
    if (user.role?.slug === 'super-admin') return true;
    const permKey = `${module}.${action}`;
    return user.permissions.includes(permKey) || user.permissions.includes(`${module}.view`);
  };

  const hasRole = (roleSlug: string): boolean => {
    if (!user || !user.role) return false;
    return user.role.slug === roleSlug;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, can, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
