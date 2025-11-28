'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAdmin } from '@/contexts/admin-context';
import { X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // Try to get the modal root, fallback to body
    const root = document.getElementById('modal-root') || document.body;
    setModalRoot(root);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(password);

    if (success) {
      setPassword('');
      onClose();
    } else {
      setError('Invalid password');
    }

    setIsLoading(false);
  };

  if (!isOpen || !mounted || !modalRoot) return null;

  const modalContent = (
    <div 
      className="bg-black/50 flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        margin: 0,
        padding: 0
      }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-md w-full max-w-sm relative mx-4"
        style={{
          padding: '1.8rem',
          maxWidth: '460px'
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-md z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-base text-gray-700 font-medium">Logging in...</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <X size={28} />
        </button>

        <h2 className="text-2xl font-bold mb-5 text-gray-900">Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-5 text-red-500 text-base">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-blue-500 text-white py-2.5 text-base rounded-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );

  // Render modal using portal to modal-root (outside scaled content)
  return createPortal(modalContent, modalRoot);
}

