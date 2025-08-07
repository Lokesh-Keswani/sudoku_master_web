import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft,
  Star,
  Trophy,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import ChallengeTimerBar from '../../../components/ChallengeTimerBar';
import { useChallengeStore, ChallengeType, DifficultyLevel } from '../../../store/challengeStore';

const ChallengeSessionPage: React.FC = () => {
  const router = useRouter();
  const { challengeType, difficulty } = router.query;
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);

  const {
    currentSession,
    startChallenge,
    endChallenge,
    resetChallenge,
    selectCell,
    tick
  } = useChallengeStore();

  // Start challenge when component mounts
  useEffect(() => {
    if (challengeType && difficulty && !currentSession) {
      startChallenge(
        challengeType as ChallengeType,
        difficulty as DifficultyLevel
      );
    }
  }, [challengeType, difficulty, currentSession, startChallenge]);

  // Timer effect
  useEffect(() => {
    if (!currentSession?.isActive || isPaused || showInstructions) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession?.isActive, isPaused, showInstructions, tick]);

  // Check if challenge ended
  useEffect(() => {
    if (currentSession && !currentSession.isActive && currentSession.timer === 0) {
      const timeUsed = currentSession.timeLimit - currentSession.timer;
      const accuracy = currentSession.correctAnswers + currentSession.mistakes > 0 
        ? (currentSession.correctAnswers / (currentSession.correctAnswers + currentSession.mistakes)) * 100 
        : 0;
      
      const stars = Math.min(3, Math.floor(accuracy / 33.33) + 1);
      const finalScore = Math.round((accuracy * 0.7 + (timeUsed / currentSession.timeLimit) * 0.3) * 100);

      const result = {
        timeTaken: timeUsed,
        correctAnswers: currentSession.correctAnswers,
        mistakes: currentSession.mistakes,
        stars,
        score: finalScore
      };

      setCurrentResult(result);
      setShowResults(true);
    }
  }, [currentSession]);

  const handleStartChallenge = () => {
    setShowInstructions(false);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!currentSession?.isActive || isPaused || showInstructions) return;
    selectCell(row, col);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleRetry = () => {
    resetChallenge();
    setShowResults(false);
    setCurrentResult(null);
    setShowInstructions(true);
    if (challengeType && difficulty) {
      startChallenge(
        challengeType as ChallengeType,
        difficulty as DifficultyLevel
      );
    }
  };

  const handleBackToList = () => {
    resetChallenge();
    router.push('/training/challenge-mode');
  };

  const getChallengeTitle = () => {
    switch (challengeType) {
      case 'pattern-recognition':
        return 'Pattern Recognition Challenge';
      case 'speed-scanning':
        return 'Speed Scanning Challenge';
      case 'mental-mapping':
        return 'Mental Mapping Challenge';
      default:
        return 'Challenge';
    }
  };

  const getChallengeInstructions = () => {
    switch (challengeType) {
      case 'pattern-recognition':
        return 'Click on cells that match the hidden pattern. Look for repeating numbers, diagonals, or geometric patterns!';
      case 'speed-scanning':
        return `Find all cells containing the number ${currentSession?.targetNumber}. Click on them as quickly as possible!`;
      case 'mental-mapping':
        return 'Memorize the grid for 10 seconds, then click on cells where you remember seeing numbers!';
      default:
        return 'Complete the challenge within the time limit!';
    }
  };

  const renderGrid = () => {
    if (!currentSession) return null;

    const grid = Array(9).fill(0).map(() => Array(9).fill(0));
    
    // Populate grid based on challenge type
    if (currentSession.type === 'speed-scanning' && currentSession.targetNumber) {
      // Generate a grid with the target number in random positions
      const numTargets = currentSession.difficulty === 'easy' ? 8 : 
                        currentSession.difficulty === 'medium' ? 12 : 16;
      
      for (let i = 0; i < numTargets; i++) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        grid[row][col] = currentSession.targetNumber;
      }
      
      // Fill other cells with random numbers
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            grid[row][col] = Math.floor(Math.random() * 9) + 1;
          }
        }
      }
    } else if (currentSession.type === 'mental-mapping' && currentSession.memorizedGrid) {
      // Show the memorized grid
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          grid[row][col] = currentSession.memorizedGrid![row][col];
        }
      }
    }

    return (
      <div className="grid grid-cols-9 gap-1 bg-gray-300 p-2 rounded-lg">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = currentSession.selectedCells.some(
              cell => cell.row === rowIndex && cell.col === colIndex
            );
            
            return (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  w-12 h-12 md:w-16 md:h-16
                  flex items-center justify-center
                  text-lg font-bold rounded
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${cell === 0 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                  }
                  ${isSelected ? 'bg-green-200 text-green-800' : ''}
                  ${currentSession.type === 'speed-scanning' && cell === currentSession.targetNumber && !isSelected
                    ? 'bg-blue-100 text-blue-800' : ''
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!currentSession.isActive || isPaused || showInstructions}
              >
                {cell > 0 ? cell : ''}
              </motion.button>
            );
          })
        )}
      </div>
    );
  };

  const renderResults = () => {
    if (!currentResult) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Challenge Complete!</h2>
            
            {/* Stars */}
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${
                    star <= currentResult.stars ? 'text-yellow-500 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Time Taken:</span>
                <span className="font-semibold text-gray-800">
                  {Math.floor(currentResult.timeTaken / 60)}:{(currentResult.timeTaken % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Correct Answers:</span>
                <span className="font-semibold text-green-600">{currentResult.correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mistakes:</span>
                <span className="font-semibold text-red-600">{currentResult.mistakes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final Score:</span>
                <span className="font-semibold text-blue-600">{currentResult.score}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handleRetry}
                className="flex-1 bg-blue-300 hover:bg-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Retry Challenge
              </button>
              <button
                onClick={handleBackToList}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Timer Bar */}
      <ChallengeTimerBar
        currentTime={currentSession.timer}
        totalTime={currentSession.timeLimit}
        isActive={currentSession.isActive && !isPaused && !showInstructions}
        isWarning={currentSession.timer < 10}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/training/challenge-mode')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Challenges
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">{getChallengeTitle()}</h1>
            <p className="text-gray-600 capitalize">{currentSession.difficulty} Level</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{currentSession.correctAnswers}</div>
              <div className="text-xs text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{currentSession.mistakes}</div>
              <div className="text-xs text-gray-600">Mistakes</div>
            </div>
            <button
              onClick={handlePauseToggle}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Instructions Modal */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                <div className="text-center">
                  <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Challenge Instructions</h2>
                  <p className="text-gray-800 mb-6">{getChallengeInstructions()}</p>
                  
                  <div className="space-y-3 mb-6 text-left">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">Time Limit: {Math.floor(currentSession.timeLimit / 60)}:{(currentSession.timeLimit % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span className="text-gray-800">Earn up to 3 stars based on accuracy and speed</span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartChallenge}
                    className="w-full bg-blue-300 hover:bg-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                  >
                    Start Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Challenge Grid */}
        <div className="flex justify-center mb-8">
          {renderGrid()}
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {currentSession?.feedback.show && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-40 flex items-center space-x-2 ${
                currentSession.feedback.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : currentSession.feedback.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {currentSession.feedback.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : currentSession.feedback.type === 'error' ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{currentSession.feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
            >
              <div className="bg-white rounded-2xl p-8 text-center">
                <Pause className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Challenge Paused</h2>
                <p className="text-gray-600 mb-6">Click the play button to resume</p>
                <button
                  onClick={handlePauseToggle}
                  className="bg-blue-300 hover:bg-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Resume
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Modal */}
        <AnimatePresence>
          {showResults && renderResults()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChallengeSessionPage; 