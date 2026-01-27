import { useState, useEffect, useMemo } from 'react';

export type CircadianTheme = 'morning' | 'afternoon' | 'night';

interface CircadianThemeState {
  theme: CircadianTheme;
  isDark: boolean;
  /** Progress through current phase (0-1) for gradient interpolation */
  phaseProgress: number;
}

/**
 * Get theme override from URL parameter for development testing.
 * Use ?theme=morning, ?theme=afternoon, or ?theme=night
 */
function getThemeOverride(): CircadianTheme | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const override = params.get('theme');
  if (override === 'morning' || override === 'afternoon' || override === 'night') {
    return override;
  }
  return null;
}

/**
 * Returns the current circadian theme based on time of day.
 *
 * Time windows:
 * - Morning: 06:00 - 11:59 (6 hours)
 * - Afternoon: 12:00 - 18:59 (7 hours)
 * - Night: 19:00 - 05:59 (11 hours)
 *
 * The hook updates every minute to track time transitions smoothly.
 *
 * For development testing, add ?theme=morning|afternoon|night to the URL.
 */
export function useCircadianTheme(): CircadianThemeState {
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [currentMinute, setCurrentMinute] = useState(() => new Date().getMinutes());
  const [themeOverride] = useState(() => getThemeOverride());

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentMinute(now.getMinutes());
    };

    // Update immediately
    updateTime();

    // Then update every minute
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const themeState = useMemo((): CircadianThemeState => {
    // Check for development override
    if (themeOverride) {
      return {
        theme: themeOverride,
        isDark: themeOverride === 'night',
        phaseProgress: 0.5, // Middle of phase for override
      };
    }

    // Calculate theme based on hour
    let theme: CircadianTheme;
    let phaseProgress: number;

    if (currentHour >= 6 && currentHour < 12) {
      // Morning: 06:00 - 11:59
      theme = 'morning';
      // Progress through morning (6 hours = 360 minutes)
      const minutesIntoMorning = (currentHour - 6) * 60 + currentMinute;
      phaseProgress = minutesIntoMorning / 360;
    } else if (currentHour >= 12 && currentHour < 19) {
      // Afternoon: 12:00 - 18:59
      theme = 'afternoon';
      // Progress through afternoon (7 hours = 420 minutes)
      const minutesIntoAfternoon = (currentHour - 12) * 60 + currentMinute;
      phaseProgress = minutesIntoAfternoon / 420;
    } else {
      // Night: 19:00 - 05:59
      theme = 'night';
      // Progress through night (11 hours = 660 minutes)
      let minutesIntoNight: number;
      if (currentHour >= 19) {
        minutesIntoNight = (currentHour - 19) * 60 + currentMinute;
      } else {
        // After midnight (00:00 - 05:59)
        minutesIntoNight = (5 * 60) + (currentHour * 60) + currentMinute;
      }
      phaseProgress = minutesIntoNight / 660;
    }

    return {
      theme,
      isDark: theme === 'night',
      phaseProgress: Math.min(1, Math.max(0, phaseProgress)),
    };
  }, [currentHour, currentMinute, themeOverride]);

  return themeState;
}

/**
 * Hook to apply the circadian theme class to the document body.
 * Call this once at the app root level.
 */
export function useApplyCircadianTheme(): CircadianThemeState {
  const themeState = useCircadianTheme();

  useEffect(() => {
    const { theme } = themeState;
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('theme-morning', 'theme-afternoon', 'theme-night');

    // Add current theme class
    root.classList.add(`theme-${theme}`);

    // Update color-scheme for native elements
    root.style.colorScheme = theme === 'night' ? 'dark' : 'light';
  }, [themeState.theme]);

  return themeState;
}
