import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

// Types for Firestore operations
export interface LiveGame {
  userId: string;
  gameId: string;
  gameState: {
    grid: number[][];
    selectedCell: { row: number; col: number } | null;
    difficulty: string;
    timer: number;
    isPaused: boolean;
    hintsRemaining: number;
    [key: string]: any;
  };
  lastUpdated: Date;
  isActive: boolean;
}

export interface RealTimeLeaderboard {
  userId: string;
  username: string;
  score: number;
  difficulty: string;
  technique: string;
  solveTime: number;
  timestamp: Date;
  rank?: number;
}

export interface GameSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  totalPuzzles: number;
  completedPuzzles: number;
  averageTime: number;
  isActive: boolean;
}

class FirestoreClientManager {
  private app: App | null = null;
  private db: Firestore | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      console.log('Firestore integration is disabled');
      return;
    }

    if (this.isConnected) {
      return;
    }

    try {
      const firebaseConfigJson = process.env.FIREBASE_CONFIG_JSON;
      if (!firebaseConfigJson) {
        throw new Error('FIREBASE_CONFIG_JSON environment variable is not set');
      }

      // Decode base64 config
      const firebaseConfig = JSON.parse(Buffer.from(firebaseConfigJson, 'base64').toString());

      // Initialize Firebase Admin if not already initialized
      if (getApps().length === 0) {
        this.app = initializeApp({
          credential: cert(firebaseConfig),
          projectId: firebaseConfig.project_id
        });
      } else {
        this.app = getApps()[0];
      }

      this.db = getFirestore(this.app);
      this.isConnected = true;
      
      console.log('Successfully connected to Firestore');
    } catch (error) {
      console.error('Failed to connect to Firestore:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.app) {
      // Firebase Admin apps don't have a delete method
      // The connection will be cleaned up automatically
      this.app = null;
      this.db = null;
      this.isConnected = false;
      console.log('Disconnected from Firestore');
    }
  }

  private checkConnection(): void {
    if (!this.isConnected || !this.db) {
      throw new Error('Firestore connection not established');
    }
  }

  // Live Game Functions
  async syncLiveGame(userId: string, gameState: LiveGame['gameState']): Promise<void> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return;
    }

    this.checkConnection();
    
    try {
      const gameId = `${userId}_${Date.now()}`;
      const liveGame: LiveGame = {
        userId,
        gameId,
        gameState,
        lastUpdated: new Date(),
        isActive: true
      };

      await this.db!.collection('live_games').doc(gameId).set(liveGame);
      console.log(`Live game synced for userId: ${userId}, gameId: ${gameId}`);
    } catch (error) {
      console.error('Error syncing live game:', error);
      throw error;
    }
  }

  async fetchLiveGame(userId: string): Promise<LiveGame | null> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return null;
    }

    this.checkConnection();
    
    try {
      const snapshot = await this.db!.collection('live_games')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .orderBy('lastUpdated', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as unknown as LiveGame;
    } catch (error) {
      console.error('Error fetching live game:', error);
      throw error;
    }
  }

  async endLiveGame(userId: string, gameId: string): Promise<void> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return;
    }

    this.checkConnection();
    
    try {
      await this.db!.collection('live_games').doc(gameId).update({
        isActive: false,
        lastUpdated: new Date()
      });
      
      console.log(`Live game ended for userId: ${userId}, gameId: ${gameId}`);
    } catch (error) {
      console.error('Error ending live game:', error);
      throw error;
    }
  }

  // Real-time Leaderboard Functions
  async saveLeaderboardScore(userId: string, username: string, scoreData: Omit<RealTimeLeaderboard, 'userId' | 'username' | 'timestamp' | 'rank'>): Promise<void> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return;
    }

    this.checkConnection();
    
    try {
      const leaderboardScore: RealTimeLeaderboard = {
        ...scoreData,
        userId,
        username,
        timestamp: new Date()
      };

      await this.db!.collection('realtime_leaderboard').add(leaderboardScore);
      console.log(`Real-time leaderboard score saved for userId: ${userId}`);
    } catch (error) {
      console.error('Error saving real-time leaderboard score:', error);
      throw error;
    }
  }

  async fetchLeaderboard(difficulty?: string, technique?: string, limit: number = 50): Promise<RealTimeLeaderboard[]> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return [];
    }

    this.checkConnection();
    
    try {
      let query: any = this.db!.collection('realtime_leaderboard');
      
      if (difficulty) {
        query = query.where('difficulty', '==', difficulty);
      }
      
      if (technique) {
        query = query.where('technique', '==', technique);
      }

      const snapshot = await query
        .orderBy('score', 'desc')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const scores: RealTimeLeaderboard[] = [];
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        scores.push({ id: doc.id, ...doc.data() } as unknown as RealTimeLeaderboard);
      });

      // Add rank to each score
      scores.forEach((score, index) => {
        score.rank = index + 1;
      });

      return scores;
    } catch (error) {
      console.error('Error fetching real-time leaderboard:', error);
      throw error;
    }
  }

  // Game Session Functions
  async startGameSession(userId: string): Promise<string> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return '';
    }

    this.checkConnection();
    
    try {
      const sessionId = `${userId}_${Date.now()}`;
      const gameSession: GameSession = {
        userId,
        sessionId,
        startTime: new Date(),
        totalPuzzles: 0,
        completedPuzzles: 0,
        averageTime: 0,
        isActive: true
      };

      await this.db!.collection('game_sessions').doc(sessionId).set(gameSession);
      console.log(`Game session started for userId: ${userId}, sessionId: ${sessionId}`);
      
      return sessionId;
    } catch (error) {
      console.error('Error starting game session:', error);
      throw error;
    }
  }

  async updateGameSession(sessionId: string, updateData: Partial<GameSession>): Promise<void> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return;
    }

    this.checkConnection();
    
    try {
      await this.db!.collection('game_sessions').doc(sessionId).update(updateData);
      console.log(`Game session updated: ${sessionId}`);
    } catch (error) {
      console.error('Error updating game session:', error);
      throw error;
    }
  }

  async endGameSession(sessionId: string): Promise<void> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return;
    }

    this.checkConnection();
    
    try {
      await this.db!.collection('game_sessions').doc(sessionId).update({
        endTime: new Date(),
        isActive: false
      });
      
      console.log(`Game session ended: ${sessionId}`);
    } catch (error) {
      console.error('Error ending game session:', error);
      throw error;
    }
  }

  async fetchActiveGameSession(userId: string): Promise<GameSession | null> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return null;
    }

    this.checkConnection();
    
    try {
      const snapshot = await this.db!.collection('game_sessions')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .orderBy('startTime', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as unknown as GameSession;
    } catch (error) {
      console.error('Error fetching active game session:', error);
      throw error;
    }
  }

  // Real-time Listeners
  async subscribeToLiveGame(userId: string, callback: (game: LiveGame | null) => void): Promise<() => void> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return () => {};
    }

    this.checkConnection();
    
    try {
      const unsubscribe = this.db!.collection('live_games')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .onSnapshot((snapshot) => {
          if (snapshot.empty) {
            callback(null);
            return;
          }

          const doc = snapshot.docs[0];
          const game = { id: doc.id, ...doc.data() } as unknown as LiveGame;
          callback(game);
        });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to live game:', error);
      throw error;
    }
  }

  async subscribeToLeaderboard(difficulty: string, technique: string, callback: (scores: RealTimeLeaderboard[]) => void): Promise<() => void> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return () => {};
    }

    this.checkConnection();
    
    try {
      const unsubscribe = this.db!.collection('realtime_leaderboard')
        .where('difficulty', '==', difficulty)
        .where('technique', '==', technique)
        .orderBy('score', 'desc')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .onSnapshot((snapshot) => {
          const scores: RealTimeLeaderboard[] = [];
          snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            scores.push({ id: doc.id, ...doc.data() } as unknown as RealTimeLeaderboard);
          });

          // Add rank to each score
          scores.forEach((score, index) => {
            score.rank = index + 1;
          });

          callback(scores);
        });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to leaderboard:', error);
      throw error;
    }
  }

  // Utility Functions
  async getConnectionStatus(): Promise<boolean> {
    return this.isConnected;
  }

  async ping(): Promise<boolean> {
    if (!this.isConnected || !this.db) {
      return false;
    }

    try {
      await this.db.collection('_health').doc('ping').get();
      return true;
    } catch (error) {
      console.error('Firestore ping failed:', error);
      return false;
    }
  }

  // Cleanup Functions
  async cleanupOldData(): Promise<void> {
    if (!process.env.ENABLE_FIRESTORE || process.env.ENABLE_FIRESTORE !== 'true') {
      return;
    }

    this.checkConnection();
    
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Clean up old live games
      const oldGamesSnapshot = await this.db!.collection('live_games')
        .where('lastUpdated', '<', oneDayAgo)
        .get();

      const batch = this.db!.batch();
      oldGamesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${oldGamesSnapshot.docs.length} old live games`);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }
}

// Export singleton instance
export const firestoreClient = new FirestoreClientManager();

// No type exports needed - types are imported from mongoClientTypes.ts 