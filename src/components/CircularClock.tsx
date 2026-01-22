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

  // Calculate minutes from midnight for wake and bed times (used for icon positioning and nap window filtering)
  const wakeMinutes = wakeTime.hour * 60 + wakeTime.minute;
  const bedMinutes = bedTime.hour * 60 + bedTime.minute;

  // Convert time (minutes from midnight) to SVG angle
  // In SVG: 0° = 3 o'clock (right), 90° = 6 o'clock (bottom), 180° = 9 o'clock (left), 270° = 12 o'clock (top)
  // We want midnight at top (270°), so we offset by 270°
  const timeToAngle = (minutesFromMidnight: number): number => {
    // Convert minutes to degrees (1440 minutes = 360 degrees)
    const degrees = (minutesFromMidnight / 1440) * 360;
    // Rotate so midnight (0 min) is at top (270° in SVG)
    // Add 270 to shift the circle, then mod 360 to keep in valid range
    return (degrees + 270) % 360;
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

      // Clamp to valid range (0-1440 minutes in a day)
      const clampedStart = Math.max(0, Math.min(1440, startMinutes));
      const clampedEnd = Math.max(0, Math.min(1440, endMinutes));

      if (clampedStart >= clampedEnd) return null;

      const startAngle = timeToAngle(clampedStart);
      let endAngle = timeToAngle(clampedEnd);

      // Handle sleep that crosses midnight (e.g., 11 PM to 2 AM)
      // If end angle is smaller than start angle, we crossed midnight
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

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // SVG arc path generator for sleep segments
  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(100, 100, radius, startAngle);
    const end = polarToCartesian(100, 100, radius, endAngle);
    // Use large arc flag based on arc span
    const arcSpan = endAngle - startAngle;
    const largeArcFlag = arcSpan > 180 ? 1 : 0;

    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(' ');
  };

  // Get recommended nap duration based on baby's age (in minutes)
  const getRecommendedNapDuration = (): number => {
    if (!babyAge) return 60; // Default 1 hour

    // Parse age string to get approximate months
    const monthsMatch = babyAge.match(/(\d+)\s*month/);
    const yearsMatch = babyAge.match(/(\d+)\s*year/);

    let ageInMonths = 0;
    if (yearsMatch) {
      ageInMonths = parseInt(yearsMatch[1]) * 12;
    }
    if (monthsMatch) {
      ageInMonths += parseInt(monthsMatch[1]);
    }

    // Nap durations by age
    if (ageInMonths < 4) return 45;      // 0-3 months: 45 min
    if (ageInMonths < 7) return 60;      // 4-6 months: 1 hour
    if (ageInMonths < 10) return 75;     // 7-9 months: 1.25 hours
    if (ageInMonths < 15) return 90;     // 10-14 months: 1.5 hours
    return 120;                           // 15+ months: 2 hours (single longer nap)
  };

  const recommendedNapDuration = getRecommendedNapDuration();

  // Get the latest logged nap end time (or start time if ongoing) for filtering
  const latestLoggedNapTime = useMemo(() => {
    const naps = entries.filter(e => e.type === 'nap');
    if (naps.length === 0) return null;

    // Find the nap with the latest end time (or start time if ongoing)
    let latestTime = 0;
    naps.forEach(nap => {
      const endTime = nap.endTime ? parseISO(nap.endTime) : currentTime;
      const endMinutes = differenceInMinutes(endTime, dayStart);
      if (endMinutes > latestTime) {
        latestTime = endMinutes;
      }
    });
    return latestTime;
  }, [entries, dayStart, currentTime]);

  // Calculate nap window angles - filter out those before logged naps
  const napWindowAngles = useMemo(() => {
    return napWindows
      .map((nap) => {
        const napStartMinutes = nap.hour * 60 + nap.minute;
        const napEndMinutes = napStartMinutes + recommendedNapDuration;

        // Only include naps within the wake window
        if (napStartMinutes < wakeMinutes || napEndMinutes > bedMinutes) {
          return null;
        }

        return {
          startAngle: timeToAngle(napStartMinutes),
          endAngle: timeToAngle(napEndMinutes),
          startMinutes: napStartMinutes,
          endMinutes: napEndMinutes,
          startTime: `${nap.hour > 12 ? nap.hour - 12 : nap.hour || 12}:${nap.minute.toString().padStart(2, '0')} ${nap.hour >= 12 ? 'PM' : 'AM'}`,
          endTime: (() => {
            const endHour = Math.floor(napEndMinutes / 60);
            const endMin = napEndMinutes % 60;
            const displayHour = endHour > 12 ? endHour - 12 : endHour || 12;
            return `${displayHour}:${endMin.toString().padStart(2, '0')} ${endHour >= 12 ? 'PM' : 'AM'}`;
          })(),
        };
      })
      .filter((nap): nap is NonNullable<typeof nap> => {
        if (nap === null) return false;
        // If there are logged naps, only show recommended windows AFTER the latest logged nap
        if (latestLoggedNapTime !== null) {
          return nap.startMinutes > latestLoggedNapTime;
        }
        return true;
      });
  }, [napWindows, wakeMinutes, bedMinutes, recommendedNapDuration, latestLoggedNapTime]);

  // Calculate wake and bed icon positions using timeToAngle
  const wakeAngle = timeToAngle(wakeMinutes);
  const bedAngle = timeToAngle(bedMinutes);

  // Position icons at radius 88 around the circle
  const wakeIconPos = polarToCartesian(100, 100, 88, wakeAngle);
  const bedIconPos = polarToCartesian(100, 100, 88, bedAngle);

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
        // Calculate center angle and arc span
        const centerAngle = (segment.startAngle + segment.endAngle) / 2;
        const arcSpan = segment.endAngle - segment.startAngle;

        // Calculate pill width based on arc span (proportional to duration)
        const pillWidth = Math.max(28, Math.min(55, arcSpan * 1.5));
        const pillHeight = 30; // Larger to sit ON the arc

        // Position at the clock radius (on the arc)
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
        {/* Subtle background circle - represents 24-hour clock face */}
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="rgba(139, 157, 195, 0.15)"
          strokeWidth="2"
          opacity="0.5"
        />


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

        {/* Nap segments as pill shapes - sitting ON the arc */}
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
              fill="rgba(30, 40, 69, 0.95)"
              stroke="#8b9dc3"
              strokeWidth="2"
            />
            {/* Cloud + Sun icon inside pill - scaled up */}
            <g transform={`rotate(${-pill.rotation}) scale(1.2)`}>
              {/* Small sun behind cloud */}
              <circle cx="4" cy="-2" r="5" fill="#f0c674" opacity="0.9" />
              {/* Sun rays */}
              {[0, 60, 120].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={angle}
                    x1={4 + 6 * Math.cos(rad)}
                    y1={-2 + 6 * Math.sin(rad)}
                    x2={4 + 8 * Math.cos(rad)}
                    y2={-2 + 8 * Math.sin(rad)}
                    stroke="#f0c674"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                );
              })}
              {/* Cloud */}
              <ellipse cx="-2" cy="3" rx="6" ry="4" fill="white" opacity="0.95" />
              <circle cx="-6" cy="0" r="3" fill="white" opacity="0.95" />
              <circle cx="2" cy="0" r="2.5" fill="white" opacity="0.95" />
            </g>
          </g>
        ))}

        {/* Current time indicator (only on today) - subtle needle */}
        {currentAngle !== null && (
          <g transform={`rotate(${currentAngle}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="182"
              y2="100"
              stroke="#f0c674"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            <circle cx="182" cy="100" r="3" fill="#f0c674" opacity="0.6" />
          </g>
        )}

        {/* Wake time icon - SOLID border (already happened) */}
        <g transform={`translate(${wakeIconPos.x}, ${wakeIconPos.y})`}>
          {/* Solid circle background with golden border */}
          <circle
            cx="0"
            cy="0"
            r="22"
            fill="#2a3655"
            stroke="#f0c674"
            strokeWidth="3"
          />

          {/* Sun icon (centered) */}
          <circle cx="0" cy="0" r="9" fill="#f0c674" />

          {/* Sun rays (8 rays at 45° intervals) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 12 * Math.cos(rad);
            const y1 = 12 * Math.sin(rad);
            const x2 = 16 * Math.cos(rad);
            const y2 = 16 * Math.sin(rad);
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#f0c674"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}
        </g>
        {/* Wake time label (below icon) */}
        <text
          x={wakeIconPos.x}
          y={wakeIconPos.y + 32}
          fill="#f0c674"
          fontSize="16"
          fontWeight="700"
          textAnchor="middle"
          className="font-display"
        >
          {wakeTimeLabel}
        </text>

        {/* Bedtime icon - DOTTED border (predicted) */}
        <g transform={`translate(${bedIconPos.x}, ${bedIconPos.y})`}>
          {/* Dotted circle border */}
          <circle
            cx="0"
            cy="0"
            r="22"
            fill="#2a3655"
            stroke="#ff7e5f"
            strokeWidth="2.5"
            strokeDasharray="4,3"
            opacity="0.9"
          />

          {/* Horizon line */}
          <line
            x1="-11"
            y1="0"
            x2="11"
            y2="0"
            stroke="#ff7e5f"
            strokeWidth="2.5"
          />

          {/* Setting sun (half circle below horizon) */}
          <path
            d="M -8 0 A 8 8 0 0 1 8 0"
            fill="#ff7e5f"
          />

          {/* Glow effect */}
          <circle
            cx="0"
            cy="-3"
            r="6"
            fill="#ff9966"
            opacity="0.4"
          />

          {/* Rays above horizon only (3 rays) */}
          {[-50, 0, 50].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const x1 = 12 * Math.cos(rad);
            const y1 = Math.min(12 * Math.sin(rad), -1);
            const x2 = 16 * Math.cos(rad);
            const y2 = Math.min(16 * Math.sin(rad), -1);
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ff7e5f"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.75"
              />
            );
          })}
        </g>
        {/* Bed time label (below icon) */}
        <text
          x={bedIconPos.x}
          y={bedIconPos.y + 32}
          fill="#ff7e5f"
          fontSize="16"
          fontWeight="700"
          textAnchor="middle"
          className="font-display"
        >
          {bedTimeLabel}
        </text>

        {/* Recommended nap window markers - Pill with dotted border */}
        {napWindowAngles.map((nap, index) => {
          // Calculate center angle and arc span
          const centerAngle = (nap.startAngle + nap.endAngle) / 2;
          const arcSpan = nap.endAngle - nap.startAngle;

          // Calculate pill dimensions based on duration (slightly smaller than logged)
          const pillWidth = Math.max(26, Math.min(50, arcSpan * 1.2));
          const pillHeight = 26;

          // Position at the clock radius
          const pos = polarToCartesian(100, 100, 85, centerAngle);

          // Positions for time labels (outside the circle)
          const startLabelPos = polarToCartesian(100, 100, 115, nap.startAngle);
          const endLabelPos = polarToCartesian(100, 100, 115, nap.endAngle);

          return (
            <g key={index}>
              {/* Pill shape with dotted border */}
              <g transform={`translate(${pos.x}, ${pos.y}) rotate(${centerAngle})`}>
                {/* Pill background */}
                <rect
                  x={-pillWidth / 2}
                  y={-pillHeight / 2}
                  width={pillWidth}
                  height={pillHeight}
                  rx={pillHeight / 2}
                  ry={pillHeight / 2}
                  fill="rgba(30, 40, 69, 0.7)"
                  stroke="#8b9dc3"
                  strokeWidth="1.5"
                  strokeDasharray="4,2"
                  opacity="0.8"
                />
                {/* Cloud + Sun icon inside pill */}
                <g transform={`rotate(${-centerAngle})`}>
                  {/* Small sun behind cloud */}
                  <circle cx="3" cy="-1" r="4" fill="#f0c674" opacity="0.6" />
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
                        opacity="0.5"
                      />
                    );
                  })}
                  {/* Cloud */}
                  <ellipse cx="-1" cy="2" rx="5" ry="3" fill="white" opacity="0.6" />
                  <circle cx="-4" cy="0" r="2.5" fill="white" opacity="0.6" />
                  <circle cx="2" cy="0" r="2" fill="white" opacity="0.6" />
                </g>
              </g>

              {/* Start time label (outside circle) */}
              <text
                x={startLabelPos.x}
                y={startLabelPos.y}
                fill="rgba(139, 157, 195, 0.8)"
                fontSize="6"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-display"
              >
                {nap.startTime}
              </text>

              {/* End time label (outside circle) */}
              <text
                x={endLabelPos.x}
                y={endLabelPos.y}
                fill="rgba(139, 157, 195, 0.8)"
                fontSize="6"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-display"
              >
                {nap.endTime}
              </text>
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
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <div className="flex items-center gap-1.5">
          {/* Logged nap pill icon (solid border) */}
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
        <div className="flex items-center gap-1.5">
          {/* Recommended nap pill icon (dotted border) */}
          <svg width="20" height="12" viewBox="0 0 20 12">
            <rect
              x="1"
              y="1"
              width="18"
              height="10"
              rx="5"
              ry="5"
              fill="rgba(30, 40, 69, 0.6)"
              stroke="#8b9dc3"
              strokeWidth="1"
              strokeDasharray="2,1"
              opacity="0.7"
            />
            <circle cx="12" cy="5" r="2.5" fill="#f0c674" opacity="0.6" />
            <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" opacity="0.6" />
            <circle cx="6" cy="5" r="1.5" fill="white" opacity="0.6" />
          </svg>
          <span className="text-white/60 text-xs font-display">Suggested</span>
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
