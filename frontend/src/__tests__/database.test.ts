import { mongoClient } from '../database/mongoClient';
import { firestoreClient } from '../database/firestoreClient';
import { databaseConfig, validateDatabaseConfig } from '../config/database';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('Database Configuration', () => {
  test('should load default configuration when no env vars are set', () => {
    const config = databaseConfig;
    
    expect(config.mongo.enabled).toBe(false);
    expect(config.firestore.enabled).toBe(false);
    expect(config.mongo.uri).toBe('mongodb://localhost:27017');
    expect(config.mongo.database).toBe('sudoku_master');
  });

  test('should enable MongoDB when ENABLE_MONGO is true', () => {
    process.env.ENABLE_MONGO = 'true';
    process.env.MONGO_URI = 'mongodb+srv://test:pass@cluster.mongodb.net/test';
    
    const config = databaseConfig;
    expect(config.mongo.enabled).toBe(true);
    expect(config.mongo.uri).toBe('mongodb+srv://test:pass@cluster.mongodb.net/test');
  });

  test('should enable Firestore when ENABLE_FIRESTORE is true', () => {
    process.env.ENABLE_FIRESTORE = 'true';
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_CONFIG_JSON = 'eyJ0ZXN0IjoidGVzdCJ9';
    
    const config = databaseConfig;
    expect(config.firestore.enabled).toBe(true);
    expect(config.firestore.projectId).toBe('test-project');
  });

  test('should validate MongoDB configuration correctly', () => {
    const config = databaseConfig;
    const errors = validateDatabaseConfig();
    
    // Should be valid when databases are disabled
    expect(errors.isValid).toBe(true);
    expect(errors.errors).toHaveLength(0);
  });

  test('should detect invalid MongoDB URI', () => {
    process.env.ENABLE_MONGO = 'true';
    process.env.MONGO_URI = 'invalid-uri';
    
    const config = databaseConfig;
    const errors = validateDatabaseConfig();
    
    expect(errors.isValid).toBe(false);
    expect(errors.errors).toContain('MONGO_URI must be a valid MongoDB connection string');
  });

  test('should detect missing Firebase config', () => {
    process.env.ENABLE_FIRESTORE = 'true';
    // Missing FIREBASE_CONFIG_JSON
    
    const config = databaseConfig;
    const errors = validateDatabaseConfig();
    
    expect(errors.isValid).toBe(false);
    expect(errors.errors).toContain('FIREBASE_CONFIG_JSON is required when Firestore is enabled');
  });
});

