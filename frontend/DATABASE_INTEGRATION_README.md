# Database Integration Guide

## Overview

This document provides comprehensive guidance for integrating and using the dual-database system in the Sudoku Master Web App. The system uses **MongoDB** for persistent data storage and **Firestore** for real-time features, with feature toggles for safe deployment.

## Architecture

### Database Strategy
- **MongoDB**: Primary database for user data, statistics, saved puzzles, reports, and completed puzzles
- **Firestore**: Secondary database for real-time features like live games, leaderboards, and game sessions
- **Feature Toggles**: Environment-based flags to enable/disable database features safely

### Directory Structure
```
frontend/src/
├── database/
│   ├── mongoClient.ts          # MongoDB client and operations
│   └── firestoreClient.ts      # Firestore client and operations
├── config/
│   └── database.ts             # Database configuration and validation
├── hooks/
│   └── useDatabase.ts          # React hook for database operations
└── .env_sample.md              # Environment variables template
```

## Setup Instructions

### 1. Environment Configuration

Copy the environment sample file and configure your database settings:

```bash
cp .env_sample.md .env.local
```

Edit `.env.local` with your actual database credentials:

```env
# Enable databases
ENABLE_MONGO=true
ENABLE_FIRESTORE=true

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sudoku_master

# Firestore Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CONFIG_JSON=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJva...
```

### 2. MongoDB Setup

#### Atlas Setup (Recommended)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address
5. Get your connection string

#### Local Setup
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
sudo apt-get install mongodb   # Ubuntu

# Start MongoDB service
brew services start mongodb-community  # macOS
sudo systemctl start mongodb          # Ubuntu
```

### 3. Firestore Setup

#### Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Generate new private key (download JSON)
6. Encode to base64: `cat serviceAccountKey.json | base64`
7. Copy the base64 string to `FIREBASE_CONFIG_JSON`

#### Firestore Rules
Configure Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Live games - users can only access their own games
    match /live_games/{gameId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Leaderboard - public read, authenticated write
    match /realtime_leaderboard/{scoreId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Game sessions - users can only access their own sessions
    match /game_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Usage Guide

### 1. Basic Database Hook Usage

```typescript
import { useDatabase } from '../hooks/useDatabase';

function MyComponent() {
  const {
    isConnected,
    isLoading,
    error,
    saveUserStats,
    fetchUserStats,
    syncLiveGame,
    subscribeToLeaderboard
  } = useDatabase();

  // Check connection status
  if (isLoading) return <div>Connecting to databases...</div>;
  if (error) return <div>Database error: {error}</div>;
  if (!isConnected) return <div>Database not connected</div>;

  // Use database operations
  const handleSaveStats = async () => {
    try {
      await saveUserStats('user123', {
        totalPuzzlesSolved: 50,
        averageSolveTime: 300,
        difficultyBreakdown: { easy: 20, medium: 15, hard: 15 }
      });
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSaveStats}>Save Stats</button>
    </div>
  );
}
```

### 2. MongoDB Operations

#### User Statistics
```typescript
// Save user statistics
await saveUserStats('user123', {
  totalPuzzlesSolved: 100,
  averageSolveTime: 250,
  fastestSolveTime: 45,
  difficultyBreakdown: {
    easy: 30,
    medium: 40,
    hard: 20,
    expert: 8,
    master: 2
  }
});

// Fetch user statistics
const stats = await fetchUserStats('user123');
if (stats) {
  console.log(`User solved ${stats.totalPuzzlesSolved} puzzles`);
}

// Update specific stats
await updateUserStats('user123', {
  totalPuzzlesSolved: 101,
  lastUpdated: new Date()
});
```

#### Saved Puzzles
```typescript
// Save a puzzle
await savePuzzle('user123', {
  puzzleId: 'puzzle_001',
  puzzle: [[5,3,0,0,7,0,0,0,0], ...],
  solution: [[5,3,4,6,7,8,9,1,2], ...],
  difficulty: 'medium',
  isCompleted: false
});

// Fetch saved puzzles
const savedPuzzles = await fetchSavedPuzzles('user123');
savedPuzzles.forEach(puzzle => {
  console.log(`Puzzle ${puzzle.puzzleId}: ${puzzle.difficulty}`);
});
```

#### User Reports
```typescript
// Save training report
await saveUserReport('user123', 'puzzle_001', 'training', {
  accuracy: 85,
  timeSpent: 300,
  mistakes: 2,
  technique: 'Hidden Single',
  difficulty: 'medium'
});

