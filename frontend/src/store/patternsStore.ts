import { create } from 'zustand';

type Mode = 'Flashcard' | 'Timed';
type Level = 'Easy' | 'Medium' | 'Hard';
type Stats = {
  correct: number;
  accuracy: number;
  patternsPerMin: number;
};

type PatternsStore = {
  sessionActive: boolean;
  stats: Stats | null;
  startSession: (mode: Mode, level: Level) => void;
  endSession: (stats: Stats) => void;
};

export const usePatternsStore = create<PatternsStore>((set) => ({
  sessionActive: false,
  stats: null,
  startSession: (mode, level) => set({ sessionActive: true, stats: null }),
  endSession: (stats) => set({ sessionActive: false, stats }),
})); 