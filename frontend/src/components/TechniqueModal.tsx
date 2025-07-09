import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, BookOpen, Lightbulb, Target } from 'lucide-react';
import { Technique, categoryColors } from '../data/techniques';

interface TechniqueModalProps {
  technique: Technique | null;
  isOpen: boolean;
  onClose: () => void;
  onPractice: (technique: Technique) => void;
}

const TechniqueModal: React.FC<TechniqueModalProps> = ({ 
  technique, 
  isOpen, 
  onClose, 
  onPractice 
}) => {
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  if (!technique) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden
              border border-gray-200 dark:border-gray-700
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="
              flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700
              bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900
            ">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {technique.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${categoryColors[technique.category as keyof typeof categoryColors] || 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}
                    `}>
                      {technique.category}
                    </span>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${technique.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        technique.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        technique.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                    `}>
                      {technique.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="
                  p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Short Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Overview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {technique.description}
                  </p>
                </div>

                {/* Full Description */}
                {technique.fullDescription && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      Detailed Explanation
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {technique.fullDescription}
                    </p>
                  </div>
                )}

                {/* Example */}
                {technique.example && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Example
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-green-500 dark:border-green-400">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        {technique.example}
                      </p>
                    </div>
                  </div>
                )}

                {/* Placeholder for Future Diagrams */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Visual Example
                  </h3>
                  <div className="
                    bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900
                    rounded-lg p-8 border-2 border-dashed border-blue-200 dark:border-blue-600
                    flex items-center justify-center
                  ">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="w-8 h-8 text-blue-400 dark:text-blue-300" />
                      </div>
                      <p className="text-sm">
                        Interactive diagram coming soon!
                      </p>
                      <p className="text-xs mt-1">
                        Visual examples will be added in future updates
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="
              p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900
              flex items-center justify-between
            ">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ready to practice this technique?
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="
                    px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300
                    bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg
                    hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-gray-500
                  "
                >
                  Close
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onPractice(technique);
                    onClose();
                  }}
                  className="
                    px-6 py-2 text-sm font-medium text-white
                    bg-green-600 dark:bg-green-700 rounded-lg
                    hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-green-500
                    flex items-center gap-2
                  "
                >
                  <Play className="w-4 h-4" />
                  Start Practice
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TechniqueModal; 