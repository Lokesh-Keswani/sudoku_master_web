import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useSpeedScannerStore } from '../../store/speedScannerStore';
import SpeedScanner from '../../components/SpeedScanner';
import { ArrowLeft, Play, Target, Clock, Zap, Brain, Trophy, BarChart3 } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const QUESTION_COUNTS = [5, 10, 15, 20];

const SpeedScanningPage: React.FC = () => {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [questionCount, setQuestionCount] = useState(10);
  const [mounted, setMounted] = useState(false);

  const {
    gameStarted,
    gameCompleted,
    score,
    correctAnswers,
    incorrectAnswers,
    totalQuestions,
    startGame,
    resetGame
  } = useSpeedScannerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
        <div className="w-full max-w-4xl bg-gray-900/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-800">
          <div className="flex flex-col gap-6 items-center">
            <div className="h-8 w-64 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const handleStartGame = () => {
    startGame(difficulty, questionCount);
  };

  const handleBackToMenu = () => {
    resetGame();
  };

  const handlePlayAgain = () => {
    resetGame();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="w-full max-w-4xl bg-gray-900/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-800">
        <AnimatePresence mode="wait">
          {/* Setup Screen */}
          {!gameStarted && !gameCompleted && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-8 items-center"
            >
              {/* Header */}
              <div className="text-center">
                <motion.h1 
                  className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Speed Scanning Quiz
                </motion.h1>
                <motion.p 
                  className="text-gray-400 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Test your ability to quickly identify techniques and solve cells
                </motion.p>
              </div>

              {/* Configuration Options */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Target className="w-4 h-4" />
                    Difficulty
                  </label>
                  <select 
                    value={difficulty} 
                    onChange={e => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <BarChart3 className="w-4 h-4" />
                    Questions
                  </label>
                  <select 
                    value={questionCount} 
                    onChange={e => setQuestionCount(Number(e.target.value))} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {QUESTION_COUNTS.map(count => <option key={count} value={count}>{count}</option>)}
                  </select>
                </div>
              </motion.div>

              {/* Game Description */}
              <motion.div 
                className="bg-gray-800/30 rounded-lg p-6 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-lg font-semibold mb-3 text-blue-400">How it works:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>A Sudoku puzzle will be displayed with a highlighted target cell</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Identify the technique that can be used to solve the highlighted cell</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Select the correct number that should go in that cell</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Get instant feedback and explanations for each answer</span>
                  </li>
                </ul>
              </motion.div>

              {/* Start Button */}
              <motion.button 
                onClick={handleStartGame}
                className="mt-6 px-12 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-6 h-6" />
                Start Quiz
              </motion.button>

              {/* Back Button */}
              <motion.button
                onClick={() => router.push('/training')}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Training Menu
              </motion.button>
            </motion.div>
          )}

          {/* Game Screen */}
          {gameStarted && !gameCompleted && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* Game Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-blue-400">
                    Speed Scanning Quiz
                  </h2>
                </div>
                <button
                  onClick={handleBackToMenu}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Exit
                </button>
              </div>
              
              {/* Game Component */}
              <SpeedScanner />
            </motion.div>
          )}

          {/* Results Screen */}
          {gameCompleted && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-blue-400">
                    Quiz Complete!
                  </h2>
                </div>
                
                {/* Final Score */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 mb-6 border border-blue-500/30">
                  <div className="text-6xl font-bold text-blue-400 mb-2">{score}%</div>
                  <div className="text-gray-400 text-lg">Final Score</div>
                </div>
                
                {/* Stats Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
                    <div className="text-gray-400">Correct</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-400">{incorrectAnswers}</div>
                    <div className="text-gray-400">Incorrect</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{totalQuestions}</div>
                    <div className="text-gray-400">Total</div>
                  </div>
                </div>

                {/* Performance Message */}
                <div className="mb-6">
                  {score >= 90 && (
                    <p className="text-green-400 text-lg font-semibold">Excellent! You&apos;re a Sudoku master!</p>
                  )}
                  {score >= 70 && score < 90 && (
                    <p className="text-blue-400 text-lg font-semibold">Great job! Keep practicing to improve further.</p>
                  )}
                  {score >= 50 && score < 70 && (
                    <p className="text-yellow-400 text-lg font-semibold">Good effort! Review the techniques and try again.</p>
                  )}
                  {score < 50 && (
                    <p className="text-orange-400 text-lg font-semibold">Keep practicing! Focus on the basic techniques first.</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={handlePlayAgain}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-4 h-4" />
                    Play Again
                  </motion.button>
                  
                  <motion.button
                    onClick={handleBackToMenu}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Setup
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SpeedScanningPage; 