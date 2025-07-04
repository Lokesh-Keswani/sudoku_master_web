import React, { useState, useRef, useEffect } from 'react';
import { usePatternsStore } from '../../store/patternsStore';
import PatternFlashcard from '../../components/PatternFlashcard';
import TimerBar from '../../components/TimerBar';
import StatsSummary from '../../components/StatsSummary';

const MODES = ['Flashcard', 'Timed'];
const LEVELS = ['Easy', 'Medium', 'Hard'];
const TIMED_DURATION = 60;

const PatternsPage: React.FC = () => {
  const [mode, setMode] = useState('Flashcard');
  const [level, setLevel] = useState('Easy');
  const [timer, setTimer] = useState(TIMED_DURATION);
  const [timedStats, setTimedStats] = useState({ correct: 0, total: 0, accuracy: 0, patternsPerMin: 0 });
  const [timedActive, setTimedActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { sessionActive, stats, startSession, endSession } = usePatternsStore();

  // Handle timer for Timed mode
  useEffect(() => {
    if (mode === 'Timed' && sessionActive && timedActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && timedActive) {
      handleTimedEnd();
    }
    return () => timerRef.current && clearTimeout(timerRef.current!);
  }, [mode, sessionActive, timedActive, timer]);

  const handleTimedStart = () => {
    setTimedStats({ correct: 0, total: 0, accuracy: 0, patternsPerMin: 0 });
    setTimer(TIMED_DURATION);
    setTimedActive(true);
    startSession('Timed', level);
  };

  const handleTimedAnswer = (correct: boolean) => {
    setTimedStats((prev) => {
      const total = prev.total + 1;
      const correctCount = prev.correct + (correct ? 1 : 0);
      return {
        correct: correctCount,
        total,
        accuracy: Math.round((correctCount / total) * 100),
        patternsPerMin: Math.round((correctCount / (TIMED_DURATION - timer + 1)) * 60),
      };
    });
  };

  const handleTimedEnd = () => {
    setTimedActive(false);
    endSession({ ...timedStats, total: timedStats.total, accuracy: timedStats.accuracy, patternsPerMin: timedStats.patternsPerMin });
  };

  const handleNextPattern = () => {
    // Just a placeholder to trigger next pattern in PatternFlashcard
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="w-full max-w-xl bg-white bg-opacity-80 backdrop-blur rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {MODES.map(m => (
              <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{m}</button>
            ))}
          </div>
          <select value={level} onChange={e => setLevel(e.target.value)} className="ml-4 px-3 py-2 rounded-lg bg-gray-100">
            {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
        </div>
        {mode === 'Timed' && timedActive && <TimerBar time={timer} total={TIMED_DURATION} />}
        {mode === 'Timed' && !timedActive && !stats && (
          <button onClick={handleTimedStart} className="w-full mt-8 py-3 rounded-xl bg-blue-500 text-white font-bold text-lg shadow-lg hover:bg-blue-600 transition-all">Start Timed Challenge</button>
        )}
        {mode === 'Timed' && timedActive && (
          <PatternFlashcard mode={mode} level={level} timed onAnswer={handleTimedAnswer} nextPattern={handleNextPattern} />
        )}
        {mode === 'Flashcard' && sessionActive && (
          <PatternFlashcard mode={mode} level={level} />
        )}
        {mode === 'Flashcard' && !sessionActive && !stats && (
          <button onClick={() => startSession('Flashcard', level)} className="w-full mt-8 py-3 rounded-xl bg-blue-500 text-white font-bold text-lg shadow-lg hover:bg-blue-600 transition-all">Start Training</button>
        )}
        {stats && <StatsSummary stats={{ ...stats, total: stats.total || timedStats.total || 0 }} />}
      </div>
    </div>
  );
};

export default PatternsPage; 