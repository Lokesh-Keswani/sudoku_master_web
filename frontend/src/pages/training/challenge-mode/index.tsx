import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ChallengeCard from '../../../components/ChallengeCard';
import { 
  Eye, 
  Zap, 
  Brain,
  Trophy,
  Star,
  ArrowLeft
} from 'lucide-react';
import { useChallengeStore } from '../../../store/challengeStore';

const challengeTypes = [
  {
    title: 'Pattern Recognition Challenge',
    description: 'Spot repeating Sudoku number patterns under time pressure. Train your visual processing and pattern recognition skills.',
    challengeType: 'pattern-recognition' as const,
    difficulty: 'medium' as const,
    icon: <Eye className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'hover:border-blue-300'
  },
  {
    title: 'Speed Scanning Challenge',
    description: 'Quickly find numbers or available moves on a grid within a time limit. Improve your scanning speed and accuracy.',
    challengeType: 'speed-scanning' as const,
    difficulty: 'medium' as const,
    icon: <Zap className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'hover:border-green-300'
  },
  {
    title: 'Mental Mapping Challenge',
    description: 'Memorize grid positions, then recall them after hiding the board. Enhance your spatial memory and visualization.',
    challengeType: 'mental-mapping' as const,
    difficulty: 'medium' as const,
    icon: <Brain className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'hover:border-purple-300'
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

const ChallengeModePage: React.FC = () => {
  const router = useRouter();
  const { totalStars, completedChallenges, results } = useChallengeStore();

  const getAverageStars = () => {
    const allResults = Object.values(results).flat();
    if (allResults.length === 0) return 0;
    const totalStars = allResults.reduce((sum, result) => sum + result.stars, 0);
    return Math.round((totalStars / allResults.length) * 10) / 10;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/training')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Training
              </button>
              <h1 className="text-xl font-bold text-gray-800">Challenge Mode</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/game" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Play
                </Link>
                <Link href="/training" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Training
                </Link>
              </div>
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
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-600 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
              Challenge Mode
            </h1>
          </div>
          <p className="text-xl text-gray-800 max-w-3xl mx-auto">
            Test your Sudoku skills with our advanced training challenges. 
            Each challenge focuses on specific cognitive abilities with progressive difficulty and scoring.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Your Challenge Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{completedChallenges}</div>
              <div className="text-gray-800">Challenges Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{totalStars}</div>
              <div className="text-gray-800">Total Stars Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{getAverageStars()}</div>
              <div className="text-gray-800">Average Stars</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Object.values(results).flat().length}
              </div>
              <div className="text-gray-800">Total Attempts</div>
            </div>
          </div>
        </motion.div>

        {/* Challenge Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {challengeTypes.map((challenge, index) => (
            <ChallengeCard
              key={challenge.challengeType}
              title={challenge.title}
              description={challenge.description}
              challengeType={challenge.challengeType}
              difficulty={challenge.difficulty}
              icon={challenge.icon}
              color={challenge.color}
              bgColor={challenge.bgColor}
              borderColor={challenge.borderColor}
            />
          ))}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            How Challenge Mode Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Your Challenge</h3>
              <p className="text-gray-800 text-sm">
                Select from three specialized challenges designed to train different cognitive skills.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete the Task</h3>
              <p className="text-gray-800 text-sm">
                Follow the instructions and complete the challenge within the time limit.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Earn Stars & Progress</h3>
              <p className="text-gray-800 text-sm">
                Get scored based on accuracy and speed, earning up to 3 stars per challenge.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Star className="w-5 h-5 mr-2 text-blue-600" />
            Pro Tips for Success
          </h3>
          <ul className="text-gray-800 text-sm space-y-2">
            <li>• <strong>Pattern Recognition:</strong> Look for repeating numbers, diagonals, and geometric patterns</li>
            <li>• <strong>Speed Scanning:</strong> Use systematic scanning techniques - row by row, then column by column</li>
            <li>• <strong>Mental Mapping:</strong> Create mental landmarks and associate numbers with positions</li>
            <li>• <strong>General:</strong> Practice regularly to improve your speed and accuracy over time</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default ChallengeModePage; 