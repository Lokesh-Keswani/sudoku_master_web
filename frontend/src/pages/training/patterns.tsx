import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePatternsStore } from '../../store/patternsStore';
import PatternFlashcard from '../../components/PatternFlashcard';
import TimerBar from '../../components/TimerBar';
import StatsSummary from '../../components/StatsSummary';
import { useThemeStore } from '../../store/themeStore';
import { Moon, Sun, Play, Pause, RotateCcw } from 'lucide-react';

const MODES = ['Flashcard', 'Timed'];
const LEVELS = ['Easy', 'Medium', 'Hard'];
const TIMED_DURATION = 60;

const PatternsPage: React.FC = () => {
  const [mode, setMode] = useState('Flashcard');
  const [level, setLevel] = useState('Easy');
  const [timer, setTimer] = useState(TIMED_DURATION);
  const [timedStats, setTimedStats] = useState({ correct: 0, total: 0, accuracy: 0, patternsPerMin: 0 });
  const [timedActive, setTimedActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { sessionActive, stats, startSession, endSession } = usePatternsStore();
  const { theme, toggleTheme } = useThemeStore();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle timer for Timed mode
  useEffect(() => {
    if (mode === 'Timed' && sessionActive && timedActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && timedActive) {
      handleTimedEnd();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [mode, sessionActive, timedActive, timer]);

  const handleTimedStart = () => {
    setTimedStats({ correct: 0, total: 0, accuracy: 0, patternsPerMin: 0 });
    setTimer(TIMED_DURATION);
    setTimedActive(true);
    startSession('Timed', level as 'Easy' | 'Medium' | 'Hard');
  };

  const handleTimedAnswer = (correct: boolean) => {
    setTimedStats((prev) => {
      const total = prev.total + 1;
      const correctCount = prev.correct + (correct ? 1 : 0);
      return {
        correct: correctCount,
        total,
        accuracy: Math.round((correctCount / total) * 100),
        patternsPerMin: Math.round((correctCount / (TIMED_DURATION - timer + 1)) * 60),
      };
    });
  };

  const handleTimedEnd = () => {
    setTimedActive(false);
    endSession({ 
      correct: timedStats.correct, 
      accuracy: timedStats.accuracy, 
      patternsPerMin: timedStats.patternsPerMin 
    });
  };

  const handleNextPattern = () => {
    // Just a placeholder to trigger next pattern in PatternFlashcard
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <div className="w-8 h-8 text-blue-600 dark:text-blue-400">🧩</div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Pattern Recognition
            </h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Train your brain to recognize common Sudoku patterns and techniques. 
            Improve your pattern recognition speed and accuracy.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Mode Selection */}
            <div className="flex gap-2">
              {MODES.map(m => (
                <motion.button
                  key={m}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    mode === m 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {m}
                </motion.button>
              ))}
            </div>

            {/* Level Selection */}
            <select 
              value={level} 
              onChange={e => setLevel(e.target.value)} 
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LEVELS.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Timer Bar for Timed Mode */}
          {mode === 'Timed' && timedActive && (
            <div className="mt-4">
              <TimerBar time={timer} total={TIMED_DURATION} />
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Timed Mode Start Button */}
          {mode === 'Timed' && !timedActive && !stats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTimedStart}
                className="px-8 py-4 rounded-xl bg-blue-500 text-white font-bold text-lg shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Start Timed Challenge
              </motion.button>
            </motion.div>
          )}

          {/* Timed Mode Active */}
          {mode === 'Timed' && timedActive && (
            <PatternFlashcard 
              mode={mode} 
              level={level} 
              timed 
              onAnswer={handleTimedAnswer} 
              nextPattern={handleNextPattern} 
            />
          )}

          {/* Flashcard Mode Active */}
          {mode === 'Flashcard' && sessionActive && (
            <PatternFlashcard mode={mode} level={level} />
          )}

          {/* Flashcard Mode Start Button */}
          {mode === 'Flashcard' && !sessionActive && !stats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startSession('Flashcard', level as 'Easy' | 'Medium' | 'Hard')}
                className="px-8 py-4 rounded-xl bg-blue-500 text-white font-bold text-lg shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Start Training
              </motion.button>
            </motion.div>
          )}

          {/* Stats Summary */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <StatsSummary stats={{ ...stats, total: timedStats.total || 0 }} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatternsPage; 