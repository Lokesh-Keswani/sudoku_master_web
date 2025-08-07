import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { databaseConfig, logDatabaseConfig } from '../config/database';

const DatabaseStatus: React.FC = () => {
  const {
    isConnected,
    firestoreConnected,
    isLoading,
    error,
    ping,
    getConnectionStatus,
    saveUserStats,
    fetchUserStats,
    syncLiveGame,
    fetchLiveGame
  } = useDatabase();

  const [testResults, setTestResults] = useState<{
    ping: boolean | null;
    operations: { [key: string]: boolean | null };
  }>({
    ping: null,
    operations: {}
  });

  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResults({ ping: null, operations: {} });

    try {
      // Test ping
      const pingResult = await ping();
      setTestResults(prev => ({ ...prev, ping: pingResult }));

      // Test basic operations
      const testUserId = 'test-user-' + Date.now();
      
      // Test API operations
      if (databaseConfig.features.enableUserStats) {
        try {
          await saveUserStats(testUserId, {
            totalPuzzlesSolved: 1,
            averageSolveTime: 300,
            difficultyBreakdown: { easy: 1, medium: 0, hard: 0, expert: 0, master: 0 }
          });
          setTestResults(prev => ({
            ...prev,
            operations: { ...prev.operations, 'saveUserStats': true }
          }));
        } catch (error) {
          setTestResults(prev => ({
            ...prev,
            operations: { ...prev.operations, 'saveUserStats': false }
          }));
        }

        try {
          const stats = await fetchUserStats(testUserId);
          setTestResults(prev => ({
            ...prev,
            operations: { ...prev.operations, 'fetchUserStats': !!stats }
          }));
        } catch (error) {
          setTestResults(prev => ({
            ...prev,
            operations: { ...prev.operations, 'fetchUserStats': false }
          }));
        }
      }

      // Test Firestore operations
      if (databaseConfig.features.enableLiveGames) {
        try {
          await syncLiveGame(testUserId, {
            grid: [
              [1,2,3,4,5,6,7,8,9],
              [4,5,6,7,8,9,1,2,3],
              [7,8,9,1,2,3,4,5,6],
              [2,3,1,5,6,4,8,9,7],
              [5,6,4,8,9,7,2,3,1],
              [8,9,7,2,3,1,5,6,4],
              [3,1,2,6,4,5,9,7,8],
              [6,4,5,9,7,8,3,1,2],
              [9,7,8,3,1,2,6,4,5]
            ],
            selectedCell: { row: 0, col: 0 },
            difficulty: 'easy',
            timer: 0,
            isPaused: false,
            hintsRemaining: 3
          });
          setTestResults(prev => ({
            ...prev,
            operations: { ...prev.operations, 'syncLiveGame': true }
          }));
        } catch (error) {
          setTestResults(prev => ({
            ...prev,
            operations: { ...prev.operations, 'syncLiveGame': false }
          }));
        }

        try {
          const liveGame = await fetchLiveGame(testUserId);
          setTestResults(prev => ({
            ...prev,
            operations: { ...prev.operations, 'fetchLiveGame': true }
          }));
        } catch (error) {
          setTestResults(prev => ({
            ...prev,
            operations: { ...prev.operations, 'fetchLiveGame': false }
          }));
        }
      }

    } catch (error) {
      console.error('Database test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleLogConfig = () => {
    logDatabaseConfig();
  };

  const getStatusIcon = (connected: boolean) => {
    if (connected) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (connected: boolean) => {
    return connected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = (connected: boolean) => {
    return connected ? 'Connected' : 'Disconnected';
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
      >
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-gray-600 dark:text-gray-300">Connecting to databases...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Database className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Database Status
        </h3>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300">Error: {error}</span>
          </div>
        </motion.div>
      )}

      {/* Connection Status */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Overall Status</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(isConnected)}
              <span className={`text-sm font-medium ${getStatusColor(isConnected)}`}>
                {getStatusText(isConnected)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">API Server</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(isConnected)}
              <span className={`text-sm font-medium ${getStatusColor(isConnected)}`}>
                {getStatusText(isConnected)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Firestore</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(firestoreConnected)}
              <span className={`text-sm font-medium ${getStatusColor(firestoreConnected)}`}>
                {getStatusText(firestoreConnected)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Feature Toggles
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(databaseConfig.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center space-x-2">
              {enabled ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {feature.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      {testResults.ping !== null && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Test Results
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ping Test</span>
              {testResults.ping ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            {Object.entries(testResults.operations).map(([operation, success]) => (
              <div key={operation} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {operation.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTestConnection}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isTesting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogConfig}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Log Config</span>
        </motion.button>
      </div>

      {/* Environment Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Environment Info
        </h4>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>API Server Enabled: {databaseConfig.mongo.enabled ? 'Yes' : 'No'}</div>
          <div>Firestore Enabled: {databaseConfig.firestore.enabled ? 'Yes' : 'No'}</div>
          <div>Database URI Set: {databaseConfig.mongo.uri !== 'mongodb://localhost:27017' ? 'Yes' : 'No'}</div>
          <div>Firebase Project Set: {databaseConfig.firestore.projectId ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default DatabaseStatus; 