import { useMemo } from 'react';
import type { SleepEntry } from '../types';
import { parseISO, format, differenceInMinutes, startOfDay, isToday as checkIsToday } from 'date-fns';

/**
 * CircularClock - 24-hour biological clock visualization (Napper-style)
 *
 * Visual features:
 * - Gradient strokes on sleep arcs
 * - Glass-morphism center with dynamic typography
 * - Sun/Moon icons for wake/bed transition points
 * - Dashed prediction arcs with reduced opacity
 *
 * Time label positioning:
 * - Logged naps: NO labels (already happened)
 * - Active nap: Start + end times at ±15° offset, radius 108
 * - Expected naps: Start + end times at ±15° offset, radius 108
 * - Wake/Bed: Icons at radius 98 (outside main arc)
 *
 * Radius values:
 * - Background circle: 88
 * - Icon/nap positioning: 88
 * - Night arc radius: 88
 * - Wake/Bed icons: 98 (outside)
 * - Time labels: 108 (outside icons)
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
        {/* SVG Gradients for arcs */}
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
            <stop offset="0%" stopColor="#4a9294" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5eadb0" stopOpacity="0.6" />
          </linearGradient>

          {/* Glass effect filter */}
          <filter id="glassBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>

          {/* Glow effect for active states */}
          <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feFlood floodColor="#5eadb0" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

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


        {/* Night sleep segments (arcs) with gradient */}
        {segments
          .filter((segment) => segment.type === 'night')
          .map((segment) => (
            <path
              key={segment.id}
              d={describeArc(segment.startAngle, segment.endAngle, 88)}
              fill="none"
              stroke="url(#nightGradient)"
              strokeWidth="24"
              strokeLinecap="round"
              className={segment.isActive ? 'animate-pulse' : ''}
              opacity={segment.isActive ? 1 : 0.85}
            />
          ))}

        {/* Logged naps (completed) - dotted circles, NO time labels */}
        {segments
          .filter((segment) => segment.type === 'nap' && !segment.isActive)
          .map((segment) => {
            const napAngle = segment.startAngle;
            const napPos = polarToCartesian(100, 100, 88, napAngle);

            return (
              <g key={segment.id} transform={`translate(${napPos.x}, ${napPos.y})`}>
                {/* Dotted circle border */}
                <circle
                  cx="0"
                  cy="0"
                  r="22"
                  fill="rgba(30, 40, 69, 0.95)"
                  stroke="#8b9dc3"
                  strokeWidth="2.5"
                  strokeDasharray="4,3"
                />

                {/* Cloud + Sun icon (centered) */}
                <g>
                  {/* Small sun behind cloud */}
                  <circle cx="5" cy="-2" r="5.5" fill="#f0c674" opacity="0.95" />

                  {/* Sun rays (3 rays at 0°, 60°, 120°) */}
                  {[0, 60, 120].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const x1 = 5 + 7 * Math.cos(rad);
                    const y1 = -2 + 7 * Math.sin(rad);
                    const x2 = 5 + 10 * Math.cos(rad);
                    const y2 = -2 + 10 * Math.sin(rad);
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
                        opacity="0.9"
                      />
                    );
                  })}

                  {/* Cloud */}
                  <ellipse cx="-1" cy="3" rx="7" ry="5" fill="white" opacity="0.95" />
                  <circle cx="-6" cy="0" r="4" fill="white" opacity="0.95" />
                  <circle cx="3" cy="0" r="3.5" fill="white" opacity="0.95" />
                </g>
              </g>
            );
          })}

        {/* Active nap (currently sleeping) - dotted circle WITH time labels and pulsing */}
        {activeSleep && activeSleep.type === 'nap' && (() => {
          const napStartMinutes = differenceInMinutes(parseISO(activeSleep.startTime), dayStart);
          const napAngle = timeToAngle(napStartMinutes);
          const napPos = polarToCartesian(100, 100, 88, napAngle);

          // Calculate duration and estimated end time
          const duration = differenceInMinutes(currentTime, parseISO(activeSleep.startTime));
          const estimatedEndMinutes = napStartMinutes + duration;

          // Position for time labels (outside the circle)
          const labelRadius = 108;
          const startLabelAngle = napAngle - 15; // Slightly counter-clockwise
          const endLabelAngle = napAngle + 15;   // Slightly clockwise

          const startLabelPos = polarToCartesian(100, 100, labelRadius, startLabelAngle);
          const endLabelPos = polarToCartesian(100, 100, labelRadius, endLabelAngle);

          // Format times for labels
          const startTimeFormatted = format(parseISO(activeSleep.startTime), 'HH:mm');
          const endTimeFormatted = format(new Date(dayStart.getTime() + estimatedEndMinutes * 60000), 'HH:mm');

          return (
            <g key={activeSleep.id}>
              {/* Dotted circle with pulsing animation and glow */}
              <g transform={`translate(${napPos.x}, ${napPos.y})`} className="animate-pulse" filter="url(#glowEffect)">
                <circle
                  cx="0"
                  cy="0"
                  r="22"
                  fill="rgba(30, 40, 69, 0.95)"
                  stroke="url(#napGradient)"
                  strokeWidth="2.5"
                  strokeDasharray="4,3"
                />

                {/* Cloud + Sun icon (same as logged nap) */}
                <g>
                  <circle cx="5" cy="-2" r="5.5" fill="#f0c674" opacity="0.95" />
                  {[0, 60, 120].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    return (
                      <line
                        key={angle}
                        x1={5 + 7 * Math.cos(rad)}
                        y1={-2 + 7 * Math.sin(rad)}
                        x2={5 + 10 * Math.cos(rad)}
                        y2={-2 + 10 * Math.sin(rad)}
                        stroke="#f0c674"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                    );
                  })}
                  <ellipse cx="-1" cy="3" rx="7" ry="5" fill="white" opacity="0.95" />
                  <circle cx="-6" cy="0" r="4" fill="white" opacity="0.95" />
                  <circle cx="3" cy="0" r="3.5" fill="white" opacity="0.95" />
                </g>
              </g>

              {/* Start time label */}
              <text
                x={startLabelPos.x}
                y={startLabelPos.y}
                fill="#8b9dc3"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                className="font-display"
              >
                {startTimeFormatted}
              </text>

              {/* End time label (current/estimated) */}
              <text
                x={endLabelPos.x}
                y={endLabelPos.y}
                fill="#8b9dc3"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                className="font-display"
              >
                {endTimeFormatted}
              </text>
            </g>
          );
        })()}

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

        {/* Wake time icon - Sun (outside arc radius +10) */}
        <g transform={`translate(${wakeIconPos.x}, ${wakeIconPos.y})`}>
          {/* Solid circle background with golden border */}
          <circle
            cx="0"
            cy="0"
            r="18"
            fill="#2a3655"
            stroke="#f0c674"
            strokeWidth="2.5"
          />

          {/* Sun icon (centered) */}
          <circle cx="0" cy="0" r="7" fill="#f0c674" />

          {/* Sun rays (8 rays at 45° intervals) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 9 * Math.cos(rad);
            const y1 = 9 * Math.sin(rad);
            const x2 = 13 * Math.cos(rad);
            const y2 = 13 * Math.sin(rad);
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
        </g>
        {/* Wake time label (below icon) */}
        <text
          x={wakeIconPos.x}
          y={wakeIconPos.y + 28}
          fill="#f0c674"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          className="font-display"
        >
          {wakeTimeLabel}
        </text>

        {/* Bedtime icon - Moon (outside arc radius +10) */}
        <g transform={`translate(${bedIconPos.x}, ${bedIconPos.y})`}>
          {/* Dotted circle border for prediction */}
          <circle
            cx="0"
            cy="0"
            r="18"
            fill="#2a3655"
            stroke="#7c85c4"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.9"
          />

          {/* Moon icon (crescent) */}
          <g transform="translate(0, 0)">
            {/* Main moon circle */}
            <circle cx="-2" cy="0" r="8" fill="#7c85c4" />
            {/* Dark cutout to create crescent */}
            <circle cx="3" cy="-3" r="6" fill="#2a3655" />
            {/* Small stars around moon */}
            <circle cx="7" cy="-6" r="1" fill="#a8b4e0" opacity="0.8" />
            <circle cx="9" cy="2" r="0.8" fill="#a8b4e0" opacity="0.6" />
            <circle cx="5" cy="7" r="0.6" fill="#a8b4e0" opacity="0.5" />
          </g>
        </g>
        {/* Bed time label (below icon) */}
        <text
          x={bedIconPos.x}
          y={bedIconPos.y + 28}
          fill="#7c85c4"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          className="font-display"
        >
          {bedTimeLabel}
        </text>

        {/* Expected/Predicted naps - dashed arcs with 60% opacity */}
        {napWindowAngles.map((nap, index) => {
          const napAngle = timeToAngle(nap.startMinutes);
          const napPos = polarToCartesian(100, 100, 88, napAngle);

          // Position for time labels (outside circle)
          const labelRadius = 108;
          const startLabelAngle = napAngle - 15;
          const endLabelAngle = napAngle + 15;

          const startLabelPos = polarToCartesian(100, 100, labelRadius, startLabelAngle);
          const endLabelPos = polarToCartesian(100, 100, labelRadius, endLabelAngle);

          return (
            <g key={index}>
              {/* Prediction arc - dashed with 60% opacity */}
              <path
                d={describeArc(nap.startAngle, nap.endAngle, 88)}
                fill="none"
                stroke="url(#predictionGradient)"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray="4,4"
                opacity="0.6"
              />

              {/* Dotted circle at start position */}
              <g transform={`translate(${napPos.x}, ${napPos.y})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="18"
                  fill="rgba(30, 40, 69, 0.7)"
                  stroke="#8b9dc3"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity="0.6"
                />

                {/* Cloud + Sun icon (more transparent) */}
                <g opacity="0.6">
                  <circle cx="4" cy="-2" r="4" fill="#f0c674" opacity="0.6" />

                  {[0, 60, 120].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    return (
                      <line
                        key={angle}
                        x1={4 + 5 * Math.cos(rad)}
                        y1={-2 + 5 * Math.sin(rad)}
                        x2={4 + 7 * Math.cos(rad)}
                        y2={-2 + 7 * Math.sin(rad)}
                        stroke="#f0c674"
                        strokeWidth="1"
                        strokeLinecap="round"
                        opacity="0.6"
                      />
                    );
                  })}

                  <ellipse cx="-1" cy="2" rx="5" ry="4" fill="white" opacity="0.5" />
                  <circle cx="-4" cy="0" r="3" fill="white" opacity="0.5" />
                  <circle cx="2" cy="0" r="2.5" fill="white" opacity="0.5" />
                </g>
              </g>

              {/* Start time label */}
              <text
                x={startLabelPos.x}
                y={startLabelPos.y}
                fill="rgba(139, 157, 195, 0.7)"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                className="font-display"
              >
                {nap.startTime}
              </text>

              {/* End time label */}
              <text
                x={endLabelPos.x}
                y={endLabelPos.y}
                fill="rgba(139, 157, 195, 0.7)"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                className="font-display"
              >
                {nap.endTime}
              </text>
            </g>
          );
        })}

        {/* Center circle with glass effect */}
        <circle
          cx="100"
          cy="100"
          r="42"
          fill="rgba(15, 20, 40, 0.85)"
          stroke="rgba(139, 157, 195, 0.2)"
          strokeWidth="1"
        />

        {/* Inner glow ring */}
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="rgba(94, 173, 176, 0.1)"
          strokeWidth="2"
        />

        {/* Center text - Dynamic typography hierarchy */}
        {centerInfo.type === 'sleeping' ? (
          <>
            {/* Status label - small, muted */}
            <text
              x="100"
              y="92"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
              className="font-display"
              letterSpacing="0.1em"
            >
              {centerInfo.label}
            </text>
            {/* Main time - large, highlighted */}
            <text
              x="100"
              y="110"
              fill="#5eadb0"
              fontSize="18"
              fontWeight="700"
              textAnchor="middle"
              className="font-display"
            >
              {centerInfo.mainText}
            </text>
            {/* Active indicator dot */}
            <circle cx="100" cy="118" r="2" fill="#5eadb0" className="animate-pulse" />
          </>
        ) : centerInfo.type === 'countdown' ? (
          <>
            {/* Status label - small, muted */}
            <text
              x="100"
              y="88"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
              className="font-display"
              letterSpacing="0.1em"
            >
              {centerInfo.label}
            </text>
            {/* Countdown - large, highlighted */}
            <text
              x="100"
              y="108"
              fill="#f0c674"
              fontSize="18"
              fontWeight="700"
              textAnchor="middle"
              className="font-display"
            >
              {centerInfo.mainText}
            </text>
            {/* Sub text - scheduled time */}
            <text
              x="100"
              y="120"
              fill="rgba(232, 234, 237, 0.5)"
              fontSize="9"
              fontWeight="500"
              textAnchor="middle"
              className="font-display"
            >
              {centerInfo.subText}
            </text>
          </>
        ) : centerInfo.type === 'naptime' ? (
          <>
            {/* Status label - small, muted */}
            <text
              x="100"
              y="92"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
              className="font-display"
              letterSpacing="0.1em"
            >
              {centerInfo.label}
            </text>
            {/* NOW - large, urgent gold */}
            <text
              x="100"
              y="112"
              fill="#f0c674"
              fontSize="22"
              fontWeight="700"
              textAnchor="middle"
              className="font-display animate-pulse"
            >
              {centerInfo.mainText}
            </text>
          </>
        ) : centerInfo.type === 'today' ? (
          <>
            {/* Status label - small, muted */}
            <text
              x="100"
              y="92"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
              className="font-display"
              letterSpacing="0.1em"
            >
              {centerInfo.label}
            </text>
            {/* Current time - large */}
            <text
              x="100"
              y="112"
              fill="#e8eaed"
              fontSize="18"
              fontWeight="700"
              textAnchor="middle"
              className="font-display"
            >
              {centerInfo.mainText}
            </text>
          </>
        ) : (
          <>
            {/* Day label - small, muted */}
            <text
              x="100"
              y="92"
              fill="rgba(232, 234, 237, 0.4)"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
              className="font-display"
              letterSpacing="0.1em"
            >
              {centerInfo.label}
            </text>
            {/* Date - large */}
            <text
              x="100"
              y="110"
              fill="rgba(232, 234, 237, 0.6)"
              fontSize="14"
              fontWeight="600"
              textAnchor="middle"
              className="font-display"
            >
              {centerInfo.mainText}
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-5">
        {/* Logged Nap */}
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="rgba(30, 40, 69, 0.95)"
              stroke="#8b9dc3"
              strokeWidth="2"
              strokeDasharray="3,2"
            />
            {/* Sun */}
            <circle cx="14" cy="10" r="3" fill="#f0c674" opacity="0.95" />
            {/* Sun rays */}
            <line x1="14" y1="6" x2="14" y2="4" stroke="#f0c674" strokeWidth="1" opacity="0.9" />
            <line x1="16.5" y1="7.5" x2="17.5" y2="6.5" stroke="#f0c674" strokeWidth="1" opacity="0.9" />
            {/* Cloud */}
            <ellipse cx="11" cy="13" rx="4" ry="3" fill="white" opacity="0.95" />
            <circle cx="8" cy="11" r="2.5" fill="white" opacity="0.95" />
            <circle cx="13" cy="11" r="2" fill="white" opacity="0.95" />
          </svg>
          <span className="text-white/65 text-xs font-display">Migdiada</span>
        </div>

        {/* Expected Nap */}
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="rgba(30, 40, 69, 0.7)"
              stroke="#8b9dc3"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            {/* Sun */}
            <circle cx="14" cy="10" r="3" fill="#f0c674" opacity="0.5" />
            {/* Cloud */}
            <ellipse cx="11" cy="13" rx="4" ry="3" fill="white" opacity="0.5" />
            <circle cx="8" cy="11" r="2.5" fill="white" opacity="0.5" />
            <circle cx="13" cy="11" r="2" fill="white" opacity="0.5" />
          </svg>
          <span className="text-white/65 text-xs font-display">Suggerida</span>
        </div>

        {/* Night */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #6670a8, #7c85c4)' }} />
          <span className="text-white/65 text-xs font-display">Nit</span>
        </div>

        {/* Wake */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="4" fill="#f0c674" />
            {/* Sun rays (4 main directions) */}
            {[0, 90, 180, 270].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={angle}
                  x1={8 + 5.5 * Math.cos(rad)}
                  y1={8 + 5.5 * Math.sin(rad)}
                  x2={8 + 7.5 * Math.cos(rad)}
                  y2={8 + 7.5 * Math.sin(rad)}
                  stroke="#f0c674"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
          <span className="text-white/65 text-xs font-display">Despertar</span>
        </div>

        {/* Bed */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            {/* Moon crescent */}
            <circle cx="7" cy="8" r="5" fill="#7c85c4" />
            <circle cx="10" cy="6" r="4" fill="#0f1428" />
            {/* Star */}
            <circle cx="13" cy="4" r="1" fill="#a8b4e0" opacity="0.8" />
          </svg>
          <span className="text-white/65 text-xs font-display">Dormir</span>
        </div>
      </div>
    </div>
  );
}