describe('MongoDB Client', () => {
  beforeEach(() => {
    // Reset client state
    mongoClient['client'] = null;
    mongoClient['db'] = null;
    mongoClient['isConnected'] = false;
  });

  test('should not connect when MongoDB is disabled', async () => {
    process.env.ENABLE_MONGO = 'false';
    
    await mongoClient.connect();
    const status = await mongoClient.getConnectionStatus();
    
    expect(status).toBe(false);
  });

  test('should handle connection errors gracefully', async () => {
    process.env.ENABLE_MONGO = 'true';
    process.env.MONGO_URI = 'mongodb://invalid-host:27017';
    
    await expect(mongoClient.connect()).rejects.toThrow();
    
    const status = await mongoClient.getConnectionStatus();
    expect(status).toBe(false);
  });

  test('should return null for operations when disabled', async () => {
    process.env.ENABLE_MONGO = 'false';
    
    const stats = await mongoClient.fetchUserStats('test-user');
    expect(stats).toBeNull();
    
    const puzzles = await mongoClient.fetchSavedPuzzles('test-user');
    expect(puzzles).toEqual([]);
  });

  test('should handle user stats operations', async () => {
    process.env.ENABLE_MONGO = 'false';
    
    // These should not throw when disabled
    await expect(mongoClient.saveUserStats('test-user', {
      totalPuzzlesSolved: 10
    })).resolves.not.toThrow();
    
    await expect(mongoClient.updateUserStats('test-user', {
      totalPuzzlesSolved: 11
    })).resolves.not.toThrow();
  });

  test('should handle puzzle operations', async () => {
    process.env.ENABLE_MONGO = 'false';
    
    const puzzleData = {
      puzzleId: 'test-puzzle',
      puzzle: [[1,2,3,4,5,6,7,8,9]],
      solution: [[1,2,3,4,5,6,7,8,9]],
      difficulty: 'easy',
      isCompleted: false
    };
    
    await expect(mongoClient.savePuzzle('test-user', puzzleData))
      .resolves.not.toThrow();
  });

  test('should handle report operations', async () => {
    process.env.ENABLE_MONGO = 'false';
    
    const reportData = {
      accuracy: 85,
      timeSpent: 300,
      mistakes: 2
    };
    
    await expect(mongoClient.saveUserReport('test-user', 'puzzle-1', 'training', reportData))
      .resolves.not.toThrow();
    
    const reports = await mongoClient.fetchUserReports('test-user');
    expect(reports).toEqual([]);
  });

  test('should handle completed puzzle operations', async () => {
    process.env.ENABLE_MONGO = 'false';
    
    const solveData = {
      puzzle: [[1,2,3,4,5,6,7,8,9]],
      solution: [[1,2,3,4,5,6,7,8,9]],
      difficulty: 'easy',
      solveTime: 300,
      mistakes: 1,
      hintsUsed: 0,
      technique: 'Hidden Single'
    };
    
    await expect(mongoClient.markPuzzleAsSolved('test-user', 'puzzle-1', solveData))
      .resolves.not.toThrow();
  });

  test('should handle leaderboard operations', async () => {
    process.env.ENABLE_MONGO = 'false';
    
    const scoreData = {
      score: 950,
      difficulty: 'medium',
      technique: 'Hidden Single',
      solveTime: 180
    };
    
    await expect(mongoClient.saveLeaderboardScore('test-user', 'TestUser', scoreData))
      .resolves.not.toThrow();
    
    const leaderboard = await mongoClient.fetchLeaderboard('medium');
    expect(leaderboard).toEqual([]);
  });
});

describe('Firestore Client', () => {
  beforeEach(() => {
    // Reset client state
    firestoreClient['app'] = null;
    firestoreClient['db'] = null;
    firestoreClient['isConnected'] = false;
  });

  test('should not connect when Firestore is disabled', async () => {
    process.env.ENABLE_FIRESTORE = 'false';
    
    await firestoreClient.connect();
    const status = await firestoreClient.getConnectionStatus();
    
    expect(status).toBe(false);
  });

  test('should handle connection errors gracefully', async () => {
    process.env.ENABLE_FIRESTORE = 'true';
    process.env.FIREBASE_CONFIG_JSON = 'invalid-base64';
    
    await expect(firestoreClient.connect()).rejects.toThrow();
    
    const status = await firestoreClient.getConnectionStatus();
    expect(status).toBe(false);
  });

  test('should return null for operations when disabled', async () => {
    process.env.ENABLE_FIRESTORE = 'false';
    
    const liveGame = await firestoreClient.fetchLiveGame('test-user');
    expect(liveGame).toBeNull();
    
    const leaderboard = await firestoreClient.fetchLeaderboard();
    expect(leaderboard).toEqual([]);
  });

  test('should handle live game operations', async () => {
    process.env.ENABLE_FIRESTORE = 'false';
    
    const gameState = {
      grid: [[1,2,3,4,5,6,7,8,9]],
      selectedCell: { row: 0, col: 0 },
      difficulty: 'easy',
      timer: 0,
      isPaused: false,
      hintsRemaining: 3
    };
    
    await expect(firestoreClient.syncLiveGame('test-user', gameState))
      .resolves.not.toThrow();
    
    await expect(firestoreClient.endLiveGame('test-user', 'game-1'))
      .resolves.not.toThrow();
  });

  test('should handle leaderboard operations', async () => {
    process.env.ENABLE_FIRESTORE = 'false';
    
    const scoreData = {
      score: 950,
      difficulty: 'medium',
      technique: 'Hidden Single',
      solveTime: 180
    };
    
    await expect(firestoreClient.saveLeaderboardScore('test-user', 'TestUser', scoreData))
      .resolves.not.toThrow();
  });

  test('should handle game session operations', async () => {
    process.env.ENABLE_FIRESTORE = 'false';
    
    const sessionId = await firestoreClient.startGameSession('test-user');
    expect(sessionId).toBe('');
    
    await expect(firestoreClient.updateGameSession('session-1', {
      totalPuzzles: 5,
      completedPuzzles: 3
    })).resolves.not.toThrow();
    
    await expect(firestoreClient.endGameSession('session-1'))
      .resolves.not.toThrow();
    
    const activeSession = await firestoreClient.fetchActiveGameSession('test-user');
    expect(activeSession).toBeNull();
  });

  test('should handle real-time listeners', async () => {
    process.env.ENABLE_FIRESTORE = 'false';
    
    const unsubscribe = await firestoreClient.subscribeToLiveGame('test-user', () => {});
    expect(typeof unsubscribe).toBe('function');
    
    const leaderboardUnsubscribe = await firestoreClient.subscribeToLeaderboard('medium', 'Hidden Single', () => {});
    expect(typeof leaderboardUnsubscribe).toBe('function');
  });
});

