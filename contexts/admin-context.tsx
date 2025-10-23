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
  const [isEditMode, setIsEditModeState] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      console.log('Auth check result:', data);
      setIsAuthenticated(data.authenticated);
      // Always keep edit mode false on page load, even if authenticated
      console.log('Admin context: Forcing edit mode to false after auth check');
      setIsEditModeState(false);
      setHasInitialized(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setIsEditModeState(false);
      setHasInitialized(true);
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
        setIsEditModeState(true); // Only enable edit mode when explicitly logging in
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
      setIsEditModeState(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const setEditMode = (mode: boolean) => {
    // Don't allow edit mode changes until after initialization
    if (!hasInitialized) {
      console.log('Admin context: Ignoring setEditMode call before initialization');
      return;
    }
    // Only allow enabling edit mode if authenticated
    if (mode && !isAuthenticated) {
      console.log('Admin context: Cannot enable edit mode without authentication');
      return;
    }
    console.log('Admin context: setEditMode called with:', mode);
    setIsEditModeState(mode);
  };

  useEffect(() => {
    // Always start in non-edit mode on page load
    console.log('Admin context: Setting edit mode to false on page load');
    setIsEditModeState(false);
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

