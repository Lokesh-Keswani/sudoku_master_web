import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Printer, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  FastForward,
  Trophy,
  Star,
  Clock,
  Target,
  Award,
  Zap,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { SolvingReport, PDFReportOptions } from '../types/solutionReport';
import { generateSolvingReport } from '../utils/solutionEngine';
import { downloadPDF } from '../utils/PDFGenerator';
import { createSpeechExplanation } from '../utils/SpeechExplanation';
import SolutionPlayer from './SolutionPlayer';
import PracticeSudokuGrid from './PracticeSudokuGrid';

interface SolveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGrid: number[][];
  solution: number[][];
  solvingTime: number;
  difficulty: string;
  hintsUsed: number;
  checkCount: number;
}

const SolveReportModal: React.FC<SolveReportModalProps> = ({
  isOpen,
  onClose,
  initialGrid,
  solution,
  solvingTime,
  difficulty,
  hintsUsed,
  checkCount
}) => {
  const [report, setReport] = useState<SolvingReport | null>(null);
  const [currentGrid, setCurrentGrid] = useState<number[][]>(initialGrid);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'summary' | 'techniques'>('player');
  const [pdfOptions, setPdfOptions] = useState<PDFReportOptions>({
    includeTechniqueDetails: true,
    includeVisualDiagrams: true,
    includeStatistics: true,
    includeBadges: true
  });

  useEffect(() => {
    if (isOpen && !report) {
      generateReport();
    }
  }, [isOpen]);

  const generateReport = () => {
    const newReport = generateSolvingReport(
      initialGrid,
      solution,
      solvingTime,
      difficulty,
      hintsUsed,
      checkCount
    );
    setReport(newReport);
    setCurrentGrid(initialGrid);
    setCurrentStepIndex(0);
  };

  const handleStepChange = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  const handleGridUpdate = (grid: number[][]) => {
    setCurrentGrid(grid);
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    
    setIsGeneratingPDF(true);
    try {
      await downloadPDF(report, pdfOptions, `sudoku-report-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getBadgeIcon = (badgeId: string) => {
    const badgeIcons: { [key: string]: React.ReactNode } = {
      'speed-demon': <Zap className="w-5 h-5" />,
      'quick-solver': <Clock className="w-5 h-5" />,
      'advanced-logic': <Target className="w-5 h-5" />,
      'expert-solver': <Award className="w-5 h-5" />,
      'no-hints': <Star className="w-5 h-5" />,
      'minimal-hints': <Trophy className="w-5 h-5" />,
      'challenge-master': <BookOpen className="w-5 h-5" />
    };
    return badgeIcons[badgeId] || <Trophy className="w-5 h-5" />;
  };

  const getBadgeColor = (badgeId: string) => {
    const badgeColors: { [key: string]: string } = {
      'speed-demon': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'quick-solver': 'bg-blue-100 text-blue-800 border-blue-300',
      'advanced-logic': 'bg-purple-100 text-purple-800 border-purple-300',
      'expert-solver': 'bg-red-100 text-red-800 border-red-300',
      'no-hints': 'bg-green-100 text-green-800 border-green-300',
      'minimal-hints': 'bg-orange-100 text-orange-800 border-orange-300',
      'challenge-master': 'bg-indigo-100 text-indigo-800 border-indigo-300'
    };
    return badgeColors[badgeId] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !report) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Solution Report
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {report.motivationalMessage}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Download size={16} />
                    {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Badges */}
              {report.badges.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {report.badges.map((badge) => (
                    <div
                      key={badge}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getBadgeColor(badge)}`}
                    >
                      {getBadgeIcon(badge)}
                      <span className="text-sm font-medium capitalize">
                        {badge.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('player')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'player'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Solution Player
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('techniques')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'techniques'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Techniques Used
              </button>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-200px)]">
              {/* Left Panel - Grid */}
              <div className="w-1/2 p-6 border-r border-gray-200">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Puzzle Grid
                  </h3>
                  <p className="text-sm text-gray-600">
                    Step {currentStepIndex + 1} of {report.steps.length}
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <PracticeSudokuGrid
                    board={currentGrid}
                    initialBoard={initialGrid}
                    onCellChange={() => {}}
                  />
                </div>

                {/* Statistics */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span className="text-sm">Solving Time</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {formatTime(report.solvingTime)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target size={16} />
                      <span className="text-sm">Total Score</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {report.totalScore}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen size={16} />
                      <span className="text-sm">Techniques</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {report.techniquesUsed.length}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star size={16} />
                      <span className="text-sm">Hints Used</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {report.hintsUsed}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Panel - Content */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'player' && (
                    <motion.div
                      key="player"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SolutionPlayer
                        steps={report.steps}
                        currentGrid={currentGrid}
                        onStepChange={handleStepChange}
                        onGridUpdate={handleGridUpdate}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'summary' && (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Puzzle Summary
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2">Puzzle Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-blue-600">Difficulty:</span>
                                <span className="ml-2 font-medium">{report.difficulty}</span>
                              </div>
                              <div>
                                <span className="text-blue-600">Steps:</span>
                                <span className="ml-2 font-medium">{report.steps.length}</span>
                              </div>
                              <div>
                                <span className="text-blue-600">Solving Time:</span>
                                <span className="ml-2 font-medium">{formatTime(report.solvingTime)}</span>
                              </div>
                              <div>
                                <span className="text-blue-600">Total Score:</span>
                                <span className="ml-2 font-medium">{report.totalScore}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-medium text-green-800 mb-2">Performance</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-green-600">Average Score per Step:</span>
                                <span className="font-medium">
                                  {(report.totalScore / report.steps.length).toFixed(1)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600">Hints Used:</span>
                                <span className="font-medium">{report.hintsUsed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600">Check Count:</span>
                                <span className="font-medium">{report.checkCount}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="font-medium text-purple-800 mb-2">Techniques Used</h4>
                            <div className="flex flex-wrap gap-2">
                              {report.techniquesUsed.map((techniqueId) => (
                                <span
                                  key={techniqueId}
                                  className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                                >
                                  {techniqueId.replace('-', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'techniques' && (
                    <motion.div
                      key="techniques"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Techniques Used
                      </h3>
                      
                      {report.techniquesUsed.map((techniqueId) => {
                        const technique = report.steps.find(step => step.techniqueId === techniqueId);
                        if (!technique) return null;
                        
                        return (
                          <div key={techniqueId} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-800">
                                {technique.technique}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                technique.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                technique.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                                technique.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {technique.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {technique.explanation}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Used {report.steps.filter(step => step.techniqueId === techniqueId).length} times</span>
                              <span>•</span>
                              <span>Score: {technique.score}</span>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SolveReportModal; 