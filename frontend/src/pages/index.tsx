import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Brain, Play, Trophy, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { GuestModeButton } from '../components/GuestModeButton';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleTrainingClick = () => {
    if (user) {
      router.push('/training');
    } else {
      router.push('/login?redirect=/training');
    }
  };

  const handlePlayClick = () => {
    if (user) {
      router.push('/game');
    } else {
      router.push('/login?redirect=/game');
    }
  };

  const handleGuestStart = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Training Button */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Sudoku Master</h1>
            </div>
            
            {/* Training Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTrainingClick}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Brain className="w-5 h-5" />
              Training
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Master Sudoku
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Challenge your mind with our intelligent Sudoku platform. Play, learn, and improve your skills with advanced training modules.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayClick}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 text-lg"
            >
              <Play className="w-6 h-6" />
              Start Playing
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTrainingClick}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 text-lg"
            >
              <Brain className="w-6 h-6" />
              Start Training
            </motion.button>
          </div>

          {/* Guest Mode Option */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-500">
                    or
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <GuestModeButton onGuestStart={handleGuestStart} />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {/* Feature 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center"
          >
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Play & Solve</h3>
            <p className="text-gray-600">
              Challenge yourself with puzzles of varying difficulty levels and track your progress.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center"
          >
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Training</h3>
            <p className="text-gray-600">
              Improve your skills with our comprehensive training modules and AI-powered suggestions.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center"
          >
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your improvement with detailed statistics and achievement tracking.
            </p>
          </motion.div>
        </motion.div>

        {/* Training Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to Level Up?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our training modules are designed to systematically improve your Sudoku skills. 
              From basic techniques to advanced strategies, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { title: 'Techniques Trainer', icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600' },
              { title: 'Pattern Recognition', icon: <Brain className="w-6 h-6" />, color: 'bg-green-100 text-green-600' },
              { title: 'Speed Scanning', icon: <Trophy className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600' },
            ].map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${module.color}`}>
                  {module.icon}
                </div>
                <span className="font-medium text-gray-700">{module.title}</span>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTrainingClick}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
            >
              <Brain className="w-6 h-6" />
              Explore Training Modules
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage; 