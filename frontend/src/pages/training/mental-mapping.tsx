import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { Brain, ArrowLeft, Target, Clock, Trophy } from 'lucide-react';
import { useMentalMappingStore } from '../../store/mentalMappingStore';
import MentalPuzzlePreview from '../../components/MentalPuzzlePreview';
import MentalMoveInput from '../../components/MentalMoveInput';
import MentalComparison from '../../components/MentalComparison';

const MentalMappingPage: React.FC = () => {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    phase,
    puzzle,
    correctMoves,
    userMoves,
    countdown,
    isPuzzleVisible,
    stats,
    startNewSession,
    addUserMove,
    submitMoves,
    tickCountdown,
    resetSession
  } = useMentalMappingStore();

  // Start countdown timer
  useEffect(() => {
    if (phase === 'preview' && countdown > 0) {
      intervalRef.current = setInterval(() => {
        tickCountdown();
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [phase, countdown, tickCountdown]);

  // Start new session on mount
  useEffect(() => {
    startNewSession();
  }, [startNewSession]);

  const handleMoveChange = (move: any, index: number) => {
    addUserMove(move, index);
  };

  const handleSubmit = () => {
    submitMoves();
  };

  const handleNextRound = () => {
    resetSession();
    startNewSession();
  };

  const calculateAccuracy = () => {
    if (stats.totalAttempts === 0) return 0;
    return Math.round((stats.totalCorrectMoves / stats.totalAttempts) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/training')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Training</span>
              </button>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Brain className="w-5 h-5" />
                <span className="font-medium">Mental Mapping Trainer</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Mental Mapping Trainer</h1>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Train your spatial memory and mental visualization skills by memorizing Sudoku moves and recalling them accurately.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
              <div className="text-gray-600 text-sm">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{calculateAccuracy()}%</div>
              <div className="text-gray-600 text-sm">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.bestStreak}</div>
              <div className="text-gray-600 text-sm">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.currentStreak}</div>
              <div className="text-gray-600 text-sm">Current Streak</div>
            </div>
          </div>
        </motion.div>

        {/* Phase Content */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {phase === 'preview' && puzzle && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl"
              >
                <MentalPuzzlePreview
                  puzzle={puzzle}
                  moves={correctMoves}
                  countdown={countdown}
                  isVisible={isPuzzleVisible}
                />
              </motion.div>
            )}

            {phase === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl"
              >
                <MentalMoveInput
                  userMoves={userMoves}
                  onMoveChange={handleMoveChange}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            )}

            {phase === 'comparison' && puzzle && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl"
              >
                <MentalComparison
                  puzzle={puzzle}
                  correctMoves={correctMoves}
                  userMoves={userMoves}
                  score={stats.lastAttempt?.score || 0}
                  onNextRound={handleNextRound}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>How It Works</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Memorize</h4>
              <p className="text-gray-600 text-sm">
                Study the puzzle for 10 seconds, focusing on the highlighted moves and their positions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Recall</h4>
              <p className="text-gray-600 text-sm">
                Input the moves you memorized in the same order, using the dropdown menus.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Compare</h4>
              <p className="text-gray-600 text-sm">
                See your results and get detailed feedback on your memory accuracy.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MentalMappingPage; 