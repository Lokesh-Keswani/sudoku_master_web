// Database Configuration Module
// Centralizes all database-related configuration and environment variables

export interface DatabaseConfig {
  // MongoDB Configuration
  mongo: {
    enabled: boolean;
    uri: string;
    database: string;
    options: {
      maxPoolSize: number;
      serverSelectionTimeoutMS: number;
      socketTimeoutMS: number;
      connectTimeoutMS: number;
    };
  };
  
  // Firestore Configuration
  firestore: {
    enabled: boolean;
    projectId: string;
    configJson: string;
  };
  
  // Feature Toggles
  features: {
    enableUserStats: boolean;
    enableSavedPuzzles: boolean;
    enableUserReports: boolean;
    enableCompletedPuzzles: boolean;
    enableLiveGames: boolean;
    enableRealTimeLeaderboard: boolean;
    enableGameSessions: boolean;
  };
}

// Default configuration
const defaultConfig: DatabaseConfig = {
  mongo: {
    enabled: false,
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    database: 'sudoku_master',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    },
  },
  
  firestore: {
    enabled: false,
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    configJson: process.env.FIREBASE_CONFIG_JSON || '',
  },
  
  features: {
    enableUserStats: true,
    enableSavedPuzzles: true,
    enableUserReports: true,
    enableCompletedPuzzles: true,
    enableLiveGames: true,
    enableRealTimeLeaderboard: true,
    enableGameSessions: true,
  },
};

// Load configuration from environment variables
export function loadDatabaseConfig(): DatabaseConfig {
  const config = { ...defaultConfig };
  
  // MongoDB Configuration
  config.mongo.enabled = process.env.ENABLE_MONGO === 'true';
  if (process.env.MONGO_URI) {
    config.mongo.uri = process.env.MONGO_URI;
  }
  if (process.env.MONGO_DATABASE) {
    config.mongo.database = process.env.MONGO_DATABASE;
  }
  if (process.env.MONGO_MAX_POOL_SIZE) {
    config.mongo.options.maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE);
  }
  if (process.env.MONGO_SERVER_SELECTION_TIMEOUT) {
    config.mongo.options.serverSelectionTimeoutMS = parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT);
  }
  if (process.env.MONGO_SOCKET_TIMEOUT) {
    config.mongo.options.socketTimeoutMS = parseInt(process.env.MONGO_SOCKET_TIMEOUT);
  }
  if (process.env.MONGO_CONNECT_TIMEOUT) {
    config.mongo.options.connectTimeoutMS = parseInt(process.env.MONGO_CONNECT_TIMEOUT);
  }
  
  // Firestore Configuration
  config.firestore.enabled = process.env.ENABLE_FIRESTORE === 'true';
  if (process.env.FIREBASE_PROJECT_ID) {
    config.firestore.projectId = process.env.FIREBASE_PROJECT_ID;
  }
  if (process.env.FIREBASE_CONFIG_JSON) {
    config.firestore.configJson = process.env.FIREBASE_CONFIG_JSON;
  }
  
  // Feature Toggles
  config.features.enableUserStats = process.env.ENABLE_USER_STATS !== 'false';
  config.features.enableSavedPuzzles = process.env.ENABLE_SAVED_PUZZLES !== 'false';
  config.features.enableUserReports = process.env.ENABLE_USER_REPORTS !== 'false';
  config.features.enableCompletedPuzzles = process.env.ENABLE_COMPLETED_PUZZLES !== 'false';
  config.features.enableLiveGames = process.env.ENABLE_LIVE_GAMES !== 'false';
  config.features.enableRealTimeLeaderboard = process.env.ENABLE_REALTIME_LEADERBOARD !== 'false';
  config.features.enableGameSessions = process.env.ENABLE_GAME_SESSIONS !== 'false';
  
  return config;
}

// Export the loaded configuration
export const databaseConfig = loadDatabaseConfig();

// Validation functions
export function validateMongoConfig(config: DatabaseConfig): string[] {
  const errors: string[] = [];
  
  if (config.mongo.enabled) {
    if (!config.mongo.uri) {
      errors.push('MONGO_URI is required when MongoDB is enabled');
    }
    if (!config.mongo.uri.includes('mongodb://') && !config.mongo.uri.includes('mongodb+srv://')) {
      errors.push('MONGO_URI must be a valid MongoDB connection string');
    }
  }
  
  return errors;
}

export function validateFirestoreConfig(config: DatabaseConfig): string[] {
  const errors: string[] = [];
  
  if (config.firestore.enabled) {
    if (!config.firestore.configJson) {
      errors.push('FIREBASE_CONFIG_JSON is required when Firestore is enabled');
    }
    if (!config.firestore.projectId) {
      errors.push('FIREBASE_PROJECT_ID is required when Firestore is enabled');
    }
    
    // Validate Firebase config JSON
    if (config.firestore.configJson) {
      try {
        const decodedConfig = JSON.parse(Buffer.from(config.firestore.configJson, 'base64').toString());
        if (!decodedConfig.project_id) {
          errors.push('Firebase config JSON must contain project_id');
        }
        if (!decodedConfig.private_key) {
          errors.push('Firebase config JSON must contain private_key');
        }
        if (!decodedConfig.client_email) {
          errors.push('Firebase config JSON must contain client_email');
        }
      } catch (error) {
        errors.push('FIREBASE_CONFIG_JSON must be a valid base64-encoded JSON string');
      }
    }
  }
  
  return errors;
}

export function validateDatabaseConfig(): { isValid: boolean; errors: string[] } {
  const mongoErrors = validateMongoConfig(databaseConfig);
  const firestoreErrors = validateFirestoreConfig(databaseConfig);
  const allErrors = [...mongoErrors, ...firestoreErrors];
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

// Utility functions
export function isDatabaseEnabled(): boolean {
  return databaseConfig.mongo.enabled || databaseConfig.firestore.enabled;
}

export function isMongoEnabled(): boolean {
  return databaseConfig.mongo.enabled;
}

export function isFirestoreEnabled(): boolean {
  return databaseConfig.firestore.enabled;
}

export function getFeatureStatus(feature: keyof DatabaseConfig['features']): boolean {
  return databaseConfig.features[feature];
}

// Log configuration status
export function logDatabaseConfig(): void {
  console.log('=== Database Configuration ===');
  console.log(`MongoDB Enabled: ${databaseConfig.mongo.enabled}`);
  console.log(`Firestore Enabled: ${databaseConfig.firestore.enabled}`);
  console.log(`Database Features:`);
  Object.entries(databaseConfig.features).forEach(([feature, enabled]) => {
    console.log(`  - ${feature}: ${enabled}`);
  });
  
  const validation = validateDatabaseConfig();
  if (!validation.isValid) {
    console.error('Database Configuration Errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  } else {
    console.log('Database configuration is valid');
  }
  console.log('==============================');
} 