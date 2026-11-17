import React, { useState, useMemo, useEffect } from 'react';
import { LearningResource, TaxonomyModule } from '../../types';

export interface ResourceDirectoryPaneProps {
  resources: LearningResource[];
  modules: TaxonomyModule[];
  initialFilterModuleId?: string;
}

type ResourceTypeFilter = 'ALL' | LearningResource['type'];
type ResourceLevelFilter = 'ALL' | LearningResource['level'];

const RESOURCE_TYPES: ResourceTypeFilter[] = [
  'ALL',
  'COURSE',
  'BOOK',
  'VIDEO',
  'PAPER',
  'INTERACTIVE',
  'REPO',
];

const RESOURCE_LEVELS: ResourceLevelFilter[] = [
  'ALL',
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'FRONTIER',
];

const LEVEL_BADGE_COLORS: Record<
  LearningResource['level'],
  { color: string; border: string; bg: string }
> = {
  BEGINNER: {
    color: 'var(--accent-primary)',
    border: 'var(--accent-primary)',
    bg: 'rgba(16, 185, 129, 0.08)',
  },
  INTERMEDIATE: {
    color: 'var(--accent-param)',
    border: 'var(--accent-param)',
    bg: 'rgba(6, 182, 212, 0.08)',
  },
  ADVANCED: {
    color: 'var(--accent-warn)',
    border: 'var(--accent-warn)',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  FRONTIER: {
    color: 'var(--accent-danger)',
    border: 'var(--accent-danger)',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
};

export const ResourceDirectoryPane: React.FC<ResourceDirectoryPaneProps> = ({
  resources,
  modules,
  initialFilterModuleId,
}) => {
  const [selectedType, setSelectedType] = useState<ResourceTypeFilter>('ALL');
  const [selectedLevel, setSelectedLevel] =
    useState<ResourceLevelFilter>('ALL');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    initialFilterModuleId || 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFree, setOnlyFree] = useState<boolean>(false);
  const [onlyInteractive, setOnlyInteractive] = useState<boolean>(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [layoutMode, setLayoutMode] = useState<'GRID' | 'TABLE'>('GRID');

  useEffect(() => {
    if (initialFilterModuleId) {
      setSelectedModuleId(initialFilterModuleId);
    }
  }, [initialFilterModuleId]);

  const moduleMap = useMemo(() => {
    const map = new Map<string, TaxonomyModule>();
    for (const mod of modules) {
      map.set(mod.id, mod);
    }
    return map;
  }, [modules]);

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return resources.filter((res) => {
      if (selectedType !== 'ALL' && res.type !== selectedType) {
        return false;
      }
      if (selectedLevel !== 'ALL' && res.level !== selectedLevel) {
        return false;
      }
      if (
        selectedModuleId !== 'ALL' &&
        !res.moduleIds.includes(selectedModuleId)
      ) {
        return false;
      }
      if (onlyFree && !res.isFree) {
        return false;
      }
      if (onlyInteractive && !res.isInteractive) {
        return false;
      }
      if (onlyBookmarked && !bookmarkedIds.includes(res.id)) {
        return false;
      }
      if (q.length > 0) {
        const haystack = [
          res.title,
          res.authorOrOrg,
          res.whyHighSignal,
          res.type,
          res.level,
          ...res.moduleIds,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [
    resources,
    selectedType,
    selectedLevel,
    selectedModuleId,
    onlyFree,
    onlyInteractive,
    onlyBookmarked,
    bookmarkedIds,
    searchQuery,
  ]);

  const stats = useMemo(() => {
    const freeCount = resources.filter((r) => r.isFree).length;
    const interactiveCount = resources.filter((r) => r.isInteractive).length;
    const paperCount = resources.filter((r) => r.type === 'PAPER').length;
    const repoCount = resources.filter((r) => r.type === 'REPO').length;
    return { freeCount, interactiveCount, paperCount, repoCount };
  }, [resources]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetAllFilters = () => {
    setSelectedType('ALL');
    setSelectedLevel('ALL');
    setSelectedModuleId('ALL');
    setSearchQuery('');
    setOnlyFree(false);
    setOnlyInteractive(false);
    setOnlyBookmarked(false);
  };

  const activeCliCommand = `grep --type=${selectedType} --level=${selectedLevel} --module=${selectedModuleId}${
    onlyFree ? ' --free' : ''
  }${onlyInteractive ? ' --interactive' : ''}${
    searchQuery.trim() ? ` "${searchQuery.trim()}"` : ''
  }`;

  return (
    <div
      className="w-full min-h-full p-4 md:p-6 space-y-6 rounded-none"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Banner: Zero-Gatekeeping Resource Manifesto */}
      <header
        className="rounded-none"
        style={{
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--border-grid)',
        }}
      >
        <div
          className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-grid)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 font-bold"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--bg-canvas)',
              }}
            >
              OPEN_INDEX
            </span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              {activeCliCommand}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span style={{ color: 'var(--accent-primary)' }}>
              MATCHES: {filteredResources.length}/{resources.length}
            </span>
            <span style={{ color: 'var(--accent-param)' }}>
              100%_FREE: {stats.freeCount}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              INTERACTIVE_LABS: {stats.interactiveCount}
            </span>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 space-y-1.5">
            <div
              className="font-mono text-xs uppercase tracking-widest font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              // ZERO-GATEKEEPING OPEN RESOURCE ENGINE
            </div>
            <h1
              className="text-lg md:text-xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Every Seminal Paper, Course, Book, Interactive Playground &amp;
              From-Scratch Repo. Curated &amp; Annotated.
            </h1>
            <p
              className="text-xs md:text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              No filler SEO listicles or paywalled fluff. Every entry includes an
              explicit{' '}
              <span style={{ color: 'var(--accent-param)' }}>
                Why It&apos;s High-Signal (No Gatekeeping Note)
              </span>{' '}
              explaining what chapters, lectures, or files actually matter and how
              to extract maximum engineering value.
            </p>
          </div>

          <div
            className="lg:col-span-4 p-3 font-mono text-xs space-y-1.5"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-grid)',
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-muted)' }}>SEMINAL_PAPERS:</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {stats.paperCount} INDEXED
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-muted)' }}>CODE_REPOS:</span>
              <span style={{ color: 'var(--accent-param)' }}>
                {stats.repoCount} REFERENCE_REPOS
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-muted)' }}>STUDY_QUEUE:</span>
              <span style={{ color: 'var(--accent-primary)' }}>
                {bookmarkedIds.length} SAVED
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive CLI Filter Bar */}
      <section
        className="rounded-none"
        style={{
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--border-grid)',
        }}
      >
        {/* Search Input + Quick Flags Row */}
        <div
          className="p-3 flex flex-wrap items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-grid)',
          }}
        >
          {/* Live CLI Search Input */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 flex-1 min-w-[260px] font-mono text-xs"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-grid)',
            }}
          >
            <span
              className="font-bold select-none whitespace-nowrap shrink-0"
              style={{ color: 'var(--accent-primary)' }}
            >
              grep -i
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, author (Karpathy, 3Blue1Brown, FlashAttention...), or topic..."
              className="w-full bg-transparent focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)] px-1 font-mono text-xs"
              style={{ color: 'var(--text-primary)' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-1.5 py-0.5 text-[10px] cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-grid)',
                  color: 'var(--text-secondary)',
                }}
              >
                [CLR]
              </button>
            )}
          </div>

          {/* Boolean Flags & View Mode */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setOnlyFree((prev) => !prev)}
              className="px-2.5 py-1.5 cursor-pointer transition-colors"
              style={{
                backgroundColor: onlyFree
                  ? 'var(--accent-primary)'
                  : 'var(--bg-canvas)',
                color: onlyFree ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                border: `1px solid ${
                  onlyFree ? 'var(--accent-primary)' : 'var(--border-grid)'
                }`,
              }}
            >
              [100%_FREE_ONLY]
            </button>

            <button
              type="button"
              onClick={() => setOnlyInteractive((prev) => !prev)}
              className="px-2.5 py-1.5 cursor-pointer transition-colors"
              style={{
                backgroundColor: onlyInteractive
                  ? 'var(--accent-param)'
                  : 'var(--bg-canvas)',
                color: onlyInteractive
                  ? 'var(--bg-canvas)'
                  : 'var(--text-secondary)',
                border: `1px solid ${
                  onlyInteractive ? 'var(--accent-param)' : 'var(--border-grid)'
                }`,
              }}
            >
              [INTERACTIVE_ONLY]
            </button>

            <button
              type="button"
              onClick={() => setOnlyBookmarked((prev) => !prev)}
              className="px-2.5 py-1.5 cursor-pointer transition-colors"
              style={{
                backgroundColor: onlyBookmarked
                  ? 'var(--accent-warn)'
                  : 'var(--bg-canvas)',
                color: onlyBookmarked
                  ? 'var(--bg-canvas)'
                  : 'var(--text-secondary)',
                border: `1px solid ${
                  onlyBookmarked ? 'var(--accent-warn)' : 'var(--border-grid)'
                }`,
              }}
            >
              [★ QUEUED ({bookmarkedIds.length})]
            </button>

            <div
              className="flex items-center"
              style={{ border: '1px solid var(--border-grid)' }}
            >
              <button
                type="button"
                onClick={() => setLayoutMode('GRID')}
                className="px-2.5 py-1.5 cursor-pointer"
                style={{
                  backgroundColor:
                    layoutMode === 'GRID'
                      ? 'var(--bg-elevated)'
                      : 'var(--bg-canvas)',
                  color:
                    layoutMode === 'GRID'
                      ? 'var(--accent-primary)'
                      : 'var(--text-muted)',
                }}
              >
                [CARDS]
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('TABLE')}
                className="px-2.5 py-1.5 cursor-pointer"
                style={{
                  backgroundColor:
                    layoutMode === 'TABLE'
                      ? 'var(--bg-elevated)'
                      : 'var(--bg-canvas)',
                  color:
                    layoutMode === 'TABLE'
                      ? 'var(--accent-primary)'
                      : 'var(--text-muted)',
                  borderLeft: '1px solid var(--border-grid)',
                }}
              >
                [TABLE]
              </button>
            </div>

            <button
              type="button"
              onClick={resetAllFilters}
              className="px-2.5 py-1.5 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-grid)',
                color: 'var(--text-muted)',
              }}
            >
              [RESET]
            </button>
          </div>
        </div>

        {/* Multi-Row Parameter Matrix: --type, --level, --module */}
        <div className="p-3 space-y-2.5 font-mono text-xs">
          {/* --type row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="w-24 shrink-0 font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              --type=
            </span>
            {RESOURCE_TYPES.map((type) => {
              const active = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className="px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors"
                  style={{
                    backgroundColor: active
                      ? 'var(--accent-primary)'
                      : 'var(--bg-canvas)',
                    color: active
                      ? 'var(--bg-canvas)'
                      : 'var(--text-secondary)',
                    border: `1px solid ${
                      active ? 'var(--accent-primary)' : 'var(--border-grid)'
                    }`,
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* --level row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="w-24 shrink-0 font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              --level=
            </span>
            {RESOURCE_LEVELS.map((level) => {
              const active = selectedLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className="px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors"
                  style={{
                    backgroundColor: active
                      ? 'var(--accent-param)'
                      : 'var(--bg-canvas)',
                    color: active
                      ? 'var(--bg-canvas)'
                      : 'var(--text-secondary)',
                    border: `1px solid ${
                      active ? 'var(--accent-param)' : 'var(--border-grid)'
                    }`,
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {/* --module row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="w-24 shrink-0 font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              --module=
            </span>
            <button
              type="button"
              onClick={() => setSelectedModuleId('ALL')}
              className="px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  selectedModuleId === 'ALL'
                    ? 'var(--accent-primary)'
                    : 'var(--bg-canvas)',
                color:
                  selectedModuleId === 'ALL'
                    ? 'var(--bg-canvas)'
                    : 'var(--text-secondary)',
                border: `1px solid ${
                  selectedModuleId === 'ALL'
                    ? 'var(--accent-primary)'
                    : 'var(--border-grid)'
                }`,
              }}
            >
              ALL_MODULES
            </button>
            {modules.map((mod) => {
              const active = selectedModuleId === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModuleId(mod.id)}
                  className="px-2.5 py-1 text-[11px] cursor-pointer transition-colors"
                  style={{
                    backgroundColor: active
                      ? 'var(--accent-primary)'
                      : 'var(--bg-canvas)',
                    color: active
                      ? 'var(--bg-canvas)'
                      : 'var(--text-secondary)',
                    border: `1px solid ${
                      active ? 'var(--accent-primary)' : 'var(--border-grid)'
                    }`,
                  }}
                >
                  {mod.number}_{mod.shortTitle.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resource Directory Display (Grid or Table) */}
      {filteredResources.length === 0 ? (
        <div
          className="p-10 text-center font-mono space-y-3"
          style={{
            backgroundColor: 'var(--bg-pane)',
            border: '1px solid var(--border-grid)',
          }}
        >
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            [0 MATCHING RESOURCES FOR QUERY: {activeCliCommand}]
          </div>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-4 py-1.5 font-mono text-xs font-bold cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-canvas)',
            }}
          >
            [RESET_FILTERS]
          </button>
        </div>
      ) : layoutMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => {
            const levelStyle = LEVEL_BADGE_COLORS[res.level];
            const isQueued = bookmarkedIds.includes(res.id);

            return (
              <article
                key={res.id}
                className="flex flex-col justify-between rounded-none"
                style={{
                  backgroundColor: 'var(--bg-pane)',
                  border: '1px solid var(--border-grid)',
                }}
              >
                <div>
                  {/* Card Top Metadata Strip */}
                  <div
                    className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderBottom: '1px solid var(--border-grid)',
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className="px-2 py-0.5 font-bold"
                        style={{
                          backgroundColor: 'var(--bg-canvas)',
                          border: '1px solid var(--border-grid)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        [{res.type}]
                      </span>

                      <span
                        className="px-2 py-0.5 font-bold"
                        style={{
                          backgroundColor: levelStyle.bg,
                          border: `1px solid ${levelStyle.border}`,
                          color: levelStyle.color,
                        }}
                      >
                        {res.level}
                      </span>

                      {res.isFree && (
                        <span
                          className="px-2 py-0.5 font-bold"
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid var(--accent-primary)',
                            color: 'var(--accent-primary)',
                          }}
                        >
                          [100%_FREE]
                        </span>
                      )}

                      {res.isInteractive && (
                        <span
                          className="px-2 py-0.5 font-bold"
                          style={{
                            backgroundColor: 'rgba(6, 182, 212, 0.12)',
                            border: '1px solid var(--accent-param)',
                            color: 'var(--accent-param)',
                          }}
                        >
                          [INTERACTIVE]
                        </span>
                      )}
                    </div>

                    <span style={{ color: 'var(--text-secondary)' }}>
                      TIME: {res.timeCommitment}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div
                        className="font-mono text-xs mb-1"
                        style={{ color: 'var(--accent-param)' }}
                      >
                        {res.authorOrOrg}
                      </div>
                      <h3
                        className="text-base font-bold leading-snug"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {res.title}
                      </h3>
                    </div>

                    {/* Why It's High-Signal (No Gatekeeping Note) */}
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-grid)',
                      }}
                    >
                      <div
                        className="font-mono text-[10px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        // WHY IT&apos;S HIGH-SIGNAL (NO GATEKEEPING NOTE)
                      </div>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {res.whyHighSignal}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Module Tags & Launch Action */}
                <div
                  className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderTop: '1px solid var(--border-grid)',
                  }}
                >
                  <div className="flex flex-wrap items-center gap-1">
                    {res.moduleIds.map((modId) => {
                      const mod = moduleMap.get(modId);
                      return (
                        <button
                          key={modId}
                          type="button"
                          onClick={() => setSelectedModuleId(modId)}
                          className="px-1.5 py-0.5 text-[10px] cursor-pointer"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-grid)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {mod ? `${mod.number}_${mod.shortTitle}` : modId}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(res.id)}
                      className="px-2.5 py-1 text-[11px] cursor-pointer"
                      style={{
                        backgroundColor: isQueued
                          ? 'var(--accent-warn)'
                          : 'var(--bg-elevated)',
                        color: isQueued
                          ? 'var(--bg-canvas)'
                          : 'var(--text-secondary)',
                        border: '1px solid var(--border-grid)',
                      }}
                    >
                      {isQueued ? '[★ QUEUED]' : '[+ QUEUE]'}
                    </button>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-[11px] font-bold tracking-wide no-underline transition-colors"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--bg-canvas)',
                        border: '1px solid var(--accent-primary)',
                      }}
                    >
                      [LAUNCH_RESOURCE ↗]
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Crisp Terminal Table View */
        <div
          className="overflow-x-auto rounded-none"
          style={{
            backgroundColor: 'var(--bg-pane)',
            border: '1px solid var(--border-grid)',
          }}
        >
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border-grid)',
                  color: 'var(--text-secondary)',
                }}
              >
                <th className="p-3 font-bold">TYPE / FLAGS</th>
                <th className="p-3 font-bold">RESOURCE &amp; AUTHOR</th>
                <th className="p-3 font-bold">LEVEL / TIME</th>
                <th className="p-3 font-bold">
                  WHY IT&apos;S HIGH-SIGNAL (NO GATEKEEPING NOTE)
                </th>
                <th className="p-3 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((res) => {
                const levelStyle = LEVEL_BADGE_COLORS[res.level];
                return (
                  <tr
                    key={res.id}
                    style={{
                      borderBottom: '1px solid var(--border-grid)',
                    }}
                  >
                    <td className="p-3 align-top space-y-1">
                      <div>
                        <span
                          className="px-2 py-0.5 text-[11px] font-bold"
                          style={{
                            backgroundColor: 'var(--bg-canvas)',
                            border: '1px solid var(--border-grid)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          [{res.type}]
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {res.isFree && (
                          <span
                            className="px-1.5 py-0.5 text-[10px]"
                            style={{
                              border: '1px solid var(--accent-primary)',
                              color: 'var(--accent-primary)',
                            }}
                          >
                            [100%_FREE]
                          </span>
                        )}
                        {res.isInteractive && (
                          <span
                            className="px-1.5 py-0.5 text-[10px]"
                            style={{
                              border: '1px solid var(--accent-param)',
                              color: 'var(--accent-param)',
                            }}
                          >
                            [INTERACTIVE]
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 align-top">
                      <div
                        className="font-sans font-bold text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {res.title}
                      </div>
                      <div
                        className="text-[11px] mt-0.5"
                        style={{ color: 'var(--accent-param)' }}
                      >
                        {res.authorOrOrg}
                      </div>
                    </td>

                    <td className="p-3 align-top space-y-1">
                      <div>
                        <span
                          className="px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: levelStyle.bg,
                            border: `1px solid ${levelStyle.border}`,
                            color: levelStyle.color,
                          }}
                        >
                          {res.level}
                        </span>
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {res.timeCommitment}
                      </div>
                    </td>

                    <td
                      className="p-3 align-top font-sans text-xs leading-relaxed max-w-md"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {res.whyHighSignal}
                    </td>

                    <td className="p-3 align-top text-right whitespace-nowrap">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1.5 text-[11px] font-bold no-underline"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: 'var(--bg-canvas)',
                        }}
                      >
                        [LAUNCH_RESOURCE ↗]
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResourceDirectoryPane;
