import React, { useEffect, useRef, useState } from 'react';

const COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
  '#FF922B', '#CC5DE8', '#74C0FC', '#63E6BE',
  '#FF8FAB', '#FFE066',
];

const random = (a, b) => Math.random() * (b - a) + a;

const generate = () =>
  Array.from({ length: 80 }, (_, i) => ({
    id:     i,
    x:      random(2, 98),
    size:   random(7, 15),
    color:  COLORS[Math.floor(Math.random() * COLORS.length)],
    delay:  random(0, 0.7),
    dur:    random(1.6, 3.0),
    circle: Math.random() > 0.45,
  }));

/**
 * ConfettiEffect — renders coloured falling particles.
 * Pass `trigger` as a counter that increments whenever you want confetti to fire.
 */
const ConfettiEffect = ({ trigger }) => {
  const [particles, setParticles] = useState([]);
  const [visible,   setVisible]   = useState(false);
  const prev  = useRef(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!trigger || trigger === prev.current) return;
    prev.current = trigger;
    clearTimeout(timer.current);
    setParticles(generate());
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(timer.current);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position:     'absolute',
            left:         `${p.x}%`,
            top:          -18,
            width:        p.size,
            height:       p.circle ? p.size : p.size * 0.55,
            background:   p.color,
            borderRadius: p.circle ? '50%' : 2,
            animation:    `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
