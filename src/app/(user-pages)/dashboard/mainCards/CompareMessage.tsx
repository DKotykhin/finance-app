import React from 'react';

interface CompareMessageProps {
  current?: number;
  previous?: number;
}

export const CompareMessage: React.FC<CompareMessageProps> = ({ current, previous }) => {
  if (!current) return <p className="text-sm text-gray-400">No data in current period</p>;
  if (!previous) return <p className="text-sm text-gray-400">No data in previous period</p>;
  const percentage = Math.abs(Math.round(((current - previous) / previous) * 100));

  if (
    (current > 0 && previous < 0) ||
    (current > 0 && previous > 0 && previous > current) ||
    (current < 0 && previous < 0 && previous < current)
  ) {
    return <p className="text-sm text-green-500">{`+ ${percentage}% from last period`}</p>;
  }

  if (
    (current < 0 && previous > 0) ||
    (current < 0 && previous < 0 && previous > current) ||
    (current > 0 && previous > 0 && previous < current)
  ) {
    return <p className="text-sm text-red-500">{`- ${percentage}% from last period`}</p>;
  }
};
