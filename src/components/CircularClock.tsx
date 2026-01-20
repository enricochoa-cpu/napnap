import { useMemo } from 'react';
import type { SleepEntry } from '../types';
import { parseISO, format, differenceInMinutes, startOfDay } from 'date-fns';

interface CircularClockProps {
  entries: SleepEntry[];
  selectedDate: string;
  activeSleep: SleepEntry | null;
  suggestedNapTime?: Date | null;
}

export function CircularClock({ entries, selectedDate, activeSleep, suggestedNapTime }: CircularClockProps) {
  const currentTime = new Date();
  const dayStart = startOfDay(parseISO(selectedDate));

  // Calculate current time position (0-360 degrees)
  const currentMinutes = differenceInMinutes(currentTime, startOfDay(currentTime));
  const currentAngle = (currentMinutes / 1440) * 360 - 90; // -90 to start at top

  // Convert entries to arc segments
  const segments = useMemo(() => {
    return entries.map((entry) => {
      const startTime = parseISO(entry.startTime);
      const endTime = entry.endTime ? parseISO(entry.endTime) : currentTime;

      const startMinutes = differenceInMinutes(startTime, dayStart);
      const endMinutes = differenceInMinutes(endTime, dayStart);

      // Clamp to current day (0-1440 minutes)
      const clampedStart = Math.max(0, Math.min(1440, startMinutes));
      const clampedEnd = Math.max(0, Math.min(1440, endMinutes));

      const startAngle = (clampedStart / 1440) * 360 - 90;
      const endAngle = (clampedEnd / 1440) * 360 - 90;

      return {
        id: entry.id,
        type: entry.type,
        startAngle,
        endAngle,
        isActive: entry.endTime === null,
        startTime: format(startTime, 'h:mm a'),
        duration: Math.round((clampedEnd - clampedStart)),
      };
    });
  }, [entries, dayStart, currentTime]);

  // Generate hour markers
  const hourMarkers = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * 360 - 90;
      const isMainHour = i % 6 === 0;
      return { hour: i, angle, isMainHour };
    });
  }, []);

  // SVG arc path generator
  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Calculate center display info
  const getCenterInfo = () => {
    // Baby is sleeping
    if (activeSleep) {
      const duration = differenceInMinutes(currentTime, parseISO(activeSleep.startTime));
      const hours = Math.floor(duration / 60);
      const mins = duration % 60;
      return {
        type: 'sleeping' as const,
        label: activeSleep.type === 'nap' ? 'Napping' : 'Sleeping',
        mainText: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
        subText: null,
      };
    }

    // Baby is awake with suggested nap time
    if (suggestedNapTime) {
      const minutesUntilNap = differenceInMinutes(suggestedNapTime, currentTime);

      if (minutesUntilNap <= 0) {
        // Nap time has passed
        return {
          type: 'naptime' as const,
          label: 'Nap time',
          mainText: 'now',
          subText: null,
        };
      }

      const hours = Math.floor(minutesUntilNap / 60);
      const mins = minutesUntilNap % 60;
      const countdownText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      return {
        type: 'countdown' as const,
        label: 'Next nap in',
        mainText: countdownText,
        subText: `Aprox. ${format(suggestedNapTime, 'h:mm a')}`,
      };
    }

    // No data - just show current time
    return {
      type: 'awake' as const,
      label: 'Awake',
      mainText: format(currentTime, 'h:mm a'),
      subText: null,
    };
  };

  const centerInfo = getCenterInfo();

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-64 h-64 md:w-72 md:h-72">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="24"
        />

        {/* Hour markers */}
        {hourMarkers.map(({ hour, angle, isMainHour }) => {
          const inner = polarToCartesian(100, 100, isMainHour ? 68 : 72, angle);
          const outer = polarToCartesian(100, 100, 62, angle);
          const labelPos = polarToCartesian(100, 100, 52, angle);

          return (
            <g key={hour}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={isMainHour ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}
                strokeWidth={isMainHour ? 2 : 1}
              />
              {isMainHour && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="rgba(255,255,255,0.5)"
                  fontSize="8"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-display"
                >
                  {hour === 0 ? '12a' : hour === 6 ? '6a' : hour === 12 ? '12p' : '6p'}
                </text>
              )}
            </g>
          );
        })}

        {/* Sleep segments */}
        {segments.map((segment) => (
          <path
            key={segment.id}
            d={describeArc(segment.startAngle, segment.endAngle, 85)}
            fill="none"
            stroke={segment.type === 'nap' ? '#5eadb0' : '#7c85c4'}
            strokeWidth="24"
            strokeLinecap="round"
            className={segment.isActive ? 'animate-pulse' : ''}
            opacity={segment.isActive ? 1 : 0.8}
          />
        ))}

        {/* Current time indicator */}
        <g transform={`rotate(${currentAngle + 90}, 100, 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="#f0c674"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="100" cy="30" r="4" fill="#f0c674" />
        </g>

        {/* Center circle */}
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="rgba(15, 20, 40, 0.9)"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {centerInfo.type === 'sleeping' ? (
            <>
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-display font-medium">
                  {centerInfo.label}
                </span>
              </div>
              <span className="text-white text-2xl font-display font-bold">
                {centerInfo.mainText}
              </span>
            </>
          ) : centerInfo.type === 'countdown' ? (
            <>
              <span className="text-[#5eadb0] text-xs font-display font-medium">
                {centerInfo.label}
              </span>
              <div className="text-white text-2xl font-display font-bold mt-0.5">
                {centerInfo.mainText}
              </div>
              <span className="text-white/50 text-[10px] font-display">
                {centerInfo.subText}
              </span>
            </>
          ) : centerInfo.type === 'naptime' ? (
            <>
              <span className="text-[#f0c674] text-xs font-display font-medium">
                {centerInfo.label}
              </span>
              <div className="text-[#f0c674] text-2xl font-display font-bold mt-0.5">
                {centerInfo.mainText}
              </div>
            </>
          ) : (
            <>
              <span className="text-white/60 text-xs font-display">
                {centerInfo.label}
              </span>
              <div className="text-white text-lg font-display font-medium mt-1">
                {centerInfo.mainText}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#5eadb0]" />
          <span className="text-white/60 text-xs font-display">Nap</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#7c85c4]" />
          <span className="text-white/60 text-xs font-display">Night</span>
        </div>
      </div>
    </div>
  );
}
