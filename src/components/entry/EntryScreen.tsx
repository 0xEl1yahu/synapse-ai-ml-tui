import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
import './entry.css';

const glyphs = {
  W: ['#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  F: ['####', '#...', '###.', '#...', '#...'],
  i: ['#', '.', '#', '#', '#'],
  s: ['.###', '#...', '####', '...#', '###.'],
  '.': ['.', '.', '.', '.', '#'],
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
};

const letters = (Object.keys(glyphs) as (keyof typeof glyphs)[]).map(letter => {
  const rows = glyphs[letter];
  return (
    <span key={letter} className={`entry-letter ${letter === 'i' || letter === 's' ? 'entry-lower' : ''} ${letter === '.' ? 'entry-dot' : ''}`}
      style={{ '--columns': rows[0].length } as CSSProperties}>
      {rows.flatMap((row, y) => Array.from(row, (pixel, x) => pixel === '#' && (
        <span className="entry-cell" key={y * row.length + x} style={{ gridRow: y + 1, gridColumn: x + 1 }}>
          {letter === '.' ? '▓' : y === 4 && x % 3 === 1 ? '░' : y === 4 ? '▓' : '█'}
        </span>
      )))}
    </span>
  );
});

interface EntryScreenProps {
  onEnter: () => void;
  loading: boolean;
  failed: boolean;
}

export function EntryScreen({ onEnter, loading, failed }: EntryScreenProps) {
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function ripple(event: PointerEvent<HTMLSpanElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current) return;
    const mark = event.currentTarget;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const radius = parseFloat(getComputedStyle(mark).fontSize) * 1.7;
      for (const cell of mark.querySelectorAll<HTMLElement>('.entry-cell')) {
        const box = cell.getBoundingClientRect();
        const dx = box.x + box.width / 2 - pointer.current.x;
        const dy = box.y + box.height / 2 - pointer.current.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= radius || cell.classList.contains('rippling')) continue;
        const strength = (1 - distance / radius) * box.width * 0.32;
        cell.style.setProperty('--shift-x', `${dx / Math.max(distance, 1) * strength}px`);
        cell.style.setProperty('--shift-y', `${dy / Math.max(distance, 1) * strength - box.height * 0.12}px`);
        cell.style.animationDelay = `${Math.round(distance / radius * 65)}ms`;
        cell.classList.add('rippling');
      }
    });
  }

  return (
    <main className="entry-screen">
      <h1 className="entry-heading">
        <span className="sr-only">WTFis.AI</span>
        <span aria-hidden="true" className="entry-wordmark" onPointerMove={ripple} onPointerDown={ripple}
          onAnimationEnd={event => (event.target as HTMLElement).classList.remove('rippling')}>
          {letters}
        </span>
      </h1>
      <button type="button" className="entry-button" onClick={onEnter} disabled={loading}>
        <span aria-hidden="true">[ </span>{loading ? 'Opening curriculum…' : 'Enter curriculum'}<span aria-hidden="true"> ↵ ]</span>
      </button>
      {failed && <p role="alert">The curriculum couldn’t load. Check your connection and try again.</p>}
    </main>
  );
}
