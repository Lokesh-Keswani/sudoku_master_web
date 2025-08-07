import { v4 as uuidv4 } from 'uuid';

export interface GuestUser {
  id: string;
  name: string;
  createdAt: Date;
  lastActive: Date;
  preferences: {
    theme: 'light' | 'dark';
    difficulty: string;
    notifications: boolean;
  };
  stats: {
    totalPuzzlesCompleted: number;
    totalTimeSpent: number;
    averageTime: number;
    bestTime: number;
    currentStreak: number;
    longestStreak: number;
    hintsUsed: number;
    techniquesMastered: string[];
  };
}

const GUEST_USER_KEY = 'sudoku_guest_user';

export const createGuestUser = (name?: string): GuestUser => {
  const guestUser: GuestUser = {
    id: `guest_${uuidv4()}`,
    name: name || `Guest_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    createdAt: new Date(),
    lastActive: new Date(),
    preferences: {
      theme: 'light',
      difficulty: 'medium',
      notifications: false,
    },
    stats: {
      totalPuzzlesCompleted: 0,
      totalTimeSpent: 0,
      averageTime: 0,
      bestTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      hintsUsed: 0,
      techniquesMastered: [],
    },
  };

  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
  return guestUser;
};

export const getGuestUser = (): GuestUser | null => {
  try {
    const stored = localStorage.getItem(GUEST_USER_KEY);
    if (!stored) return null;
    
    const guestUser = JSON.parse(stored);
    // Convert date strings back to Date objects
    guestUser.createdAt = new Date(guestUser.createdAt);
    guestUser.lastActive = new Date(guestUser.lastActive);
    
    return guestUser;
  } catch (error) {
    console.error('Error parsing guest user:', error);
    return null;
  }
};

export const updateGuestUser = (updates: Partial<GuestUser>): GuestUser | null => {
  const currentUser = getGuestUser();
  if (!currentUser) return null;

  const updatedUser: GuestUser = {
    ...currentUser,
    ...updates,
    lastActive: new Date(),
  };

  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

export const updateGuestStats = (stats: Partial<GuestUser['stats']>): GuestUser | null => {
  const currentUser = getGuestUser();
  if (!currentUser) return null;

  const updatedUser: GuestUser = {
    ...currentUser,
    stats: {
      ...currentUser.stats,
      ...stats,
    },
    lastActive: new Date(),
  };

  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

export const updateGuestPreferences = (preferences: Partial<GuestUser['preferences']>): GuestUser | null => {
  const currentUser = getGuestUser();
  if (!currentUser) return null;

  const updatedUser: GuestUser = {
    ...currentUser,
    preferences: {
      ...currentUser.preferences,
      ...preferences,
    },
    lastActive: new Date(),
  };

  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

export const clearGuestUser = (): void => {
  localStorage.removeItem(GUEST_USER_KEY);
};

export const isGuestUser = (userId: string): boolean => {
  return userId.startsWith('guest_');
};

export const migrateGuestToAuthenticated = async (firebaseUser: any): Promise<void> => {
  const guestUser = getGuestUser();
  if (!guestUser) return;

  try {
    // Migrate guest data via API
    const response = await fetch('/api/auth/migrate-guest', {
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

    if (response.ok) {
      // Clear guest user data after successful migration
      clearGuestUser();
    }
  } catch (error) {
    console.error('Error migrating guest user:', error);
  }
}; 