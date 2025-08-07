import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Lightbulb, 
  Eye, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Moon,
  Sun
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';
import { getPracticePuzzleByTechnique } from '../../../data/practicePuzzles';
import { getTechniqueById } from '../../../data/techniques';
import PracticeSudokuGrid from '../../../components/PracticeSudokuGrid';
import { PracticePuzzle } from '../../../data/practicePuzzles';

const PracticePage: React.FC = () => {
  const router = useRouter();
  const { techniqueName } = router.query;
  const { theme, toggleTheme } = useThemeStore();
  
  const [puzzle, setPuzzle] = useState<PracticePuzzle | null>(null);
  const [currentBoard, setCurrentBoard] = useState<number[][]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load puzzle when technique name is available
  useEffect(() => {
    if (techniqueName && typeof techniqueName === 'string') {
      const practicePuzzle = getPracticePuzzleByTechnique(techniqueName);
      if (practicePuzzle) {
        setPuzzle(practicePuzzle);
        setCurrentBoard(practicePuzzle.initialBoard.map(row => [...row]));
      }
    }
  }, [techniqueName]);

  const handleCellChange = (row: number, col: number, value: number) => {
    if (puzzle && puzzle.initialBoard[row][col] === 0) {
      const newBoard = currentBoard.map(r => [...r]);
      newBoard[row][col] = value;
      setCurrentBoard(newBoard);
    }
  };

  const checkSolution = () => {
    if (!puzzle) return;
    
    const isCorrectSolution = currentBoard.every((row, rowIndex) =>
      row.every((cell, colIndex) => cell === puzzle.solution[rowIndex][colIndex])
    );
    
    setIsCorrect(isCorrectSolution);
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  const resetPuzzle = () => {
    if (puzzle) {
      setCurrentBoard(puzzle.initialBoard.map(row => [...row]));
      setShowSolution(false);
      setShowHints(false);
      setCurrentHintIndex(0);
      setIsCorrect(null);
      setShowFeedback(false);
    }
  };

  const nextHint = () => {
    if (puzzle && currentHintIndex < puzzle.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const previousHint = () => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(currentHintIndex - 1);
    }
  };

  const technique = puzzle ? getTechniqueById(puzzle.techniqueId) : null;

  if (!puzzle || !technique) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧩</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Practice Puzzle Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The practice puzzle for this technique is not available yet.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  {technique.name} Practice
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {technique.difficulty} • {technique.category}
                </p>
              </div>
            </div>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Puzzle Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Practice Puzzle
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {puzzle.description}
                </p>
              </div>

                             {/* Sudoku Grid */}
               <div className="flex justify-center mb-6">
                 <PracticeSudokuGrid
                   board={currentBoard}
                   initialBoard={puzzle.initialBoard}
                   onCellChange={handleCellChange}
                   teachingPoints={puzzle.teachingPoints}
                   showSolution={showSolution}
                   solution={puzzle.solution}
                 />
               </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={checkSolution}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Check Solution
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetPuzzle}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </motion.button>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mt-4 p-4 rounded-lg text-center font-semibold ${
                      isCorrect 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Correct! Well done!
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Incorrect. Try again!
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Technique Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Technique Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                  <p className="text-gray-800 dark:text-white">{technique.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category:</span>
                  <p className="text-gray-800 dark:text-white">{technique.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Difficulty:</span>
                  <p className="text-gray-800 dark:text-white">{technique.difficulty}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Description:</span>
                  <p className="text-gray-800 dark:text-white text-sm">{technique.description}</p>
                </div>
              </div>
            </div>

            {/* Hints Panel */}
            {showHints && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Hints
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-gray-800 dark:text-white text-sm">
                      {puzzle.hints[currentHintIndex]}
                    </p>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={previousHint}
                      disabled={currentHintIndex === 0}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currentHintIndex + 1} of {puzzle.hints.length}
                    </span>
                    <button
                      onClick={nextHint}
                      disabled={currentHintIndex === puzzle.hints.length - 1}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Teaching Points */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Teaching Points
              </h3>
              <div className="space-y-3">
                {puzzle.teachingPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full mt-1 ${point.color}`}></div>
                    <div>
                      <p className="text-sm text-gray-800 dark:text-white">
                        Cell ({point.row + 1}, {point.col + 1})
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage; 