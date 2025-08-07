import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { 
  Eye, 
  Zap, 
  Brain,
  Star,
  Clock,
  Target
} from 'lucide-react';

interface ChallengeCardProps {
  title: string;
  description: string;
  challengeType: 'pattern-recognition' | 'speed-scanning' | 'mental-mapping';
  difficulty: 'easy' | 'medium' | 'hard';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  title, 
  description, 
  challengeType,
  difficulty,
  icon, 
  color,
  bgColor,
  borderColor
}) => {
  const router = useRouter();

  const handleStartChallenge = () => {
    router.push(`/training/challenge-mode/${challengeType}?difficulty=${difficulty}`);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-blue-200 text-blue-800';
      case 'medium':
        return 'bg-green-200 text-green-800';
      case 'hard':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
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
      scale: 1.02,
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
      className="group cursor-pointer"
    >
      <div className={`
        bg-white rounded-2xl p-6 shadow-md border border-gray-200
        hover:shadow-lg transition-all duration-300
        h-full flex flex-col
        ${borderColor}
      `}>
        {/* Icon */}
        <motion.div
          variants={iconVariants}
          className={`${color} mb-4`}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-800 mb-4 text-sm leading-relaxed flex-grow">
          {description}
        </p>

        {/* Difficulty Badge */}
        <div className="mb-4">
          <span className={`inline-block ${getDifficultyColor(difficulty)} text-xs font-medium px-3 py-1 rounded-full capitalize`}>
            {difficulty}
          </span>
        </div>

        {/* Challenge Info */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-gray-700 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              {difficulty === 'easy' ? '90s' : difficulty === 'medium' ? '60s' : '45s'} time limit
            </span>
          </div>
          <div className="flex items-center text-gray-700 text-sm">
            <Target className="w-4 h-4 mr-2" />
            <span>
              {difficulty === 'easy' ? '3' : difficulty === 'medium' ? '4' : '5'} rounds
            </span>
          </div>
          <div className="flex items-center text-gray-700 text-sm">
            <Star className="w-4 h-4 mr-2" />
            <span>Up to 3 stars</span>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={handleStartChallenge}
          className={`
            w-full mt-auto pt-4 border-t border-gray-200
            bg-blue-300 hover:bg-blue-400 text-white font-medium py-3 px-4 rounded-xl
            transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            flex items-center justify-center space-x-2
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Start Challenge</span>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2 }}
          >
            <svg 
              className="w-4 h-4" 
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
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ChallengeCard; 