'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '@/types';

interface AuthContextType {
  user: IUser | null;
  isAdmin: boolean;
  loginAs: (role: 'admin' | 'customer') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN_USER: IUser = {
  _id: 'usr_admin',
  name: 'Palette Hubb Admin',
  email: 'admin@palettehubb.com',
  role: 'admin',
  createdAt: '2025-01-01T00:00:00.000Z',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(DEFAULT_ADMIN_USER);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('palette_hubb_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        queueMicrotask(() => setUser(parsed));
      }
    } catch (e) {
      console.error('Failed to load user', e);
    }
  }, []);

  const loginAs = (role: 'admin' | 'customer') => {
    const newUser: IUser =
      role === 'admin'
        ? {
            _id: 'usr_admin',
            name: 'Palette Hubb Admin',
            email: 'admin@palettehubb.com',
            role: 'admin',
            createdAt: new Date().toISOString(),
          }
        : {
            _id: 'usr_customer',
            name: 'Aarav Sharma',
            email: 'aarav.sharma@example.com',
            role: 'customer',
            createdAt: new Date().toISOString(),
          };
    setUser(newUser);
    try {
      localStorage.setItem('palette_hubb_user', JSON.stringify(newUser));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('palette_hubb_user');
    } catch (e) {
      console.error('Failed to remove user', e);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
