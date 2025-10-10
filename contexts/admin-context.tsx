'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isEditMode: boolean;
  isAuthenticated: boolean;
  setEditMode: (mode: boolean) => void;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      if (!data.authenticated) {
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setIsEditMode(false);
    }
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setIsEditMode(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const setEditMode = (mode: boolean) => {
    if (mode && !isAuthenticated) {
      return; // Can't enable edit mode without authentication
    }
    setIsEditMode(mode);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isEditMode,
        isAuthenticated,
        setEditMode,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

