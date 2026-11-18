import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { EntryScreen } from './components/entry/EntryScreen'
import { readStorage, writeStorage } from './storage'

const entryKey = 'wtfis_ai_entered_v1';
type CurriculumComponent = typeof import('./App').default;

function Site() {
  const [returning] = useState(() => readStorage('sessionStorage', entryKey) === '1');
  const [opening, setOpening] = useState(returning);
  const [failed, setFailed] = useState(false);
  const [Curriculum, setCurriculum] = useState<CurriculumComponent | null>(null);

  useEffect(() => {
    if (!opening) return;
    let active = true;
    import('./App').then(({ default: App }) => {
      if (!active) return;
      writeStorage('sessionStorage', entryKey, '1');
      setCurriculum(() => App);
    }).catch(() => {
      if (!active) return;
      setFailed(true);
      setOpening(false);
    });
    return () => { active = false; };
  }, [opening]);

  if (Curriculum) return <Curriculum focusOnEntry={!returning} />;
  if (returning && opening) return <main className="entry-screen" role="status">Opening curriculum…</main>;
  return <EntryScreen loading={opening} failed={failed} onEnter={() => {
    setFailed(false);
    setOpening(true);
  }} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Site />
  </StrictMode>,
)
