import { NextApiRequest, NextApiResponse } from 'next';
import { mongoClient } from '../../../utils/mongoClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Connect to MongoDB
    await mongoClient.connect();

    // Check if user profile already exists
    const existingProfile = await mongoClient.getUserProfile(uid);

    if (!existingProfile) {
      // Create new user profile
      await mongoClient.createUserProfile({
        uid,
        email: email || '',
        displayName: displayName || undefined,
        photoURL: photoURL || undefined,
        preferences: {
          theme: 'light',
          difficulty: 'medium',
          notifications: true,
        },
      });

      // Create initial user stats
      await mongoClient.createUserStats({
        uid,
        totalPuzzlesCompleted: 0,
        totalTimeSpent: 0,
        averageTime: 0,
        bestTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        hintsUsed: 0,
        techniquesMastered: [],
      });

      return res.status(201).json({ message: 'User initialized successfully' });
    } else {
      // Update last login time
      await mongoClient.updateUserProfile(uid, {
        lastLoginAt: new Date(),
      });

      return res.status(200).json({ message: 'User login updated' });
    }
  } catch (error) {
    console.error('Error initializing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 