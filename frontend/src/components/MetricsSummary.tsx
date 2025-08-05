import React from 'react';
import { motion } from 'framer-motion';
// import { ResponsiveContainer, ScatterChart, XAxis, YAxis, ZAxis, Scatter, Tooltip } from 'recharts';
import { Trophy, Target, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';

type Metrics = {
  avgTime: number;
  accuracy: number;
  missed: number;
  hits: number;
  misses: number;
  heatmap: number[][];
};

type MetricsSummaryProps = {
  stats: Metrics;
  onPlayAgain: () => void;
  onReviewSession: () => void;
};

const MetricsSummary: React.FC<MetricsSummaryProps> = ({ stats, onPlayAgain, onReviewSession }) => {
  // Prepare data for heatmap - Temporarily disabled
  // const heatmapData = [];
  // for (let r = 0; r < 9; r++) {
  //   for (let c = 0; c < 9; c++) {
  //     if (stats.heatmap[r][c] > 0) {
  //     heatmapData.push({ x: c + 1, y: r + 1, value: stats.heatmap[r][c] });
  //   }
  //   }
  //   }

  const getPerformanceMessage = () => {
    if (stats.accuracy >= 90) return "🎉 Outstanding! You're a speed scanning master!";
    if (stats.accuracy >= 75) return "🌟 Excellent performance! Keep up the great work!";
    if (stats.accuracy >= 60) return "👍 Good job! You're improving steadily!";
    return "💪 Keep practicing! Every attempt makes you faster!";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gray-800">Session Complete!</h2>
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-lg text-gray-600">{getPerformanceMessage()}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center p-4 bg-blue-50 rounded-xl"
        >
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{stats.avgTime}ms</div>
          <div className="text-gray-600 text-sm">Avg Time</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-4 bg-green-50 rounded-xl"
        >
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{stats.accuracy}%</div>
          <div className="text-gray-600 text-sm">Accuracy</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center p-4 bg-purple-50 rounded-xl"
        >
          <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{stats.hits}</div>
          <div className="text-gray-600 text-sm">Hits</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center p-4 bg-red-50 rounded-xl"
        >
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">{stats.misses}</div>
          <div className="text-gray-600 text-sm">Misses</div>
        </motion.div>
      </div>

      {/* Heatmap - Temporarily disabled for production build */}
      {/* <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Click Heatmap
        </h3>
        <div className="flex justify-center">
          <div className="bg-gray-50 rounded-xl p-4">
            <ResponsiveContainer width={400} height={400}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <XAxis type="number" dataKey="x" name="Col" domain={[1, 9]} hide />
            <YAxis type="number" dataKey="y" name="Row" domain={[1, 9]} hide />
                <ZAxis type="number" dataKey="value" range={[50, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                />
            <Scatter data={heatmapData} fill="#3b82f6" shape="square" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
        </div>
        <p className="text-center text-gray-600 text-sm mt-2">
          Brighter areas show where you clicked most frequently
        </p>
      </div> */}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgain}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Zap className="w-5 h-5 inline mr-2" />
          Play Again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReviewSession}
          className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Review Session
        </motion.button>
    </div>
    </motion.div>
  );
};

export default MetricsSummary; 