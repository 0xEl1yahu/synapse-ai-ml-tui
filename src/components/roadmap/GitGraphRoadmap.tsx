import React, { useState, useMemo } from 'react';
import {
  RoadmapNode,
  MilestoneProject,
  TaxonomyModule,
  TrackId,
} from '../../types';
import { MilestoneProjectDrawer } from './MilestoneProjectDrawer';

export interface GitGraphRoadmapProps {
  nodes: RoadmapNode[];
  projects: MilestoneProject[];
  modules: TaxonomyModule[];
  activeTrack: TrackId;
  onTrackChange: (track: TrackId) => void;
  completedNodeIds: string[];
  onToggleNode: (nodeId: string) => void;
  completedProjectIds?: string[];
  onToggleProject?: (projectId: string) => void;
  onOpenModule: (moduleId: string) => void;
}

interface TrackMetadata {
  id: TrackId;
  flag: string;
  title: string;
  tagline: string;
  pipelineSummary: string;
  targetPersona: string;
}

const TRACK_DEFINITIONS: TrackMetadata[] = [
  {
    id: 'builder',
    flag: '--track=builder',
    title: 'AI Systems Builder',
    tagline:
      'Top-down from Python, Embeddings, RAG & Agent Harnesses -> Fine-Tuning -> Deep Learning & Evals',
    pipelineSummary:
      'EMBEDDINGS_&_VECTORS ──► HYBRID_RAG ──► AGENT_HARNESS_LOOP ──► LORA_SFT ──► EVAL_HARNESS',
    targetPersona: 'Product Engineers, SWEs & AI Application Architects',
  },
  {
    id: 'ml-engineer',
    flag: '--track=ml-engineer',
    title: 'Full-Stack ML Engineer',
    tagline:
      'Foundations & Data -> Classical ML / XGBoost -> PyTorch Deep Learning -> GPU Inference & MLOps',
    pipelineSummary:
      'LINEAR_ALGEBRA_&_DATA ──► XGBOOST_TABULAR ──► PYTORCH_AUTODIFF ──► TRANSFORMERS ──► KV_CACHE_&_QUANTIZATION',
    targetPersona: 'Production ML Engineers, Platform & Inference Systems',
  },
  {
    id: 'researcher',
    flag: '--track=researcher',
    title: 'First-Principles Researcher',
    tagline:
      'Linear Algebra & Calculus -> Micrograd/Autodiff from Scratch -> Transformers, MoE & Mamba-2 -> Flow Matching, GRPO & Mechanistic Interp',
    pipelineSummary:
      'SPECTRAL_MATH ──► MICROGRAD_ENGINE ──► ROPE_MOE_MAMBA2 ──► FLOW_MATCHING_&_GRPO ──► SPARSE_AUTOENCODERS',
    targetPersona: 'AI Researchers, Frontier Model & Alignment Engineers',
  },
];

function renderAsciiProgressBar(completed: number, total: number, width = 20): string {
  if (total <= 0) return `[${'░'.repeat(width)}] 0%`;
  const ratio = Math.min(1, Math.max(0, completed / total));
  const filled = Math.round(ratio * width);
  const empty = Math.max(0, width - filled);
  const pct = Math.round(ratio * 100);
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
}

