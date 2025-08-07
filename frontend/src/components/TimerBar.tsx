import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimerBarProps {
  time: number;
  total: number;
  showIcon?: boolean;
}

const TimerBar: React.FC<TimerBarProps> = ({ time, total, showIcon = true }) => {
  const percentage = (time / total) * 100;
  const getColorClass = () => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full space-y-2">
      {/* Timer Display */}
      <div className="flex items-center justify-between">
        {showIcon && (
          <div className="flex items-center space-x-2 text-gray-700">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Time Remaining</span>
          </div>
        )}
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-800">{time}s</span>
          <span className="text-gray-600 ml-1">/ {total}s</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${getColorClass()}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'linear' }}
      />
      </div>
    </div>
  );
};

export default TimerBar; 