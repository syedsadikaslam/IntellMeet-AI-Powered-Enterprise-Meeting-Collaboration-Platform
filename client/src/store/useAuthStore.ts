import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isHydrating: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  setHydrating: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isHydrating: true,
      setUser: (user) => set({ user }),
      setToken: (token, refreshToken) => set((state) => ({ 
        token, 
        refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken 
      })),
      setHydrating: (isHydrating) => set({ isHydrating }),
      logout: () => {
        set({ user: null, token: null, refreshToken: null });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      },
    }),
    {
      name: 'intellmeet-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHydrating(false);
      },
    }
  )
);