export const GitGraphRoadmap: React.FC<GitGraphRoadmapProps> = ({
  nodes,
  projects,
  modules,
  activeTrack,
  onTrackChange,
  completedNodeIds,
  onToggleNode,
  completedProjectIds = [],
  onToggleProject,
  onOpenModule,
}) => {
  const [scopeFilter, setScopeFilter] = useState<'TRACK_ONLY' | 'FULL_DAG'>('TRACK_ONLY');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'MASTERED'>('ALL');

  const moduleMap = useMemo(() => {
    const map = new Map<string, TaxonomyModule>();
    for (const mod of modules) {
      map.set(mod.id, mod);
    }
    return map;
  }, [modules]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, RoadmapNode>();
    for (const n of nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [nodes]);

  // Nodes belonging to the active track
  const trackNodes = useMemo(
    () => nodes.filter((n) => n.tracks.includes(activeTrack)),
    [nodes, activeTrack]
  );

  // Visible nodes based on scope and status filters
  const displayedNodes = useMemo(() => {
    const base = scopeFilter === 'TRACK_ONLY' ? trackNodes : nodes;
    return base.filter((node) => {
      const isCompleted = completedNodeIds.includes(node.id);
      if (statusFilter === 'MASTERED') return isCompleted;
      if (statusFilter === 'PENDING') return !isCompleted;
      return true;
    });
  }, [scopeFilter, trackNodes, nodes, completedNodeIds, statusFilter]);

  // Progress calculations for active track
  const trackStats = useMemo(() => {
    const totalNodes = trackNodes.length;
    const completedInTrack = trackNodes.filter((n) =>
      completedNodeIds.includes(n.id)
    ).length;
    const totalWeeks = trackNodes.reduce((acc, n) => acc + n.estimatedWeeks, 0);
    const completedWeeks = trackNodes
      .filter((n) => completedNodeIds.includes(n.id))
      .reduce((acc, n) => acc + n.estimatedWeeks, 0);

    return {
      totalNodes,
      completedInTrack,
      totalWeeks,
      completedWeeks,
      remainingWeeks: Math.max(0, totalWeeks - completedWeeks),
    };
  }, [trackNodes, completedNodeIds]);

  const activeTrackMeta = useMemo(
    () =>
      TRACK_DEFINITIONS.find((t) => t.id === activeTrack) ||
      TRACK_DEFINITIONS[0],
    [activeTrack]
  );

  return (
    <div
      className="w-full min-h-full p-4 md:p-6 space-y-6 rounded-none"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Terminal Banner: Learning Through Building Philosophy & Live ASCII Progress */}
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
              DAG_ENGINE
            </span>
            <span style={{ color: 'var(--text-primary)' }} className="font-bold">
              git log --graph --oneline --decorate {activeTrackMeta.flag}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span style={{ color: 'var(--accent-primary)' }} className="font-bold">
              TRACK_PROGRESS:{' '}
              {renderAsciiProgressBar(
                trackStats.completedInTrack,
                trackStats.totalNodes,
                16
              )}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              NODES: {trackStats.completedInTrack}/{trackStats.totalNodes}{' '}
              MASTERED
            </span>
            <span style={{ color: 'var(--accent-param)' }}>
              EST_TIME: {trackStats.completedWeeks}/{trackStats.totalWeeks} WKS
            </span>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 space-y-1.5">
            <div
              className="font-mono text-xs uppercase tracking-widest font-bold"
              style={{ color: 'var(--accent-param)' }}
            >
              // EXECUTION_DOCTRINE :: LEARNING THROUGH BUILDING
            </div>
            <h1
              className="text-lg md:text-xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              No Passive Watching. Every Node Demands a Working Artifact &amp;
              Self-Verification Gate.
            </h1>
            <p
              className="text-xs md:text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Select your execution track below. Traverse the dependency DAG from
              root commits to frontier architectures. Each node pairs direct theory
              with a concrete <span style={{ color: 'var(--accent-primary)' }}>Build Deliverable</span> and a
              falsifiable <span style={{ color: 'var(--accent-warn)' }}>Verification Check</span>.
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
              <span style={{ color: 'var(--text-muted)' }}>ACTIVE_BRANCH:</span>
              <span
                className="font-bold"
                style={{ color: 'var(--accent-primary)' }}
              >
                refs/heads/{activeTrack}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-muted)' }}>REMAINING_WORK:</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {trackStats.remainingWeeks} WEEKS ({trackStats.totalNodes - trackStats.completedInTrack} COMMITS)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-muted)' }}>GLOBAL_DAG_NODES:</span>
              <span style={{ color: 'var(--accent-param)' }}>
                {completedNodeIds.length}/{nodes.length} TOTAL MASTERED
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Track Selector Matrix */}
      <section
        className="rounded-none"
        style={{
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--border-grid)',
        }}
      >
        <div
          className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-grid)',
          }}
        >
          <span
            className="font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-primary)' }}
          >
            01 // TRACK_SELECTOR_MATRIX (SWITCH EXECUTION PATH)
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            [3 SPECIALIZED DAG PROJECTIONS AVAILABLE]
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          {TRACK_DEFINITIONS.map((track, idx) => {
            const isSelected = activeTrack === track.id;
            const nodesInThisTrack = nodes.filter((n) =>
              n.tracks.includes(track.id)
            );
            const completedInThisTrack = nodesInThisTrack.filter((n) =>
              completedNodeIds.includes(n.id)
            ).length;
            const weeksInThisTrack = nodesInThisTrack.reduce(
              (sum, n) => sum + n.estimatedWeeks,
              0
            );

            return (
              <button
                key={track.id}
                type="button"
                onClick={() => onTrackChange(track.id)}
                className="text-left p-4 flex flex-col justify-between gap-3 transition-colors cursor-pointer"
                style={{
                  backgroundColor: isSelected
                    ? 'var(--bg-elevated)'
                    : 'var(--bg-pane)',
                  borderRight:
                    idx < TRACK_DEFINITIONS.length - 1
                      ? '1px solid var(--border-grid)'
                      : 'none',
                  borderBottom: isSelected
                    ? '2px solid var(--accent-primary)'
                    : '1px solid var(--border-grid)',
                }}
              >
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span
                      className="px-2 py-0.5 font-bold"
                      style={{
                        backgroundColor: isSelected
                          ? 'var(--accent-primary)'
                          : 'var(--bg-canvas)',
                        color: isSelected
                          ? 'var(--bg-canvas)'
                          : 'var(--accent-param)',
                        border: `1px solid ${
                          isSelected
                            ? 'var(--accent-primary)'
                            : 'var(--border-grid)'
                        }`,
                      }}
                    >
                      {track.flag}
                    </span>
                    <span
                      style={{
                        color: isSelected
                          ? 'var(--accent-primary)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {isSelected ? '[● ACTIVE_TRACK]' : '[○ SELECT]'}
                    </span>
                  </div>

                  <div
                    className="text-base font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {track.title}
                  </div>

                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {track.tagline}
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2" style={{ borderTop: '1px solid var(--border-grid)' }}>
                  <div
                    className="font-mono text-[11px] truncate"
                    style={{ color: 'var(--accent-param)' }}
                  >
                    {track.pipelineSummary}
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span style={{ color: 'var(--text-muted)' }}>
                      {nodesInThisTrack.length} NODES // ~{weeksInThisTrack} WKS
                    </span>
                    <span
                      style={{
                        color:
                          completedInThisTrack > 0
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {completedInThisTrack}/{nodesInThisTrack.length} MASTERED
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive `git log --graph` Dependency Tree */}
      <section
        className="rounded-none"
        style={{
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--border-grid)',
        }}
      >
        {/* Graph Controls Header */}
        <div
          className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-grid)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-primary)' }}
            >
              02 // INTERACTIVE_GIT_GRAPH_DEPENDENCY_TREE
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              ({displayedNodes.length} COMMITS SHOWN)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Toggle */}
            <div
              className="flex items-center"
              style={{ border: '1px solid var(--border-grid)' }}
            >
              <button
                type="button"
                onClick={() => setScopeFilter('TRACK_ONLY')}
                className="px-2.5 py-1 font-mono text-xs cursor-pointer"
                style={{
                  backgroundColor:
                    scopeFilter === 'TRACK_ONLY'
                      ? 'var(--accent-primary)'
                      : 'var(--bg-canvas)',
                  color:
                    scopeFilter === 'TRACK_ONLY'
                      ? 'var(--bg-canvas)'
                      : 'var(--text-secondary)',
                }}
              >
                --scope=TRACK ({trackNodes.length})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('FULL_DAG')}
                className="px-2.5 py-1 font-mono text-xs cursor-pointer"
                style={{
                  backgroundColor:
                    scopeFilter === 'FULL_DAG'
                      ? 'var(--accent-primary)'
                      : 'var(--bg-canvas)',
                  color:
                    scopeFilter === 'FULL_DAG'
                      ? 'var(--bg-canvas)'
                      : 'var(--text-secondary)',
                  borderLeft: '1px solid var(--border-grid)',
                }}
              >
                --scope=ALL_NODES ({nodes.length})
              </button>
            </div>

            {/* Status Filter */}
            <div
              className="flex items-center"
              style={{ border: '1px solid var(--border-grid)' }}
            >
              {(['ALL', 'PENDING', 'MASTERED'] as const).map((status, sIdx) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className="px-2.5 py-1 font-mono text-xs cursor-pointer"
                  style={{
                    backgroundColor:
                      statusFilter === status
                        ? 'var(--accent-param)'
                        : 'var(--bg-canvas)',
                    color:
                      statusFilter === status
                        ? 'var(--bg-canvas)'
                        : 'var(--text-secondary)',
                    borderLeft:
                      sIdx > 0 ? '1px solid var(--border-grid)' : 'none',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Commit Graph Rows */}
        <div className="divide-y" style={{ borderColor: 'var(--border-grid)' }}>
          {displayedNodes.length === 0 ? (
            <div
              className="p-8 text-center font-mono text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              No roadmap nodes match current filter criteria (`--status={statusFilter}`).
            </div>
          ) : (
            displayedNodes.map((node, index) => {
              const isCompleted = completedNodeIds.includes(node.id);
              const isInActiveTrack = node.tracks.includes(activeTrack);
              const linkedModule = moduleMap.get(node.moduleId);
              const isLast = index === displayedNodes.length - 1;

              // Determine if all parent dependencies are satisfied
              const unmetDeps = node.dependencies.filter(
                (depId) => !completedNodeIds.includes(depId)
              );
              const isReadyToBuild = !isCompleted && unmetDeps.length === 0;

              // Commit hash style ID
              const commitHash = node.id.slice(0, 12).padEnd(8, '0');

              return (
                <div
                  key={node.id}
                  className="grid grid-cols-1 lg:grid-cols-12 transition-colors"
                  style={{
                    backgroundColor: isCompleted
                      ? 'rgba(16, 185, 129, 0.03)'
                      : 'var(--bg-pane)',
                    borderBottom: !isLast
                      ? '1px solid var(--border-grid)'
                      : 'none',
                  }}
                >
                  {/* Left Git Rail Column (ASCII Commit Graph `●──┬──`) */}
                  <div
                    className="lg:col-span-3 p-4 font-mono text-xs flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderRight: '1px solid var(--border-grid)',
                    }}
                  >
                    <div>
                      {/* Top connector rail */}
                      <div
                        className="whitespace-pre leading-none mb-1 select-none"
                        style={{
                          color: isCompleted
                            ? 'var(--accent-primary)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {index === 0 ? '┌── [ROOT_COMMIT]' : '│   │'}
                      </div>

                      {/* Main Commit Node Line */}
                      <div className="flex items-center gap-2 py-1">
                        <span
                          className="font-bold whitespace-pre"
                          style={{
                            color: isCompleted
                              ? 'var(--accent-primary)'
                              : isReadyToBuild
                              ? 'var(--accent-param)'
                              : 'var(--accent-warn)',
                          }}
                        >
                          {isCompleted
                            ? '●──┬──'
                            : isReadyToBuild
                            ? '◎──┬──'
                            : '○──┬──'}
                        </span>
                        <span
                          className="px-1.5 py-0.5 text-[11px] font-bold"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-grid)',
                            color: isCompleted
                              ? 'var(--accent-primary)'
                              : 'var(--accent-param)',
                          }}
                        >
                          {commitHash}
                        </span>
                      </div>

                      {/* Branch & Dependency metadata */}
                      <div className="pl-3 mt-2 space-y-1.5" style={{ borderLeft: '1px solid var(--border-grid)' }}>
                        <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>CMD: </span>
                          <code style={{ color: 'var(--text-primary)' }}>
                            {node.command}
                          </code>
                        </div>

                        <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>EST: </span>
                          <span style={{ color: 'var(--accent-param)' }}>
                            {node.estimatedWeeks}{' '}
                            {node.estimatedWeeks === 1 ? 'WEEK' : 'WEEKS'}
                          </span>
                        </div>

                        {/* Parent Dependencies */}
                        <div className="text-[11px]">
                          <span style={{ color: 'var(--text-muted)' }}>
                            PARENTS:{' '}
                          </span>
                          {node.dependencies.length === 0 ? (
                            <span style={{ color: 'var(--accent-primary)' }}>
                              [NONE // ENTRYPOINT]
                            </span>
                          ) : (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {node.dependencies.map((depId) => {
                                const depDone = completedNodeIds.includes(depId);
                                const depNode = nodeMap.get(depId);
                                return (
                                  <span
                                    key={depId}
                                    className="px-1.5 py-0.5 text-[10px]"
                                    style={{
                                      backgroundColor: 'var(--bg-elevated)',
                                      border: `1px solid ${
                                        depDone
                                          ? 'var(--accent-primary)'
                                          : 'var(--accent-warn)'
                                      }`,
                                      color: depDone
                                        ? 'var(--accent-primary)'
                                        : 'var(--accent-warn)',
                                    }}
                                    title={depNode?.title || depId}
                                  >
                                    {depDone ? '✓' : '↑'} {depId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Track membership tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {node.tracks.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 text-[10px]"
                              style={{
                                backgroundColor:
                                  t === activeTrack
                                    ? 'rgba(16, 185, 129, 0.12)'
                                    : 'var(--bg-elevated)',
                                border: `1px solid ${
                                  t === activeTrack
                                    ? 'var(--accent-primary)'
                                    : 'var(--border-grid)'
                                }`,
                                color:
                                  t === activeTrack
                                    ? 'var(--accent-primary)'
                                    : 'var(--text-muted)',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom connector rail */}
                    <div
                      className="whitespace-pre leading-none mt-3 select-none"
                      style={{
                        color: isCompleted
                          ? 'var(--accent-primary)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {!isLast ? '│   ▼' : '└── [END_OF_BRANCH]'}
                    </div>
                  </div>

                  {/* Right Node Specification Column */}
                  <div className="lg:col-span-9 p-4 flex flex-col justify-between gap-4">
                    {/* Node Header Bar */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                          <span
                            className="px-2 py-0.5 font-bold"
                            style={{
                              backgroundColor: isCompleted
                                ? 'var(--accent-primary)'
                                : isReadyToBuild
                                ? 'rgba(6, 182, 212, 0.12)'
                                : 'var(--bg-elevated)',
                              color: isCompleted
                                ? 'var(--bg-canvas)'
                                : isReadyToBuild
                                ? 'var(--accent-param)'
                                : 'var(--accent-warn)',
                              border: `1px solid ${
                                isCompleted
                                  ? 'var(--accent-primary)'
                                  : isReadyToBuild
                                  ? 'var(--accent-param)'
                                  : 'var(--border-grid)'
                              }`,
                            }}
                          >
                            {isCompleted
                              ? 'STATUS: MASTERED'
                              : isReadyToBuild
                              ? 'STATUS: READY_TO_BUILD'
                              : `STATUS: PREREQ_PENDING (${unmetDeps.length})`}
                          </span>

                          {linkedModule && (
                            <span
                              className="px-2 py-0.5"
                              style={{
                                backgroundColor: 'var(--bg-canvas)',
                                border: '1px solid var(--border-grid)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              MOD_{linkedModule.number} ::{' '}
                              {linkedModule.shortTitle}
                            </span>
                          )}

                          {!isInActiveTrack && (
                            <span
                              className="px-2 py-0.5"
                              style={{
                                backgroundColor: 'var(--bg-canvas)',
                                border: '1px solid var(--border-grid)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              [EXTERNAL_TO_ACTIVE_TRACK]
                            </span>
                          )}
                        </div>

                        <h3
                          className="text-base md:text-lg font-bold tracking-tight pt-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {node.title}
                        </h3>
                      </div>

                      {/* Action Buttons: Toggle Mastered & Open Module */}
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => onToggleNode(node.id)}
                          className="px-3 py-1.5 font-bold tracking-wide transition-colors cursor-pointer"
                          style={{
                            backgroundColor: isCompleted
                              ? 'var(--accent-primary)'
                              : 'var(--bg-canvas)',
                            color: isCompleted
                              ? 'var(--bg-canvas)'
                              : 'var(--text-primary)',
                            border: `1px solid ${
                              isCompleted
                                ? 'var(--accent-primary)'
                                : 'var(--border-grid)'
                            }`,
                          }}
                        >
                          {isCompleted ? '[✓ MASTERED]' : '[ ] PENDING'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenModule(node.moduleId)}
                          className="px-3 py-1.5 font-bold tracking-wide transition-colors cursor-pointer"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            color: 'var(--accent-param)',
                            border: '1px solid var(--accent-param)',
                          }}
                        >
                          [LEARN_&_EXPERIMENT ❯]
                        </button>
                      </div>
                    </div>

                    {/* Two-Column Spec Grid: Build Deliverable & Self-Verification Check */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Concrete Build Deliverable */}
                      <div
                        className="p-3"
                        style={{
                          backgroundColor: 'var(--bg-canvas)',
                          border: '1px solid var(--border-grid)',
                        }}
                      >
                        <div
                          className="font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          <span>┌─ CONCRETE_BUILD_DELIVERABLE</span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            [ARTIFACT]
                          </span>
                        </div>
                        <p
                          className="text-xs md:text-sm leading-relaxed"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {node.deliverable}
                        </p>
                      </div>

                      {/* Self-Verification Check */}
                      <div
                        className="p-3"
                        style={{
                          backgroundColor: 'var(--bg-canvas)',
                          border: '1px solid var(--border-grid)',
                        }}
                      >
                        <div
                          className="font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between"
                          style={{ color: 'var(--accent-warn)' }}
                        >
                          <span>├─ SELF_VERIFICATION_GATE</span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            [PROOF_OF_WORK]
                          </span>
                        </div>
                        <p
                          className="text-xs md:text-sm leading-relaxed"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {node.verificationCheck}
                        </p>
                      </div>
                    </div>

                    {/* Linked Module Core Tools & Subtopics Footer */}
                    {linkedModule && (
                      <div
                        className="pt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]"
                        style={{ borderTop: '1px solid var(--border-grid)' }}
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span style={{ color: 'var(--text-muted)' }}>
                            MODULE_PATH:
                          </span>
                          <span style={{ color: 'var(--accent-param)' }}>
                            {linkedModule.filePath}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span style={{ color: 'var(--text-muted)' }}>
                            TOOLS:
                          </span>
                          {linkedModule.coreTools.slice(0, 4).map((tool) => (
                            <span
                              key={tool}
                              className="px-1.5 py-0.5"
                              style={{
                                backgroundColor: 'var(--bg-canvas)',
                                border: '1px solid var(--border-grid)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Embedded Capstone Milestone Project Drawer */}
      <MilestoneProjectDrawer
        projects={projects}
        activeTrack={activeTrack}
        completedProjectIds={completedProjectIds}
        onToggleProject={onToggleProject}
      />
    </div>
  );
};

export default GitGraphRoadmap;
