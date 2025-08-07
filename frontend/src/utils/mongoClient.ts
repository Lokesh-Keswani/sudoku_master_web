import { MongoClient, Db, Collection } from 'mongodb';
import type { UserProfile, UserStats, UserTrainingProgress, UserSolveReport } from './mongoClientTypes';

// Server-side only check
if (typeof window !== 'undefined') {
  throw new Error('MongoDB client should only be used on the server side');
}

// Re-export types for convenience
export type { UserProfile, UserStats, UserTrainingProgress, UserSolveReport };

class MongoClientManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  // Collections
  private userProfilesCollection: Collection<UserProfile> | null = null;
  private userStatsCollection: Collection<UserStats> | null = null;
  private userTrainingCollection: Collection<UserTrainingProgress> | null = null;
  private userReportsCollection: Collection<UserSolveReport> | null = null;

  async connect(): Promise<void> {
    if (!process.env.ENABLE_MONGO || process.env.ENABLE_MONGO !== 'true') {
      console.log('MongoDB integration is disabled');
      return;
    }

    if (this.isConnected) {
      return;
    }

    try {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MONGO_URI environment variable is not set');
      }

      this.client = new MongoClient(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db('sudoku_master');
      
      // Initialize collections
      this.userProfilesCollection = this.db.collection<UserProfile>('user_profiles');
      this.userStatsCollection = this.db.collection<UserStats>('user_stats');
      this.userTrainingCollection = this.db.collection<UserTrainingProgress>('user_training');
      this.userReportsCollection = this.db.collection<UserSolveReport>('user_reports');

      // Create indexes for better performance
      await this.createIndexes();
      
      this.isConnected = true;
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  async getConnectionStatus(): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.db().admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.userProfilesCollection || !this.userStatsCollection || 
        !this.userTrainingCollection || !this.userReportsCollection) {
      return;
    }

    // User profiles indexes
    await this.userProfilesCollection.createIndex({ uid: 1 }, { unique: true });
    await this.userProfilesCollection.createIndex({ email: 1 }, { unique: true });

    // User stats indexes
    await this.userStatsCollection.createIndex({ uid: 1 }, { unique: true });

    // User training indexes
    await this.userTrainingCollection.createIndex({ uid: 1, moduleId: 1 }, { unique: true });
    await this.userTrainingCollection.createIndex({ uid: 1, lastPlayed: -1 });

    // User reports indexes
    await this.userReportsCollection.createIndex({ uid: 1, createdAt: -1 });
    await this.userReportsCollection.createIndex({ reportId: 1 }, { unique: true });
  }

  // User Profile Operations
  async createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'lastLoginAt'>): Promise<void> {
    if (!this.userProfilesCollection) return;

    const now = new Date();
    const userProfile: UserProfile = {
      ...profile,
      createdAt: now,
      lastLoginAt: now,
    };

    await this.userProfilesCollection.insertOne(userProfile);
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!this.userProfilesCollection) return null;
    return await this.userProfilesCollection.findOne({ uid });
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (!this.userProfilesCollection) return;
    await this.userProfilesCollection.updateOne(
      { uid },
      { $set: { ...updates, lastLoginAt: new Date() } }
    );
  }

  // User Stats Operations
  async createUserStats(stats: Omit<UserStats, 'lastUpdated'>): Promise<void> {
    if (!this.userStatsCollection) return;

    const userStats: UserStats = {
      ...stats,
      lastUpdated: new Date(),
    };

    await this.userStatsCollection.insertOne(userStats);
  }

  async getUserStats(uid: string): Promise<UserStats | null> {
    if (!this.userStatsCollection) return null;
    return await this.userStatsCollection.findOne({ uid });
  }

  async updateUserStats(uid: string, updates: Partial<UserStats>): Promise<void> {
    if (!this.userStatsCollection) return;
    await this.userStatsCollection.updateOne(
      { uid },
      { $set: { ...updates, lastUpdated: new Date() } }
    );
  }

  // User Training Progress Operations
  async saveTrainingProgress(progress: Omit<UserTrainingProgress, 'lastPlayed'>): Promise<void> {
    if (!this.userTrainingCollection) return;

    const trainingProgress: UserTrainingProgress = {
      ...progress,
      lastPlayed: new Date(),
    };

    await this.userTrainingCollection.updateOne(
      { uid: progress.uid, moduleId: progress.moduleId },
      { $set: trainingProgress },
      { upsert: true }
    );
  }

  async getUserTrainingProgress(uid: string): Promise<UserTrainingProgress[]> {
    if (!this.userTrainingCollection) return [];
    return await this.userTrainingCollection.find({ uid }).toArray();
  }

  async getModuleProgress(uid: string, moduleId: string): Promise<UserTrainingProgress | null> {
    if (!this.userTrainingCollection) return null;
    return await this.userTrainingCollection.findOne({ uid, moduleId });
  }

  // User Solve Reports Operations
  async saveSolveReport(report: Omit<UserSolveReport, 'createdAt'>): Promise<void> {
    if (!this.userReportsCollection) return;

    const solveReport: UserSolveReport = {
      ...report,
      createdAt: new Date(),
    };

    await this.userReportsCollection.insertOne(solveReport);
  }

  async getUserSolveReports(uid: string, limit = 50): Promise<UserSolveReport[]> {
    if (!this.userReportsCollection) return [];
    return await this.userReportsCollection
      .find({ uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  async getSolveReport(reportId: string): Promise<UserSolveReport | null> {
    if (!this.userReportsCollection) return null;
    return await this.userReportsCollection.findOne({ reportId });
  }

  // Bulk Operations
  async deleteUserData(uid: string): Promise<void> {
    if (!this.userProfilesCollection || !this.userStatsCollection || 
        !this.userTrainingCollection || !this.userReportsCollection) {
      return;
    }

    await Promise.all([
      this.userProfilesCollection.deleteOne({ uid }),
      this.userStatsCollection.deleteOne({ uid }),
      this.userTrainingCollection.deleteMany({ uid }),
      this.userReportsCollection.deleteMany({ uid }),
    ]);
  }

  // Health check
  async ping(): Promise<boolean> {
    return await this.getConnectionStatus();
  }
}

// Export singleton instance
export const mongoClient = new MongoClientManager(); 