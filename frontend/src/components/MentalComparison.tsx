import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Move } from '../store/mentalMappingStore';
import { Check, X, Brain, Trophy, Target } from 'lucide-react';

interface MentalComparisonProps {
  puzzle: number[][];
  correctMoves: Move[];
  userMoves: (Move | null)[];
  score: number;
  onNextRound: () => void;
}

const MentalComparison: React.FC<MentalComparisonProps> = ({
  puzzle,
  correctMoves,
  userMoves,
  score,
  onNextRound
}) => {
  const [currentComparison, setCurrentComparison] = useState(0);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    // Start showing comparisons after a delay
    const timer = setTimeout(() => {
      setShowGrid(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getMotivationalMessage = (score: number) => {
    if (score === 3) return "🎉 Perfect Memory! You're a mental mapping master!";
    if (score === 2) return "🌟 Great job! You're getting really good at this!";
    if (score === 1) return "👍 Good effort! Keep practicing to improve!";
    return "💪 Don't give up! Every attempt makes you stronger!";
  };

  const getScoreColor = (score: number) => {
    if (score === 3) return 'text-green-600';
    if (score === 2) return 'text-blue-600';
    if (score === 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isMoveCorrect = (index: number) => {
    const userMove = userMoves[index];
    const correctMove = correctMoves[index];
    return userMove && correctMove && 
      userMove.row === correctMove.row && 
      userMove.col === correctMove.col && 
      userMove.number === correctMove.number;
  };

  const getCellHighlight = (row: number, col: number) => {
    // Check if it's a correct move
    const correctMoveIndex = correctMoves.findIndex(m => m.row === row && m.col === col);
    if (correctMoveIndex !== -1) {
      const userMove = userMoves[correctMoveIndex];
      if (userMove && userMove.row === row && userMove.col === col && userMove.number === correctMoves[correctMoveIndex].number) {
        return 'bg-green-200 border-green-500'; // Correct
      } else {
        return 'bg-red-200 border-red-500'; // Wrong position or number
      }
    }
    
    // Check if user placed a move here that's wrong
    const userMoveIndex = userMoves.findIndex(m => m && m.row === row && m.col === col);
    if (userMoveIndex !== -1) {
      const userMove = userMoves[userMoveIndex];
      const correctMove = correctMoves[userMoveIndex];
      if (userMove && (!correctMove || userMove.row !== correctMove.row || userMove.col !== correctMove.col || userMove.number !== correctMove.number)) {
        return 'bg-red-200 border-red-500'; // Wrong move
      }
    }
    
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center space-y-8"
    >
      {/* Score Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-4">
          <Brain className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">Memory Test Results</h2>
          <Trophy className="w-8 h-8 text-yellow-600" />
        </div>
        <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
          {score}/3
        </div>
        <p className="text-xl text-gray-600 max-w-md">
          {getMotivationalMessage(score)}
        </p>
      </motion.div>

      {/* Comparison Grid */}
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-200"
          >
            <div className="grid grid-cols-9 gap-1">
              {puzzle.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const highlight = getCellHighlight(rowIndex, colIndex);
                  const isCorrectMove = correctMoves.some(m => m.row === rowIndex && m.col === colIndex);
                  const moveNumber = correctMoves.find(m => m.row === rowIndex && m.col === colIndex)?.number;
                  
                  return (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-12 h-12 flex items-center justify-center text-lg font-bold relative
                        border border-gray-300
                        ${rowIndex % 3 === 0 ? 'border-t-2 border-t-gray-400' : ''}
                        ${colIndex % 3 === 0 ? 'border-l-2 border-l-gray-400' : ''}
                        ${rowIndex === 8 ? 'border-b-2 border-b-gray-400' : ''}
                        ${colIndex === 8 ? 'border-r-2 border-r-gray-400' : ''}
                        ${highlight || 'bg-white'}
                        ${cell === 0 ? 'text-gray-400' : 'text-gray-800'}
                      `}
                    >
                      {cell !== 0 ? (
                        <span>{cell}</span>
                      ) : isCorrectMove ? (
                        <span className="text-blue-600 font-bold">{moveNumber}</span>
                      ) : null}
                      
                      {/* Comparison indicators */}
                      {highlight && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        >
                          {highlight.includes('green') ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <X className="w-3 h-3 text-red-600" />
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move-by-Move Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="w-full max-w-2xl space-y-4"
      >
        <h3 className="text-xl font-semibold text-gray-800 text-center mb-6">
          Move-by-Move Analysis
        </h3>
        
        {[0, 1, 2].map((index) => {
          const isCorrect = isMoveCorrect(index);
          const userMove = userMoves[index];
          const correctMove = correctMoves[index];
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + index * 0.3 }}
              className={`
                p-4 rounded-lg border-2 transition-all duration-300
                ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isCorrect ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="font-semibold text-gray-800">Move {index + 1}</span>
                </div>
                <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Your Move:</span>
                  <p className="font-medium">
                    {userMove ? `Row ${userMove.row + 1}, Col ${userMove.col + 1}, Number ${userMove.number}` : 'Not entered'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Correct Move:</span>
                  <p className="font-medium">
                    Row {correctMove.row + 1}, Col {correctMove.col + 1}, Number {correctMove.number}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Next Round Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="pt-4"
      >
        <button
          onClick={onNextRound}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Try Another Round
        </button>
      </motion.div>
    </motion.div>
  );
};

export default MentalComparison; 