import { useMemo } from 'react';
import type { SleepEntry } from '../types';
import { parseISO, format, differenceInMinutes, startOfDay, isToday as checkIsToday } from 'date-fns';

interface TimeMarker {
  hour: number;
  minute: number;
}

interface CircularClockProps {
  entries: SleepEntry[];
  selectedDate: string;
  activeSleep: SleepEntry | null;
  suggestedNapTime?: Date | null;
  recommendedWakeTime?: TimeMarker | null;
  recommendedBedtime?: TimeMarker | null;
  napWindows?: TimeMarker[];
  babyAge?: string;
}

export function CircularClock({
  entries,
  selectedDate,
  activeSleep,
  suggestedNapTime,
  recommendedWakeTime,
  recommendedBedtime,
  napWindows = [],
  babyAge,
}: CircularClockProps) {
  const currentTime = new Date();
  const selectedDateObj = parseISO(selectedDate);
  const dayStart = startOfDay(selectedDateObj);
  const isToday = checkIsToday(selectedDateObj);

  // Default wake/bed times if not provided
  const wakeTime = recommendedWakeTime || { hour: 7, minute: 0 };
  const bedTime = recommendedBedtime || { hour: 19, minute: 0 };

  // Calculate minutes from midnight for wake time
  const wakeMinutes = wakeTime.hour * 60 + wakeTime.minute;

  // Biological clock mapping:
  // - Wake time (e.g., 7 AM) at 9 o'clock position (left, 180° SVG)
  // - Midday at 12 o'clock position (top, 270° SVG)
  // - Bedtime (e.g., 7 PM) at 3 o'clock position (right, 0° SVG)
  // - Midnight at 6 o'clock position (bottom, 90° SVG)

  // Convert clock time (minutes from midnight) to SVG angle
  // The clock anchors wake time at 9 o'clock (180°)
  const timeToAngle = (minutesFromMidnight: number) => {
    // Calculate minutes since wake time (handle wrap around midnight)
    let minutesSinceWake = minutesFromMidnight - wakeMinutes;
    if (minutesSinceWake < 0) {
      minutesSinceWake += 1440; // Add 24 hours
    }
    // Map 24 hours (1440 min) to 360°, starting at 180° (9 o'clock)
    return (minutesSinceWake / 1440) * 360 + 180;
  };

  // Current time in minutes from midnight
  const currentMinutes = differenceInMinutes(currentTime, startOfDay(currentTime));
  const currentAngle = isToday ? timeToAngle(currentMinutes) : null;

  // Convert entries to arc segments
  const segments = useMemo(() => {
    return entries.map((entry) => {
      const startTime = parseISO(entry.startTime);
      const endTime = entry.endTime ? parseISO(entry.endTime) : currentTime;

      const startMinutes = differenceInMinutes(startTime, dayStart);
      const endMinutes = differenceInMinutes(endTime, dayStart);

      // Clamp to valid range (0-1440)
      const clampedStart = Math.max(0, Math.min(1440, startMinutes));
      const clampedEnd = Math.max(0, Math.min(1440, endMinutes));

      if (clampedStart >= clampedEnd) return null;

      const startAngle = timeToAngle(clampedStart);
      let endAngle = timeToAngle(clampedEnd);

      // Handle arc that crosses the wake time position
      if (endAngle < startAngle) {
        endAngle += 360;
      }

      return {
        id: entry.id,
        type: entry.type,
        startAngle,
        endAngle,
        isActive: entry.endTime === null,
        startTime: format(startTime, 'h:mm a'),
        duration: Math.round(clampedEnd - clampedStart),
      };
    }).filter(Boolean) as Array<{
      id: string;
      type: string;
      startAngle: number;
      endAngle: number;
      isActive: boolean;
      startTime: string;
      duration: number;
    }>;
  }, [entries, dayStart, currentTime, wakeMinutes]);

  // Generate hour markers for full 24-hour cycle
  const hourMarkers = useMemo(() => {
    const markers = [];
    for (let hour = 0; hour < 24; hour++) {
      const minutes = hour * 60;
      const angle = timeToAngle(minutes);
      // Mark key hours: wake, midday (12), bedtime, midnight (0)
      const isMainHour = hour === 0 || hour === 6 || hour === 12 || hour === 18 ||
                         hour === wakeTime.hour || hour === bedTime.hour;
      markers.push({ hour, angle, isMainHour });
    }
    return markers;
  }, [wakeMinutes, wakeTime.hour, bedTime.hour]);

  // SVG arc path generator
  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(100, 100, radius, startAngle);
    const end = polarToCartesian(100, 100, radius, endAngle);
    const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0;

    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(' ');
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // Calculate nap window angles
  const napWindowAngles = useMemo(() => {
    return napWindows.map((nap) => {
      const napMinutes = nap.hour * 60 + nap.minute;
      return {
        angle: timeToAngle(napMinutes),
        time: `${nap.hour > 12 ? nap.hour - 12 : nap.hour || 12}:${nap.minute.toString().padStart(2, '0')} ${nap.hour >= 12 ? 'PM' : 'AM'}`,
      };
    });
  }, [napWindows, wakeMinutes]);

  // Positions for sunrise (9 o'clock) and sunset (3 o'clock)
  const sunriseAngle = 180; // 9 o'clock position (left)
  const sunsetAngle = 0;    // 3 o'clock position (right)
  const sunrisePos = polarToCartesian(100, 100, 85, sunriseAngle);
  const sunsetPos = polarToCartesian(100, 100, 85, sunsetAngle);

  // Format time labels for sunrise/sunset
  const formatTimeLabel = (time: TimeMarker) => {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const wakeTimeLabel = formatTimeLabel(wakeTime);
  const bedTimeLabel = formatTimeLabel(bedTime);

  // Calculate nap pill positions and dimensions
  const napPills = useMemo(() => {
    return segments
      .filter((seg) => seg.type === 'nap')
      .map((segment) => {
        // Calculate center angle and arc length
        const centerAngle = (segment.startAngle + segment.endAngle) / 2;
        const arcSpan = segment.endAngle - segment.startAngle;

        // Calculate pill dimensions based on duration
        // Minimum pill width, scales with duration
        const pillWidth = Math.max(20, Math.min(40, arcSpan * 0.8));
        const pillHeight = 18;

        // Position at the clock radius
        const pos = polarToCartesian(100, 100, 85, centerAngle);

        // Rotation to align pill tangent to the circle
        const rotation = centerAngle;

        return {
          id: segment.id,
          x: pos.x,
          y: pos.y,
          width: pillWidth,
          height: pillHeight,
          rotation,
          isActive: segment.isActive,
          duration: segment.duration,
        };
      });
  }, [segments]);

  // Calculate center display info
  const getCenterInfo = () => {
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

    if (suggestedNapTime && isToday) {
      const minutesUntilNap = differenceInMinutes(suggestedNapTime, currentTime);

      if (minutesUntilNap <= 0) {
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
        subText: `~${format(suggestedNapTime, 'h:mm a')}`,
      };
    }

    if (isToday) {
      return {
        type: 'today' as const,
        label: 'Today',
        mainText: format(currentTime, 'h:mm a'),
        subText: null,
      };
    }

    return {
      type: 'past' as const,
      label: null,
      mainText: null,
      subText: null,
    };
  };

  const centerInfo = getCenterInfo();

  // Format display date for header
  const displayDate = format(selectedDateObj, 'MMMM d');

  return (
    <div className="relative flex flex-col items-center">
      {/* Header for past days */}
      {!isToday && (
        <div className="text-center mb-4">
          <h2 className="text-white text-xl font-display font-semibold">{displayDate}</h2>
          {babyAge && (
            <p className="text-white/60 text-sm font-display">{babyAge}</p>
          )}
        </div>
      )}

      <svg viewBox="0 0 200 200" className="w-64 h-64 md:w-72 md:h-72">
        <defs>
          {/* Gradient for daytime arc (upper half: 9 o'clock to 3 o'clock via top) */}
          <linearGradient id="dayGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#f0c674" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#87CEEB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff7e5f" stopOpacity="0.4" />
          </linearGradient>
          {/* Gradient for nighttime arc (lower half: 3 o'clock to 9 o'clock via bottom) */}
          <linearGradient id="nightGradient" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#ff7e5f" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#7c85c4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f0c674" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Daytime arc (upper half: sunrise to sunset) */}
        <path
          d={describeArc(180, 360, 85)}
          fill="none"
          stroke="url(#dayGradient)"
          strokeWidth="24"
        />
        {/* Nighttime arc (lower half: sunset to sunrise) */}
        <path
          d={describeArc(0, 180, 85)}
          fill="none"
          stroke="url(#nightGradient)"
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
                  fontSize="7"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-display"
                >
                  {hour === 0 ? '12a' : hour === 12 ? '12p' : hour > 12 ? `${hour - 12}p` : `${hour}a`}
                </text>
              )}
            </g>
          );
        })}

        {/* Night sleep segments (arcs) */}
        {segments
          .filter((segment) => segment.type === 'night')
          .map((segment) => (
            <path
              key={segment.id}
              d={describeArc(segment.startAngle, segment.endAngle, 85)}
              fill="none"
              stroke="#7c85c4"
              strokeWidth="24"
              strokeLinecap="round"
              className={segment.isActive ? 'animate-pulse' : ''}
              opacity={segment.isActive ? 1 : 0.8}
            />
          ))}

        {/* Nap segments as pill shapes */}
        {napPills.map((pill) => (
          <g
            key={pill.id}
            transform={`translate(${pill.x}, ${pill.y}) rotate(${pill.rotation})`}
            className={pill.isActive ? 'animate-pulse' : ''}
          >
            {/* Pill background with soft purple/blue outline */}
            <rect
              x={-pill.width / 2}
              y={-pill.height / 2}
              width={pill.width}
              height={pill.height}
              rx={pill.height / 2}
              ry={pill.height / 2}
              fill="rgba(30, 40, 69, 0.9)"
              stroke="#8b9dc3"
              strokeWidth="1.5"
            />
            {/* Cloud + Sun icon inside pill */}
            <g transform={`rotate(${-pill.rotation})`}>
              {/* Small sun behind cloud */}
              <circle cx="3" cy="-1" r="4" fill="#f0c674" opacity="0.9" />
              {/* Sun rays */}
              {[0, 60, 120].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={angle}
                    x1={3 + 5 * Math.cos(rad)}
                    y1={-1 + 5 * Math.sin(rad)}
                    x2={3 + 7 * Math.cos(rad)}
                    y2={-1 + 7 * Math.sin(rad)}
                    stroke="#f0c674"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                );
              })}
              {/* Cloud */}
              <ellipse cx="-1" cy="2" rx="5" ry="3" fill="white" opacity="0.95" />
              <circle cx="-4" cy="0" r="2.5" fill="white" opacity="0.95" />
              <circle cx="2" cy="0" r="2" fill="white" opacity="0.95" />
            </g>
          </g>
        ))}

        {/* Current time indicator (only on today) */}
        {currentAngle !== null && (
          <g transform={`rotate(${currentAngle}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="185"
              y2="100"
              stroke="#f0c674"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="185" cy="100" r="4" fill="#f0c674" />
          </g>
        )}

        {/* Sunrise icon at 9 o'clock (left) */}
        <g transform={`translate(${sunrisePos.x}, ${sunrisePos.y})`}>
          {/* Sun circle */}
          <circle cx="0" cy="0" r="8" fill="#f0c674" />
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 10 * Math.cos(rad);
            const y1 = 10 * Math.sin(rad);
            const x2 = 14 * Math.cos(rad);
            const y2 = 14 * Math.sin(rad);
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#f0c674"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
          {/* Time label */}
          <text
            x="-22"
            y="0"
            fill="#f0c674"
            fontSize="6"
            textAnchor="end"
            dominantBaseline="middle"
            className="font-display"
            fontWeight="500"
          >
            {wakeTimeLabel}
          </text>
        </g>

        {/* Sunset icon at 3 o'clock (right) */}
        <g transform={`translate(${sunsetPos.x}, ${sunsetPos.y})`}>
          {/* Horizon line */}
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#ff7e5f" strokeWidth="2" />
          {/* Sun half-circle (setting) */}
          <path
            d="M -8 0 A 8 8 0 0 1 8 0"
            fill="#ff7e5f"
            stroke="none"
          />
          {/* Gradient glow */}
          <circle cx="0" cy="-2" r="5" fill="#ff9966" opacity="0.5" />
          {/* Rays above horizon */}
          {[-45, 0, 45].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const x1 = 10 * Math.cos(rad);
            const y1 = 10 * Math.sin(rad);
            const x2 = 14 * Math.cos(rad);
            const y2 = 14 * Math.sin(rad);
            return (
              <line
                key={angle}
                x1={x1}
                y1={Math.min(y1, 0)}
                x2={x2}
                y2={Math.min(y2, 0)}
                stroke="#ff7e5f"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}
          {/* Time label */}
          <text
            x="22"
            y="0"
            fill="#ff7e5f"
            fontSize="6"
            textAnchor="start"
            dominantBaseline="middle"
            className="font-display"
            fontWeight="500"
          >
            {bedTimeLabel}
          </text>
        </g>

        {/* Nap window markers - Sun with cloud */}
        {napWindowAngles.map((nap, index) => {
          const pos = polarToCartesian(100, 100, 85, nap.angle);
          return (
            <g key={index} transform={`translate(${pos.x}, ${pos.y})`}>
              {/* Half sun (behind cloud) */}
              <circle cx="4" cy="0" r="6" fill="#f0c674" opacity="0.8" />
              {/* Sun rays peeking out */}
              {[45, 90, 135].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                const x1 = 4 + 7 * Math.cos(rad);
                const y1 = 7 * Math.sin(rad);
                const x2 = 4 + 10 * Math.cos(rad);
                const y2 = 10 * Math.sin(rad);
                return (
                  <line
                    key={angle}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#f0c674"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                );
              })}
              {/* Cloud covering half the sun */}
              <ellipse cx="-2" cy="2" rx="7" ry="4" fill="white" opacity="0.9" />
              <circle cx="-5" cy="0" r="3.5" fill="white" opacity="0.9" />
              <circle cx="1" cy="-1" r="3" fill="white" opacity="0.9" />
            </g>
          );
        })}

        {/* Center circle */}
        <circle cx="100" cy="100" r="40" fill="rgba(15, 20, 40, 0.9)" />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: !isToday && babyAge ? '60px' : '0' }}>
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
              <span className="text-white/80 text-sm font-display font-semibold mb-1">
                Today
              </span>
              <div className="text-[#5eadb0] text-xs font-display font-medium">
                {centerInfo.label}
              </div>
              <div className="text-white text-xl font-display font-bold">
                {centerInfo.mainText}
              </div>
              <span className="text-white/50 text-[10px] font-display">
                {centerInfo.subText}
              </span>
            </>
          ) : centerInfo.type === 'naptime' ? (
            <>
              <span className="text-white/80 text-sm font-display font-semibold mb-1">
                Today
              </span>
              <div className="text-[#f0c674] text-xs font-display font-medium">
                {centerInfo.label}
              </div>
              <div className="text-[#f0c674] text-2xl font-display font-bold">
                {centerInfo.mainText}
              </div>
            </>
          ) : centerInfo.type === 'today' ? (
            <>
              <span className="text-white text-lg font-display font-semibold">
                Today
              </span>
              <div className="text-white/60 text-sm font-display mt-1">
                {centerInfo.mainText}
              </div>
            </>
          ) : (
            // Past day - center is empty, info is in header
            <span className="text-white/40 text-xs font-display">
              {format(selectedDateObj, 'EEE')}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          {/* Nap pill icon */}
          <svg width="20" height="12" viewBox="0 0 20 12">
            <rect
              x="1"
              y="1"
              width="18"
              height="10"
              rx="5"
              ry="5"
              fill="rgba(30, 40, 69, 0.9)"
              stroke="#8b9dc3"
              strokeWidth="1"
            />
            <circle cx="12" cy="5" r="2.5" fill="#f0c674" opacity="0.9" />
            <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" opacity="0.9" />
            <circle cx="6" cy="5" r="1.5" fill="white" opacity="0.9" />
          </svg>
          <span className="text-white/60 text-xs font-display">Nap</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#7c85c4]" />
          <span className="text-white/60 text-xs font-display">Night</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="4" fill="#f0c674" />
            {[0, 90, 180, 270].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={angle}
                  x1={8 + 5 * Math.cos(rad)}
                  y1={8 + 5 * Math.sin(rad)}
                  x2={8 + 7 * Math.cos(rad)}
                  y2={8 + 7 * Math.sin(rad)}
                  stroke="#f0c674"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
          <span className="text-white/60 text-xs font-display">Wake</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16">
            <line x1="2" y1="8" x2="14" y2="8" stroke="#ff7e5f" strokeWidth="1.5" />
            <path d="M 4 8 A 4 4 0 0 1 12 8" fill="#ff7e5f" />
          </svg>
          <span className="text-white/60 text-xs font-display">Bed</span>
        </div>
      </div>
    </div>
  );
}
