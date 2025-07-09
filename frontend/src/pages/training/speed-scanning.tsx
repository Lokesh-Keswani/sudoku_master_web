import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useSpeedTrainerStore } from '../../store/speedTrainerStore';
import SpeedTrainerGrid from '../../components/SpeedTrainerGrid';
import SolutionRevealModal from '../../components/SolutionRevealModal';
import { ArrowLeft, Play, Target, Clock, Zap, Brain } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TECHNIQUES = ['Hidden Single', 'Naked Single', 'Locked Candidates'];
const TIMES = [20, 30, 45];

const SpeedScanningPage: React.FC = () => {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState('Easy');
  const [technique, setTechnique] = useState('Hidden Single');
  const [timeLimit, setTimeLimit] = useState(20);
  const [mounted, setMounted] = useState(false);

  const {
    gameState,
    challengeActive,
    stats,
    showSolutionReveal,
    startChallenge,
    resetChallenge,
    hideSolution,
    puzzle,
    section,
    timer,
    timeLimit: storeTimeLimit
  } = useSpeedTrainerStore();

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

  const handleStartChallenge = () => {
    startChallenge(difficulty, technique, timeLimit);
  };

  const handleBackToMenu = () => {
    resetChallenge();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="w-full max-w-4xl bg-gray-900/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-800">
        <AnimatePresence mode="wait">
          {/* Setup Screen */}
          {gameState === 'setup' && (
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
                  Speed Scanning Trainer
                </motion.h1>
                <motion.p 
                  className="text-gray-400 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Train your pattern recognition and scanning speed
                </motion.p>
              </div>

              {/* Configuration Options */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl"
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
                    onChange={e => setDifficulty(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Brain className="w-4 h-4" />
                    Technique
                  </label>
                  <select 
                    value={technique} 
                    onChange={e => setTechnique(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {TECHNIQUES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Clock className="w-4 h-4" />
                    Time Limit
                  </label>
                  <select 
                    value={timeLimit} 
                    onChange={e => setTimeLimit(Number(e.target.value))} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {TIMES.map(t => <option key={t} value={t}>{t}s</option>)}
                  </select>
                </div>
              </motion.div>

              {/* Start Button */}
              <motion.button 
                onClick={handleStartChallenge}
                className="mt-6 px-12 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-6 h-6" />
                Start Challenge
              </motion.button>

              {/* Back Button */}
              <motion.button
                onClick={() => router.push('/training')}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Training Menu
              </motion.button>
            </motion.div>
          )}

          {/* Game Screen */}
          {(gameState === 'playing' || challengeActive) && (
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
                    Speed Scanning Challenge
                  </h2>
                  <div className="flex items-center gap-2 text-orange-400">
                    <Clock className="w-5 h-5" />
                    <span className="font-mono text-lg">{timer}s</span>
                  </div>
                </div>
                <button
                  onClick={handleBackToMenu}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Exit
                </button>
              </div>
              
              {/* Game Grid */}
              <SpeedTrainerGrid />
            </motion.div>
          )}

          {/* Results Screen */}
          {stats && gameState !== 'playing' && !challengeActive && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-blue-400 mb-4">
                  Challenge Complete!
                </h2>
                
                {/* Stats Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{stats.accuracy}%</div>
                    <div className="text-gray-400">Accuracy</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{stats.hits}</div>
                    <div className="text-gray-400">Correct</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-400">{stats.misses}</div>
                    <div className="text-gray-400">Incorrect</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={handleStartChallenge}
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

        {/* Solution Reveal Modal */}
        <SolutionRevealModal 
          isOpen={showSolutionReveal} 
          onClose={hideSolution} 
        />
      </div>
    </div>
  );
};

export default SpeedScanningPage; 