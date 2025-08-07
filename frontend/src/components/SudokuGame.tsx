import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Settings, CheckCircle, FileText } from 'lucide-react';
import { useSudokuStore } from '../store/sudokuStore';
import { useThemeStore } from '../store/themeStore';
import SudokuGrid from './SudokuGrid';
import NumberPad from './NumberPad';
import ControlPanel from './ControlPanel';
import ThemeToggle from './ThemeToggle';
import SolveReportModal from './SolveReportModal';

const SudokuGame: React.FC = () => {
  const {
    grid,
    selectedCell,
    difficulty,
    timer,
    isNotesMode,
    hintsRemaining,
    undoStack,
    redoStack,
    initialGrid,
    showSolutionReport,
    newGame,
    pauseTimer,
    resumeTimer,
    getFormattedTime,
    setDifficulty,
    makeMove,
    selectCell,
    toggleNotesMode,
    showSolutionReportModal,
    hideSolutionReportModal
  } = useSudokuStore();

  const { theme } = useThemeStore();

  const [showCongrats, setShowCongrats] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Global keyboard event listener
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't handle keyboard events if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key;

      // Number keys 1-9
      if (key >= '1' && key <= '9') {
        e.preventDefault();
        if (selectedCell) {
          await makeMove(parseInt(key));
        }
      }
      // Arrow keys for navigation
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
        if (selectedCell) {
          const { row, col } = selectedCell;
          let newRow = row;
          let newCol = col;

          switch (key) {
            case 'ArrowUp':
              newRow = Math.max(0, row - 1);
              break;
            case 'ArrowDown':
              newRow = Math.min(8, row + 1);
              break;
            case 'ArrowLeft':
              newCol = Math.max(0, col - 1);
              break;
            case 'ArrowRight':
              newCol = Math.min(8, col + 1);
              break;
          }

          selectCell(newRow, newCol);
        }
      }
      // Backspace/Delete for erasing
      else if (key === 'Backspace' || key === 'Delete') {
        e.preventDefault();
        if (selectedCell) {
          await makeMove(0);
        }
      }
      // Space bar for notes mode toggle
      else if (key === ' ') {
        e.preventDefault();
        toggleNotesMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, makeMove, selectCell, toggleNotesMode]);

  const handleNewGame = async () => {
    setIsLoading(true);
    try {
      const success = await newGame(difficulty);
      if (!success) {
        console.error('Failed to start new game');
      }
    } catch (error) {
      console.error('Error starting new game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseResume = () => {
    if (timer.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleDifficultyChange = async (newDifficulty: string) => {
    setIsLoading(true);
    try {
      setDifficulty(newDifficulty);
      const success = await newGame(newDifficulty);
      if (!success) {
        console.error('Failed to start new game with difficulty:', newDifficulty);
      }
    } catch (error) {
      console.error('Error changing difficulty:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for puzzle solved (stopTimer is called in store)
  useEffect(() => {
    // Listen for timer.isGameComplete and show congrats
    if (timer.isGameComplete) {
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 4000);
    }
  }, [timer.isGameComplete]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 pb-32 lg:pb-8">
        {/* Header with Theme Toggle */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
              Sudoku Master
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode
            </div>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* Timer and Game Controls */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-center sm:justify-start space-x-4">
              <div className="text-xl sm:text-2xl font-mono font-bold text-gray-800 dark:text-gray-200">
                {getFormattedTime()}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePauseResume}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                title={timer.isPaused ? "Resume game" : "Pause game"}
              >
                {timer.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </motion.button>
            </div>
            
            <div className="flex items-center justify-center sm:justify-end space-x-3">
              <select
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                disabled={isLoading}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
                <option value="master">Master</option>
              </select>
              
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                onClick={handleNewGame}
                disabled={isLoading}
                className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Start a new game"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isLoading ? 'Loading...' : 'New Game'}</span>
                <span className="sm:hidden">{isLoading ? '...' : 'New'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Game Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {hintsRemaining}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hints Left</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {undoStack.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Undo Stack</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {redoStack.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Redo Stack</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md text-center">
            <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {isNotesMode ? 'ON' : 'OFF'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Notes Mode</div>
          </div>
        </motion.div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sudoku Grid */}
          <motion.div 
            className="lg:col-span-2 flex justify-center px-4 sm:px-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SudokuGrid />
          </motion.div>

          {/* Controls Sidebar - Hidden on mobile, NumberPad is fixed at bottom */}
          <motion.div 
            className="space-y-6 hidden lg:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <NumberPad />
            <ControlPanel />
          </motion.div>
        </div>

        {/* Mobile NumberPad - Fixed at bottom */}
        <div className="lg:hidden">
          <NumberPad />
        </div>

        {/* Game Instructions */}
        <motion.div 
          className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
            How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Basic Controls:</h4>
              <ul className="space-y-1">
                <li>• Click on a cell to select it</li>
                <li>• Use number pad or keyboard (1-9) to place numbers</li>
                <li>• Use Backspace/Delete to erase</li>
                <li>• Toggle notes mode to add pencil marks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Advanced Features:</h4>
              <ul className="space-y-1">
                <li>• Undo/Redo moves with history tracking</li>
                <li>• Get hints (limited per game)</li>
                <li>• Check solution when board is complete</li>
                <li>• Complete puzzle with animation</li>
                <li>• Toggle between light and dark themes</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Congratulations Modal/Toast */}
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Congratulations!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">You solved the puzzle!</p>
              <div className="flex gap-3">
                <button
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  onClick={showSolutionReportModal}
                >
                  <FileText size={16} />
                  View Solution Report
                </button>
                <button
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  onClick={() => setShowCongrats(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Solution Report Modal */}
        <SolveReportModal
          isOpen={showSolutionReport}
          onClose={hideSolutionReportModal}
          initialGrid={initialGrid}
          solution={grid.map(row => row.map(cell => cell.value))}
          solvingTime={timer.elapsedTime}
          difficulty={difficulty}
          hintsUsed={3 - hintsRemaining}
          checkCount={0}
        />
      </div>
    </div>
  );
};

export default SudokuGame; 