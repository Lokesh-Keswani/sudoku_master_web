import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { patterns, Pattern, getPatternsByDifficulty } from '../data/patterns';
import { useThemeStore } from '../store/themeStore';
import { Lightbulb, Eye, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

type PatternFlashcardProps = {
  mode: string;
  level: string;
  onAnswer?: (correct: boolean) => void;
  timed?: boolean;
  nextPattern?: () => void;
};

const PatternFlashcard: React.FC<PatternFlashcardProps> = ({ 
  mode, 
  level, 
  onAnswer, 
  timed, 
  nextPattern 
}) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const { theme } = useThemeStore();

  // Filter patterns by level
  const filtered = getPatternsByDifficulty(level as 'Easy' | 'Medium' | 'Hard');
  const pattern = filtered[current] || filtered[0];

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    setShowHints(false);
    setCurrentHintIndex(0);
    setImgError(false);
  }, [current, level]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === pattern.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowExplanation(true);
    if (onAnswer) onAnswer(isCorrect);
    
    if (timed && nextPattern) {
      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
        setShowExplanation(false);
        setShowHints(false);
        setCurrentHintIndex(0);
        setImgError(false);
        nextPattern();
      }, 2000);
    }
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % filtered.length);
  };

  const nextHint = () => {
    if (currentHintIndex < pattern.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const previousHint = () => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(currentHintIndex - 1);
    }
  };

  if (!pattern) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No patterns available for this level.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-90 backdrop-blur rounded-2xl shadow-xl p-6 mt-6 w-full max-w-2xl mx-auto">
      {/* Pattern Image */}
      <div className="w-full max-w-md h-64 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
        {!imgError ? (
          <img
            src={pattern.image}
            alt={`${pattern.technique} pattern`}
            className="object-contain w-full h-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-center p-4">
            <div className="text-6xl mb-2">🧩</div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Pattern image not available
            </span>
            <p className="text-gray-600 dark:text-gray-300 text-xs mt-2">
              {pattern.technique} pattern
            </p>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="text-lg font-semibold mb-4 text-gray-800 dark:text-white text-center">
        {pattern.question}
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-3 w-full mb-6">
        {pattern.options.map((option) => (
          <motion.button
            key={option}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleSelect(option)}
            className={`py-3 px-4 rounded-lg font-medium transition-all border-2 text-sm
              ${selected === option
                ? feedback === 'correct' && option === pattern.correctAnswer
                  ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300 animate-pulse'
                  : feedback === 'incorrect' && option === selected
                  ? 'bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300 animate-shake'
                  : option === pattern.correctAnswer && feedback === 'incorrect'
                  ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300'
                  : 'bg-blue-100 dark:bg-blue-900 border-blue-300 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300'
              }
            `}
            disabled={!!selected}
          >
            {option}
          </motion.button>
        ))}
      </div>

      {/* Feedback and Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`w-full mb-4 p-4 rounded-lg text-center font-semibold ${
              feedback === 'correct' 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {feedback === 'correct' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>{feedback === 'correct' ? 'Correct!' : 'Incorrect.'}</span>
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-normal text-sm">
              {pattern.explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hints Section */}
      <div className="w-full mb-4">
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
        >
          <Lightbulb className="w-4 h-4" />
          {showHints ? 'Hide Hints' : 'Show Hints'}
        </button>

        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
            >
              <div className="mb-3">
                <p className="text-gray-800 dark:text-gray-200 text-sm">
                  {pattern.hints[currentHintIndex]}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={previousHint}
                  disabled={currentHintIndex === 0}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentHintIndex + 1} of {pattern.hints.length}
                </span>
                <button
                  onClick={nextHint}
                  disabled={currentHintIndex === pattern.hints.length - 1}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!timed && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={!selected}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold shadow-lg hover:bg-blue-600 transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Pattern
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}

      {/* Pattern Info */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            {pattern.difficulty}
          </span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            {pattern.category}
          </span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            {current + 1} of {filtered.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatternFlashcard; 