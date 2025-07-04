import React, { useState, useEffect, useRef } from 'react';
import SudokuGrid from '../../components/SudokuGrid';
// import { useSpeedScanStore } from '../../stores/speedScanStore'; // (optional for future)

const CHALLENGE_TIME = 20; // seconds
const CHALLENGE_TYPE = 'Hidden Single';

const getRandomUnit = () => {
  // Return a random row, col, or box index (0-8)
  return Math.floor(Math.random() * 9);
};

const SpeedScan: React.FC = () => {
  const [timer, setTimer] = useState(CHALLENGE_TIME);
  const [activeUnit, setActiveUnit] = useState(getRandomUnit());
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [focusMap, setFocusMap] = useState(Array(9).fill(0)); // For heatmap
  const [challengeActive, setChallengeActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Placeholder puzzle (should use real generator)
  const puzzle = Array(9).fill(0).map(() => Array(9).fill(''));

  useEffect(() => {
    if (challengeActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0) {
      setChallengeActive(false);
      setShowResults(true);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [challengeActive, timer]);

  const startChallenge = () => {
    setTimer(CHALLENGE_TIME);
    setHits(0);
    setMisses(0);
    setFocusMap(Array(9).fill(0));
    setActiveUnit(getRandomUnit());
    setChallengeActive(true);
    setShowResults(false);
  };

  const handleCellClick = (row: number, col: number) => {
    // Only allow clicks in the active unit
    if (row !== activeUnit) return;
    // TODO: Check if correct (Hidden Single)
    setHits(hits + 1);
    setFocusMap((prev) => {
      const updated = [...prev];
      updated[col] += 1;
      return updated;
    });
    // Switch to next unit
    setActiveUnit(getRandomUnit());
  };

  // Metrics
  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
  const avgTime = hits > 0 ? ((CHALLENGE_TIME - timer) / hits).toFixed(2) : '-';

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Speed Scanning Challenge</h1>
      <div className="mb-4">
        <button onClick={startChallenge} className="btn btn-primary">Start Challenge</button>
      </div>
      {/* Timer Bar */}
      <div className="w-full h-3 bg-gray-200 rounded mb-4">
        <div
          className="h-3 bg-blue-500 rounded transition-all duration-200"
          style={{ width: `${(timer / CHALLENGE_TIME) * 100}%` }}
        />
      </div>
      <div className="flex gap-8 mb-6">
        {/* Partial Sudoku Grid: Only show one row */}
        <div>
          <div className="mb-2 font-semibold">Row {activeUnit + 1}</div>
          <div className="grid grid-cols-9 gap-1">
            {[...Array(9)].map((_, col) => (
              <div
                key={col}
                className="w-10 h-10 border flex items-center justify-center bg-white text-lg font-bold cursor-pointer hover:bg-blue-100"
                onClick={() => challengeActive && handleCellClick(activeUnit, col)}
              >
                {puzzle[activeUnit][col]}
              </div>
            ))}
          </div>
        </div>
        {/* Metrics Panel */}
        <div className="flex flex-col gap-2">
          <div>⏱️ Time Left: <span className="font-bold">{timer}s</span></div>
          <div>✅ Hits: <span className="font-bold text-green-600">{hits}</span></div>
          <div>❌ Misses: <span className="font-bold text-red-600">{misses}</span></div>
          <div>🎯 Accuracy: <span className="font-bold">{accuracy}%</span></div>
          <div>⏳ Avg Time/Action: <span className="font-bold">{avgTime}s</span></div>
        </div>
      </div>
      {/* Results/Heatmap */}
      {showResults && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-2">Results</h2>
          <div className="mb-2">Heatmap (focus per column):</div>
          <div className="flex gap-1">
            {focusMap.map((val, idx) => (
              <div
                key={idx}
                className="w-10 h-10 flex items-end justify-center bg-blue-100 border"
                style={{ height: `${40 + val * 10}px`, background: `rgba(59,130,246,${0.2 + val * 0.1})` }}
              >
                {val > 0 ? <span className="text-blue-700 font-bold">{val}</span> : ''}
              </div>
            ))}
          </div>
          {/* Placeholder for history/improvement graph */}
          <div className="mt-6">[History & Improvement Graph Coming Soon]</div>
        </div>
      )}
    </div>
  );
};

export default SpeedScan; 