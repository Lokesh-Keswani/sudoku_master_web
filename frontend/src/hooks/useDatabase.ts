import { useState, useEffect, useCallback } from 'react';
import { firestoreClient } from '../database/firestoreClient';
import { databaseConfig, isDatabaseEnabled, isFirestoreEnabled } from '../config/database';
import type {
  UserStats,
  SavedPuzzle,
  UserReport,
  CompletedPuzzle,
  LeaderboardScore,
  RealTimeLeaderboard,
  GameSession
} from '../database/mongoClientTypes';
import type { LiveGame } from '../database/firestoreClient';

interface DatabaseState {
  isConnected: boolean;
  firestoreConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface DatabaseOperations {
  // MongoDB Operations
  saveUserStats: (userId: string, statsData: Partial<UserStats>) => Promise<void>;
  fetchUserStats: (userId: string) => Promise<UserStats | null>;
  updateUserStats: (userId: string, statsData: Partial<UserStats>) => Promise<void>;
  
  savePuzzle: (userId: string, puzzleData: Omit<SavedPuzzle, 'userId' | 'createdAt' | 'lastPlayed'>) => Promise<void>;
  fetchSavedPuzzles: (userId: string) => Promise<SavedPuzzle[]>;
  
  saveUserReport: (userId: string, puzzleId: string, reportType: UserReport['reportType'], reportData: UserReport['reportData']) => Promise<void>;
  fetchUserReports: (userId: string, reportType?: UserReport['reportType']) => Promise<UserReport[]>;
  
  markPuzzleAsSolved: (userId: string, puzzleId: string, solveData: Omit<CompletedPuzzle, 'userId' | 'puzzleId' | 'completedAt'>) => Promise<void>;
  fetchCompletedPuzzles: (userId: string, difficulty?: string) => Promise<CompletedPuzzle[]>;
  
  saveLeaderboardScore: (userId: string, username: string, scoreData: Omit<LeaderboardScore, 'userId' | 'username' | 'timestamp'>) => Promise<void>;
  fetchLeaderboard: (difficulty?: string, technique?: string, limit?: number) => Promise<LeaderboardScore[]>;
  
  // Firestore Operations
  syncLiveGame: (userId: string, gameState: LiveGame['gameState']) => Promise<void>;
  fetchLiveGame: (userId: string) => Promise<LiveGame | null>;
  endLiveGame: (userId: string, gameId: string) => Promise<void>;
  
  saveRealTimeLeaderboardScore: (userId: string, username: string, scoreData: Omit<RealTimeLeaderboard, 'userId' | 'username' | 'timestamp' | 'rank'>) => Promise<void>;
  fetchRealTimeLeaderboard: (difficulty?: string, technique?: string, limit?: number) => Promise<RealTimeLeaderboard[]>;
  
  startGameSession: (userId: string) => Promise<string>;
  updateGameSession: (sessionId: string, updateData: Partial<GameSession>) => Promise<void>;
  endGameSession: (sessionId: string) => Promise<void>;
  fetchActiveGameSession: (userId: string) => Promise<GameSession | null>;
  
  // Real-time Listeners
  subscribeToLiveGame: (userId: string, callback: (game: LiveGame | null) => void) => Promise<() => void>;
  subscribeToLeaderboard: (difficulty: string, technique: string, callback: (scores: RealTimeLeaderboard[]) => void) => Promise<() => void>;
  
  // Utility Operations
  ping: () => Promise<boolean>;
  getConnectionStatus: () => Promise<boolean>;
}

export function useDatabase(): DatabaseState & DatabaseOperations {
  const [state, setState] = useState<DatabaseState>({
    isConnected: false,
    firestoreConnected: false,
    isLoading: true,
    error: null,
  });

  // Initialize database connections
  useEffect(() => {
    async function initializeDatabases() {
      if (!isDatabaseEnabled()) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Initialize Firestore
        if (isFirestoreEnabled()) {
          await firestoreClient.connect();
          const firestoreStatus = await firestoreClient.getConnectionStatus();
          setState(prev => ({ ...prev, firestoreConnected: firestoreStatus }));
        }

        setState(prev => ({
          ...prev,
          isConnected: isFirestoreEnabled() ? state.firestoreConnected : true,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Database initialization error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Database initialization failed',
          isLoading: false,
        }));
      }
    }

    initializeDatabases();

    // Cleanup on unmount
    return () => {
      firestoreClient.disconnect();
    };
  }, []);

