'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/seed-data';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  authPromptMessage: string | null;
  openAuthModal: (tab?: 'login' | 'register', promptMessage?: string) => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string; pendingApproval?: boolean }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start with default customer or check saved session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>(INITIAL_USERS);

  useEffect(() => {
    // Load active session from localStorage if exists
    try {
      const savedUserJson = localStorage.getItem('quickbite_user_session');
      if (savedUserJson) {
        const parsed = JSON.parse(savedUserJson);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved user session:', e);
    }

    // Refresh users from API
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setAvailableUsers(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login', promptMessage?: string) => {
    setAuthModalTab(tab);
    setAuthPromptMessage(promptMessage || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'password123' }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCurrentUser(data.data);
        localStorage.setItem('quickbite_user_session', JSON.stringify(data.data));
        closeAuthModal();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed. Please check credentials.' };
      }
    } catch (err: any) {
      return { success: false, error: 'Network error occurred during sign in.' };
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; error?: string; pendingApproval?: boolean }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (data.success) {
        if (data.pendingApproval) {
          // Do not log in, but refresh user list so it's active
          fetch('/api/auth/users')
            .then(res => res.json())
            .then(userData => {
              if (userData.success && Array.isArray(userData.data)) {
                setAvailableUsers(userData.data);
              }
            })
            .catch(() => {});
          return { success: true, pendingApproval: true };
        }

        if (data.data) {
          setCurrentUser(data.data);
          localStorage.setItem('quickbite_user_session', JSON.stringify(data.data));
          setAvailableUsers(prev => [data.data, ...prev]);
          closeAuthModal();
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed.' };
      }
    } catch (err: any) {
      return { success: false, error: 'Network error occurred during registration.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('quickbite_user_session');
  };

  const switchRole = (role: UserRole) => {
    const found = availableUsers.find(u => u.role === role) || INITIAL_USERS.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('quickbite_user_session', JSON.stringify(found));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        isAuthModalOpen,
        authModalTab,
        authPromptMessage,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        switchRole,
        availableUsers,
      }}
    >
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
