import React from 'react';
import { motion } from 'framer-motion';
import { useSpeedTrainerStore } from '../store/speedTrainerStore';
import { getSectionCells } from '../utils/trainingUtils';

const SpeedTrainerGrid: React.FC = () => {
  const { puzzle, section, clickCell, challengeActive } = useSpeedTrainerStore();
  if (!puzzle || !section) return null;
  const sectionCells = getSectionCells(section.type, section.index);

  const getSectionLabel = () => {
    switch (section.type) {
      case 'row': return `Row ${section.index + 1}`;
      case 'col': return `Column ${section.index + 1}`;
      case 'box': return `Box ${section.index + 1}`;
      default: return '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Section Label */}
      {challengeActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Focus on: {getSectionLabel()}
          </h3>
          <p className="text-gray-600">
            Find the {section.technique || 'pattern'} in this section
          </p>
        </motion.div>
      )}

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
          const inSection = sectionCells.some(([r, c]) => r === row && c === col);
              const cellValue = puzzle[row][col];
              const isEmpty = cellValue === 0;
              
          return (
                <motion.div
              key={`${row}-${col}`}
                  whileHover={inSection ? { scale: 1.05 } : {}}
                  whileTap={inSection ? { scale: 0.95 } : {}}
                  className={`
                    w-12 h-12 flex items-center justify-center text-lg font-bold cursor-pointer
                    border border-gray-300 relative transition-all duration-200
                    ${row % 3 === 0 ? 'border-t-2 border-t-gray-400' : ''}
                    ${col % 3 === 0 ? 'border-l-2 border-l-gray-400' : ''}
                    ${row === 8 ? 'border-b-2 border-b-gray-400' : ''}
                    ${col === 8 ? 'border-r-2 border-r-gray-400' : ''}
                    ${inSection 
                      ? 'ring-4 ring-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg' 
                      : 'bg-white hover:bg-gray-50'
                    }
                    ${isEmpty ? 'text-gray-400' : 'text-gray-800'}
              `}
                  onClick={() => inSection && challengeActive && clickCell(row, col)}
            >
                  {!isEmpty && cellValue}
                  
                  {/* Section highlight indicator */}
                  {inSection && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                    />
                  )}
                </motion.div>
          );
        })
      )}
        </div>
      </motion.div>
    </div>
  );
};

export default SpeedTrainerGrid; 