import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
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
    hidden: { rotate: -180, scale: 0 },
    visible: { 
      rotate: 0, 
      scale: 1,
      transition: {
        delay: 0.2,
        duration: 0.5,
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

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
      className="group cursor-pointer"
    >
      <div className="
        bg-white bg-opacity-80 rounded-2xl p-6 shadow-xl 
        hover:bg-blue-50 hover:scale-105 transition-transform duration-300
        border border-gray-200 hover:border-blue-300
        h-full flex flex-col
      ">
        {/* Icon */}
        <motion.div
          variants={iconVariants}
          className="text-blue-600 mb-4"
        >
          {icon || <Puzzle className="w-8 h-8" />}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-700 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-grow">
          {description}
        </p>

        {/* Training Target */}
        <div className="mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            Training Target
          </span>
          <p className="text-gray-700 text-sm mt-1 font-medium">
            {trainingTarget}
          </p>
        </div>

        {/* How it works */}
        <div className="mb-4">
          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            How it works
          </span>
          <p className="text-gray-600 text-sm mt-1">
            {howItWorks}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
          <span className="text-blue-600 text-sm font-medium">
            Start Training →
          </span>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
            className="text-blue-600 group-hover:text-blue-700"
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