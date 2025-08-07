import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TeachingPoint {
  row: number;
  col: number;
  description: string;
  color: string;
}

interface PracticeSudokuGridProps {
  board: number[][];
  initialBoard: number[][];
  onCellChange: (row: number, col: number, value: number) => void;
  teachingPoints?: TeachingPoint[];
  showSolution?: boolean;
  solution?: number[][];
}

const PracticeSudokuGrid: React.FC<PracticeSudokuGridProps> = ({
  board,
  initialBoard,
  onCellChange,
  teachingPoints = [],
  showSolution = false,
  solution = []
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (value: number) => {
    if (selectedCell) {
      onCellChange(selectedCell.row, selectedCell.col, value);
    }
  };

  const isTeachingPoint = (row: number, col: number) => {
    return teachingPoints.some(point => point.row === row && point.col === col);
  };

  const getTeachingPoint = (row: number, col: number) => {
    return teachingPoints.find(point => point.row === row && point.col === col);
  };

  const isHighlighted = (row: number, col: number) => {
    if (!selectedCell) return false;
    
    const { row: selectedRow, col: selectedCol } = selectedCell;
    
    // Same row, column, or box
    return row === selectedRow || 
           col === selectedCol || 
           (Math.floor(row / 3) === Math.floor(selectedRow / 3) && 
            Math.floor(col / 3) === Math.floor(selectedCol / 3));
  };

  const isSameNumber = (row: number, col: number) => {
    if (!selectedCell) return false;
    
    const selectedValue = board[selectedCell.row][selectedCell.col];
    const currentValue = board[row][col];
    
    return selectedValue !== 0 && currentValue === selectedValue;
  };

  const getCellValue = (row: number, col: number) => {
    if (showSolution && solution.length > 0) {
      return solution[row][col];
    }
    return board[row][col];
  };

  const isFixed = (row: number, col: number) => {
    return initialBoard[row][col] !== 0;
  };

  const isCorrect = (row: number, col: number) => {
    if (!showSolution || solution.length === 0) return true;
    return board[row][col] === 0 || board[row][col] === solution[row][col];
  };

  const getCellStyle = (row: number, col: number) => {
    const teachingPoint = getTeachingPoint(row, col);
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isHighlightedCell = isHighlighted(row, col);
    const isSameNumberCell = isSameNumber(row, col);
    const isFixedCell = isFixed(row, col);
    const isCorrectCell = isCorrect(row, col);

    let baseClasses = "w-full h-full flex items-center justify-center text-lg sm:text-xl font-semibold transition-all duration-200 cursor-pointer";
    
    // Background colors
    if (teachingPoint) {
      baseClasses += ` ${teachingPoint.color}`;
    } else if (isSelected) {
      baseClasses += " bg-blue-500 text-white";
    } else if (isSameNumberCell) {
      baseClasses += " bg-blue-100 dark:bg-blue-900";
    } else if (isHighlightedCell) {
      baseClasses += " bg-gray-100 dark:bg-gray-700";
    } else {
      baseClasses += " bg-white dark:bg-gray-800";
    }

    // Text colors
    if (isSelected) {
      baseClasses += " text-white";
    } else if (isFixedCell) {
      baseClasses += " text-gray-800 dark:text-gray-200";
    } else if (!isCorrectCell) {
      baseClasses += " text-red-600 dark:text-red-400";
    } else {
      baseClasses += " text-blue-600 dark:text-blue-400";
    }

    // Border for teaching points
    if (teachingPoint) {
      baseClasses += " border-2 border-blue-500";
    }

    return baseClasses;
  };

  return (
    <div className="space-y-6">
      {/* Sudoku Grid */}
      <motion.div
        className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="grid grid-cols-9 grid-rows-9 bg-white dark:bg-gray-900 rounded-lg overflow-hidden border-2 sm:border-4 border-gray-400 dark:border-gray-600 shadow-lg aspect-square"
          style={{ boxSizing: 'content-box' }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const borderClasses = [
                rowIndex % 3 === 0 ? 'border-t-2' : 'border-t',
                colIndex % 3 === 0 ? 'border-l-2' : 'border-l',
                rowIndex === 8 ? 'border-b-2' : '',
                colIndex === 8 ? 'border-r-2' : '',
                'border-gray-400',
                'dark:border-gray-600',
              ].join(' ');

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={borderClasses}
                  style={{ background: 'inherit' }}
                >
                  <div
                    className={getCellStyle(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {getCellValue(rowIndex, colIndex) !== 0 ? getCellValue(rowIndex, colIndex) : ''}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Number Pad */}
      <div className="flex justify-center">
        <div className="grid grid-cols-9 gap-2 max-w-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <motion.button
              key={number}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberInput(number)}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {number}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => selectedCell && onCellChange(selectedCell.row, selectedCell.col, 0)}
          className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Clear Cell
        </motion.button>
      </div>

      {/* Teaching Points Legend */}
      {teachingPoints.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Teaching Points
          </h3>
          <div className="space-y-2">
            {teachingPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${point.color}`}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Cell ({point.row + 1}, {point.col + 1}): {point.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeSudokuGrid; 