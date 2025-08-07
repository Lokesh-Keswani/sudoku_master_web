import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user: User) => set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      }),

      clearUser: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'sudoku-auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 