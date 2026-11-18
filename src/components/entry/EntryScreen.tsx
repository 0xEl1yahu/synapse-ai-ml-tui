import type { CSSProperties } from 'react';
import { AsciiWater } from './AsciiWater';
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
  return (
    <main className="entry-screen">
      <h1 className="entry-heading">
        <span className="sr-only">WTFis.AI</span>
        <span aria-hidden="true" className="entry-wordmark">
          {letters}
        </span>
      </h1>
      <AsciiWater />
      <button type="button" className="entry-button" onClick={onEnter} disabled={loading}>
        <span aria-hidden="true">[ </span>{loading ? 'Opening curriculum…' : 'Enter curriculum'}<span aria-hidden="true"> ↵ ]</span>
      </button>
      {failed && <p role="alert">The curriculum couldn’t load. Check your connection and try again.</p>}
    </main>
  );
}