  // MongoDB Operations via API
  const saveUserStats = useCallback(async (userId: string, statsData: Partial<UserStats>): Promise<void> => {
    if (!databaseConfig.features.enableUserStats) return;
    try {
      const response = await fetch('/api/user/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, statsData }),
      });
      if (!response.ok) throw new Error('Failed to save user stats');
    } catch (error) {
      console.error('Error saving user stats:', error);
      throw error;
    }
  }, []);

  const fetchUserStats = useCallback(async (userId: string): Promise<UserStats | null> => {
    if (!databaseConfig.features.enableUserStats) return null;
    try {
      const response = await fetch(`/api/user/stats/${userId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }, []);

  const updateUserStats = useCallback(async (userId: string, statsData: Partial<UserStats>): Promise<void> => {
    if (!databaseConfig.features.enableUserStats) return;
    try {
      const response = await fetch(`/api/user/stats/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statsData),
      });
      if (!response.ok) throw new Error('Failed to update user stats');
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }, []);

  const savePuzzle = useCallback(async (userId: string, puzzleData: Omit<SavedPuzzle, 'userId' | 'createdAt' | 'lastPlayed'>): Promise<void> => {
    if (!databaseConfig.features.enableSavedPuzzles) return;
    try {
      const response = await fetch('/api/user/puzzles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, puzzleData }),
      });
      if (!response.ok) throw new Error('Failed to save puzzle');
    } catch (error) {
      console.error('Error saving puzzle:', error);
      throw error;
    }
  }, []);

  const fetchSavedPuzzles = useCallback(async (userId: string): Promise<SavedPuzzle[]> => {
    if (!databaseConfig.features.enableSavedPuzzles) return [];
    try {
      const response = await fetch(`/api/user/puzzles/${userId}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching saved puzzles:', error);
      throw error;
    }
  }, []);

  const saveUserReport = useCallback(async (userId: string, puzzleId: string, reportType: UserReport['reportType'], reportData: UserReport['reportData']): Promise<void> => {
    if (!databaseConfig.features.enableUserReports) return;
    try {
      const response = await fetch('/api/user/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, puzzleId, reportType, reportData }),
      });
      if (!response.ok) throw new Error('Failed to save user report');
    } catch (error) {
      console.error('Error saving user report:', error);
      throw error;
    }
  }, []);

  const fetchUserReports = useCallback(async (userId: string, reportType?: UserReport['reportType']): Promise<UserReport[]> => {
    if (!databaseConfig.features.enableUserReports) return [];
    try {
      const url = reportType 
        ? `/api/user/reports/${userId}?type=${reportType}`
        : `/api/user/reports/${userId}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching user reports:', error);
      throw error;
    }
  }, []);

  const markPuzzleAsSolved = useCallback(async (userId: string, puzzleId: string, solveData: Omit<CompletedPuzzle, 'userId' | 'puzzleId' | 'completedAt'>): Promise<void> => {
    if (!databaseConfig.features.enableCompletedPuzzles) return;
    try {
      const response = await fetch('/api/user/completed-puzzles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, puzzleId, solveData }),
      });
      if (!response.ok) throw new Error('Failed to mark puzzle as solved');
    } catch (error) {
      console.error('Error marking puzzle as solved:', error);
      throw error;
    }
  }, []);

  const fetchCompletedPuzzles = useCallback(async (userId: string, difficulty?: string): Promise<CompletedPuzzle[]> => {
    if (!databaseConfig.features.enableCompletedPuzzles) return [];
    try {
      const url = difficulty 
        ? `/api/user/completed-puzzles/${userId}?difficulty=${difficulty}`
        : `/api/user/completed-puzzles/${userId}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching completed puzzles:', error);
      throw error;
    }
  }, []);

  const saveLeaderboardScore = useCallback(async (userId: string, username: string, scoreData: Omit<LeaderboardScore, 'userId' | 'username' | 'timestamp'>): Promise<void> => {
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, scoreData }),
      });
      if (!response.ok) throw new Error('Failed to save leaderboard score');
    } catch (error) {
      console.error('Error saving leaderboard score:', error);
      throw error;
    }
  }, []);

  const fetchLeaderboard = useCallback(async (difficulty?: string, technique?: string, limit?: number): Promise<LeaderboardScore[]> => {
    try {
      const params = new URLSearchParams();
      if (difficulty) params.append('difficulty', difficulty);
      if (technique) params.append('technique', technique);
      if (limit) params.append('limit', limit.toString());
      
      const response = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }, []);

  // Firestore Operations
  const syncLiveGame = useCallback(async (userId: string, gameState: LiveGame['gameState']): Promise<void> => {
    if (!databaseConfig.features.enableLiveGames) return;
    try {
      await firestoreClient.syncLiveGame(userId, gameState);
    } catch (error) {
      console.error('Error syncing live game:', error);
      throw error;
    }
  }, []);

  const fetchLiveGame = useCallback(async (userId: string): Promise<LiveGame | null> => {
    if (!databaseConfig.features.enableLiveGames) return null;
    try {
      return await firestoreClient.fetchLiveGame(userId);
    } catch (error) {
      console.error('Error fetching live game:', error);
      throw error;
    }
  }, []);

  const endLiveGame = useCallback(async (userId: string, gameId: string): Promise<void> => {
    if (!databaseConfig.features.enableLiveGames) return;
    try {
      await firestoreClient.endLiveGame(userId, gameId);
    } catch (error) {
      console.error('Error ending live game:', error);
      throw error;
    }
  }, []);

  const saveRealTimeLeaderboardScore = useCallback(async (userId: string, username: string, scoreData: Omit<RealTimeLeaderboard, 'userId' | 'username' | 'timestamp' | 'rank'>): Promise<void> => {
    if (!databaseConfig.features.enableRealTimeLeaderboard) return;
    try {
      await firestoreClient.saveLeaderboardScore(userId, username, scoreData);
    } catch (error) {
      console.error('Error saving real-time leaderboard score:', error);
      throw error;
    }
  }, []);

  const fetchRealTimeLeaderboard = useCallback(async (difficulty?: string, technique?: string, limit?: number): Promise<RealTimeLeaderboard[]> => {
    if (!databaseConfig.features.enableRealTimeLeaderboard) return [];
    try {
      return await firestoreClient.fetchLeaderboard(difficulty, technique, limit);
    } catch (error) {
      console.error('Error fetching real-time leaderboard:', error);
      throw error;
    }
  }, []);

  const startGameSession = useCallback(async (userId: string): Promise<string> => {
    if (!databaseConfig.features.enableGameSessions) return '';
    try {
      return await firestoreClient.startGameSession(userId);
    } catch (error) {
      console.error('Error starting game session:', error);
      throw error;
    }
  }, []);

  const updateGameSession = useCallback(async (sessionId: string, updateData: Partial<GameSession>): Promise<void> => {
    if (!databaseConfig.features.enableGameSessions) return;
    try {
      await firestoreClient.updateGameSession(sessionId, updateData);
    } catch (error) {
      console.error('Error updating game session:', error);
      throw error;
    }
  }, []);

  const endGameSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!databaseConfig.features.enableGameSessions) return;
    try {
      await firestoreClient.endGameSession(sessionId);
    } catch (error) {
      console.error('Error ending game session:', error);
      throw error;
    }
  }, []);

  const fetchActiveGameSession = useCallback(async (userId: string): Promise<GameSession | null> => {
    if (!databaseConfig.features.enableGameSessions) return null;
    try {
      return await firestoreClient.fetchActiveGameSession(userId);
    } catch (error) {
      console.error('Error fetching active game session:', error);
      throw error;
    }
  }, []);

  // Real-time Listeners
  const subscribeToLiveGame = useCallback(async (userId: string, callback: (game: LiveGame | null) => void): Promise<() => void> => {
    if (!databaseConfig.features.enableLiveGames) return () => {};
    try {
      return await firestoreClient.subscribeToLiveGame(userId, callback);
    } catch (error) {
      console.error('Error subscribing to live game:', error);
      throw error;
    }
  }, []);

  const subscribeToLeaderboard = useCallback(async (difficulty: string, technique: string, callback: (scores: RealTimeLeaderboard[]) => void): Promise<() => void> => {
    if (!databaseConfig.features.enableRealTimeLeaderboard) return () => {};
    try {
      return await firestoreClient.subscribeToLeaderboard(difficulty, technique, callback);
    } catch (error) {
      console.error('Error subscribing to leaderboard:', error);
      throw error;
    }
  }, []);

  // Utility Operations
  const ping = useCallback(async (): Promise<boolean> => {
    try {
      const firestorePing = isFirestoreEnabled() ? await firestoreClient.ping() : true;
      return firestorePing;
    } catch (error) {
      console.error('Database ping failed:', error);
      return false;
    }
  }, []);

  const getConnectionStatus = useCallback(async (): Promise<boolean> => {
    return state.isConnected;
  }, [state.isConnected]);

  return {
    ...state,
    saveUserStats,
    fetchUserStats,
    updateUserStats,
    savePuzzle,
    fetchSavedPuzzles,
    saveUserReport,
    fetchUserReports,
    markPuzzleAsSolved,
    fetchCompletedPuzzles,
    saveLeaderboardScore,
    fetchLeaderboard,
    syncLiveGame,
    fetchLiveGame,
    endLiveGame,
    saveRealTimeLeaderboardScore,
    fetchRealTimeLeaderboard,
    startGameSession,
    updateGameSession,
    endGameSession,
    fetchActiveGameSession,
    subscribeToLiveGame,
    subscribeToLeaderboard,
    ping,
    getConnectionStatus,
  };
} 