// Fetch reports by type
const trainingReports = await fetchUserReports('user123', 'training');
const allReports = await fetchUserReports('user123');
```

#### Completed Puzzles
```typescript
// Mark puzzle as solved
await markPuzzleAsSolved('user123', 'puzzle_001', {
  puzzle: [[5,3,4,6,7,8,9,1,2], ...],
  solution: [[5,3,4,6,7,8,9,1,2], ...],
  difficulty: 'medium',
  solveTime: 245,
  mistakes: 1,
  hintsUsed: 0,
  technique: 'Hidden Single'
});

// Fetch completed puzzles
const completedPuzzles = await fetchCompletedPuzzles('user123', 'medium');
```

### 3. Firestore Operations

#### Live Games
```typescript
// Sync live game state
await syncLiveGame('user123', {
  grid: [[5,3,0,0,7,0,0,0,0], ...],
  selectedCell: { row: 0, col: 2 },
  difficulty: 'medium',
  timer: 245,
  isPaused: false,
  hintsRemaining: 3
});

// Fetch live game
const liveGame = await fetchLiveGame('user123');
if (liveGame) {
  console.log(`Game ${liveGame.gameId} is active`);
}

// End live game
await endLiveGame('user123', 'game_001');
```

#### Real-time Leaderboard
```typescript
// Save leaderboard score
await saveRealTimeLeaderboardScore('user123', 'JohnDoe', {
  score: 950,
  difficulty: 'medium',
  technique: 'Hidden Single',
  solveTime: 180
});

// Fetch leaderboard
const leaderboard = await fetchRealTimeLeaderboard('medium', 'Hidden Single', 10);
leaderboard.forEach((score, index) => {
  console.log(`${index + 1}. ${score.username}: ${score.score}`);
});
```

#### Game Sessions
```typescript
// Start game session
const sessionId = await startGameSession('user123');

// Update session
await updateGameSession(sessionId, {
  totalPuzzles: 5,
  completedPuzzles: 3,
  averageTime: 240
});

// End session
await endGameSession(sessionId);

