import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Undo2, 
  Redo2, 
  Lightbulb, 
  Play,
  RotateCcw
} from 'lucide-react';
import { useSudokuStore } from '../store/sudokuStore';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const ControlPanel: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  
  const {
    undo,
    redo,
    useHint,
    completePuzzle,
    grid,
    undoStack,
    redoStack,
    hintsRemaining,
    selectedCell,
    makeMove
  } = useSudokuStore();

  // Helper function to check if board is complete
  const isBoardComplete = (grid: any[][]) => {
    return !grid.flat().some(cell => cell.value === 0);
  };

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const handleUndo = () => {
    const success = undo();
    if (success) {
      addToast('info', 'Move undone');
    }
  };

  const handleRedo = () => {
    const success = redo();
    if (success) {
      addToast('info', 'Move redone');
    }
  };

  const handleHint = async () => {
    setIsHinting(true);
    try {
      const result = await useSudokuStore.getState().useHint();
      if (result.success) {
        if (result.type === 'conflict') {
          addToast('warning', result.message);
        } else {
          addToast('success', result.message);
        }
      } else {
        addToast('error', result.message || 'No hints available');
      }
    } catch (error) {
      addToast('error', 'Failed to get hint');
    } finally {
      setIsHinting(false);
    }
  };

  const handleCompletePuzzle = async () => {
    setIsCompleting(true);
    try {
      const result = await completePuzzle();
      if (result.completed) {
        addToast('success', 'Puzzle completed successfully!');
        
        // Animate the completion by filling cells one by one
        if (result.solutionPath) {
          const emptyCells = [];
          for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
              if (grid[row][col].value === 0 && result.solutionPath[row][col]) {
                emptyCells.push({ row, col, value: result.solutionPath[row][col] });
              }
            }
          }
          
          // Animate filling each cell
          for (let i = 0; i < emptyCells.length; i++) {
            const cell = emptyCells[i];
            setTimeout(async () => {
              await makeMove(cell.value);
            }, i * 100); // 100ms delay between each cell
          }
        }
      } else {
        addToast('error', result.error || 'Failed to complete puzzle');
      }
    } catch (error) {
      addToast('error', 'Failed to complete puzzle');
    } finally {
      setIsCompleting(false);
    }
  };

  const isUndoDisabled = undoStack.length === 0;
  const isRedoDisabled = redoStack.length === 0;
  const isHintDisabled = hintsRemaining <= 0 || isBoardComplete(grid);
  const isCompleteDisabled = isBoardComplete(grid);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Game Controls
      </h3>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: isUndoDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isUndoDisabled ? 1 : 0.95 }}
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
            whileHover={{ scale: isRedoDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isRedoDisabled ? 1 : 0.95 }}
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

        <div className="mt-3">
          <motion.button
            whileHover={{ scale: isHintDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isHintDisabled ? 1 : 0.95 }}
            onClick={handleHint}
            disabled={isHintDisabled || isHinting}
            className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isHintDisabled || isHinting
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
            title={isHintDisabled ? "No hints left or board is complete" : `Get a hint (${hintsRemaining} left)`}
          >
            {isHinting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            {isHinting ? 'Getting Hint...' : `Hint (${hintsRemaining})`}
          </motion.button>
        </div>

        <div className="mt-3">
          <motion.button
            whileHover={{ scale: isCompleteDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isCompleteDisabled ? 1 : 0.95 }}
            onClick={handleCompletePuzzle}
            disabled={isCompleteDisabled || isCompleting}
            className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isCompleteDisabled || isCompleting
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
            title={isCompleteDisabled ? "Board is already complete" : "Complete the puzzle with animation"}
          >
            {isCompleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isCompleting ? 'Completing...' : 'Complete Puzzle'}
          </motion.button>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ControlPanel; 