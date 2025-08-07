import React from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  RotateCw, 
  Eraser, 
  Edit3,
  Undo2,
  Redo2
} from 'lucide-react';
import { useSudokuStore } from '../store/sudokuStore';

// Function to calculate remaining count for each digit
function getRemainingCount(board: any[][], digit: number): number {
  const maxCount = 9;
  const currentCount = board.flat().filter((cell) => cell.value === digit).length;
  return Math.max(0, maxCount - currentCount);
}

const NumberPad: React.FC = () => {
  const {
    makeMove,
    toggleNotesMode,
    isNotesMode,
    erase,
    undo,
    redo,
    undoStack,
    redoStack,
    selectedCell,
    updateNotes,
    grid
  } = useSudokuStore();

  const handleNumberClick = async (number: number) => {
    if (!selectedCell) return;
    if (isNotesMode) {
      updateNotes(selectedCell.row, selectedCell.col, number);
    } else {
      await makeMove(number);
    }
  };

  const handleErase = async () => {
    if (selectedCell) {
      await makeMove(0);
    }
  };

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  const isUndoDisabled = undoStack.length === 0;
  const isRedoDisabled = redoStack.length === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md md:block fixed bottom-0 left-0 right-0 z-50 md:relative md:z-auto mobile-safe-area">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 hidden md:block">
        Number Pad
      </h3>
      
      {/* Numbers Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => {
          const remainingCount = getRemainingCount(grid, number);
          const isFullyPlaced = remainingCount === 0;
          
          return (
            <motion.button
              key={number}
              whileHover={{ scale: selectedCell ? 1.05 : 1 }}
              whileTap={{ scale: selectedCell ? 0.95 : 1 }}
              onClick={() => handleNumberClick(number)}
              disabled={!selectedCell || isFullyPlaced}
              className={`relative min-h-12 sm:min-h-14 md:min-h-16 rounded-lg font-bold text-lg transition-all duration-200 ease-in-out shadow-md active:scale-95 touch-target ${
                selectedCell && !isFullyPlaced
                  ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                  : isFullyPlaced
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
              title={isNotesMode ? `Add/remove note ${number}` : `Place number ${number}`}
            >
              <span className="text-sm sm:text-base md:text-lg">{number}</span>
              
              {/* Numbers Left Indicator */}
              <div className={`absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                remainingCount === 0 
                  ? 'bg-red-500 text-white' 
                  : remainingCount <= 2 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {remainingCount}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleNotesMode}
          className={`w-full p-3 rounded-lg transition-all duration-200 ease-in-out shadow-md active:scale-95 flex items-center justify-center gap-2 touch-target ${
            isNotesMode
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          title={isNotesMode ? "Exit notes mode" : "Enter notes mode"}
        >
          <Edit3 className="w-4 h-4" />
          <span className="hidden sm:inline">{isNotesMode ? 'Notes Mode ON' : 'Notes Mode'}</span>
          <span className="sm:hidden">{isNotesMode ? 'Notes ON' : 'Notes'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleErase}
          disabled={!selectedCell}
          className={`w-full p-3 rounded-lg transition-all duration-200 ease-in-out shadow-md active:scale-95 flex items-center justify-center gap-2 touch-target ${
            selectedCell
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
          title="Erase selected cell"
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden sm:inline">Erase</span>
          <span className="sm:hidden">Clear</span>
        </motion.button>

        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: isUndoDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isUndoDisabled ? 1 : 0.98 }}
            onClick={handleUndo}
            disabled={isUndoDisabled}
            className={`p-3 rounded-lg transition-all duration-200 ease-in-out shadow-md active:scale-95 flex items-center justify-center gap-2 touch-target ${
              isUndoDisabled
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title="Undo last move"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
            <span className="sm:hidden">↶</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: isRedoDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isRedoDisabled ? 1 : 0.98 }}
            onClick={handleRedo}
            disabled={isRedoDisabled}
            className={`p-3 rounded-lg transition-all duration-200 ease-in-out shadow-md active:scale-95 flex items-center justify-center gap-2 touch-target ${
              isRedoDisabled
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title="Redo last undone move"
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Redo</span>
            <span className="sm:hidden">↷</span>
          </motion.button>
        </div>
      </div>

      {/* Status Indicators - Hidden on mobile to save space */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 hidden md:block">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between mb-1">
            <span>Undo Stack:</span>
            <span className="font-mono">{undoStack.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Redo Stack:</span>
            <span className="font-mono">{redoStack.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberPad; 