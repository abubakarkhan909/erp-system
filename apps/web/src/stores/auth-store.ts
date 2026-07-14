'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@jewelry-erp/shared';
import { apiPost, setAuthToken } from '@/lib/api/client';

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setSession: (session: LoginResponse) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setSession: ({ user, accessToken, refreshToken }) => {
        setAuthToken(accessToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      clearSession: () => {
        setAuthToken(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      login: async (username, password) => {
        const res = await apiPost<LoginResponse>(
          '/auth/login',
          { username, password },
          { auth: false },
        );
        get().setSession(res.data);
        return res.data.user;
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await apiPost('/auth/logout', { refreshToken }, { auth: false });
          }
        } catch {
          // Ignore logout API errors — clear local session regardless
        } finally {
          get().clearSession();
        }
      },
    }),
    {
      name: 'jewelry_erp_auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAuthToken(state.accessToken);
        }
      },
    },
  ),
);
