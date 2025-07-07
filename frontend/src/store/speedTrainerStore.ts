import { create } from 'zustand';

// Types
export type Section = { type: 'row' | 'col' | 'box'; index: number; technique?: string };
export type Metrics = {
  avgTime: number;
  accuracy: number;
  missed: number;
  hits: number;
  misses: number;
  heatmap: number[][];
};

export type SpeedTrainerStore = {
  challengeActive: boolean;
  puzzle: number[][] | null;
  section: Section | null;
  timer: number;
  hits: number;
  misses: number;
  responseTimes: number[];
  heatmap: number[][];
  stats: Metrics | null;
  currentTechnique: string;
  timeLimit: number;
  startChallenge: (difficulty: string, technique: string, timeLimit: number) => void;
  clickCell: (row: number, col: number) => void;
  tick: () => void;
  endChallenge: () => void;
  resetChallenge: () => void;
};

export const useSpeedTrainerStore = create<SpeedTrainerStore>((set, get) => ({
  challengeActive: false,
  puzzle: null,
  section: null,
  timer: 0,
  hits: 0,
  misses: 0,
  responseTimes: [],
  heatmap: Array(9).fill(0).map(() => Array(9).fill(0)),
  stats: null,
  currentTechnique: '',
  timeLimit: 0,
  startChallenge: (difficulty, technique, timeLimit) => {
    // Dynamically import utils to guarantee client-only execution
    import('../utils/trainingUtils').then(utils => {
      const puzzle = utils.generateSpeedTrainerPuzzle(difficulty, technique);
      const section = utils.getRandomSection(technique);
      set({
        challengeActive: true,
        puzzle,
        section,
        timer: timeLimit,
        hits: 0,
        misses: 0,
        responseTimes: [],
        heatmap: Array(9).fill(0).map(() => Array(9).fill(0)),
        stats: null,
        currentTechnique: technique,
        timeLimit,
      });
    });
  },
  clickCell: (row, col) => {
    const { section, puzzle, hits, misses, responseTimes, heatmap, currentTechnique } = get();
    if (!section || !puzzle) return;
    import('../utils/trainingUtils').then(utils => {
      if (!utils.isCellInSection(row, col, section)) return;
      const correct = utils.isCorrectMove(puzzle, row, col, currentTechnique);
      const now = Date.now();
      const newHeatmap = heatmap.map((r, i) => r.map((v, j) => (i === row && j === col ? v + 1 : v)));
      set({
        hits: hits + (correct ? 1 : 0),
        misses: misses + (correct ? 0 : 1),
        responseTimes: [...responseTimes, now],
        heatmap: newHeatmap,
        section: utils.getRandomSection(currentTechnique),
      });
    });
  },
  tick: () => {
    const { timer } = get();
    if (timer > 0) set({ timer: timer - 1 });
    else get().endChallenge();
  },
  endChallenge: () => {
    const { hits, misses, responseTimes, heatmap } = get();
    const total = hits + misses;
    const avgTime = responseTimes.length > 1 ? Math.round((responseTimes[responseTimes.length - 1] - responseTimes[0]) / (responseTimes.length - 1)) : 0;
    const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;
    set({
      challengeActive: false,
      stats: {
        avgTime,
        accuracy,
        missed: misses,
        hits,
        misses,
        heatmap,
      },
    });
  },
  resetChallenge: () => {
    set({
      challengeActive: false,
      puzzle: null,
      section: null,
      timer: 0,
      hits: 0,
      misses: 0,
      responseTimes: [],
      heatmap: Array(9).fill(0).map(() => Array(9).fill(0)),
      stats: null,
      currentTechnique: '',
      timeLimit: 0,
    });
  },
})); 