import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeedTrainerStore } from '../../store/speedTrainerStore';
import SpeedTrainerGrid from '../../components/SpeedTrainerGrid';
import TimerBar from '../../components/TimerBar';
import MetricsSummary from '../../components/MetricsSummary';
import { ArrowLeft, Play, Target, Clock, Zap } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TECHNIQUES = ['Hidden Single', 'Naked Single', 'Locked Candidates'];
const TIMES = [20, 30, 45];

const SpeedScanningPage: React.FC = () => {
  const [difficulty, setDifficulty] = useState('Easy');
  const [technique, setTechnique] = useState('Hidden Single');
  const [timeLimit, setTimeLimit] = useState(20);
  const [mounted, setMounted] = useState(false);

  const {
    challengeActive,
    stats,
    startChallenge,
    resetChallenge,
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="w-full max-w-4xl bg-gray-900/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-800">
        <AnimatePresence mode="wait">
          {!challengeActive && !stats && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-8 items-center"
            >
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
                    <Zap className="w-4 h-4" />
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

              <motion.button 
                onClick={() => startChallenge(difficulty, technique, timeLimit)}
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
            </motion.div>
          )}

          {challengeActive && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
                             <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-blue-400">
                   Find: {section?.technique || 'Pattern'}
                 </h2>
                <button
                  onClick={resetChallenge}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Exit
                </button>
              </div>
              
                             <TimerBar time={timer} total={storeTimeLimit} />
              <SpeedTrainerGrid />
            </motion.div>
          )}

          {stats && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
                             <MetricsSummary 
                 stats={stats} 
                 onPlayAgain={() => startChallenge(difficulty, technique, timeLimit)}
                 onReviewSession={() => resetChallenge()}
               />
              <div className="flex justify-center mt-8">
                <motion.button
                  onClick={resetChallenge}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Setup
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SpeedScanningPage; 