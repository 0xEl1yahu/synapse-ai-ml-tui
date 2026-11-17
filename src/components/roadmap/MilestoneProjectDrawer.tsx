import React, { useState, useMemo } from 'react';
import { MilestoneProject, TrackId } from '../../types';

export interface MilestoneProjectDrawerProps {
  projects: MilestoneProject[];
  activeTrack: TrackId;
  completedProjectIds?: string[];
  onToggleProject?: (projectId: string) => void;
}

const DIFFICULTY_STYLES: Record<
  MilestoneProject['difficulty'],
  { border: string; text: string; bg: string }
> = {
  FOUNDATIONAL: {
    border: 'var(--accent-primary)',
    text: 'var(--accent-primary)',
    bg: 'rgba(16, 185, 129, 0.08)',
  },
  INTERMEDIATE: {
    border: 'var(--accent-param)',
    text: 'var(--accent-param)',
    bg: 'rgba(6, 182, 212, 0.08)',
  },
  FRONTIER: {
    border: 'var(--accent-warn)',
    text: 'var(--accent-warn)',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
};

export const MilestoneProjectDrawer: React.FC<MilestoneProjectDrawerProps> = ({
  projects,
  activeTrack,
  completedProjectIds = [],
  onToggleProject,
}) => {
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.level - b.level),
    [projects]
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const trackMatch = sortedProjects.find((p) => p.track === activeTrack);
    return trackMatch?.id || sortedProjects[0]?.id || '';
  });

  const [localCompletedIds, setLocalCompletedIds] = useState<string[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewAllCards, setViewAllCards] = useState<boolean>(false);

  const effectiveCompletedIds =
    completedProjectIds.length > 0 || onToggleProject
      ? completedProjectIds
      : localCompletedIds;

  const handleToggleProject = (projectId: string) => {
    if (onToggleProject) {
      onToggleProject(projectId);
    } else {
      setLocalCompletedIds((prev) =>
        prev.includes(projectId)
          ? prev.filter((id) => id !== projectId)
          : [...prev, projectId]
      );
    }
  };

  const handleToggleStep = (projectId: string, stepIdx: number) => {
    const key = `${projectId}:${stepIdx}`;
    setCheckedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopyCommand = (project: MilestoneProject) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(project.starterCommand).catch(() => {});
    }
    setCopiedId(project.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === project.id ? null : prev));
    }, 1800);
  };

  const activeProject = useMemo(
    () =>
      sortedProjects.find((p) => p.id === selectedProjectId) ||
      sortedProjects[0] ||
      null,
    [sortedProjects, selectedProjectId]
  );

  if (sortedProjects.length === 0) {
    return null;
  }

  const renderProjectSpec = (project: MilestoneProject) => {
    const isCompleted = effectiveCompletedIds.includes(project.id);
    const isRecommended =
      project.track === activeTrack || project.track === 'all';
    const diffStyle = DIFFICULTY_STYLES[project.difficulty];

    const completedStepCount = project.implementationSteps.filter(
      (_, idx) => checkedSteps[`${project.id}:${idx}`]
    ).length;

    return (
      <div
        key={project.id}
        className="rounded-none"
        style={{
          backgroundColor: 'var(--bg-pane)',
          border: '1px solid var(--border-grid)',
        }}
      >
        {/* Spec Top Title Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 font-mono text-xs"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-grid)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-2 py-0.5 font-bold tracking-wider"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-active)',
                color: 'var(--accent-primary)',
              }}
            >
              LEVEL_0{project.level}
            </span>
            <span
              className="px-2 py-0.5 font-semibold"
              style={{
                backgroundColor: diffStyle.bg,
                border: `1px solid ${diffStyle.border}`,
                color: diffStyle.text,
              }}
            >
              [{project.difficulty}]
            </span>
            <span
              className="px-2 py-0.5"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-grid)',
                color: 'var(--text-secondary)',
              }}
            >
              EST: {project.estimatedHours}H
            </span>
            <span
              className="px-2 py-0.5"
              style={{
                backgroundColor: isRecommended
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'var(--bg-canvas)',
                border: `1px solid ${
                  isRecommended ? 'var(--accent-primary)' : 'var(--border-grid)'
                }`,
                color: isRecommended
                  ? 'var(--accent-primary)'
                  : 'var(--text-muted)',
              }}
            >
              --track={project.track}
              {isRecommended ? ' [TRACK_TARGET]' : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleToggleProject(project.id)}
            className="px-3 py-1 font-mono text-xs font-bold tracking-wide transition-colors cursor-pointer"
            style={{
              backgroundColor: isCompleted
                ? 'var(--accent-primary)'
                : 'var(--bg-canvas)',
              color: isCompleted ? 'var(--bg-canvas)' : 'var(--text-primary)',
              border: `1px solid ${
                isCompleted ? 'var(--accent-primary)' : 'var(--border-grid)'
              }`,
            }}
          >
            {isCompleted ? '[✓ CAPSTONE_SHIPPED]' : '[ ] MARK_SHIPPED'}
          </button>
        </div>

        {/* Project Title & Problem Statement */}
        <div
          className="p-4"
          style={{ borderBottom: '1px solid var(--border-grid)' }}
        >
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-2">
            <h3
              className="text-base md:text-lg font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {project.title}
            </h3>
            <span
              className="font-mono text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              id::{project.id}
            </span>
          </div>
          <div
            className="p-3 mt-2 font-mono text-xs leading-relaxed"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-grid)',
              color: 'var(--text-secondary)',
            }}
          >
            <div
              className="text-[11px] uppercase tracking-wider mb-1 font-bold"
              style={{ color: 'var(--accent-param)' }}
            >
              // PROBLEM_STATEMENT & ENGINEERING_MANDATE
            </div>
            <p
              className="font-sans text-sm leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              {project.problemStatement}
            </p>
          </div>

          {/* Tech Stack Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <span
              className="mr-1 uppercase tracking-wider text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              STACK_DEPS:
            </span>
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[11px]"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-grid)',
                  color: 'var(--accent-param)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Main 2-Column Split: ASCII System Architecture + Implementation Blueprint */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: ASCII System Architecture & Starter CLI */}
          <div
            className="lg:col-span-6 p-4 flex flex-col justify-between"
            style={{
              borderBottom: '1px solid var(--border-grid)',
              borderRight: '1px solid var(--border-grid)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span
                  className="font-bold uppercase tracking-wider"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  ┌─ SYSTEM_ARCHITECTURE_TOPOLOGY (ASCII)
                </span>
                <span style={{ color: 'var(--text-muted)' }}>[READ_ONLY]</span>
              </div>
              <pre
                className="p-3 overflow-x-auto font-mono text-[11px] leading-[1.35] select-all"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-grid)',
                  color: 'var(--text-primary)',
                }}
              >
                {project.architectureAscii}
              </pre>
            </div>

            {/* Starter CLI Command Box */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <span
                  className="font-bold uppercase tracking-wider"
                  style={{ color: 'var(--accent-warn)' }}
                >
                  $ BOOTSTRAP_WORKSPACE_CMD
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCommand(project)}
                  className="px-2 py-0.5 font-mono text-[11px] cursor-pointer transition-colors"
                  style={{
                    backgroundColor:
                      copiedId === project.id
                        ? 'var(--accent-primary)'
                        : 'var(--bg-elevated)',
                    color:
                      copiedId === project.id
                        ? 'var(--bg-canvas)'
                        : 'var(--text-primary)',
                    border: '1px solid var(--border-grid)',
                  }}
                >
                  {copiedId === project.id
                    ? '[✓ COPIED_TO_CLIPBOARD]'
                    : '[COPY_CMD]'}
                </button>
              </div>
              <div
                className="p-2.5 font-mono text-xs overflow-x-auto flex items-center justify-between gap-2"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-active)',
                  color: 'var(--accent-primary)',
                }}
              >
                <code className="whitespace-pre">{project.starterCommand}</code>
              </div>
            </div>
          </div>

          {/* Right Column: Implementation Blueprint & Evaluation Metrics */}
          <div
            className="lg:col-span-6 p-4 flex flex-col justify-between"
            style={{ borderBottom: '1px solid var(--border-grid)' }}
          >
            {/* Implementation Blueprint */}
            <div>
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span
                  className="font-bold uppercase tracking-wider"
                  style={{ color: 'var(--accent-param)' }}
                >
                  ├─ IMPLEMENTATION_BLUEPRINT ({completedStepCount}/
                  {project.implementationSteps.length} STEPS)
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  [CLICK_TO_CHECK]
                </span>
              </div>
              <div
                className="divide-y"
                style={{
                  border: '1px solid var(--border-grid)',
                  backgroundColor: 'var(--bg-canvas)',
                }}
              >
                {project.implementationSteps.map((step, idx) => {
                  const stepKey = `${project.id}:${idx}`;
                  const isStepDone = !!checkedSteps[stepKey];
                  return (
                    <button
                      key={stepKey}
                      type="button"
                      onClick={() => handleToggleStep(project.id, idx)}
                      className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 font-mono text-xs transition-colors cursor-pointer"
                      style={{
                        borderBottom:
                          idx < project.implementationSteps.length - 1
                            ? '1px solid var(--border-grid)'
                            : 'none',
                        backgroundColor: isStepDone
                          ? 'rgba(16, 185, 129, 0.06)'
                          : 'transparent',
                      }}
                    >
                      <span
                        className="shrink-0 font-bold"
                        style={{
                          color: isStepDone
                            ? 'var(--accent-primary)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {isStepDone ? '[✓]' : `[0${idx + 1}]`}
                      </span>
                      <span
                        className="font-sans text-xs leading-relaxed"
                        style={{
                          color: isStepDone
                            ? 'var(--text-secondary)'
                            : 'var(--text-primary)',
                          textDecoration: isStepDone ? 'line-through' : 'none',
                        }}
                      >
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evaluation Metrics & Acceptance Criteria */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span
                  className="font-bold uppercase tracking-wider"
                  style={{ color: 'var(--accent-warn)' }}
                >
                  └─ PRODUCTION_EVALUATION_GATES (PASS_CRITERIA)
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {project.evaluationMetrics.length} GATES
                </span>
              </div>
              <div
                className="p-3 space-y-2"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-grid)',
                }}
              >
                {project.evaluationMetrics.map((metric, mIdx) => (
                  <div
                    key={mIdx}
                    className="flex items-start gap-2 font-mono text-xs"
                  >
                    <span
                      className="shrink-0 font-bold"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      [GATE_0{mIdx + 1}]
                    </span>
                    <span
                      className="font-sans text-xs leading-relaxed"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {metric}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className="rounded-none"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        border: '1px solid var(--border-grid)',
      }}
    >
      {/* Drawer Header Chrome */}
      <div
        className="px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-grid)',
        }}
      >
        <div className="flex items-center gap-2 font-mono text-xs">
          <span
            className="px-2 py-0.5 font-bold"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-canvas)',
            }}
          >
            CAPSTONE_DRAWER
          </span>
          <span
            className="font-bold tracking-wider uppercase"
            style={{ color: 'var(--text-primary)' }}
          >
            END-TO-END MILESTONE PROJECTS (LEVEL 01 ──► LEVEL 04)
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span style={{ color: 'var(--text-muted)' }}>
            SHIPPED: {effectiveCompletedIds.length}/{sortedProjects.length}
          </span>
          <button
            type="button"
            onClick={() => setViewAllCards((prev) => !prev)}
            className="px-2.5 py-1 font-mono text-xs cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-grid)',
              color: 'var(--accent-param)',
            }}
          >
            {viewAllCards
              ? '[MODE: STACKED_ALL_LEVELS]'
              : '[MODE: TABBED_INSPECTOR]'}
          </button>
        </div>
      </div>

      {/* Level Selector Tabs */}
      {!viewAllCards && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{
            backgroundColor: 'var(--bg-pane)',
            borderBottom: '1px solid var(--border-grid)',
          }}
        >
          {sortedProjects.map((project, index) => {
            const isSelected = activeProject?.id === project.id;
            const isDone = effectiveCompletedIds.includes(project.id);
            const isTrackMatch =
              project.track === activeTrack || project.track === 'all';

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
                className="text-left p-3 font-mono transition-colors cursor-pointer flex flex-col justify-between gap-1.5"
                style={{
                  backgroundColor: isSelected
                    ? 'var(--bg-elevated)'
                    : 'var(--bg-pane)',
                  borderRight:
                    index < sortedProjects.length - 1
                      ? '1px solid var(--border-grid)'
                      : 'none',
                  borderBottom: isSelected
                    ? '2px solid var(--accent-primary)'
                    : '2px solid transparent',
                }}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: isSelected
                        ? 'var(--accent-primary)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {isSelected ? '❯ ' : '  '}LVL_0{project.level} ::{' '}
                    {project.difficulty}
                  </span>
                  <span
                    className="text-[11px]"
                    style={{
                      color: isDone
                        ? 'var(--accent-primary)'
                        : isTrackMatch
                        ? 'var(--accent-param)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {isDone
                      ? '[✓ SHIPPED]'
                      : isTrackMatch
                      ? '[★ TRACK]'
                      : `[${project.estimatedHours}H]`}
                  </span>
                </div>
                <div
                  className="text-xs font-sans font-semibold truncate w-full"
                  style={{
                    color: isSelected
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)',
                  }}
                >
                  {project.title}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Project or All Projects */}
      <div className="p-4 space-y-6">
        {viewAllCards
          ? sortedProjects.map((project) => renderProjectSpec(project))
          : activeProject && renderProjectSpec(activeProject)}
      </div>
    </section>
  );
};

export default MilestoneProjectDrawer;
