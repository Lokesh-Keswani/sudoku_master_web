import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Play, Download } from 'lucide-react';
import SolveReportModal from '../components/SolveReportModal';

const SolutionReportDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  // Sample puzzle data for demo
  const sampleInitialGrid = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];

  const sampleSolution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];

  const sampleSolvingTime = 180000; // 3 minutes
  const sampleDifficulty = 'medium';
  const sampleHintsUsed = 1;
  const sampleCheckCount = 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Solution Report Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the advanced solution report module with step-by-step analysis, 
            technique explanations, and interactive features.
          </p>
        </motion.div>

        {/* Demo Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Sample Puzzle
          </h2>
          
          <div className="flex justify-center mb-6">
            <div className="grid grid-cols-9 gap-1 bg-gray-800 p-2 rounded-lg">
              {sampleInitialGrid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-12 h-12 flex items-center justify-center text-lg font-bold ${
                      cell === 0 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-white text-gray-800'
                    } ${
                      (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-gray-800' : ''
                    } ${
                      (colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-gray-800' : ''
                    }`}
                  >
                    {cell === 0 ? '' : cell}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">Medium</div>
              <div className="text-sm text-blue-600">Difficulty</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">3:00</div>
              <div className="text-sm text-green-600">Solving Time</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">1</div>
              <div className="text-sm text-purple-600">Hints Used</div>
            </div>
          </div>
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive Player</h3>
            <p className="text-gray-600 text-sm">
              Step through the solution with animated transitions and visual feedback.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Technique Analysis</h3>
            <p className="text-gray-600 text-sm">
              Detailed explanations of each solving technique with Hodoku references.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Reports</h3>
            <p className="text-gray-600 text-sm">
              Generate comprehensive PDF reports with visual diagrams and statistics.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Speech Narration</h3>
            <p className="text-gray-600 text-sm">
              Listen to step-by-step explanations using Web Speech API.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Achievement Badges</h3>
            <p className="text-gray-600 text-sm">
              Earn badges for speed, technique mastery, and solving efficiency.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Stats</h3>
            <p className="text-gray-600 text-sm">
              Detailed statistics and performance metrics for improvement tracking.
            </p>
          </div>
        </motion.div>

        {/* Demo Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
          >
            <FileText size={20} />
            Launch Solution Report Demo
          </button>
        </motion.div>

        {/* Solution Report Modal */}
        <SolveReportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          initialGrid={sampleInitialGrid}
          solution={sampleSolution}
          solvingTime={sampleSolvingTime}
          difficulty={sampleDifficulty}
          hintsUsed={sampleHintsUsed}
          checkCount={sampleCheckCount}
        />
      </div>
    </div>
  );
};

export default SolutionReportDemo; 