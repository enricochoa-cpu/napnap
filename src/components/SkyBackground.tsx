import { useMemo } from 'react';
import type { CircadianTheme } from '../hooks/useCircadianTheme';

interface SkyBackgroundProps {
  theme: CircadianTheme;
}

/**
 * Renders a theme-appropriate ambient sky background.
 * - Morning: Warm gradient with animated sun
 * - Afternoon: Cool gradient with drifting clouds
 * - Night: Dark gradient with twinkling stars and moon
 */
export function SkyBackground({ theme }: SkyBackgroundProps) {
  return (
    <>
      {/* Base sky gradient */}
      <div className="sky-background" />

      {/* Theme-specific decorations */}
      {theme === 'morning' && <MorningSky />}
      {theme === 'afternoon' && <AfternoonSky />}
      {theme === 'night' && <NightSky />}
    </>
  );
}

function MorningSky() {
  return (
    <div className="fixed inset-0 z-[-5] pointer-events-none overflow-hidden">
      {/* Animated sun */}
      <div className="sky-sun" />
    </div>
  );
}

function AfternoonSky() {
  return (
    <div className="sky-clouds">
      <div className="sky-cloud sky-cloud-1" />
      <div className="sky-cloud sky-cloud-2" />
      <div className="sky-cloud sky-cloud-3" />
    </div>
  );
}

function NightSky() {
  // Generate stars with stable positions using useMemo
  const stars = useMemo(() => {
    const starArray = [];
    for (let i = 0; i < 60; i++) {
      const size = Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small';
      starArray.push({
        id: i,
        size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 70}%`, // Keep stars in upper portion
        duration: `${2 + Math.random() * 4}s`,
        delay: `${Math.random() * 3}s`,
        baseOpacity: 0.3 + Math.random() * 0.5,
      });
    }
    return starArray;
  }, []);

  return (
    <>
      {/* Starfield */}
      <div className="starfield">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`star ${star.size}`}
            style={{
              left: star.left,
              top: star.top,
              '--duration': star.duration,
              '--delay': star.delay,
              '--base-opacity': star.baseOpacity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Moon */}
      <div className="fixed inset-0 z-[-4] pointer-events-none">
        <div className="moon" />
      </div>
    </>
  );
}
