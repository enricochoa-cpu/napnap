import { useEffect, useState } from 'react';
import type { SleepEntry } from '../types';
import { formatTime, calculateDuration, formatDuration } from '../utils/dateUtils';

interface ActiveSleepProps {
  entry: SleepEntry;
  onWake: (id: string) => void;
}

export function ActiveSleep({ entry, onWake }: ActiveSleepProps) {
  const [duration, setDuration] = useState(calculateDuration(entry.startTime, null));

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(calculateDuration(entry.startTime, null));
    }, 60000);

    return () => clearInterval(interval);
  }, [entry.startTime]);

  return (
    <div className="sleep-active p-6 text-white relative">
      {/* Sleeping indicator */}
      <div className="absolute top-4 right-4">
        <div className="breathing">
          <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.5 6c-1.92 0-3.5 1.58-3.5 3.5 0 1.58 1.04 2.9 2.47 3.35l-.97 2.15c-.19.41-.02.89.38 1.11.41.22.91.07 1.13-.32l1.49-3.29c.1-.22.1-.47 0-.69l-1.49-3.29c-.22-.39-.72-.54-1.13-.32-.4.22-.57.7-.38 1.11l.97 2.15C13.46 12.4 12.42 11.08 12.42 9.5c0-1.92 1.58-3.5 3.5-3.5s3.5 1.58 3.5 3.5-1.58 3.5-3.5 3.5" />
            <text x="5" y="18" fontSize="8" fill="currentColor">z z z</text>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center gap-4">
        {/* Moon icon with glow */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
          <div className="absolute -inset-2 rounded-full bg-yellow-300/30 animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        <div className="flex-1">
          <p className="font-display text-white/70 text-sm mb-1">
            {entry.type === 'nap' ? 'Napping' : 'Night Sleep'}
          </p>
          <p className="font-display text-4xl font-bold text-glow">
            {formatDuration(duration)}
          </p>
          <p className="text-white/60 text-sm mt-1">
            Started at {formatTime(entry.startTime)}
          </p>
        </div>
      </div>

      {/* Wake button */}
      <button
        onClick={() => onWake(entry.id)}
        className="btn-wake w-full mt-6 py-3 font-display font-semibold"
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Wake Up
        </span>
      </button>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
