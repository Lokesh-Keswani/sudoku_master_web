import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Move } from '../store/mentalMappingStore';

interface MentalMoveInputProps {
  userMoves: (Move | null)[];
  onMoveChange: (move: Move, index: number) => void;
  onSubmit: () => void;
}

const MentalMoveInput: React.FC<MentalMoveInputProps> = ({
  userMoves,
  onMoveChange,
  onSubmit
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const isFormComplete = userMoves.every(move => move !== null);

  const handleMoveChange = (index: number, field: keyof Move, value: number) => {
    const currentMove = userMoves[index] || { row: 0, col: 0, number: 0 };
    const newMove = { ...currentMove, [field]: value };
    onMoveChange(newMove, index);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">
          Recall Your Moves
        </h2>
        <p className="text-lg text-gray-600 max-w-md">
          Enter the moves you memorized in the same order you saw them
        </p>
      </motion.div>

      {/* Move Input Forms */}
      <div className="space-y-6 w-full max-w-2xl">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`
              bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-300
              ${focusedIndex === index ? 'border-blue-400 shadow-xl' : 'border-gray-200'}
              ${userMoves[index] ? 'bg-gradient-to-r from-green-50 to-blue-50' : ''}
            `}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                Move {index + 1}
              </h3>
              {userMoves[index] && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Row Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Row
                </label>
                <select
                  value={userMoves[index]?.row || ''}
                  onChange={(e) => handleMoveChange(index, 'row', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Row</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((row) => (
                    <option key={row} value={row - 1}>
                      Row {row}
                    </option>
                  ))}
                </select>
              </div>

              {/* Column Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Column
                </label>
                <select
                  value={userMoves[index]?.col || ''}
                  onChange={(e) => handleMoveChange(index, 'col', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Column</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
                    <option key={col} value={col - 1}>
                      Column {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number
                </label>
                <select
                  value={userMoves[index]?.number || ''}
                  onChange={(e) => handleMoveChange(index, 'number', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Number</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Move Summary */}
            {userMoves[index] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-blue-100 rounded-lg"
              >
                <p className="text-sm text-blue-800 font-medium">
                  Move {index + 1}: Row {userMoves[index]!.row + 1}, Column {userMoves[index]!.col + 1}, Number {userMoves[index]!.number}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Submit Button */}
      <motion.div variants={itemVariants} className="pt-4">
        <button
          onClick={onSubmit}
          disabled={!isFormComplete}
          className={`
            px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300
            ${isFormComplete
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isFormComplete ? 'Submit Moves' : 'Complete All Moves First'}
        </button>
      </motion.div>

      {/* Tooltip */}
      <motion.div
        variants={itemVariants}
        className="text-center text-gray-500 text-sm max-w-md"
      >
        💡 Tip: Try to visualize the grid in your mind and recall the exact positions and numbers you saw.
      </motion.div>
    </motion.div>
  );
};

export default MentalMoveInput; 