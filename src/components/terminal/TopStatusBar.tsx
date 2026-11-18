import React from 'react';
import {
  Search,
  Sparkles,
  CheckSquare,
  Compass,
  Sliders,
} from 'lucide-react';
import { ThemeId, TrackId, ViewMode } from '../../types';
import { WTFBrandLogo } from './EcosystemLogos';

export interface TopStatusBarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  activePath: string;
  activeTrack: TrackId;
  onTrackChange: (track: TrackId) => void;
  activeTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  renderAscii: boolean;
  onToggleAscii: () => void;
  onOpenCommandPalette: () => void;
  completedCount: number;
  totalCount: number;
}

const VIEW_TABS: { id: ViewMode; code: string; label: string; shortLabel: string }[] = [
  { id: 'overview', code: '01', label: 'HOME_&_WTF_INDEX', shortLabel: 'WTF_INDEX' },
  { id: 'module', code: '02', label: 'WTF_IS_LIBRARY', shortLabel: 'LIBRARY' },
  { id: 'papers', code: '03', label: 'PAPERS_DECODED', shortLabel: 'PAPERS' },
  { id: 'webgl-lab', code: '04', label: 'AI_SYSTEMS_LAB', shortLabel: '3D_LAB' },
  { id: 'roadmap', code: '05', label: 'BUILD_ROADMAP', shortLabel: 'ROADMAP' },
  { id: 'resources', code: '06', label: 'OPEN_RESOURCES', shortLabel: 'RESOURCES' },
];

const TRACK_OPTIONS: { id: TrackId; label: string }[] = [
  { id: 'builder', label: 'builder' },
  { id: 'ml-engineer', label: 'ml-engineer' },
  { id: 'researcher', label: 'researcher' },
];

