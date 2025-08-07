import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TrainingCard from '../components/TrainingCard';
import { ProtectedRoute } from '../components/ProtectedRoute';
import ThemeToggle from '../components/ThemeToggle';
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

const trainingModules = [
  {
    title: 'Techniques Trainer',
    description: 'Master advanced solving techniques like X-Wing, Swordfish, and XY-Chains',
    trainingTarget: 'Pattern Recognition & Logic',
    howItWorks: 'Interactive tutorials with step-by-step guidance through complex solving methods',
    route: '/training/techniques',
    icon: <Puzzle className="w-8 h-8" />
  },
  {
    title: 'Pattern Recognition',
    description: 'Train your brain to spot common patterns and number relationships',
    trainingTarget: 'Visual Processing & Memory',
    howItWorks: 'Timed exercises that gradually increase in complexity to improve pattern recognition speed',
    route: '/training/patterns',
    icon: <Search className="w-8 h-8" />
  },
  {
    title: 'Speed Scanning',
    description: 'Improve your scanning speed and number placement efficiency',
    trainingTarget: 'Speed & Accuracy',
    howItWorks: 'Rapid-fire puzzles with time pressure to enhance scanning and decision-making speed',
    route: '/training/speed-scanning',
    icon: <Zap className="w-8 h-8" />
  },
  {
    title: 'Mental Mapping',
    description: 'Train your spatial memory by memorizing and recalling Sudoku moves',
    trainingTarget: 'Spatial Memory & Visualization',
    howItWorks: 'Memorize highlighted moves for 10 seconds, then recall their exact positions and numbers',
    route: '/training/mental-mapping',
    icon: <Map className="w-8 h-8" />
  },
  {
    title: 'AI Coach Suggestions',
    description: 'Get personalized hints and strategy recommendations',
    trainingTarget: 'Strategic Thinking',
    howItWorks: 'AI analyzes your solving patterns and provides targeted suggestions for improvement',
    route: '/training/coach',
    icon: <Bot className="w-8 h-8" />
  },
  {
    title: 'Challenge Mode',
    description: 'Test your skills against increasingly difficult puzzles',
    trainingTarget: 'Endurance & Problem Solving',
    howItWorks: 'Progressive difficulty levels with performance tracking and achievements',
    route: '/training/challenge-mode',
    icon: <Trophy className="w-8 h-8" />
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const TrainingPage: React.FC = () => {
  const router = useRouter();
  const { theme } = useThemeStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Sudoku Master</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Home
                </Link>
                <Link href="/game" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Play
                </Link>
                <Link href="/training" className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Training
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4 transition-colors">
            Training Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors">
            Master the art of Sudoku with our comprehensive training modules designed to improve your skills systematically.
          </p>
        </motion.div>

        {/* Training Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {trainingModules.map((module, index) => (
            <TrainingCard
              key={module.title}
              title={module.title}
              description={module.description}
              trainingTarget={module.trainingTarget}
              howItWorks={module.howItWorks}
              route={module.route}
              icon={module.icon}
            />
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center transition-colors">
            Your Training Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</div>
              <div className="text-gray-600 dark:text-gray-300">Techniques Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">156</div>
              <div className="text-gray-600 dark:text-gray-300">Puzzles Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">8.5</div>
              <div className="text-gray-600 dark:text-gray-300">Average Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default TrainingPage; 