import { NextApiRequest, NextApiResponse } from 'next';
import { mongoClient } from '../../../utils/mongoClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firebaseUser, guestData } = req.body;

    if (!firebaseUser?.uid || !guestData) {
      return res.status(400).json({ error: 'Firebase user and guest data are required' });
    }

    // Connect to MongoDB
    await mongoClient.connect();

    // Create user profile with guest data
    await mongoClient.createUserProfile({
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || guestData.name,
      photoURL: firebaseUser.photoURL || undefined,
      preferences: guestData.preferences || {
        theme: 'light',
        difficulty: 'medium',
        notifications: true,
      },
    });

    // Create user stats with guest data
    await mongoClient.createUserStats({
      uid: firebaseUser.uid,
      totalPuzzlesCompleted: guestData.stats?.totalPuzzlesCompleted || 0,
      totalTimeSpent: guestData.stats?.totalTimeSpent || 0,
      averageTime: guestData.stats?.averageTime || 0,
      bestTime: guestData.stats?.bestTime || 0,
      currentStreak: guestData.stats?.currentStreak || 0,
      longestStreak: guestData.stats?.longestStreak || 0,
      hintsUsed: guestData.stats?.hintsUsed || 0,
      techniquesMastered: guestData.stats?.techniquesMastered || [],
    });

    return res.status(200).json({ message: 'Guest data migrated successfully' });
  } catch (error) {
    console.error('Error migrating guest data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 