import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { patterns } from '../data/patterns';

type PatternFlashcardProps = {
  mode: string;
  level: string;
  onAnswer?: (correct: boolean) => void;
  timed?: boolean;
  nextPattern?: () => void;
};

const PatternFlashcard: React.FC<PatternFlashcardProps> = ({ mode, level, onAnswer, timed, nextPattern }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Filter patterns by level
  const filtered = patterns.filter(p => {
    if (level === 'Easy') return ['Naked Single', 'Hidden Single', 'Naked Pair'].includes(p.correctAnswer);
    if (level === 'Medium') return ['X-Wing', 'Locked Candidates', 'Hidden Pair'].includes(p.correctAnswer);
    if (level === 'Hard') return ['XY-Wing', 'Chains', 'Swordfish'].includes(p.correctAnswer);
    return true;
  });
  const pattern = filtered[current] || filtered[0];

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    setImgError(false);
  }, [current, level]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === pattern.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowExplanation(true);
    if (onAnswer) onAnswer(isCorrect);
    if (timed && nextPattern) {
      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
        setShowExplanation(false);
        setImgError(false);
        nextPattern();
      }, 900);
    }
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % filtered.length);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur rounded-2xl shadow-xl p-6 mt-6 w-full">
      <div className="w-64 h-40 bg-gray-200 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
        {!imgError ? (
          <img
            src={pattern.image}
            alt="Pattern"
            className="object-contain w-full h-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-gray-400">Image not available</span>
        )}
      </div>
      <div className="text-lg font-semibold mb-2">{pattern.question}</div>
      <div className="grid grid-cols-2 gap-3 w-full mb-4">
        {pattern.options.map((option) => (
          <motion.button
            key={option}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => handleSelect(option)}
            className={`py-2 rounded-lg font-medium transition-all border-2
              ${selected === option
                ? feedback === 'correct' && option === pattern.correctAnswer
                  ? 'bg-green-100 border-green-500 text-green-700 animate-pulse'
                  : feedback === 'incorrect' && option === selected
                  ? 'bg-red-100 border-red-500 text-red-700 animate-shake'
                  : 'bg-gray-100 border-blue-300'
                : 'bg-gray-100 border-transparent hover:bg-blue-100'}
            `}
            disabled={!!selected}
          >
            {option}
          </motion.button>
        ))}
      </div>
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 text-center font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}
        >
          {feedback === 'correct' ? 'Correct!' : 'Incorrect.'}
          <div className="text-gray-700 font-normal mt-1">{pattern.explanation}</div>
        </motion.div>
      )}
      {!timed && (
        <button
          onClick={handleNext}
          className="mt-4 px-6 py-2 rounded-lg bg-blue-500 text-white font-bold shadow-lg hover:bg-blue-600 transition-all"
          disabled={!selected}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default PatternFlashcard; 