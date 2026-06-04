import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User } from '@/types';

type AuthState = {
  user: User | null;
  loading: boolean;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  fetchMe: async () => {
    try {
      const { data } = await api.get<User>('/auth/me');
      set({ user: data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null });
    window.location.href = '/login';
  },
}));
