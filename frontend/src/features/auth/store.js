import { create } from 'zustand';
import { api } from '@/lib/api';
export const useAuth = create((set) => ({
    user: null,
    loading: true,
    fetchMe: async () => {
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data, loading: false });
        }
        catch {
            set({ user: null, loading: false });
        }
    },
    logout: async () => {
        await api.post('/auth/logout');
        set({ user: null });
        window.location.href = '/login';
    },
}));
