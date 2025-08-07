import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface ChallengeTimerBarProps {
  currentTime: number;
  totalTime: number;
  isActive: boolean;
  isWarning?: boolean;
}

const ChallengeTimerBar: React.FC<ChallengeTimerBarProps> = ({
  currentTime,
  totalTime,
  isActive,
  isWarning = false
}) => {
  const progress = (currentTime / totalTime) * 100;
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const getProgressColor = () => {
    if (isWarning || progress < 20) return 'bg-red-400';
    if (progress < 50) return 'bg-yellow-400';
    return 'bg-blue-300';
  };

  const getTextColor = () => {
    if (isWarning || progress < 20) return 'text-red-700';
    if (progress < 50) return 'text-yellow-700';
    return 'text-blue-700';
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Timer Display */}
          <div className="flex items-center space-x-3">
            <motion.div
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
              className={`flex items-center space-x-2 ${getTextColor()}`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-lg font-bold">{formattedTime}</span>
            </motion.div>
            
            {isWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-1 text-red-600"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Time&apos;s running out!</span>
              </motion.div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="flex-1 mx-6">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor()} rounded-full`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Progress Percentage */}
          <div className={`text-sm font-medium ${getTextColor()}`}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeTimerBar; 