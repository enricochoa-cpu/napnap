import { useMemo } from 'react';
import type { SleepEntry } from '../types';
import { parseISO, format, differenceInMinutes, startOfDay, isToday as checkIsToday } from 'date-fns';

/**
 * CircularClock - 24-hour biological clock visualization (Napper AAA-style)
 *
 * Visual features:
 * - Elegant thin arcs (10px night, 8px prediction)
 * - Glassmorphism center with radial gradient
 * - Minimalist Sun/Moon icons
 * - Gradient needle with fade effect
 * - Drop-shadow glow on active elements
 *
 * Radius values:
 * - Background circle: 88
 * - Arc radius: 88
 * - Wake/Bed icons: 98
 * - Time labels: 115 (increased spacing)
 */

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

  // Position icons at radius 98 (outside the main arc)
  const wakeIconPos = polarToCartesian(100, 100, 98, wakeAngle);
  const bedIconPos = polarToCartesian(100, 100, 98, bedAngle);

  // Format time labels for sunrise/sunset
  const formatTimeLabel = (time: TimeMarker) => {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const wakeTimeLabel = formatTimeLabel(wakeTime);
  const bedTimeLabel = formatTimeLabel(bedTime);

  // Calculate center display info with Catalan labels
  const getCenterInfo = () => {
    if (activeSleep) {
      const duration = differenceInMinutes(currentTime, parseISO(activeSleep.startTime));
      const hours = Math.floor(duration / 60);
      const mins = duration % 60;
      return {
        type: 'sleeping' as const,
        label: activeSleep.type === 'nap' ? 'MIGDIADA' : 'DORMINT',
        mainText: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
        subText: null,
      };
    }

    if (suggestedNapTime && isToday) {
      const minutesUntilNap = differenceInMinutes(suggestedNapTime, currentTime);

      if (minutesUntilNap <= 0) {
        return {
          type: 'naptime' as const,
          label: 'HORA DE MIGDIADA',
          mainText: 'ara',
          subText: null,
        };
      }

      const hours = Math.floor(minutesUntilNap / 60);
      const mins = minutesUntilNap % 60;
      const countdownText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      return {
        type: 'countdown' as const,
        label: 'PROPERA MIGDIADA',
        mainText: countdownText,
        subText: `~${format(suggestedNapTime, 'HH:mm')}`,
      };
    }

    if (isToday) {
      return {
        type: 'today' as const,
        label: 'AVUI',
        mainText: format(currentTime, 'HH:mm'),
        subText: null,
      };
    }

    return {
      type: 'past' as const,
      label: format(selectedDateObj, 'EEE').toUpperCase(),
      mainText: format(selectedDateObj, 'd MMM'),
      subText: null,
    };
  };

  const centerInfo = getCenterInfo();

  // Format display date for header
  const displayDate = format(selectedDateObj, 'MMMM d');

  // Label radius increased for more spacing
  const labelRadius = 115;

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
        {/* SVG Definitions */}
        <defs>
          {/* Night sleep gradient */}
          <linearGradient id="nightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6670a8" />
            <stop offset="100%" stopColor="#7c85c4" />
          </linearGradient>

          {/* Nap gradient */}
          <linearGradient id="napGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a9294" />
            <stop offset="100%" stopColor="#5eadb0" />
          </linearGradient>

          {/* Prediction gradient (lighter) */}
          <linearGradient id="predictionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a9294" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#5eadb0" stopOpacity="0.5" />
          </linearGradient>

          {/* Needle gradient - fades toward center */}
          <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f0c674" stopOpacity="0" />
            <stop offset="40%" stopColor="#f0c674" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f0c674" stopOpacity="0.9" />
          </linearGradient>

          {/* Center radial gradient for glassmorphism */}
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(30, 40, 69, 0.9)" />
            <stop offset="100%" stopColor="rgba(15, 20, 40, 1)" />
          </radialGradient>

          {/* Drop shadow filter for active arcs */}
          <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(94, 173, 176, 0.4)" />
          </filter>

          {/* Drop shadow for night arcs */}
          <filter id="nightGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(124, 133, 196, 0.3)" />
          </filter>
        </defs>

        {/* Subtle background circle - represents 24-hour clock face */}
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="rgba(139, 157, 195, 0.1)"
          strokeWidth="1"
        />

        {/* Night sleep segments (arcs) - elegant thin stroke */}
        {segments
          .filter((segment) => segment.type === 'night')
          .map((segment) => (
            <path
              key={segment.id}
              d={describeArc(segment.startAngle, segment.endAngle, 88)}
              fill="none"
              stroke="url(#nightGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              filter={segment.isActive ? 'url(#activeGlow)' : 'url(#nightGlow)'}
              opacity={segment.isActive ? 1 : 0.9}
            />
          ))}

        {/* Logged naps (completed) - minimal elegant circles */}
        {segments
          .filter((segment) => segment.type === 'nap' && !segment.isActive)
          .map((segment) => {
            const napAngle = segment.startAngle;
            const napPos = polarToCartesian(100, 100, 88, napAngle);

            return (
              <g key={segment.id} transform={`translate(${napPos.x}, ${napPos.y})`}>
                {/* Elegant circle border */}
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill="rgba(30, 40, 69, 0.95)"
                  stroke="rgba(139, 157, 195, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="3,2"
                />

                {/* Minimalist sun icon */}
                <circle cx="0" cy="0" r="5" fill="#f0c674" opacity="0.9" />
                <g stroke="#f0c674" strokeWidth="1" strokeLinecap="round" opacity="0.7">
                  <line x1="0" y1="-8" x2="0" y2="-10" />
                  <line x1="0" y1="8" x2="0" y2="10" />
                  <line x1="-8" y1="0" x2="-10" y2="0" />
                  <line x1="8" y1="0" x2="10" y2="0" />
                </g>
              </g>
            );
          })}

        {/* Active nap (currently sleeping) - with glow effect */}
        {activeSleep && activeSleep.type === 'nap' && (() => {
          const napStartMinutes = differenceInMinutes(parseISO(activeSleep.startTime), dayStart);
          const napAngle = timeToAngle(napStartMinutes);
          const napPos = polarToCartesian(100, 100, 88, napAngle);

          // Calculate duration and estimated end time
          const duration = differenceInMinutes(currentTime, parseISO(activeSleep.startTime));
          const estimatedEndMinutes = napStartMinutes + duration;

          // Position for time labels (outside the circle)
          const startLabelAngle = napAngle - 15;
          const endLabelAngle = napAngle + 15;

          const startLabelPos = polarToCartesian(100, 100, labelRadius, startLabelAngle);
          const endLabelPos = polarToCartesian(100, 100, labelRadius, endLabelAngle);

          // Format times for labels
          const startTimeFormatted = format(parseISO(activeSleep.startTime), 'HH:mm');
          const endTimeFormatted = format(new Date(dayStart.getTime() + estimatedEndMinutes * 60000), 'HH:mm');

          return (
            <g key={activeSleep.id}>
              {/* Active circle with glow */}
              <g transform={`translate(${napPos.x}, ${napPos.y})`} filter="url(#activeGlow)">
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill="rgba(30, 40, 69, 0.95)"
                  stroke="url(#napGradient)"
                  strokeWidth="2"
                  className="animate-pulse"
                />

                {/* Minimalist sun icon */}
                <circle cx="0" cy="0" r="5" fill="#f0c674" />
                <g stroke="#f0c674" strokeWidth="1" strokeLinecap="round" opacity="0.85">
                  <line x1="0" y1="-8" x2="0" y2="-10" />
                  <line x1="0" y1="8" x2="0" y2="10" />
                  <line x1="-8" y1="0" x2="-10" y2="0" />
                  <line x1="8" y1="0" x2="10" y2="0" />
                </g>
              </g>

              {/* Start time label */}
              <text
                x={startLabelPos.x}
                y={startLabelPos.y}
                fill="rgba(232, 234, 237, 0.6)"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {startTimeFormatted}
              </text>

              {/* End time label */}
              <text
                x={endLabelPos.x}
                y={endLabelPos.y}
                fill="rgba(232, 234, 237, 0.6)"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {endTimeFormatted}
              </text>
            </g>
          );
        })()}

        {/* Current time indicator - thin elegant needle with gradient */}
        {currentAngle !== null && (
          <g transform={`rotate(${currentAngle}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="186"
              y2="100"
              stroke="url(#needleGradient)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <circle cx="186" cy="100" r="2.5" fill="#f0c674" opacity="0.85" />
          </g>
        )}

        {/* Wake time icon - Minimalist Sun */}
        <g transform={`translate(${wakeIconPos.x}, ${wakeIconPos.y})`}>
          <circle
            cx="0"
            cy="0"
            r="14"
            fill="rgba(30, 40, 69, 0.95)"
            stroke="#f0c674"
            strokeWidth="1.5"
          />
          {/* Minimalist sun - single path */}
          <path
            d="M0,-6 L0,-9 M0,6 L0,9 M-6,0 L-9,0 M6,0 L9,0 M-4.2,-4.2 L-6.4,-6.4 M4.2,-4.2 L6.4,-6.4 M-4.2,4.2 L-6.4,6.4 M4.2,4.2 L6.4,6.4"
            stroke="#f0c674"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <circle cx="0" cy="0" r="4" fill="#f0c674" />
        </g>
        {/* Wake time label */}
        <text
          x={wakeIconPos.x}
          y={wakeIconPos.y + 24}
          fill="rgba(232, 234, 237, 0.6)"
          fontSize="12"
          fontWeight="600"
          textAnchor="middle"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {wakeTimeLabel}
        </text>

        {/* Bedtime icon - Minimalist Moon */}
        <g transform={`translate(${bedIconPos.x}, ${bedIconPos.y})`}>
          <circle
            cx="0"
            cy="0"
            r="14"
            fill="rgba(30, 40, 69, 0.95)"
            stroke="#7c85c4"
            strokeWidth="1.5"
            strokeDasharray="3,3"
            opacity="0.9"
          />
          {/* Minimalist crescent moon path */}
          <path
            d="M-2,-6 A6,6 0 1,0 -2,6 A4.5,4.5 0 1,1 -2,-6"
            fill="#7c85c4"
            opacity="0.9"
          />
          {/* Single star */}
          <circle cx="5" cy="-4" r="1" fill="rgba(168, 180, 224, 0.7)" />
        </g>
        {/* Bed time label */}
        <text
          x={bedIconPos.x}
          y={bedIconPos.y + 24}
          fill="rgba(232, 234, 237, 0.6)"
          fontSize="12"
          fontWeight="600"
          textAnchor="middle"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {bedTimeLabel}
        </text>

        {/* Expected/Predicted naps - thin dashed arcs */}
        {napWindowAngles.map((nap, index) => {
          const napAngle = timeToAngle(nap.startMinutes);
          const napPos = polarToCartesian(100, 100, 88, napAngle);

          const startLabelAngle = napAngle - 15;
          const endLabelAngle = napAngle + 15;

          const startLabelPos = polarToCartesian(100, 100, labelRadius, startLabelAngle);
          const endLabelPos = polarToCartesian(100, 100, labelRadius, endLabelAngle);

          return (
            <g key={index}>
              {/* Prediction arc - thin dashed */}
              <path
                d={describeArc(nap.startAngle, nap.endAngle, 88)}
                fill="none"
                stroke="url(#predictionGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="4,4"
                opacity="0.6"
              />

              {/* Prediction circle */}
              <g transform={`translate(${napPos.x}, ${napPos.y})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="12"
                  fill="rgba(30, 40, 69, 0.6)"
                  stroke="rgba(139, 157, 195, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                {/* Faded sun */}
                <circle cx="0" cy="0" r="3.5" fill="#f0c674" opacity="0.5" />
                <g stroke="#f0c674" strokeWidth="0.75" strokeLinecap="round" opacity="0.4">
                  <line x1="0" y1="-6" x2="0" y2="-7.5" />
                  <line x1="0" y1="6" x2="0" y2="7.5" />
                  <line x1="-6" y1="0" x2="-7.5" y2="0" />
                  <line x1="6" y1="0" x2="7.5" y2="0" />
                </g>
              </g>

              {/* Time labels */}
              <text
                x={startLabelPos.x}
                y={startLabelPos.y}
                fill="rgba(232, 234, 237, 0.6)"
                fontSize="9"
                fontWeight="500"
                textAnchor="middle"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {nap.startTime}
              </text>
              <text
                x={endLabelPos.x}
                y={endLabelPos.y}
                fill="rgba(232, 234, 237, 0.6)"
                fontSize="9"
                fontWeight="500"
                textAnchor="middle"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {nap.endTime}
              </text>
            </g>
          );
        })}

        {/* Center circle with glassmorphism */}
        <circle
          cx="100"
          cy="100"
          r="42"
          fill="url(#centerGradient)"
          stroke="rgba(232, 234, 237, 0.1)"
          strokeWidth="1"
        />

        {/* Center text - Dynamic typography with proper letter-spacing */}
        {centerInfo.type === 'sleeping' ? (
          <>
            <text
              x="100"
              y="92"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="7"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.12em"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.label}
            </text>
            <text
              x="100"
              y="110"
              fill="#5eadb0"
              fontSize="18"
              fontWeight="700"
              textAnchor="middle"
              letterSpacing="-0.02em"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.mainText}
            </text>
            <circle cx="100" cy="118" r="2" fill="#5eadb0" className="animate-pulse" />
          </>
        ) : centerInfo.type === 'countdown' ? (
          <>
            <text
              x="100"
              y="88"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="7"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.12em"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.label}
            </text>
            <text
              x="100"
              y="108"
              fill="#f0c674"
              fontSize="18"
              fontWeight="700"
              textAnchor="middle"
              letterSpacing="-0.02em"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.mainText}
            </text>
            <text
              x="100"
              y="120"
              fill="rgba(232, 234, 237, 0.5)"
              fontSize="9"
              fontWeight="500"
              textAnchor="middle"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.subText}
            </text>
          </>
        ) : centerInfo.type === 'naptime' ? (
          <>
            <text
              x="100"
              y="92"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="7"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.12em"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.label}
            </text>
            <text
              x="100"
              y="112"
              fill="#f0c674"
              fontSize="22"
              fontWeight="700"
              textAnchor="middle"
              letterSpacing="-0.02em"
              className="animate-pulse"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.mainText}
            </text>
          </>
        ) : centerInfo.type === 'today' ? (
          <>
            <text
              x="100"
              y="92"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="7"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.12em"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.label}
            </text>
            <text
              x="100"
              y="112"
              fill="#e8eaed"
              fontSize="18"
              fontWeight="700"
              textAnchor="middle"
              letterSpacing="-0.02em"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.mainText}
            </text>
          </>
        ) : (
          <>
            <text
              x="100"
              y="92"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="7"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="0.12em"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.label}
            </text>
            <text
              x="100"
              y="110"
              fill="rgba(232, 234, 237, 0.6)"
              fontSize="14"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="-0.02em"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {centerInfo.mainText}
            </text>
          </>
        )}
      </svg>

      {/* Refined Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-5">
        {/* Nap */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="rgba(30, 40, 69, 0.95)" stroke="rgba(139, 157, 195, 0.4)" strokeWidth="1" strokeDasharray="2,1.5" />
            <circle cx="8" cy="8" r="2.5" fill="#f0c674" opacity="0.9" />
          </svg>
          <span className="text-white/50 text-xs font-display">Migdiada</span>
        </div>

        {/* Suggested */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="rgba(30, 40, 69, 0.6)" stroke="rgba(139, 157, 195, 0.3)" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
            <circle cx="8" cy="8" r="2" fill="#f0c674" opacity="0.5" />
          </svg>
          <span className="text-white/50 text-xs font-display">Suggerida</span>
        </div>

        {/* Night */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg, #6670a8, #7c85c4)' }} />
          <span className="text-white/50 text-xs font-display">Nit</span>
        </div>

        {/* Wake */}
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="2.5" fill="#f0c674" />
            <g stroke="#f0c674" strokeWidth="1" strokeLinecap="round" opacity="0.7">
              <line x1="7" y1="1" x2="7" y2="3" />
              <line x1="7" y1="11" x2="7" y2="13" />
              <line x1="1" y1="7" x2="3" y2="7" />
              <line x1="11" y1="7" x2="13" y2="7" />
            </g>
          </svg>
          <span className="text-white/50 text-xs font-display">Despertar</span>
        </div>

        {/* Bed */}
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M5,2 A5,5 0 1,0 5,12 A3.5,3.5 0 1,1 5,2" fill="#7c85c4" opacity="0.9" />
            <circle cx="11" cy="3" r="1" fill="rgba(168, 180, 224, 0.7)" />
          </svg>
          <span className="text-white/50 text-xs font-display">Dormir</span>
        </div>
      </div>
    </div>
  );
}
