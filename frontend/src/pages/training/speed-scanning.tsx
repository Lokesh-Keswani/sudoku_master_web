import React, { useState, useEffect } from 'react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TECHNIQUES = ['Hidden Single', 'Naked Single', 'Locked Candidates'];
const TIMES = [20, 30, 45];

const SpeedScanningPage: React.FC = () => {
  const [difficulty, setDifficulty] = useState('Easy');
  const [technique, setTechnique] = useState('Hidden Single');
  const [timeLimit, setTimeLimit] = useState(20);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render only static placeholder, matching SSR HTML
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl p-6">
          <div className="flex flex-col gap-6 items-center">
            <h1 className="text-3xl font-bold mb-2">Speed Scanning Trainer</h1>
            <div className="h-8 w-full bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Only use the store after mount
  const { challengeActive, startChallenge, stats } = require('../../store/speedTrainerStore').useSpeedTrainerStore();
  const SpeedTrainerGrid = require('../../components/SpeedTrainerGrid').default;
  const TimerBar = require('../../components/TimerBar').default;
  const MetricsSummary = require('../../components/MetricsSummary').default;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl p-6">
        {!challengeActive && !stats && (
          <div className="flex flex-col gap-6 items-center">
            <h1 className="text-3xl font-bold mb-2">Speed Scanning Trainer</h1>
            <div className="flex gap-4">
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="px-4 py-2 rounded bg-gray-800">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={technique} onChange={e => setTechnique(e.target.value)} className="px-4 py-2 rounded bg-gray-800">
                {TECHNIQUES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} className="px-4 py-2 rounded bg-gray-800">
                {TIMES.map(t => <option key={t} value={t}>{t}s</option>)}
              </select>
            </div>
            <button onClick={() => startChallenge(difficulty, technique, timeLimit)} className="mt-4 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-700 transition-all">Start Challenge</button>
          </div>
        )}
        {challengeActive && (
          <>
            <TimerBar />
            <SpeedTrainerGrid />
          </>
        )}
        {stats && <MetricsSummary stats={stats} />}
      </div>
    </div>
  );
};

export default SpeedScanningPage; 