import React from 'react';

const TimerBar = ({ time = 60, total = 60 }) => {
  return (
    <div className="w-full h-3 bg-gray-200 rounded mb-4">
      <div
        className="h-3 bg-blue-500 rounded transition-all duration-200"
        style={{ width: `${(time / total) * 100}%` }}
      />
    </div>
  );
};

export default TimerBar; 