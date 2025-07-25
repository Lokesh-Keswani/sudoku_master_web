import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Cell from './Cell';
import { useSudokuStore } from '../store/sudokuStore';
import { findConflictingCells } from '../utils/validator';

const SudokuGrid: React.FC = () => {
  const { 
    grid, 
    selectedCell, 
    selectCell 
  } = useSudokuStore();

  const [conflictingCells, setConflictingCells] = useState<Array<{row: number, col: number}>>([]);
  const [highlightedNumbers, setHighlightedNumbers] = useState<Set<number>>(new Set());

  // Update highlighted numbers when selected cell changes
  useEffect(() => {
    if (selectedCell) {
      const selectedValue = grid[selectedCell.row][selectedCell.col].value;
      if (selectedValue !== 0) {
        setHighlightedNumbers(new Set([selectedValue]));
      } else {
        setHighlightedNumbers(new Set());
      }
    } else {
      setHighlightedNumbers(new Set());
    }
  }, [selectedCell, grid]);

  // Check for conflicts when grid changes
  useEffect(() => {
    const conflicts: Array<{row: number, col: number}> = [];
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col].value;
        if (value !== 0) {
          const cellConflicts = findConflictingCells(grid, row, col, value);
          conflicts.push(...cellConflicts);
        }
      }
    }

    setConflictingCells(conflicts);
  }, [grid]);

  const handleCellClick = (row: number, col: number) => {
    selectCell(row, col);
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
    
    const selectedValue = grid[selectedCell.row][selectedCell.col].value;
    const currentValue = grid[row][col].value;
    
    return selectedValue !== 0 && currentValue === selectedValue;
  };

  const isConflicting = (row: number, col: number) => {
    return conflictingCells.some(cell => cell.row === row && cell.col === col);
  };

  const getCellHighlightType = (row: number, col: number) => {
    if (isConflicting(row, col)) {
      return 'conflict';
    } else if (isSameNumber(row, col)) {
      return 'same-number';
    } else if (isHighlighted(row, col)) {
      return 'highlighted';
    }
    return 'normal';
  };

  // Modern, clean grid styling with mobile responsiveness
  return (
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
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const highlightType = getCellHighlightType(rowIndex, colIndex);
            // Calculate bold borders for 3x3 boxes
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
                <Cell
                  row={rowIndex}
                  col={colIndex}
                  cell={cell}
                  isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                  isHighlighted={highlightType === 'highlighted'}
                  isFixed={cell.isFixed}
                  onClick={handleCellClick}
                  isConflicting={highlightType === 'conflict'}
                />
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default SudokuGrid; 