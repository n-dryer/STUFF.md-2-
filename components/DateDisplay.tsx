
import React from 'react';

interface DateDisplayProps {
  date: string;
}

const DateDisplay: React.FC<DateDisplayProps> = ({ date }) => {
  const d = new Date(date);
  const displayDate = d.toISOString().split('T')[0];
  const fullTimestamp = d.toLocaleString();

  return (
    <span className="text-sm text-light-gray font-mono whitespace-nowrap" title={fullTimestamp}>
      {displayDate}
    </span>
  );
};

export default DateDisplay;
