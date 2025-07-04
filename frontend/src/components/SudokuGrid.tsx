import React from 'react';
import Cell from './Cell';

const SudokuGrid = ({ puzzle }) => {
  // Placeholder: render empty grid
  return (
    <div className="grid grid-cols-9 gap-1">
      {[...Array(9)].map((_, row) =>
        [...Array(9)].map((_, col) => <Cell key={`${row}-${col}`} row={row} col={col} value={puzzle?.[row]?.[col] || ''} />)
      )}
    </div>
  );
};

export default SudokuGrid; 