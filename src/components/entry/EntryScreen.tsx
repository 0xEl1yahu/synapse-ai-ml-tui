import { AsciiWater, wordmark } from './AsciiWater';
import './entry.css';

interface EntryScreenProps {
  onEnter: () => void;
  loading: boolean;
  failed: boolean;
}

export function EntryScreen({ onEnter, loading, failed }: EntryScreenProps) {
  return (
    <main className="entry-screen">
      <h1 className="entry-heading">
        <span className="entry-title-text">{wordmark}</span>
        <AsciiWater />
      </h1>
      <button type="button" className="entry-button" onClick={onEnter} disabled={loading}>
        {loading ? 'Opening curriculum…' : 'Enter curriculum'}
        <span className="entry-key" aria-hidden="true">↵</span>
      </button>
      {failed && <p role="alert">The curriculum couldn’t load. Check your connection and try again.</p>}
    </main>
  );
}