// Fetch active session
const activeSession = await fetchActiveGameSession('user123');
```

### 4. Real-time Listeners

#### Live Game Subscription
```typescript
useEffect(() => {
  let unsubscribe: (() => void) | undefined;

  const setupLiveGameListener = async () => {
    unsubscribe = await subscribeToLiveGame('user123', (game) => {
      if (game) {
        console.log('Live game updated:', game.gameState);
        // Update your component state
        setGameState(game.gameState);
      } else {
        console.log('No active live game');
      }
    });
  };

  setupLiveGameListener();

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);
```

#### Leaderboard Subscription
```typescript
useEffect(() => {
  let unsubscribe: (() => void) | undefined;

  const setupLeaderboardListener = async () => {
    unsubscribe = await subscribeToLeaderboard('medium', 'Hidden Single', (scores) => {
      console.log('Leaderboard updated:', scores);
      setLeaderboard(scores);
    });
  };

  setupLeaderboardListener();

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);
```

## Feature Toggles

### Environment Variables
Control database features with environment variables:

```env
# Enable/Disable entire databases
ENABLE_MONGO=true
ENABLE_FIRESTORE=true

# Enable/Disable specific features
ENABLE_USER_STATS=true
ENABLE_SAVED_PUZZLES=true
ENABLE_USER_REPORTS=true
ENABLE_COMPLETED_PUZZLES=true
ENABLE_LIVE_GAMES=true
ENABLE_REALTIME_LEADERBOARD=true
ENABLE_GAME_SESSIONS=true
```

### Conditional Usage
```typescript
import { databaseConfig } from '../config/database';

// Check if feature is enabled
if (databaseConfig.features.enableUserStats) {
  await saveUserStats(userId, statsData);
}

// Or use the hook which handles this automatically
const { saveUserStats } = useDatabase();
// The hook will automatically check feature toggles
```

## Error Handling

### Database Connection Errors
```typescript
const { isConnected, error, isLoading } = useDatabase();

if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={`Database error: ${error}`} />;
}

if (!isConnected) {
  return <ErrorMessage message="Database not available" />;
}
```

### Operation Error Handling
```typescript
const handleSaveData = async () => {
  try {
    await saveUserStats(userId, statsData);
    showSuccess('Data saved successfully');
  } catch (error) {
    console.error('Failed to save data:', error);
    showError('Failed to save data. Please try again.');
  }
};
```

### Graceful Degradation
```typescript
// Database operations return null/empty arrays when disabled
const stats = await fetchUserStats(userId);
if (stats) {
  // Use database data
  setUserStats(stats);
} else {
  // Fallback to local storage or default values
  setUserStats(getLocalStats());
}
```

## Performance Optimization

### Connection Pooling
MongoDB connection pooling is configured automatically:

```typescript
// In mongoClient.ts
const client = new MongoClient(mongoUri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### Batch Operations
For multiple operations, use batch processing:

```typescript
// Batch save multiple puzzles
const puzzles = [puzzle1, puzzle2, puzzle3];
for (const puzzle of puzzles) {
  await savePuzzle(userId, puzzle);
}
```

### Caching Strategy
Implement caching for frequently accessed data:

```typescript
const [cachedStats, setCachedStats] = useState(null);

const fetchStatsWithCache = async (userId) => {
  if (cachedStats) return cachedStats;
  
  const stats = await fetchUserStats(userId);
  setCachedStats(stats);
  return stats;
};
```

## Monitoring and Debugging

### Connection Status
```typescript
const { ping, getConnectionStatus } = useDatabase();

// Check if databases are responding
const isHealthy = await ping();
const isConnected = await getConnectionStatus();
```

### Debug Logging
Enable debug logging in development:

```env
DB_DEBUG_LOGGING=true
```

### Database Health Check
```typescript
// Add to your app initialization
import { logDatabaseConfig } from '../config/database';

// Log configuration status
logDatabaseConfig();

// Test connections
const { ping } = useDatabase();
const isHealthy = await ping();
console.log('Database health:', isHealthy);
```

## Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use different credentials for development, staging, and production
- Rotate database passwords regularly

### Firestore Security Rules
- Implement proper authentication checks
- Use user-based access control
- Validate data on both client and server

### MongoDB Security
- Use connection strings with authentication
- Enable network access controls
- Implement proper user roles and permissions

## Troubleshooting

### Common Issues

#### Connection Errors
```bash
# Check MongoDB connection
mongosh "mongodb+srv://cluster.mongodb.net/sudoku_master"

# Check Firestore connection
# Verify service account key is base64 encoded
echo $FIREBASE_CONFIG_JSON | base64 -d | jq .
```

#### Feature Not Working
1. Check environment variables are set correctly
2. Verify feature toggles are enabled
3. Check database connection status
4. Review error logs in browser console

#### Performance Issues
1. Check connection pool settings
2. Monitor database query performance
3. Implement proper indexing
4. Use batch operations for multiple records

### Debug Commands
```typescript
// Test database connections
const { ping, getConnectionStatus } = useDatabase();
console.log('Ping result:', await ping());
console.log('Connection status:', await getConnectionStatus());

// Log configuration
import { logDatabaseConfig } from '../config/database';
logDatabaseConfig();
```

## Migration and Updates

### Adding New Collections
1. Update types in `mongoClient.ts`
2. Add new functions to the client
3. Update the `useDatabase` hook
4. Add feature toggle if needed
5. Update documentation

### Schema Changes
1. Create migration scripts
2. Update TypeScript interfaces
3. Handle backward compatibility
4. Test thoroughly before deployment

### Database Upgrades
1. Backup existing data
2. Test upgrade process in staging
3. Plan maintenance window
4. Execute upgrade with rollback plan

## Best Practices

### Code Organization
- Keep database logic in dedicated modules
- Use TypeScript interfaces for type safety
- Implement proper error handling
- Use feature toggles for safe deployment

### Performance
- Use connection pooling
- Implement caching strategies
- Monitor query performance
- Use batch operations when possible

### Security
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Regular security audits

### Testing
- Unit test database functions
- Integration test with real databases
- Test error scenarios
- Performance testing

## Support and Maintenance

### Regular Tasks
- Monitor database performance
- Review and update security rules
- Backup data regularly
- Update dependencies

### Emergency Procedures
- Database connection issues
- Data corruption
- Security breaches
- Performance degradation

For additional support, refer to:
- MongoDB Documentation: https://docs.mongodb.com/
- Firebase Documentation: https://firebase.google.com/docs
- Project Issues: [GitHub Issues Link] 