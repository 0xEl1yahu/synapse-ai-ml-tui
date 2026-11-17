import React, { useState } from 'react';
import { TaxonomyModule, ThemeId, TrackId, ViewMode, WebGLSceneId } from '../../types';

export interface CommandLineBarProps {
  modules: TaxonomyModule[];
  manPages?: Record<
    string,
    { title: string; summary: string; command: string; moduleId: string; subTopicId?: string }
  >;
  onNavigateView: (view: ViewMode) => void;
  onSelectSubTopic: (moduleId: string, subTopicId: string) => void;
  onSelectScene: (sceneId: WebGLSceneId) => void;
  onToggleAscii: (force?: boolean) => void;
  onChangeTrack: (track: TrackId) => void;
  onChangeTheme: (theme: ThemeId) => void;
  onOpenSearch: () => void;
}

const QUICK_CHIPS = [
  { label: 'wtf attention', cmd: 'wtf attention' },
  { label: 'wtf backprop', cmd: 'wtf backprop' },
  { label: 'wtf agent-harness', cmd: 'wtf agent-harness' },
  { label: 'wtf orchestration', cmd: 'wtf orchestration' },
  { label: 'wtf sdk', cmd: 'wtf sdk' },
  { label: 'wtf docker', cmd: 'wtf docker' },
  { label: 'wtf vlm', cmd: 'wtf vlm' },
  { label: 'papers', cmd: 'papers' },
];

