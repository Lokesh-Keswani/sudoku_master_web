import React from 'react';

const Cell = ({ row, col, value }) => {
  return (
    <div className="w-10 h-10 border flex items-center justify-center bg-white text-lg font-bold cursor-pointer">
      {value}
    </div>
  );
};

export default Cell; 