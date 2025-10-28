import React from 'react';

const BrutalistSpinner: React.FC = () => {
  return (
    <div 
        className="absolute inset-0 p-4 flex items-start pointer-events-none"
        aria-label="Processing..."
    >
        <span className="inline-block w-1 h-8 bg-off-black animate-blink-hard"></span>
    </div>
  );
};

export default BrutalistSpinner;
