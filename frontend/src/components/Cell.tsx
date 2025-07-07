import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cell as CellType, useSudokuStore } from '../store/sudokuStore';
import { notesKey } from '../utils/sudokuUtils';

interface CellProps {
  row: number;
  col: number;
  cell: CellType;
  isSelected: boolean;
  isHighlighted: boolean;
  isFixed: boolean;
  onClick: (row: number, col: number) => void;
  isConflicting?: boolean;
}

const Cell: React.FC<CellProps> = ({
  row,
  col,
  cell,
  isSelected,
  isHighlighted,
  isFixed,
  onClick,
  isConflicting = false
}) => {
  const { isNotesMode, notes, wrongCells } = useSudokuStore();
  const [hinted, setHinted] = useState(false);
  const key = notesKey(row, col);
  const cellNotes = notes[key] || [];
  const isWrong = wrongCells.has(key);

  // Animate hint (pulse) when value is set and was previously empty
  useEffect(() => {
    if (cell.value !== 0 && hinted) {
      const timeout = setTimeout(() => setHinted(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [cell.value, hinted]);

  // Listen for value change to trigger hint animation
  useEffect(() => {
    if (cell.value !== 0 && !isFixed) {
      setHinted(true);
    }
    // eslint-disable-next-line
  }, [cell.value]);

  const handleClick = () => {
    if (!isFixed) {
      onClick(row, col);
    }
  };

  // Determine cell styling
  let baseClasses = 'w-12 h-12 border flex items-center justify-center text-lg font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-white dark:bg-gray-800';
  if (isWrong) {
    baseClasses += ' border-red-500 animate-shake';
  } else if (hinted) {
    baseClasses += ' bg-yellow-100 animate-pulse-gentle';
  } else if (isConflicting) {
    baseClasses += ' bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  } else if (isSelected) {
    baseClasses += ' bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
  } else if (isHighlighted) {
    baseClasses += ' bg-blue-50 dark:bg-blue-800 text-blue-600 dark:text-blue-300';
  } else {
    baseClasses += ' text-gray-900 dark:text-gray-100';
  }
  if (isFixed) {
    baseClasses += ' font-bold';
  }

  // Render notes as 3x3 mini-grid
  const renderNotes = () => {
    if (cell.value !== 0 || cellNotes.length === 0) return null;
    const noteGrid = Array(9).fill(null);
    cellNotes.forEach(num => {
      noteGrid[num - 1] = num;
    });
    return (
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full text-xs select-none">
        {noteGrid.map((num, idx) => (
          <div key={idx} className="flex items-center justify-center text-gray-500 dark:text-gray-400">
            {num || ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className={baseClasses}
      onClick={handleClick}
      tabIndex={0}
      whileHover={{ scale: isFixed ? 1 : 1.05 }}
      whileTap={{ scale: isFixed ? 1 : 0.95 }}
      animate={isWrong ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: isWrong ? 0.5 : 0.2, ease: 'easeInOut' }}
    >
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