const THEME_OPTIONS: { id: ThemeId; label: string; dotColor: string }[] = [
  { id: 'phosphor', label: 'PHOSPHOR', dotColor: '#10B981' },
  { id: 'amber-crt', label: 'AMBER-CRT', dotColor: '#F59E0B' },
  { id: 'cyber-cyan', label: 'CYBER-CYAN', dotColor: '#06B6D4' },
  { id: 'paper-lab', label: 'PAPER-LAB', dotColor: '#0D9488' },
];

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  activeView,
  onViewChange,
  activePath,
  activeTrack,
  onTrackChange,
  activeTheme,
  onThemeChange,
  renderAscii,
  onToggleAscii,
  onOpenCommandPalette,
  completedCount,
  totalCount,
}) => {
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header
      className="w-full select-none font-mono text-xs border-b shrink-0"
      style={{
        backgroundColor: 'var(--bg-pane)',
        borderColor: 'var(--border-grid)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Tier: Brand Identity, Active Path, Quick Search & Telemetry */}
      <div
        className="flex flex-wrap items-center justify-between border-b min-h-[36px]"
        style={{ borderColor: 'var(--border-grid)' }}
      >
        {/* Left: Brand Emblem & UNIX Path */}
        <div className="flex items-center min-w-0">
          <button
            onClick={() => onViewChange('overview')}
            className="flex items-center gap-2 px-3 py-2 border-r font-bold tracking-wider transition-colors cursor-pointer"
            style={{
              borderColor: 'var(--border-grid)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--accent-primary)',
            }}
            title="Return to WTFIS.AI Home Index"
          >
            <WTFBrandLogo className="w-4 h-4 shrink-0" />
            <span className="font-display tracking-tight text-sm">WTFIS.AI</span>
            <span
              className="text-[10px] px-1.5 py-0.5 border font-normal hidden sm:inline-block"
              style={{
                borderColor: 'var(--border-grid)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-secondary)',
              }}
            >
              v2.6 // FREE_OPEN_PLAYGROUND
            </span>
          </button>

          {/* Active UNIX Path Breadcrumb */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 border-r truncate max-w-[360px]"
            style={{ borderColor: 'var(--border-grid)' }}
          >
            <span style={{ color: 'var(--text-muted)' }}>PATH:</span>
            <span
              className="truncate font-medium"
              style={{ color: 'var(--accent-param)' }}
            >
              {activePath}
            </span>
            <span
              className="inline-block w-1.5 h-3.5 animate-cursor"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>

        {/* Right: Search Trigger, Progress Telemetry & Theme Switcher */}
        <div className="flex items-center">
          {/* Ask "WTF is..." Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2.5 px-3 py-2 border-l transition-colors cursor-pointer hover:opacity-90"
            style={{
              borderColor: 'var(--border-grid)',
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
            }}
            title="Search any AI/ML concept (Cmd+K or /)"
          >
            <Search
              className="w-3.5 h-3.5"
              style={{ color: 'var(--accent-primary)' }}
            />
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              ASK &quot;WTF IS...&quot;
            </span>
            <kbd
              className="px-1.5 py-0.5 text-[10px] border"
              style={{
                borderColor: 'var(--border-grid)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--accent-primary)',
              }}
            >
              ⌘K /
            </kbd>
          </button>

          {/* Completion Progress Meter */}
          <div
            className="hidden lg:flex items-center gap-2 px-3 py-2 border-l text-[11px]"
            style={{ borderColor: 'var(--border-grid)' }}
            title={`${completedCount} of ${totalCount} subtopics reviewed`}
          >
            <CheckSquare
              className="w-3.5 h-3.5"
              style={{ color: 'var(--accent-primary)' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>REVIEWED:</span>
            <span style={{ color: 'var(--text-primary)' }}>
              {completedCount}/{totalCount}
            </span>
            <span style={{ color: 'var(--accent-primary)' }}>
              [{completionPct}%]
            </span>
          </div>

          {/* Theme Selector */}
          <div
            className="hidden sm:flex items-center border-l px-2 py-1 gap-1"
            style={{ borderColor: 'var(--border-grid)' }}
          >
            {THEME_OPTIONS.map((t) => {
              const isSelected = activeTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className="flex items-center gap-1 px-1.5 py-1 text-[10px] border transition-colors cursor-pointer"
                  style={{
                    borderColor: isSelected ? 'var(--border-active)' : 'transparent',
                    backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                  title={`Switch terminal theme to ${t.label}`}
                >
                  <span
                    className="w-2 h-2 inline-block"
                    style={{ backgroundColor: t.dotColor }}
                  />
                  <span className="hidden xl:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Tier: Primary View Mode Multiplexer Tabs + Track Flag + ASCII Shader Toggle */}
      <div className="flex items-center justify-between min-h-[34px] overflow-x-auto no-scrollbar">
        {/* View Mode Tabs */}
        <nav className="flex items-center shrink-0">
          {VIEW_TABS.map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 border-r text-[11px] tracking-tight whitespace-nowrap transition-colors cursor-pointer"
                style={{
                  borderColor: 'var(--border-grid)',
                  backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderBottom: isActive
                    ? '2px solid var(--accent-primary)'
                    : '2px solid transparent',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{tab.code}:</span>
                <span className="font-semibold hidden xl:inline">{tab.label}</span>
                <span className="font-semibold xl:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Track Selector & Real-Time ASCII Shader Toggle */}
        <div className="flex items-center shrink-0 ml-auto">
          {/* Track Selector */}
          <div
            className="hidden lg:flex items-center gap-1 px-2 py-1 border-l text-[11px] whitespace-nowrap"
            style={{ borderColor: 'var(--border-grid)' }}
          >
            <Compass
              className="w-3 h-3 shrink-0"
              style={{ color: 'var(--accent-param)' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>track:</span>
            <div className="flex items-center gap-1">
              {TRACK_OPTIONS.map((track) => {
                const active = activeTrack === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => onTrackChange(track.id)}
                    className="px-1.5 py-0.5 text-[10px] border transition-colors cursor-pointer"
                    style={{
                      borderColor: active
                        ? 'var(--accent-param)'
                        : 'var(--border-grid)',
                      backgroundColor: active
                        ? 'var(--bg-elevated)'
                        : 'transparent',
                      color: active
                        ? 'var(--accent-param)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {track.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ASCII Post-Processing Shader Toggle */}
          <button
            onClick={onToggleAscii}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border-l text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            style={{
              borderColor: 'var(--border-grid)',
              backgroundColor: renderAscii ? 'var(--bg-elevated)' : 'transparent',
              color: renderAscii ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
            title="Toggle real-time ASCII glyph post-processing shader on all 3D scenes"
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">ASCII:</span>
            <span
              className="font-bold"
              style={{
                color: renderAscii ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              [{renderAscii ? 'ON' : 'OFF'}]
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
export default TopStatusBar;
