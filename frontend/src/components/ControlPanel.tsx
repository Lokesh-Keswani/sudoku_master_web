import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  RotateCw, 
  Lightbulb, 
  CheckSquare,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useSudokuStore } from '../store/sudokuStore';
import { isBoardComplete, isBoardValid, findConflictingCells } from '../utils/validator';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const ControlPanel: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [conflictingCells, setConflictingCells] = useState<Array<{row: number, col: number}>>([]);
  const [solutionSteps, setSolutionSteps] = useState<any[]>([]);
  
  const {
    undo,
    redo,
    useHint,
    checkSolution,
    grid,
    undoStack,
    redoStack,
    hintsRemaining,
    selectedCell,
    makeMove
  } = useSudokuStore();

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

  const handleHint = () => {
    useHint();
    addToast('info', 'Hint revealed!');
  };

  const handleCheckSolution = () => {
    checkSolution();
    addToast('info', 'Checking solution...');
  };

  const isUndoDisabled = undoStack.length === 0;
  const isRedoDisabled = redoStack.length === 0;
  const isHintDisabled = hintsRemaining <= 0 || grid.flat().every(cell => cell.value !== 0);
  const isCheckDisabled = !isBoardComplete(grid);

  return (
    <div className="space-y-4">
      {/* Enhanced Game Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Game Controls
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
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
            <RotateCcw className="w-4 h-4" />
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
            <RotateCw className="w-4 h-4" />
            Redo
          </motion.button>
        </div>

        <div className="mt-3">
          <motion.button
            whileHover={{ scale: isHintDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isHintDisabled ? 1 : 0.95 }}
            onClick={handleHint}
            disabled={isHintDisabled}
            className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isHintDisabled 
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
            title={isHintDisabled ? "No hints left or board is full" : `Reveal a hint (${hintsRemaining} left)`}
          >
            <Lightbulb className="w-4 h-4" />
            Hint ({hintsRemaining})
          </motion.button>
        </div>

        <div className="mt-3">
          <motion.button
            whileHover={{ scale: isCheckDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isCheckDisabled ? 1 : 0.95 }}
            onClick={handleCheckSolution}
            disabled={isCheckDisabled || isChecking}
            className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isCheckDisabled || isChecking
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            title={isCheckDisabled ? "Complete the board first" : "Check your solution"}
          >
            {isChecking ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckSquare className="w-4 h-4" />
            )}
            {isChecking ? 'Checking...' : 'Check Solution'}
          </motion.button>
        </div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 ${
              toast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : toast.type === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Solution Steps Display */}
      {solutionSteps.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Step-by-Step Solution</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {solutionSteps.map((step, idx) => (
              <li key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2 last:border-b-0 last:mb-0">
                <span className="font-bold">Step {idx + 1}:</span> Place <span className="font-bold">{step.value}</span> at <span className="font-mono">R{step.row + 1}C{step.col + 1}</span>
                {step.reason && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.reason}</div>
                )}
                {step.strategy && (
                  <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">Strategy: {step.strategy}</div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default ControlPanel; 