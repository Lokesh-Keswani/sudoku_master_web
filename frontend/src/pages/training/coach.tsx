import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { 
  Flame, 
  Download, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Clock, 
  Trophy,
  ArrowLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAICoachStore } from '../../store/aiCoachStore';
import { useTrainingStore } from '../../stores/trainingStore';
import SkillRadarChart from '../../components/SkillRadarChart';
import AISuggestionBox from '../../components/AISuggestionBox';
import { generateTrainingReport, TrainingReportData } from '../../utils/reportGenerator';

const AICoachPage: React.FC = () => {
  const router = useRouter();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showNoDataMessage, setShowNoDataMessage] = useState(false);
  
  const {
    skillRatings,
    streakCount,
    currentAnalysis,
    getStreakStatus,
    getPerformanceStats,
    generateAnalysis,
    completedDrills,
  } = useAICoachStore();

  const { getOverallProgress } = useTrainingStore();

  // Check if user has completed any drills
  const hasTrainingData = completedDrills.length > 0;
  const overallProgress = getOverallProgress();

  useEffect(() => {
    // Generate initial analysis if not exists
    if (!currentAnalysis && hasTrainingData) {
      generateAnalysis();
    }

    // Show no data message after a delay if no training data
    if (!hasTrainingData) {
      const timer = setTimeout(() => setShowNoDataMessage(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentAnalysis, hasTrainingData, generateAnalysis]);

  const handleDownloadReport = async () => {
    if (!currentAnalysis) return;

    setIsGeneratingReport(true);
    try {
      const performanceStats = getPerformanceStats();
      const streakStatus = getStreakStatus();

      const reportData: TrainingReportData = {
        playerName: 'Sudoku Player', // Could be enhanced with actual user name
        reportDate: new Date().toLocaleDateString(),
        totalHoursTrained: overallProgress.totalTimeSpent,
        streak: streakStatus.current,
        totalDrillsCompleted: performanceStats.totalDrills,
        skillRatings,
        analysis: currentAnalysis,
        performanceStats,
      };

      await generateTrainingReport(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRefreshAnalysis = () => {
    generateAnalysis();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
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

  // No training data state
  if (!hasTrainingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            className="flex items-center gap-4 mb-8"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <button
              onClick={() => router.push('/training')}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Training Coach
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your personalized training companion
              </p>
            </div>
          </motion.div>

          {/* No Data Message */}
          <motion.div
            className="max-w-2xl mx-auto text-center"
            variants={itemVariants}
            initial="hidden"
            animate={showNoDataMessage ? "visible" : "hidden"}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Training Data Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Complete at least one training session to unlock your AI Coach suggestions and personalized recommendations.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/training')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Start Training
                </button>
                <p className="text-sm text-gray-500">
                  Try any training module to begin building your skill profile
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            variants={itemVariants}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/training')}
                className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AI Training Coach
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your personalized training companion
                </p>
              </div>
            </div>
            <button
              onClick={handleRefreshAnalysis}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh Analysis"
            >
              <RefreshCw className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </motion.div>

          {/* Streak Display */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Flame className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {streakCount}-Day Training Streak!
                    </h2>
                    <p className="text-orange-100">
                      Keep the momentum going!
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{streakCount}</div>
                  <div className="text-orange-100">days</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Skill Radar Chart */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Skill Assessment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your current skill levels across all techniques
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <SkillRadarChart
                  skillRatings={skillRatings}
                  height={400}
                  width={400}
                  animate={true}
                />
              </div>
            </motion.div>

            {/* AI Suggestions */}
            <motion.div
              variants={itemVariants}
            >
              {currentAnalysis && (
                <AISuggestionBox
                  analysis={currentAnalysis}
                  showDrills={true}
                  animate={true}
                />
              )}
            </motion.div>
          </div>

          {/* Performance Summary */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Performance Summary
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getPerformanceStats().totalDrills}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Drills
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getPerformanceStats().averageSuccessRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Success Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(overallProgress.totalTimeSpent / 60000)}m
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Time Trained
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getPerformanceStats().mostPlayedCategory}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Favorite Category
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Report Download */}
          <motion.div
            className="text-center"
            variants={itemVariants}
          >
            <button
              onClick={handleDownloadReport}
              disabled={isGeneratingReport || !currentAnalysis}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {isGeneratingReport ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download My Training Report.pdf
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Get a detailed PDF report with your progress, strengths, and personalized recommendations
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AICoachPage; 