export const CommandLineBar: React.FC<CommandLineBarProps> = ({
  modules,
  manPages = {},
  onNavigateView,
  onSelectSubTopic,
  onSelectScene,
  onToggleAscii,
  onChangeTrack,
  onChangeTheme,
  onOpenSearch,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [consoleLog, setConsoleLog] = useState<{ cmd: string; output: string } | null>(null);

  const executeCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    setHistory((prev) => [trimmed, ...prev.slice(0, 29)]);
    setHistoryIdx(-1);

    const parts = trimmed.toLowerCase().split(/\s+/);
    const verb = parts[0];
    const arg = parts.slice(1).join(' ');

    if (verb === 'help' || verb === '?') {
      setConsoleLog({
        cmd: trimmed,
        output:
          'COMMANDS: wtf <topic> (e.g. wtf attention, wtf backprop, wtf agent-harness, wtf grpo, wtf svd, wtf sae) | lab <neural-lattice|loss-landscape|latent-galaxy|attention-rope|flow-matching|superposition-sae> | cd <home|library|lab|roadmap|resources> | ascii <on|off> | track <builder|ml-engineer|researcher> | theme <phosphor|amber-crt|cyber-cyan|paper-lab> | clear',
      });
      return;
    }

    if (verb === 'clear') {
      setConsoleLog(null);
      return;
    }

    if (verb === 'search' || verb === 'find') {
      onOpenSearch();
      return;
    }

    if (verb === 'ls') {
      setConsoleLog({
        cmd: trimmed,
        output: modules.map((m) => `${m.number}_${m.slug}/ (${m.subTopics.length} topics)`).join('  |  '),
      });
      return;
    }

    if (verb === 'ascii') {
      if (arg === 'on' || arg === 'true' || arg === '1') {
        onToggleAscii(true);
        setConsoleLog({ cmd: trimmed, output: '[GLSL_ASCII_SHADER]: ENABLED (--render=ascii)' });
      } else if (arg === 'off' || arg === 'false' || arg === '0') {
        onToggleAscii(false);
        setConsoleLog({ cmd: trimmed, output: '[GLSL_ASCII_SHADER]: DISABLED (--render=shader)' });
      } else {
        onToggleAscii();
        setConsoleLog({ cmd: trimmed, output: '[GLSL_ASCII_SHADER]: TOGGLED' });
      }
      return;
    }

    if (verb === 'theme') {
      const validThemes: ThemeId[] = ['phosphor', 'amber-crt', 'cyber-cyan', 'paper-lab'];
      const match = validThemes.find((t) => t.startsWith(arg));
      if (match) {
        onChangeTheme(match);
        setConsoleLog({ cmd: trimmed, output: `[THEME]: Switched active palette to '${match}'` });
      } else {
        setConsoleLog({
          cmd: trimmed,
          output: `Usage: theme <phosphor | amber-crt | cyber-cyan | paper-lab>`,
        });
      }
      return;
    }

    if (verb === 'track') {
      const validTracks: TrackId[] = ['builder', 'ml-engineer', 'researcher'];
      const match = validTracks.find((t) => t.includes(arg));
      if (match) {
        onChangeTrack(match);
        onNavigateView('roadmap');
        setConsoleLog({ cmd: trimmed, output: `[TRACK]: Active roadmap track set to --track=${match}` });
      } else {
        setConsoleLog({ cmd: trimmed, output: 'Usage: track <builder | ml-engineer | researcher>' });
      }
      return;
    }

    if (verb === 'lab' || verb === 'scene') {
      const scenes: WebGLSceneId[] = [
        'neural-lattice',
        'loss-landscape',
        'latent-galaxy',
        'attention-rope',
        'flow-matching',
        'superposition-sae',
      ];
      const match = scenes.find((s) => s.includes(arg));
      if (match) {
        onSelectScene(match);
        onNavigateView('webgl-lab');
        setConsoleLog({ cmd: trimmed, output: `[WEBGL2_LAB]: Mounted 3D scene '${match}'` });
      } else {
        onNavigateView('webgl-lab');
        setConsoleLog({
          cmd: trimmed,
          output: `Opened AI Systems Lab. Available scenes: ${scenes.join(', ')}`,
        });
      }
      return;
    }

    if (verb === 'cd') {
      if (arg === '~' || arg === 'home' || arg === 'overview') {
        onNavigateView('overview');
        return;
      }
      if (arg.includes('paper') || arg.includes('arxiv')) {
        onNavigateView('papers');
        setConsoleLog({
          cmd: trimmed,
          output: 'Mounted ~/wtfis-ai/papers-decoded/ (Attention Is All You Need, ResNet, LoRA, FlashAttention, DeepSeek-R1...)',
        });
        return;
      }
      if (arg.includes('roadmap') || arg.includes('dag')) {
        onNavigateView('roadmap');
        return;
      }
      if (arg.includes('resource')) {
        onNavigateView('resources');
        return;
      }
      if (arg.includes('lab') || arg.includes('webgl')) {
        onNavigateView('webgl-lab');
        return;
      }
      const modMatch = modules.find(
        (m) =>
          m.number === arg ||
          m.slug.includes(arg) ||
          m.id.includes(arg)
      );
      if (modMatch) {
        onSelectSubTopic(modMatch.id, modMatch.subTopics[0].id);
        onNavigateView('module');
        setConsoleLog({ cmd: trimmed, output: `Mounted ${modMatch.filePath}` });
        return;
      }
    }

    if (verb === 'paper' || verb === 'papers') {
      onNavigateView('papers');
      setConsoleLog({
        cmd: trimmed,
        output: '[PAPERS_DECODED]: Opened Canonical Paper Dissector (Attention Is All You Need, ResNet, LoRA, FlashAttention, RoPE, GRPO, DPO, Flow Matching, PagedAttention, SAEs)',
      });
      return;
    }

    if (verb === 'wtf' || verb === 'man') {
      const cleanQuery = arg.replace(/^is\s+/, '').trim();
      const manHit = manPages[cleanQuery];
      if (manHit) {
        const mod = modules.find((m) => m.id === manHit.moduleId);
        const subId = manHit.subTopicId || mod?.subTopics[0]?.id || '';
        onSelectSubTopic(manHit.moduleId, subId);
        onNavigateView('module');
        setConsoleLog({
          cmd: trimmed,
          output: `[${manHit.title}]: ${manHit.summary}`,
        });
        return;
      }

      // Fuzzy match across all subtopics
      for (const mod of modules) {
        for (const st of mod.subTopics) {
          if (
            st.commandSlug.includes(cleanQuery) ||
            st.title.toLowerCase().includes(cleanQuery)
          ) {
            onSelectSubTopic(mod.id, st.id);
            onNavigateView('module');
            setConsoleLog({
              cmd: trimmed,
              output: `Opened "${st.title}" (${mod.filePath})`,
            });
            return;
          }
        }
      }
    }

    setConsoleLog({
      cmd: trimmed,
      output: `Command not recognized: "${trimmed}". Type 'help' or 'wtf attention' / 'wtf backprop' / 'wtf agent-harness'.`,
    });
  };

  return (
    <div className="shrink-0 bg-[var(--bg-pane)] border-t border-[var(--border-grid)] font-mono text-xs">
      {/* Expandable Console Output Drawer */}
      {consoleLog && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#05070A] border-b border-[var(--border-grid)] text-[11px]">
          <div className="truncate">
            <span className="text-[var(--text-secondary)] mr-2">$ {consoleLog.cmd} ──▸</span>
            <span className="text-[var(--accent-primary)]">{consoleLog.output}</span>
          </div>
          <button
            type="button"
            onClick={() => setConsoleLog(null)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] ml-3 cursor-pointer"
          >
            [×]
          </button>
        </div>
      )}

      {/* Main Prompt Input Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCommand(input);
            setInput('');
          }}
          className="flex-1 flex items-center gap-2 min-w-[260px]"
        >
          <span className="text-[var(--accent-primary)] font-bold whitespace-nowrap">
            engineer@wtfis.ai:~$ ❯
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' && history.length > 0) {
                e.preventDefault();
                const nextIdx = Math.min(history.length - 1, historyIdx + 1);
                setHistoryIdx(nextIdx);
                setInput(history[nextIdx]);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIdx <= 0) {
                  setHistoryIdx(-1);
                  setInput('');
                } else {
                  const nextIdx = historyIdx - 1;
                  setHistoryIdx(nextIdx);
                  setInput(history[nextIdx]);
                }
              }
            }}
            placeholder="Type a command: 'wtf attention', 'wtf agent-harness', 'lab loss-landscape', 'ascii on', 'help'..."
            className="w-full bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)] px-1 text-xs"
          />
        </form>

        {/* Quick-Execute Command Chips */}
        <div className="hidden lg:flex items-center gap-1">
          <span className="text-[10px] text-[var(--text-muted)] mr-1">QUICK_EXEC:</span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.cmd}
              type="button"
              onClick={() => executeCommand(chip.cmd)}
              className="px-1.5 py-0.5 text-[10px] border border-[var(--border-grid)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandLineBar;
