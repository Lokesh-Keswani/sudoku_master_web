import { useState, useEffect } from 'react';
import { getGuestUser, updateGuestStats, updateGuestPreferences, isGuestUser } from '../utils/guestUser';

export const useGuestUser = () => {
  const [guestUser, setGuestUser] = useState(getGuestUser());

  useEffect(() => {
    // Update guest user state when localStorage changes
    const handleStorageChange = () => {
      setGuestUser(getGuestUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateStats = (stats: any) => {
    const updated = updateGuestStats(stats);
    if (updated) {
      setGuestUser(updated);
    }
    return updated;
  };

  const updatePrefs = (preferences: any) => {
    const updated = updateGuestPreferences(preferences);
    if (updated) {
      setGuestUser(updated);
    }
    return updated;
  };

  const checkIsGuest = (userId: string) => {
    return isGuestUser(userId);
  };

  return {
    guestUser,
    updateStats,
    updatePrefs,
    checkIsGuest,
  };
}; 