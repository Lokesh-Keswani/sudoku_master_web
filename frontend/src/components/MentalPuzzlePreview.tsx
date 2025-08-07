import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Move } from '../store/mentalMappingStore';

interface MentalPuzzlePreviewProps {
  puzzle: number[][];
  moves: Move[];
  countdown: number;
  isVisible: boolean;
}

const MentalPuzzlePreview: React.FC<MentalPuzzlePreviewProps> = ({
  puzzle,
  moves,
  countdown,
  isVisible
}) => {
  const isMoveHighlighted = (row: number, col: number) => {
    return moves.some(move => move.row === row && move.col === col);
  };

  const getMoveNumber = (row: number, col: number) => {
    const move = moves.find(m => m.row === row && m.col === col);
    return move ? move.number : null;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-6"
        >
          {/* Countdown and Message */}
          <div className="text-center space-y-4">
            <motion.div
              key={countdown}
              initial={{ scale: 1.2, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-bold text-blue-600"
            >
              {countdown}
            </motion.div>
            <p className="text-xl text-gray-700 font-medium">
              Memorize the board and deductions carefully!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${(countdown / 10) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>

          {/* Sudoku Grid */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-200">
            <div className="grid grid-cols-9 gap-1">
              {puzzle.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const isHighlighted = isMoveHighlighted(rowIndex, colIndex);
                  const moveNumber = getMoveNumber(rowIndex, colIndex);
                  
                  return (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-12 h-12 flex items-center justify-center text-lg font-bold
                        border border-gray-300 relative
                        ${rowIndex % 3 === 0 ? 'border-t-2 border-t-gray-400' : ''}
                        ${colIndex % 3 === 0 ? 'border-l-2 border-l-gray-400' : ''}
                        ${rowIndex === 8 ? 'border-b-2 border-b-gray-400' : ''}
                        ${colIndex === 8 ? 'border-r-2 border-r-gray-400' : ''}
                        ${isHighlighted ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-white'}
                        ${cell === 0 ? 'text-gray-400' : 'text-gray-800'}
                      `}
                      animate={isHighlighted ? {
                        boxShadow: [
                          '0 0 0 0 rgba(59, 130, 246, 0.4)',
                          '0 0 0 10px rgba(59, 130, 246, 0)',
                          '0 0 0 0 rgba(59, 130, 246, 0)'
                        ]
                      } : {}}
                      transition={isHighlighted ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      } : {}}
                    >
                      {cell !== 0 ? (
                        <span>{cell}</span>
                      ) : isHighlighted ? (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                          className="text-blue-600 font-bold"
                        >
                          {moveNumber}
                        </motion.span>
                      ) : null}
                      
                      {/* Highlight indicator */}
                      {isHighlighted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white text-xs font-bold">
                            {moves.findIndex(m => m.row === rowIndex && m.col === colIndex) + 1}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center text-gray-600 max-w-md">
            <p className="text-sm">
              Focus on the highlighted cells and their numbers. You&apos;ll need to recall these exact positions and values!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MentalPuzzlePreview; 