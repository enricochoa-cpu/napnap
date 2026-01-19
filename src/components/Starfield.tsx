import { useMemo } from 'react';

export function Starfield() {
  const stars = useMemo(() => {
    const starArray = [];
    for (let i = 0; i < 50; i++) {
      const size = Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small';
      starArray.push({
        id: i,
        size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${2 + Math.random() * 4}s`,
        delay: `${Math.random() * 3}s`,
        baseOpacity: 0.3 + Math.random() * 0.5,
      });
    }
    return starArray;
  }, []);

  return (
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
  );
}

export function Moon() {
  return <div className="moon" />;
}
