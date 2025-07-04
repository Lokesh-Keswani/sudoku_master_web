import React from 'react';
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, ZAxis, Scatter, Tooltip } from 'recharts';

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
};

const MetricsSummary: React.FC<MetricsSummaryProps> = ({ stats }) => {
  // Prepare data for heatmap
  const heatmapData = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      heatmapData.push({ x: c + 1, y: r + 1, value: stats.heatmap[r][c] });
    }
  }

  return (
    <div className="mt-8 p-4 bg-gray-900 rounded-xl shadow-lg text-white">
      <div className="font-bold text-lg mb-2">Session Summary</div>
      <div>Avg Time/Action: {stats.avgTime} ms</div>
      <div>Accuracy: {stats.accuracy}%</div>
      <div>Missed Patterns: {stats.missed}</div>
      <div>Hits: {stats.hits} | Misses: {stats.misses}</div>
      <div className="mt-6 mb-2 font-semibold">Heatmap of Clicks</div>
      <div className="w-full flex justify-center">
        <ResponsiveContainer width={300} height={300}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <XAxis type="number" dataKey="x" name="Col" domain={[1, 9]} hide />
            <YAxis type="number" dataKey="y" name="Row" domain={[1, 9]} hide />
            <ZAxis type="number" dataKey="value" range={[0, 400]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={heatmapData} fill="#3b82f6" shape="square" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-4">
        <button className="px-6 py-2 rounded-lg bg-blue-600 font-bold hover:bg-blue-700 transition-all">Play Again</button>
        <button className="px-6 py-2 rounded-lg bg-gray-700 font-bold hover:bg-gray-800 transition-all">Review Session</button>
      </div>
    </div>
  );
};

export default MetricsSummary; 