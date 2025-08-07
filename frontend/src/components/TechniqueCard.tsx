import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Info } from 'lucide-react';
import { Technique, categoryColors } from '../data/techniques';

interface TechniqueCardProps {
  technique: Technique;
  onLearnMore: (technique: Technique) => void;
  onPractice: (technique: Technique) => void;
}

const TechniqueCard: React.FC<TechniqueCardProps> = ({ 
  technique, 
  onLearnMore, 
  onPractice 
}) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const iconVariants = {
    hidden: { rotate: -180, scale: 0 },
    visible: { 
      rotate: 0, 
      scale: 1,
      transition: {
        delay: 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      rotate: 360,
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className="group"
    >
      <div className="
        bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-xl p-6 shadow-md 
        hover:shadow-lg transition-all duration-300
        border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
        h-full flex flex-col
        backdrop-blur-sm
      ">
        {/* Header with Icon */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            variants={iconVariants}
            className="text-blue-600 dark:text-blue-400"
          >
            <BookOpen className="w-6 h-6" />
          </motion.div>
          
          {/* Category Badge */}
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${categoryColors[technique.category as keyof typeof categoryColors] || 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}
          `}>
            {technique.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300">
          {technique.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow mb-4 line-clamp-2">
          {technique.description}
        </p>

        {/* Difficulty Indicator */}
        <div className="mb-4">
          <span className={`
            inline-block px-2 py-1 rounded text-xs font-medium
            ${technique.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              technique.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              technique.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
          `}>
            {technique.difficulty}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onLearnMore(technique)}
            className="
              flex-1 flex items-center justify-center gap-2
              px-3 py-2 text-sm font-medium
              bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg
              hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            "
          >
            <Info className="w-4 h-4" />
            Learn More
          </motion.button>
          
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onPractice(technique)}
            className="
              flex-1 flex items-center justify-center gap-2
              px-3 py-2 text-sm font-medium
              bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-lg
              hover:bg-green-100 dark:hover:bg-green-800 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            "
          >
            <Play className="w-4 h-4" />
            Practice
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TechniqueCard; 