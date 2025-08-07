import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeedTrainerStore } from '../store/speedTrainerStore';
import { CheckCircle, XCircle, Target, Clock } from 'lucide-react';

const SpeedTrainerGrid: React.FC = () => {
  const { 
    puzzle, 
    section, 
    correctCell, 
    userSelection, 
    gameState, 
    timer, 
    timeLimit,
    wrongAttempts,
    maxWrongAttempts,
    clickCell 
  } = useSpeedTrainerStore();

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        useSpeedTrainerStore.getState().tick();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  if (!puzzle || !section) return null;

  const getSectionCells = (type: 'row' | 'col' | 'box', index: number): [number, number][] => {
    if (type === 'row') return Array(9).fill(0).map((_, c) => [index, c]);
    if (type === 'col') return Array(9).fill(0).map((_, r) => [r, index]);
    
    // box: index 0-8, 3x3
    const boxRow = Math.floor(index / 3) * 3;
    const boxCol = (index % 3) * 3;
    const cells: [number, number][] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push([boxRow + r, boxCol + c]);
      }
    }
    return cells;
  };

  const sectionCells = getSectionCells(section.type, section.index);

  const getSectionLabel = () => {
    switch (section.type) {
      case 'row': return `Row ${section.index + 1}`;
      case 'col': return `Column ${section.index + 1}`;
      case 'box': return `Box ${section.index + 1}`;
      default: return '';
    }
  };

  const isCellInSection = (row: number, col: number): boolean => {
    return sectionCells.some(([r, c]) => r === row && c === col);
  };

  const getCellState = (row: number, col: number) => {
    const isEmpty = puzzle[row][col] === 0;
    const inSection = isCellInSection(row, col);
    const isCorrectCell = correctCell && row === correctCell.row && col === correctCell.col;
    const isUserSelection = userSelection && row === userSelection.row && col === userSelection.col;
    const isClickable = inSection && isEmpty && gameState === 'playing';

    return {
      isEmpty,
      inSection,
      isCorrectCell,
      isUserSelection,
      isClickable,
      isSuccess: gameState === 'success' && isCorrectCell,
      isFailure: gameState === 'failed' && isUserSelection && !isCorrectCell,
    };
  };

  const getCellClasses = (cellState: ReturnType<typeof getCellState>) => {
    const baseClasses = `
      w-12 h-12 flex items-center justify-center text-lg font-bold relative transition-all duration-200
      border border-gray-300
    `;

    const borderClasses = `
      ${cellState.inSection ? 'border-blue-400' : 'border-gray-300'}
      ${Math.floor(cellState.inSection ? 0 : 1) % 3 === 0 ? 'border-t-2 border-t-gray-400' : ''}
      ${Math.floor(cellState.inSection ? 0 : 1) % 3 === 0 ? 'border-l-2 border-l-gray-400' : ''}
    `;

    const stateClasses = cellState.isClickable
      ? 'cursor-pointer hover:scale-105 hover:shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 ring-2 ring-blue-400'
      : cellState.inSection
      ? 'bg-gradient-to-br from-blue-50 to-purple-50 ring-1 ring-blue-300'
      : 'bg-white';

    const textClasses = cellState.isEmpty ? 'text-gray-400' : 'text-gray-800';

    const animationClasses = cellState.isSuccess
      ? 'bg-green-500 text-white ring-4 ring-green-400 shadow-lg'
      : cellState.isFailure
      ? 'bg-red-500 text-white ring-4 ring-red-400 shadow-lg'
      : '';

    return `${baseClasses} ${borderClasses} ${stateClasses} ${textClasses} ${animationClasses}`;
  };

  const handleCellClick = (row: number, col: number) => {
    const cellState = getCellState(row, col);
    if (cellState.isClickable) {
      clickCell(row, col);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Game Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Target className="w-5 h-5" />
            <span className="font-semibold">Focus: {getSectionLabel()}</span>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{timer}s</span>
          </div>
        </div>
        
        {gameState === 'playing' && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Find the {section.technique || 'pattern'}</span>
            <span>•</span>
            <span>Wrong attempts: {wrongAttempts}/{maxWrongAttempts}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(timer / timeLimit) * 100}%`,
              backgroundColor: timer > timeLimit * 0.6 ? '#10b981' : timer > timeLimit * 0.3 ? '#f59e0b' : '#ef4444'
            }}
            initial={{ width: '100%' }}
            animate={{ width: `${(timer / timeLimit) * 100}%` }}
          />
        </div>
      </motion.div>

      {/* Game State Messages */}
      <AnimatePresence>
        {gameState === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-green-600 font-bold text-lg"
          >
            <CheckCircle className="w-6 h-6" />
            Success! Great job!
          </motion.div>
        )}

        {gameState === 'failed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-red-600 font-bold text-lg"
          >
            <XCircle className="w-6 h-6" />
            Time&apos;s up! Let&apos;s see the solution.
          </motion.div>
        )}

        {gameState === 'timeout' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-red-600 font-bold text-lg"
          >
            <Clock className="w-6 h-6" />
            Time expired! Here&apos;s the solution.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sudoku Grid */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-200"
      >
        <div className="grid grid-cols-9 gap-1">
          {[...Array(9)].map((_, row) =>
            [...Array(9)].map((_, col) => {
              const cellState = getCellState(row, col);
              
              return (
                <motion.div
                  key={`${row}-${col}`}
                  whileHover={cellState.isClickable ? { scale: 1.05 } : {}}
                  whileTap={cellState.isClickable ? { scale: 0.95 } : {}}
                  className={getCellClasses(cellState)}
                  onClick={() => handleCellClick(row, col)}
                >
                  {/* Cell Content */}
                  {!cellState.isEmpty && puzzle[row][col]}
                  
                  {/* Success Animation */}
                  {cellState.isSuccess && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>
                  )}

                  {/* Failure Animation */}
                  {cellState.isFailure && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <XCircle className="w-8 h-8 text-white" />
                    </motion.div>
                  )}

                  {/* Section highlight indicator */}
                  {cellState.inSection && !cellState.isEmpty && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                    />
                  )}

                  {/* Pulse animation for correct cell in solution reveal */}
                  {cellState.isCorrectCell && (gameState === 'failed' || gameState === 'timeout') && (
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          '0 0 0 0 rgba(34, 197, 94, 0.7)',
                          '0 0 0 10px rgba(34, 197, 94, 0)',
                          '0 0 0 0 rgba(34, 197, 94, 0)'
                        ]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                      className="absolute inset-0 rounded"
                    />
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Instructions */}
      {gameState === 'playing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-600 max-w-md"
        >
          <p className="text-sm">
            Click on the highlighted {section.type} to find where the {section.technique || 'pattern'} can be placed.
            <br />
            <span className="text-orange-600 font-medium">
              You have {wrongAttempts} wrong attempts remaining.
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SpeedTrainerGrid; 