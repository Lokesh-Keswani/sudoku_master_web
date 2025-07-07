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
    updateNotes
  } = useSudokuStore();

  const handleNumberClick = (number: number) => {
    if (!selectedCell) return;
    if (isNotesMode) {
      updateNotes(selectedCell.row, selectedCell.col, number);
    } else {
      makeMove(number);
    }
  };

  const handleErase = () => {
    if (selectedCell) {
      erase();
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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Number Pad
      </h3>
      
      {/* Numbers Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <motion.button
            key={number}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumberClick(number)}
            disabled={!selectedCell}
            className={`w-12 h-12 rounded-lg font-bold text-lg transition-colors ${
              selectedCell
                ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            title={isNotesMode ? `Add/remove note ${number}` : `Place number ${number}`}
          >
            {number}
          </motion.button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleNotesMode}
          className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isNotesMode
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          title={isNotesMode ? "Exit notes mode" : "Enter notes mode"}
        >
          <Edit3 className="w-4 h-4" />
          {isNotesMode ? 'Notes Mode ON' : 'Notes Mode'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleErase}
          disabled={!selectedCell}
          className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            selectedCell
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
          title="Erase selected cell"
        >
          <Eraser className="w-4 h-4" />
          Erase
        </motion.button>

        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: isUndoDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isUndoDisabled ? 1 : 0.98 }}
            onClick={handleUndo}
            disabled={isUndoDisabled}
            className={`p-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isUndoDisabled
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title="Undo last move"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </motion.button>

          <motion.button
            whileHover={{ scale: isRedoDisabled ? 1 : 1.02 }}
            whileTap={{ scale: isRedoDisabled ? 1 : 0.98 }}
            onClick={handleRedo}
            disabled={isRedoDisabled}
            className={`p-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isRedoDisabled
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title="Redo last undone move"
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </motion.button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between items-center">
            <span>Undo Stack:</span>
            <span className="font-mono">{undoStack.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Redo Stack:</span>
            <span className="font-mono">{redoStack.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Notes Mode:</span>
            <span className={isNotesMode ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}>
              {isNotesMode ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberPad; 