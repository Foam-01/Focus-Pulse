import React from 'react';

interface TimerCircleProps {
  remainingSeconds: number;
  totalSeconds: number;
  formattedTime: string;
  sessionStatus: string;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({
  remainingSeconds,
  totalSeconds,
  formattedTime,
  sessionStatus,
}) => {
  const totalCircumference = 722; // 2 * PI * 115
  const progress = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  const strokeDashoffset = totalCircumference * (1 - progress);

  return (
    <div className="timer-circle-wrapper">
      <svg className="timer-svg" viewBox="0 0 260 260">
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <circle className="timer-bg-circle" cx="130" cy="130" r="115" />
        <circle
          className="timer-progress-circle"
          cx="130"
          cy="130"
          r="115"
          style={{ strokeDashoffset }}
        />
      </svg>

      <div className="timer-center-info">
        <span className="timer-display-text">{formattedTime}</span>
        <span className="timer-status-badge">{sessionStatus}</span>
      </div>
    </div>
  );
};
