import React from 'react';
import { motion } from 'framer-motion';
import { AIAnalysis } from '../store/aiCoachStore';
import { TrendingUp, TrendingDown, Lightbulb, Target, ArrowRight } from 'lucide-react';

interface AISuggestionBoxProps {
  analysis: AIAnalysis;
  className?: string;
  showDrills?: boolean;
  animate?: boolean;
}

export const AISuggestionBox: React.FC<AISuggestionBoxProps> = ({
  analysis,
  className = '',
  showDrills = true,
  animate = true,
}) => {
  const formatSkillName = (skill: string): string => {
    return skill.replace(/([A-Z])/g, ' $1').trim();
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 80) return 'text-green-600';
    if (rating >= 60) return 'text-blue-600';
    if (rating >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBgColor = (rating: number): string => {
    if (rating >= 80) return 'bg-green-100';
    if (rating >= 60) return 'bg-blue-100';
    if (rating >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  const drillVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      variants={animate ? containerVariants : undefined}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Coach Analysis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Personalized recommendations based on your performance
          </p>
        </div>
      </div>

      {/* Overall Rating */}
      <motion.div
        className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Overall Performance Rating
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on all your training sessions
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getRatingColor(analysis.overallRating)}`}>
              {analysis.overallRating}%
            </div>
            <div className="text-xs text-gray-500">
              {analysis.overallRating >= 80 ? 'Expert' : 
               analysis.overallRating >= 60 ? 'Advanced' : 
               analysis.overallRating >= 40 ? 'Intermediate' : 'Beginner'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Strongest Area */}
        <motion.div
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="font-medium text-green-800 dark:text-green-200">
              Strongest Area
            </h4>
          </div>
          <div className="text-lg font-semibold text-green-900 dark:text-green-100">
            {formatSkillName(analysis.strongestArea)}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Keep up the excellent work!
          </div>
        </motion.div>

        {/* Weakest Area */}
        <motion.div
          className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className="font-medium text-red-800 dark:text-red-200">
              Needs Improvement
            </h4>
          </div>
          <div className="text-lg font-semibold text-red-900 dark:text-red-100">
            {formatSkillName(analysis.weakestArea)}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">
            Focus on this area for better results
          </div>
        </motion.div>
      </div>

      {/* Suggestions */}
      <motion.div
        className="mb-6"
        variants={itemVariants}
      >
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Personalized Suggestions
        </h4>
        <div className="space-y-2">
          {analysis.suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              variants={drillVariants}
            >
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {index + 1}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {suggestion}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommended Drills */}
      {showDrills && analysis.recommendedDrills.length > 0 && (
        <motion.div
          variants={itemVariants}
        >
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400" />
            Recommended Drills
          </h4>
          <div className="space-y-2">
            {analysis.recommendedDrills.map((drill, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                variants={drillVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {index + 1}
                  </span>
                </div>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {drill}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Improvement Areas */}
      {analysis.improvementAreas.length > 0 && (
        <motion.div
          className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          variants={itemVariants}
        >
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            🎯 Focus Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.improvementAreas.map((area, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full"
              >
                {formatSkillName(area)}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AISuggestionBox; 