import { NextApiRequest, NextApiResponse } from 'next';
import { mongoClient } from '../../../../utils/mongoClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid } = req.query;

    if (!uid || typeof uid !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Connect to MongoDB
    await mongoClient.connect();

    // Get user stats
    const userStats = await mongoClient.getUserStats(uid);

    if (!userStats) {
      return res.status(404).json({ error: 'User stats not found' });
    }

    return res.status(200).json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 