import React from 'react';
import { useSpeedTrainerStore } from '../store/speedTrainerStore';
import { getSectionCells } from '../utils/trainingUtils';

const SpeedTrainerGrid: React.FC = () => {
  const { puzzle, section, clickCell } = useSpeedTrainerStore();
  if (!puzzle || !section) return null;
  const sectionCells = getSectionCells(section.type, section.index);

  return (
    <div className="grid grid-cols-9 gap-1 my-6">
      {[...Array(9)].map((_, row) =>
        [...Array(9)].map((_, col) => {
          const inSection = sectionCells.some(([r, c]) => r === row && c === col);
          return (
            <div
              key={`${row}-${col}`}
              className={`w-10 h-10 border flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-150
                ${inSection ? 'ring-4 ring-blue-400 border-blue-500 bg-gray-700' : 'border-gray-700 bg-gray-800'}
              `}
              onClick={() => inSection && clickCell(row, col)}
            >
              {puzzle[row][col] !== 0 ? puzzle[row][col] : ''}
            </div>
          );
        })
      )}
    </div>
  );
};

export default SpeedTrainerGrid; 