describe('Database Integration', () => {
  test('should handle feature toggles correctly', () => {
    // Test all feature toggles
    const features = [
      'enableUserStats',
      'enableSavedPuzzles', 
      'enableUserReports',
      'enableCompletedPuzzles',
      'enableLiveGames',
      'enableRealTimeLeaderboard',
      'enableGameSessions'
    ];
    
    features.forEach(feature => {
      expect(databaseConfig.features).toHaveProperty(feature);
      expect(typeof databaseConfig.features[feature as keyof typeof databaseConfig.features]).toBe('boolean');
    });
  });

  test('should provide proper error handling', async () => {
    // Test that operations don't throw when databases are disabled
    process.env.ENABLE_MONGO = 'false';
    process.env.ENABLE_FIRESTORE = 'false';
    
    // MongoDB operations
    await expect(mongoClient.saveUserStats('test', {})).resolves.not.toThrow();
    await expect(mongoClient.fetchUserStats('test')).resolves.toBeNull();
    await expect(mongoClient.savePuzzle('test', {} as any)).resolves.not.toThrow();
    await expect(mongoClient.fetchSavedPuzzles('test')).resolves.toEqual([]);
    
    // Firestore operations
    await expect(firestoreClient.syncLiveGame('test', {} as any)).resolves.not.toThrow();
    await expect(firestoreClient.fetchLiveGame('test')).resolves.toBeNull();
    await expect(firestoreClient.saveLeaderboardScore('test', 'user', {} as any)).resolves.not.toThrow();
    await expect(firestoreClient.fetchLeaderboard()).resolves.toEqual([]);
  });

  test('should handle connection status correctly', async () => {
    process.env.ENABLE_MONGO = 'false';
    process.env.ENABLE_FIRESTORE = 'false';
    
    const mongoStatus = await mongoClient.getConnectionStatus();
    const firestoreStatus = await firestoreClient.getConnectionStatus();
    
    expect(mongoStatus).toBe(false);
    expect(firestoreStatus).toBe(false);
  });

  test('should handle ping operations correctly', async () => {
    process.env.ENABLE_MONGO = 'false';
    process.env.ENABLE_FIRESTORE = 'false';
    
    const mongoPing = await mongoClient.ping();
    const firestorePing = await firestoreClient.ping();
    
    expect(mongoPing).toBe(true); // Returns true when disabled
    expect(firestorePing).toBe(true); // Returns true when disabled
  });
});

describe('Type Safety', () => {
  test('should have proper TypeScript types', () => {
    // Test that types are properly exported
    expect(typeof mongoClient).toBe('object');
    expect(typeof firestoreClient).toBe('object');
    expect(typeof databaseConfig).toBe('object');
    
    // Test that required methods exist
    expect(typeof mongoClient.connect).toBe('function');
    expect(typeof mongoClient.disconnect).toBe('function');
    expect(typeof mongoClient.getConnectionStatus).toBe('function');
    expect(typeof mongoClient.ping).toBe('function');
    
    expect(typeof firestoreClient.connect).toBe('function');
    expect(typeof firestoreClient.disconnect).toBe('function');
    expect(typeof firestoreClient.getConnectionStatus).toBe('function');
    expect(typeof firestoreClient.ping).toBe('function');
  });
}); 