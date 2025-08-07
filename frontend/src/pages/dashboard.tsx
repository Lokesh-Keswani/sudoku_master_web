import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Play, 
  BookOpen, 
  Brain, 
  Zap,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getGuestUser, isGuestUser } from '../utils/guestUser';

interface DashboardStats {
  totalPuzzlesCompleted: number;
  totalTimeSpent: number;
  averageTime: number;
  bestTime: number;
  currentStreak: number;
  longestStreak: number;
  hintsUsed: number;
  techniquesMastered: string[];
}

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { user: storeUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const loadUserStats = async () => {
      if (user?.uid) {
        // Check if user is a guest
        if (isGuestUser(user.uid)) {
          setIsGuest(true);
          const guestUser = getGuestUser();
          if (guestUser) {
            setStats({
              totalPuzzlesCompleted: guestUser.stats.totalPuzzlesCompleted,
              totalTimeSpent: guestUser.stats.totalTimeSpent,
              averageTime: guestUser.stats.averageTime,
              bestTime: guestUser.stats.bestTime,
              currentStreak: guestUser.stats.currentStreak,
              longestStreak: guestUser.stats.longestStreak,
              hintsUsed: guestUser.stats.hintsUsed,
              techniquesMastered: guestUser.stats.techniquesMastered,
            });
          }
          setLoading(false);
        } else {
          // Load from API for authenticated users
          try {
            const response = await fetch(`/api/user/stats/${user.uid}`);
            if (response.ok) {
              const userStats = await response.json();
              setStats({
                totalPuzzlesCompleted: userStats.totalPuzzlesCompleted || 0,
                totalTimeSpent: userStats.totalTimeSpent || 0,
                averageTime: userStats.averageTime || 0,
                bestTime: userStats.bestTime || 0,
                currentStreak: userStats.currentStreak || 0,
                longestStreak: userStats.longestStreak || 0,
                hintsUsed: userStats.hintsUsed || 0,
                techniquesMastered: userStats.techniquesMastered || [],
              });
            }
          } catch (error) {
            console.error('Error loading user stats:', error);
          } finally {
            setLoading(false);
          }
        }
      } else if (storeUser?.uid && isGuestUser(storeUser.uid)) {
        // Handle guest user from store
        setIsGuest(true);
        const guestUser = getGuestUser();
        if (guestUser) {
          setStats({
            totalPuzzlesCompleted: guestUser.stats.totalPuzzlesCompleted,
            totalTimeSpent: guestUser.stats.totalTimeSpent,
            averageTime: guestUser.stats.averageTime,
            bestTime: guestUser.stats.bestTime,
            currentStreak: guestUser.stats.currentStreak,
            longestStreak: guestUser.stats.longestStreak,
            hintsUsed: guestUser.stats.hintsUsed,
            techniquesMastered: guestUser.stats.techniquesMastered,
          });
        }
        setLoading(false);
      }
    };

    loadUserStats();
  }, [user, storeUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const navigationCards = [
    {
      title: 'Play Sudoku',
      description: 'Start a new puzzle',
      icon: Play,
      color: 'bg-blue-500',
      href: '/game',
    },
    {
      title: 'Training',
      description: 'Improve your skills',
      icon: BookOpen,
      color: 'bg-green-500',
      href: '/training',
    },
    {
      title: 'Speed Training',
      description: 'Quick pattern recognition',
      icon: Zap,
      color: 'bg-yellow-500',
      href: '/training/speed-scanning',
    },
    {
      title: 'Mental Mapping',
      description: 'Memory training',
      icon: Brain,
      color: 'bg-purple-500',
      href: '/training/mental-mapping',
    },
  ];

  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>Dashboard - Sudoku Master</title>
          <meta name="description" content="Your Sudoku Master dashboard" />
        </Head>

        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
          {/* Header */}
          <header className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b border-gray-200 dark:border-gray-700`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold">9</span>
                  </div>
                  <h1 className="text-xl font-bold">Sudoku Master</h1>
                </div>
                
                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {storeUser?.displayName || storeUser?.email}
                    {isGuest && (
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        Guest
                      </span>
                    )}
                  </span>
                </div>
                  
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {theme === 'dark' ? '🌞' : '🌙'}
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
                          <h2 className="text-3xl font-bold mb-2">
              Welcome back, {storeUser?.displayName || 'Sudoku Master'}! 🎉
              {isGuest && (
                <span className="block text-lg font-normal text-gray-600 dark:text-gray-400 mt-2">
                  Playing in Guest Mode
                </span>
              )}
            </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Ready to solve some puzzles? Let&apos;s continue your journey to becoming a Sudoku expert.
              </p>
            </motion.div>

            {/* Stats Grid */}
            {!loading && stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700`}>
                  <div className="flex items-center">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Puzzles Completed</p>
                      <p className="text-2xl font-bold">{stats.totalPuzzlesCompleted}</p>
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700`}>
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
                      <p className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</p>
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700`}>
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                      <p className="text-2xl font-bold">{stats.currentStreak} days</p>
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700`}>
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Best Time</p>
                      <p className="text-2xl font-bold">{formatTime(stats.bestTime)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {navigationCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 3) }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-200`}
                  onClick={() => router.push(card.href)}
                >
                  <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{card.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/game')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start New Game</span>
                </button>
                
                <button
                  onClick={() => router.push('/training')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Training Mode</span>
                </button>
                
                <button
                  onClick={() => router.push('/training/speed-scanning')}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Speed Training</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    </ProtectedRoute>
  );
};

export default DashboardPage; 