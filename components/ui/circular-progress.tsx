import React from 'react';

type CircularProgressProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
};

export function CircularProgress({ value, size = 180, strokeWidth = 14 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          stroke="#222" // dark gray
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Gradient */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" /> {/* blue-600 */}
            <stop offset="100%" stopColor="#1d4ed8" /> {/* blue-700 */}
          </linearGradient>
        </defs>
      </svg>
      {/* Center Text */}
      <span className="absolute text-white text-4xl font-medium">{value}%</span>
    </div>
  );
}
