import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw, ArrowRight, Home } from 'lucide-react';
import { useSpeedTrainerStore } from '../store/speedTrainerStore';

interface SolutionRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SolutionRevealModal: React.FC<SolutionRevealModalProps> = ({ isOpen, onClose }) => {
  const { 
    correctCell, 
    section, 
    gameState, 
    wrongAttempts,
    nextDrill, 
    retryDrill, 
    resetChallenge 
  } = useSpeedTrainerStore();

  if (!isOpen || !correctCell || !section) return null;

  const getSectionLabel = () => {
    switch (section.type) {
      case 'row': return `Row ${section.index + 1}`;
      case 'col': return `Column ${section.index + 1}`;
      case 'box': return `Box ${section.index + 1}`;
      default: return '';
    }
  };

  const getOutcomeMessage = () => {
    switch (gameState) {
      case 'success':
        return {
          title: 'Excellent! You found it!',
          message: 'Great scanning skills!',
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          color: 'text-green-600'
        };
      case 'failed':
        return {
          title: 'Too many wrong attempts',
          message: `You made ${wrongAttempts} wrong attempts. Let's see the solution.`,
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          color: 'text-red-600'
        };
      case 'timeout':
        return {
          title: 'Time ran out!',
          message: 'You ran out of time. Here\'s the correct answer.',
          icon: <XCircle className="w-8 h-8 text-orange-500" />,
          color: 'text-orange-600'
        };
      default:
        return {
          title: 'Solution Revealed',
          message: 'Here\'s the correct answer.',
          icon: <CheckCircle className="w-8 h-8 text-blue-500" />,
          color: 'text-blue-600'
        };
    }
  };

  const outcome = getOutcomeMessage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                {outcome.icon}
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-2xl font-bold mb-2 ${outcome.color}`}
              >
                {outcome.title}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600"
              >
                {outcome.message}
              </motion.p>
            </div>

            {/* Solution Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 mb-6 border-2 border-green-200"
            >
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Correct Answer:
                </h3>
                <div className="flex items-center justify-center gap-2 text-lg">
                  <span className="font-bold text-green-600">
                    {getSectionLabel()}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="font-bold text-blue-600">
                    Row {correctCell.row + 1}, Column {correctCell.col + 1}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="font-bold text-purple-600">
                    Number {correctCell.value}
                  </span>
                </div>
                
                {/* Visual representation */}
                <div className="mt-3 inline-block bg-white rounded-lg p-3 border-2 border-green-300">
                  <div className="text-2xl font-bold text-green-600">
                    {correctCell.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    R{correctCell.row + 1}C{correctCell.col + 1}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={retryDrill}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry This Drill
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextDrill}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Next Drill
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetChallenge}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Menu
              </motion.button>
            </motion.div>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SolutionRevealModal; 