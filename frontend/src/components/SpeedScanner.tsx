import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeedScannerStore, getRandomTechniqueOptions } from '../store/speedScannerStore';
import { techniques } from '../data/techniques';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Target, Brain, Clock } from 'lucide-react';

const SpeedScanner: React.FC = () => {
  const {
    currentQuestion,
    selectedTechnique,
    selectedValue,
    feedback,
    showExplanation,
    questionIndex,
    totalQuestions,
    score,
    correctAnswers,
    incorrectAnswers,
    loading,
    gameStarted,
    gameCompleted,
    difficulty,
    selectTechnique,
    selectValue,
    submitAnswer,
    toggleExplanation,
    loadNextQuestion
  } = useSpeedScannerStore();

  // Get technique options for current question
  const techniqueOptions = currentQuestion 
    ? getRandomTechniqueOptions(currentQuestion.correctTechnique, 4)
    : [];

  // Get technique description for tooltip
  const getTechniqueDescription = (techniqueName: string) => {
    const technique = techniques.find(t => t.name === techniqueName);
    return technique?.description || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center p-8 text-gray-500">
        No question loaded. Please start the game.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">
              Score: {score}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-400">✓ {correctAnswers}</span>
          <span className="text-red-400">✗ {incorrectAnswers}</span>
        </div>
      </div>

      {/* Sudoku Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-9 gap-0.5 bg-gray-700 p-1 rounded-lg">
          {currentQuestion.puzzle.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isTargetCell = rowIndex === currentQuestion.targetCell.row && 
                                 colIndex === currentQuestion.targetCell.col;
              const isFilled = cell !== 0;
              
              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-12 h-12 flex items-center justify-center text-lg font-bold
                    ${isTargetCell 
                      ? 'bg-yellow-400 text-gray-900 ring-2 ring-yellow-300' 
                      : isFilled 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-800 text-gray-300'
                    }
                    ${(rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-gray-600' : ''}
                    ${(colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-gray-600' : ''}
                  `}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (rowIndex * 9 + colIndex) * 0.01 }}
                >
                  {isFilled ? cell : ''}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Question Prompt */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          What technique can be used to solve the highlighted cell?
        </h3>
        <p className="text-gray-400 text-sm">
          Select the correct technique and the number that should go in the cell.
        </p>
      </div>

      {/* Technique Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Technique:
        </label>
        <div className="grid grid-cols-2 gap-3">
          {techniqueOptions.map((technique) => {
            const isSelected = selectedTechnique === technique;
            const isCorrect = feedback === 'correct' && technique === currentQuestion.correctTechnique;
            const isIncorrect = feedback === 'incorrect' && technique === selectedTechnique && 
                               selectedTechnique !== currentQuestion.correctTechnique;
            
            return (
              <motion.button
                key={technique}
                onClick={() => selectTechnique(technique)}
                disabled={feedback !== null}
                className={`
                  relative p-3 rounded-lg border-2 transition-all duration-200
                  ${isSelected 
                    ? 'bg-blue-500 border-blue-400 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }
                  ${isCorrect ? 'bg-green-500 border-green-400' : ''}
                  ${isIncorrect ? 'bg-red-500 border-red-400' : ''}
                  ${feedback !== null ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                `}
                whileHover={feedback === null ? { scale: 1.02 } : {}}
                whileTap={feedback === null ? { scale: 0.98 } : {}}
                title={getTechniqueDescription(technique)}
              >
                <div className="text-sm font-medium">{technique}</div>
                {isCorrect && (
                  <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-white" />
                )}
                {isIncorrect && (
                  <XCircle className="absolute top-1 right-1 w-4 h-4 text-white" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Number Pad */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Number:
        </label>
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isSelected = selectedValue === num;
            const isCorrect = feedback === 'correct' && num === currentQuestion.correctValue;
            const isIncorrect = feedback === 'incorrect' && num === selectedValue && 
                               selectedValue !== currentQuestion.correctValue;
            
            return (
              <motion.button
                key={num}
                onClick={() => selectValue(num)}
                disabled={feedback !== null}
                className={`
                  w-12 h-12 rounded-lg border-2 text-lg font-bold transition-all duration-200
                  ${isSelected 
                    ? 'bg-blue-500 border-blue-400 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }
                  ${isCorrect ? 'bg-green-500 border-green-400' : ''}
                  ${isIncorrect ? 'bg-red-500 border-red-400' : ''}
                  ${feedback !== null ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                `}
                whileHover={feedback === null ? { scale: 1.05 } : {}}
                whileTap={feedback === null ? { scale: 0.95 } : {}}
              >
                {num}
                {isCorrect && (
                  <CheckCircle className="absolute top-1 right-1 w-3 h-3 text-white" />
                )}
                {isIncorrect && (
                  <XCircle className="absolute top-1 right-1 w-3 h-3 text-white" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={submitAnswer}
          disabled={!selectedTechnique || selectedValue === null || feedback !== null}
          className={`
            px-8 py-3 rounded-lg font-semibold transition-all duration-200
            ${selectedTechnique && selectedValue !== null && feedback === null
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
          whileHover={selectedTechnique && selectedValue !== null && feedback === null ? { scale: 1.05 } : {}}
          whileTap={selectedTechnique && selectedValue !== null && feedback === null ? { scale: 0.95 } : {}}
        >
          Submit Answer
        </motion.button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              text-center p-4 rounded-lg border-2
              ${feedback === 'correct' 
                ? 'bg-green-500/20 border-green-400 text-green-300' 
                : 'bg-red-500/20 border-red-400 text-red-300'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {feedback === 'correct' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-semibold">
                {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            {feedback === 'incorrect' && (
              <div className="text-sm">
                <p>Correct technique: <span className="font-semibold">{currentQuestion.correctTechnique}</span></p>
                <p>Correct value: <span className="font-semibold">{currentQuestion.correctValue}</span></p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation */}
      {feedback && (
        <div className="space-y-3">
          <motion.button
            onClick={toggleExplanation}
            className="flex items-center justify-center gap-2 w-full p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-sm font-medium">
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </span>
            {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </motion.button>
          
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-800/50 rounded-lg p-4 space-y-2"
              >
                {currentQuestion.explanation.map((line, index) => (
                  <p key={index} className="text-sm text-gray-300">
                    {line}
                  </p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Next Button */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={loadNextQuestion}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {questionIndex + 1 >= totalQuestions ? 'Finish Game' : 'Next Question'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpeedScanner; 