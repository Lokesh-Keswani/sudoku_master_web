import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useThemeStore } from '../store/themeStore';
import { 
  Puzzle, 
  Search, 
  Zap, 
  Map, 
  Bot, 
  Trophy,
  Brain,
  Target,
  BookOpen,
  Clock,
  Eye,
  Lightbulb
} from 'lucide-react';

interface TrainingCardProps {
  title: string;
  description: string;
  trainingTarget: string;
  howItWorks: string;
  route: string;
  icon?: React.ReactNode;
  color?: string;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ 
  title, 
  description, 
  trainingTarget, 
  howItWorks, 
  route, 
  icon, 
  color = "from-blue-500 to-purple-600" 
}) => {
  const router = useRouter();
  const { theme } = useThemeStore();

  const handleClick = () => {
    router.push(route);
  };

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
        duration: 0.5,
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
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.15,
      filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    hidden: { scale: 1, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 0,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    hover: {
      scale: [1, 1.2, 1],
      opacity: [0, 0.3, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
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
      onClick={handleClick}
      className="group cursor-pointer relative"
    >
      {/* Pulse effect background */}
      <motion.div
        variants={pulseVariants}
        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl"
      />
      
      <div className="
        bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-90 rounded-2xl p-6 shadow-xl 
        hover:bg-blue-50 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300
        border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500
        h-full flex flex-col relative z-10
      ">
        {/* Icon */}
        <motion.div
          variants={iconVariants}
          className="text-blue-600 dark:text-blue-400 mb-4 relative"
        >
          {icon || <Puzzle className="w-8 h-8" />}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed flex-grow transition-colors">
          {description}
        </p>

        {/* Training Target */}
        <div className="mb-3">
          <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full transition-colors">
            Training Target
          </span>
          <p className="text-gray-700 dark:text-gray-200 text-sm mt-1 font-medium transition-colors">
            {trainingTarget}
          </p>
        </div>

        {/* How it works */}
        <div className="mb-4">
          <span className="inline-block bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-medium px-2 py-1 rounded-full transition-colors">
            How it works
          </span>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 transition-colors">
            {howItWorks}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-600 transition-colors">
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium transition-colors">
            Start Training →
          </span>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
            className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrainingCard; 