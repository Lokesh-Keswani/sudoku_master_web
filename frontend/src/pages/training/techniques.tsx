import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useTrainingStore } from '../../stores/trainingStore';
import SudokuGrid from '../../components/SudokuGrid';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const TechniquesTrainer: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exercise, setExercise] = useState(null);
  const { progress } = useTrainingStore();

  // Placeholder for loading a puzzle
  const loadExercise = async () => {
    setLoading(true);
    setError('');
    try {
      // TODO: Use utils/techniqueTrainer to generate puzzle
      setExercise({});
    } catch (e) {
      setError('Failed to load puzzle');
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Techniques Trainer</h1>
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-2">
          {LEVELS.map((lvl) => (
            <Tab
              key={lvl}
              className={({ selected }) =>
                `px-4 py-2 rounded-lg font-semibold focus:outline-none transition-all duration-200 ${
                  selected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`
              }
            >
              {lvl}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          {LEVELS.map((lvl, idx) => (
            <Tab.Panel key={lvl}>
              {loading ? (
                <div>Loading puzzle…</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <>
                  <SudokuGrid puzzle={exercise} />
                  {/* Sidebar, Try It button, etc. */}
                  <button onClick={loadExercise} className="mt-4 btn btn-primary">Try It</button>
                </>
              )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default TechniquesTrainer; 