import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  FastForward, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SolutionStep, SolutionPlayerState } from '../types/solutionReport';
import { getTechniqueById, getTechniqueColor } from '../data/enhancedTechniques';
import { createSpeechExplanation, SpeechExplanation } from '../utils/SpeechExplanation';

interface SolutionPlayerProps {
  steps: SolutionStep[];
  currentGrid: number[][];
  onStepChange: (stepIndex: number) => void;
  onGridUpdate: (grid: number[][]) => void;
  className?: string;
}

const SolutionPlayer: React.FC<SolutionPlayerProps> = ({
  steps,
  currentGrid,
  onStepChange,
  onGridUpdate,
  className = ''
}) => {
  const [playerState, setPlayerState] = useState<SolutionPlayerState>({
    currentStep: 0,
    isPlaying: false,
    isFastForward: false,
    playbackSpeed: 1,
    autoPlay: false,
    showExplanations: true,
    showTechniqueDetails: false
  });

  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const speechRef = useRef<SpeechExplanation | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize speech explanation
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechRef.current = createSpeechExplanation({
        enabled: speechEnabled,
        rate: 1.0,
        pitch: 1.0,
        language: 'en-US'
      });

      speechRef.current.setSteps(steps);
      speechRef.current.setCallbacks(
        (stepIndex) => {
          setPlayerState(prev => ({ ...prev, currentStep: stepIndex }));
          onStepChange(stepIndex);
          updateGridToStep(stepIndex);
        },
        () => {
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        }
      );
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
      if (speechRef.current) {
        speechRef.current.stop();
      }
    };
  }, [steps, speechEnabled]);

  useEffect(() => {
    if (speechRef.current) {
      speechRef.current.setSteps(steps);
    }
  }, [steps]);

  const updateGridToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      const step = steps[stepIndex];
      onGridUpdate(step.gridState);
    }
  };

  const playStep = async (stepIndex: number) => {
    setPlayerState(prev => ({ ...prev, currentStep: stepIndex }));
    onStepChange(stepIndex);
    updateGridToStep(stepIndex);

    if (speechRef.current && speechEnabled) {
      await speechRef.current.playStep(stepIndex);
    }
  };

  const playAll = async () => {
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
    
    if (speechRef.current && speechEnabled) {
      await speechRef.current.playAllSteps();
    } else {
      // Manual playback without speech
      for (let i = playerState.currentStep; i < steps.length; i++) {
        if (!playerState.isPlaying) break;
        
        setPlayerState(prev => ({ ...prev, currentStep: i }));
        onStepChange(i);
        updateGridToStep(i);
        
        await new Promise(resolve => 
          setTimeout(resolve, 2000 / playerState.playbackSpeed)
        );
      }
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const pause = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    if (speechRef.current) {
      speechRef.current.pause();
    }
  };

  const stop = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
    if (speechRef.current) {
      speechRef.current.stop();
    }
    onStepChange(0);
    updateGridToStep(0);
  };

  const fastForward = () => {
    setPlayerState(prev => ({ ...prev, isFastForward: true }));
    const targetStep = Math.min(playerState.currentStep + 5, steps.length - 1);
    playStep(targetStep);
    setTimeout(() => {
      setPlayerState(prev => ({ ...prev, isFastForward: false }));
    }, 500);
  };

  const nextStep = () => {
    if (playerState.currentStep < steps.length - 1) {
      playStep(playerState.currentStep + 1);
    }
  };

  const prevStep = () => {
    if (playerState.currentStep > 0) {
      playStep(playerState.currentStep - 1);
    }
  };

  const toggleStepExpansion = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleSpeech = () => {
    const newSpeechEnabled = !speechEnabled;
    setSpeechEnabled(newSpeechEnabled);
    if (speechRef.current) {
      speechRef.current.setOptions({ enabled: newSpeechEnabled });
    }
  };

  const getTechniqueInfo = (step: SolutionStep) => {
    return getTechniqueById(step.techniqueId);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Solution Player
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Step {playerState.currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-lg transition-colors ${
                speechEnabled 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={speechEnabled ? 'Disable Speech' : 'Enable Speech'}
            >
              {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((playerState.currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={stop}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Stop"
          >
            <SkipBack size={16} />
          </button>
          
          <button
            onClick={prevStep}
            disabled={playerState.currentStep === 0}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Previous Step"
          >
            <SkipBack size={16} />
          </button>

          {playerState.isPlaying ? (
            <button
              onClick={pause}
              className="p-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Pause"
            >
              <Pause size={20} />
            </button>
          ) : (
            <button
              onClick={playAll}
              className="p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              title="Play All"
            >
              <Play size={20} />
            </button>
          )}

          <button
            onClick={nextStep}
            disabled={playerState.currentStep === steps.length - 1}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Next Step"
          >
            <SkipForward size={16} />
          </button>

          <button
            onClick={fastForward}
            disabled={playerState.currentStep >= steps.length - 5}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Fast Forward (5 steps)"
          >
            <FastForward size={16} />
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {steps.map((step, index) => {
            const technique = getTechniqueInfo(step);
            const isExpanded = expandedSteps.has(index);
            const isCurrentStep = index === playerState.currentStep;
            const isCompleted = index < playerState.currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`border-b border-gray-100 ${
                  isCurrentStep ? 'bg-blue-50 border-blue-200' : ''
                } ${isCompleted ? 'bg-green-50' : ''}`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => playStep(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isCurrentStep 
                          ? 'bg-blue-500 text-white' 
                          : isCompleted 
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">
                            {step.technique}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechniqueColor(step.difficulty)}`}>
                            {step.difficulty}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          Row {step.row + 1}, Column {step.col + 1} → {step.value}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepExpansion(index);
                        }}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">Explanation</h5>
                            <p className="text-sm text-gray-600">{step.explanation}</p>
                          </div>

                          {technique && (
                            <div>
                              <h5 className="font-medium text-gray-800 mb-2">Technique Details</h5>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600 mb-2">{technique.fullDescription}</p>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={technique.hodokuUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <ExternalLink size={14} />
                                    Learn more on Hodoku
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Score:</span>
                              <span className="ml-2 font-medium">{step.score}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Time:</span>
                              <span className="ml-2 font-medium">{formatTime(step.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SolutionPlayer; 