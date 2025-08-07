import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle, 
  signOutUser, 
  resetPassword,
  onAuthStateChange,
  getCurrentUser
} from '../utils/firebase';
import { useAuthStore } from '../store/authStore';
import { getGuestUser, isGuestUser, clearGuestUser } from '../utils/guestUser';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { setUser: setStoreUser, clearUser } = useAuthStore();

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        setStoreUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        });

        // Check if there's a guest user to migrate
        const guestUser = getGuestUser();
        if (guestUser) {
          // Migrate guest data to authenticated user via API
          try {
            await fetch('/api/auth/migrate-guest', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                firebaseUser: {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                },
                guestData: guestUser,
              }),
            });
          } catch (error) {
            console.error('Error migrating guest data:', error);
          }
        }

        // Initialize user data via API
        try {
          const response = await fetch('/api/auth/init-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
            }),
          });
          
          if (!response.ok) {
            console.error('Error initializing user data');
          }
        } catch (error) {
          console.error('Error initializing user data:', error);
        }
      } else {
        // Check for guest user when no Firebase user
        const guestUser = getGuestUser();
        if (guestUser) {
          setStoreUser({
            uid: guestUser.id,
            email: '',
            displayName: guestUser.name,
            photoURL: undefined,
          });
        } else {
          setUser(null);
          clearUser();
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setStoreUser, clearUser]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signUpWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogleAuth = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if current user is a guest user
      const currentUser = getCurrentUser();
      const guestUser = getGuestUser();
      
      if (currentUser && isGuestUser(currentUser.uid)) {
        // Clear guest user data
        clearGuestUser();
        clearUser();
      } else {
        // Sign out Firebase user
        await signOutUser();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearUser]);

  const resetPasswordAction = useCallback(async (email: string) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle: signInWithGoogleAuth,
    signOut,
    resetPassword: resetPasswordAction,
    clearError,
  };
}

// Hook for getting current user without subscription
export function useCurrentUser(): User | null {
  return getCurrentUser();
}

// Hook for checking if user is authenticated
export function useIsAuthenticated(): boolean {
  const { user } = useAuth();
  return !!user;
} 