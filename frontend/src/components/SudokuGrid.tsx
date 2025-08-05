import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Cell from './Cell';
import { useSudokuStore } from '../store/sudokuStore';
import { findConflictingCells } from '../utils/validator';

const isUnitComplete = (cells: any[]) => {
  // All values 1-9, no zero, no duplicates
  const values = cells.map(cell => cell.value);
  if (values.includes(0)) return false;
  const set = new Set(values);
  return set.size === 9;
};

const getBoxCells = (grid: any[][], boxRow: number, boxCol: number) => {
  const cells = [];
  for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
    for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
      cells.push({ row: r, col: c, cell: grid[r][c] });
    }
  }
  return cells;
};

const SudokuGrid: React.FC = () => {
  const { 
    grid, 
    selectedCell, 
    selectCell,
    hintsRemaining,
    timer
  } = useSudokuStore();

  const [conflictingCells, setConflictingCells] = useState<Array<{row: number, col: number}>>([]);
  const [highlightedNumbers, setHighlightedNumbers] = useState<Set<number>>(new Set());
  const [sparkleCells, setSparkleCells] = useState<{[key:string]:boolean}>({});
  const [hintCell, setHintCell] = useState<{row:number,col:number}|null>(null);
  const prevGridRef = useRef(grid);
  const prevCompletedUnitsRef = useRef<Set<string>>(new Set());

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

  // Sparkle animation for completed row/col/box
  useEffect(() => {
    // Clear sparkles if game is complete (complete puzzle was used)
    if (timer.isGameComplete) {
      setSparkleCells({});
      prevCompletedUnitsRef.current.clear();
      return;
    }

    const newSparkleCells: {[key:string]:boolean} = {};
    const currentCompletedUnits = new Set<string>();

    // Check rows
    for (let r = 0; r < 9; r++) {
      const rowCells = grid[r];
      if (isUnitComplete(rowCells)) {
        const unitKey = `row-${r}`;
        currentCompletedUnits.add(unitKey);
        // Only sparkle if this unit was just completed
        if (!prevCompletedUnitsRef.current.has(unitKey)) {
          for (let c = 0; c < 9; c++) {
            newSparkleCells[`${r},${c}`] = true;
          }
        }
      }
    }

    // Check columns
    for (let c = 0; c < 9; c++) {
      const colCells = grid.map(row => row[c]);
      if (isUnitComplete(colCells)) {
        const unitKey = `col-${c}`;
        currentCompletedUnits.add(unitKey);
        // Only sparkle if this unit was just completed
        if (!prevCompletedUnitsRef.current.has(unitKey)) {
          for (let r = 0; r < 9; r++) {
            newSparkleCells[`${r},${c}`] = true;
          }
        }
      }
    }

    // Check boxes
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const boxCells = getBoxCells(grid, br, bc);
        if (isUnitComplete(boxCells.map(x=>x.cell))) {
          const unitKey = `box-${br}-${bc}`;
          currentCompletedUnits.add(unitKey);
          // Only sparkle if this unit was just completed
          if (!prevCompletedUnitsRef.current.has(unitKey)) {
            for (const {row,col} of boxCells) {
              newSparkleCells[`${row},${col}`] = true;
            }
          }
        }
      }
    }

    setSparkleCells(newSparkleCells);
    prevCompletedUnitsRef.current = currentCompletedUnits;

    // Clear sparkles after animation duration
    if (Object.keys(newSparkleCells).length > 0) {
      setTimeout(() => {
        setSparkleCells({});
      }, 1500);
    }
  }, [grid, timer.isGameComplete]);

  // Detect hint cell (cell that changed from 0 to value and hintsRemaining decreased)
  useEffect(() => {
    const prevGrid = prevGridRef.current;
    let found = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (prevGrid[r][c].value === 0 && grid[r][c].value !== 0) {
          setHintCell({row:r,col:c});
          found = true;
        }
      }
    }
    if (!found) setHintCell(null);
    prevGridRef.current = grid;
  }, [grid, hintsRemaining]);

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
            const sparkle = sparkleCells[`${rowIndex},${colIndex}`] || false;
            const isHinted = !!(hintCell && hintCell.row === rowIndex && hintCell.col === colIndex);
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
                  sparkle={sparkle}
                  isHinted={isHinted}
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