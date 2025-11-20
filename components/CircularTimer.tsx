import React from 'react';
import { TimerMode } from '../types';

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  mode: TimerMode;
  isActive: boolean;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ timeLeft, totalTime, mode, isActive }) => {
  const radius = 120;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  let colorClass = 'text-indigo-500';
  if (mode === TimerMode.SHORT_BREAK) colorClass = 'text-emerald-500';
  if (mode === TimerMode.LONG_BREAK) colorClass = 'text-blue-500';

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 transition-all duration-500"
      >
        {/* Background Circle */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-slate-800"
        />
        {/* Progress Circle */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={`${colorClass} transition-colors duration-500`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-6xl font-bold tracking-tighter ${colorClass} drop-shadow-lg`}>
          {formatTime(timeLeft)}
        </span>
        <span className="text-slate-400 text-sm font-medium mt-2 uppercase tracking-widest">
            {isActive ? 'Odaklanıyor' : 'Beklemede'}
        </span>
      </div>
    </div>
  );
};

export default CircularTimer;