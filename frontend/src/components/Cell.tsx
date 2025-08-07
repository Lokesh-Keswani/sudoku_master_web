import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cell as CellType } from '../store/sudokuStore';
import { isMoveValid, findConflictingCells } from '../utils/validator';
import { useSudokuStore } from '../store/sudokuStore';

interface CellProps {
  row: number;
  col: number;
  cell: CellType;
  isSelected: boolean;
  isHighlighted: boolean;
  isFixed: boolean;
  onClick: (row: number, col: number) => void;
  isConflicting?: boolean;
  sparkle?: boolean;
  isHinted?: boolean;
}

const Cell: React.FC<CellProps> = ({
  row,
  col,
  cell,
  isSelected,
  isHighlighted,
  isFixed,
  onClick,
  isConflicting = false,
  sparkle = false,
  isHinted = false
}) => {
  const [isInvalid, setIsInvalid] = useState(false);
  const [lastValue, setLastValue] = useState(cell.value);
  const { makeMove, grid } = useSudokuStore();
  const [showSparkle, setShowSparkle] = useState(false);
  const [showHintGlow, setShowHintGlow] = useState(false);

  // Sparkle effect when sparkle prop is true
  useEffect(() => {
    if (sparkle) {
      setShowSparkle(true);
      const timeout = setTimeout(() => setShowSparkle(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [sparkle, cell.value]);

  // Hint glow effect
  useEffect(() => {
    if (isHinted) {
      setShowHintGlow(true);
      const timeout = setTimeout(() => setShowHintGlow(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [isHinted, cell.value]);

  // Check for invalid moves when value changes
  useEffect(() => {
    if (cell.value !== 0 && cell.value !== lastValue) {
      const conflicts = findConflictingCells(
        grid,
        row,
        col,
        cell.value
      );
      
      if (conflicts.length > 0) {
        setIsInvalid(true);
        // Auto-clear invalid state after animation
        setTimeout(() => setIsInvalid(false), 2000);
      }
      
      setLastValue(cell.value);
    }
  }, [cell.value, row, col, lastValue, grid]);

  const handleClick = () => {
    if (!isFixed) {
      onClick(row, col);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (isFixed) return;

    const key = e.key;
    if (key >= '1' && key <= '9') {
      e.preventDefault();
      const value = parseInt(key);
      const success = await makeMove(value);
      if (!success) {
        setIsInvalid(true);
        setTimeout(() => setIsInvalid(false), 1000);
      }
    } else if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault();
      await makeMove(0);
    }
  };

  // Determine cell styling based on state
  const getCellClasses = () => {
    let baseClasses = 'w-full h-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm sm:text-base md:text-lg font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 min-h-8 sm:min-h-10 md:min-h-12';

    // Box borders for 3x3 grid separation
    if (col === 2 || col === 5) {
      baseClasses += ' border-r-2 border-gray-400 dark:border-gray-500';
    }
    if (row === 2 || row === 5) {
      baseClasses += ' border-b-2 border-gray-400 dark:border-gray-500';
    }

    // Background colors based on state
    if (isConflicting) {
      baseClasses += ' bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    } else if (isInvalid) {
      baseClasses += ' bg-red-50 dark:bg-red-800 text-red-600 dark:text-red-300';
    } else if (isSelected) {
      baseClasses += ' bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    } else if (isHighlighted) {
      baseClasses += ' bg-blue-50 dark:bg-blue-800 text-blue-600 dark:text-blue-300';
    } else {
      baseClasses += ' bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
    }

    // Fixed number styling
    if (isFixed) {
      baseClasses += ' font-bold text-gray-900 dark:text-gray-100';
    }

    // Hint glow
    if (showHintGlow) {
      baseClasses += ' ring-4 ring-yellow-300 ring-opacity-80 z-10';
    }

    return baseClasses;
  };

  // Render notes
  const renderNotes = () => {
    if (cell.value !== 0 || cell.notes.size === 0) return null;

    const noteNumbers = Array.from(cell.notes).sort();
    const noteGrid = Array(9).fill(null);
    
    noteNumbers.forEach(num => {
      noteGrid[num - 1] = num;
    });

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full text-xs">
        {noteGrid.map((num, index) => (
          <div key={index} className="flex items-center justify-center text-gray-500 dark:text-gray-400">
            {num || ''}
          </div>
        ))}
      </div>
    );
  };

  // Enhanced Sparkle SVG
  const EnhancedSparkle = () => (
    <>
      {/* Main sparkle */}
      <motion.svg
        initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
        animate={{ opacity: [0, 1, 0.7, 0], scale: [0.5, 1.3, 1, 1.7], rotate: [0, 20, -20, 0] }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
        viewBox="0 0 40 40"
        fill="none"
      >
        <g>
          <circle cx="20" cy="20" r="8" fill="#fcd34d" fillOpacity="0.8" />
          <circle cx="20" cy="20" r="14" fill="#fde68a" fillOpacity="0.4" />
          <circle cx="20" cy="20" r="20" fill="#fef3c7" fillOpacity="0.18" />
        </g>
      </motion.svg>
      {/* Extra sparkles */}
      <motion.svg
        initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
        animate={{ opacity: [0, 1, 0.7, 0], scale: [0.3, 1, 0.8, 1.2], rotate: [0, -30, 30, 0] }}
        transition={{ duration: 1.1, delay: 0.1, ease: 'easeInOut' }}
        className="absolute left-1 top-1 w-3 h-3 pointer-events-none z-30"
        viewBox="0 0 12 12"
        fill="none"
      >
        <circle cx="6" cy="6" r="6" fill="#fbbf24" fillOpacity="0.7" />
      </motion.svg>
      <motion.svg
        initial={{ opacity: 0, scale: 0.2, rotate: 0 }}
        animate={{ opacity: [0, 1, 0.7, 0], scale: [0.2, 0.8, 1.1, 1.4], rotate: [0, 45, -45, 0] }}
        transition={{ duration: 1.0, delay: 0.2, ease: 'easeInOut' }}
        className="absolute right-1 bottom-1 w-2 h-2 pointer-events-none z-30"
        viewBox="0 0 8 8"
        fill="none"
      >
        <circle cx="4" cy="4" r="4" fill="#a3e635" fillOpacity="0.7" />
      </motion.svg>
      <motion.svg
        initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
        animate={{ opacity: [0, 1, 0.7, 0], scale: [0.4, 1.1, 0.9, 1.3], rotate: [0, -15, 15, 0] }}
        transition={{ duration: 1.1, delay: 0.15, ease: 'easeInOut' }}
        className="absolute right-2 top-2 w-2 h-2 pointer-events-none z-30"
        viewBox="0 0 8 8"
        fill="none"
      >
        <circle cx="4" cy="4" r="4" fill="#38bdf8" fillOpacity="0.6" />
      </motion.svg>
    </>
  );

  return (
    <motion.div
      className={getCellClasses() + ' relative'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      whileHover={{ scale: isFixed ? 1 : 1.05 }}
      whileTap={{ scale: isFixed ? 1 : 0.95 }}
      animate={{
        scale: isInvalid ? [1, 1.1, 1] : 1,
        rotate: isInvalid ? [0, -5, 5, -5, 0] : 0,
      }}
      transition={{
        duration: isInvalid ? 0.6 : 0.2,
        ease: "easeInOut"
      }}
    >
      {showSparkle && <EnhancedSparkle />}
      {cell.value !== 0 ? (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="select-none"
        >
          {cell.value}
        </motion.span>
      ) : (
        renderNotes()
      )}
    </motion.div>
  );
};

export default Cell; 