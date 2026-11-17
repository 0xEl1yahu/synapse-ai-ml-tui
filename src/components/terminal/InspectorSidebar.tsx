import React from 'react';
import { LearningResource, SubTopic, TaxonomyModule, WebGLSceneId } from '../../types';

export interface InspectorSidebarProps {
  module: TaxonomyModule;
  activeSubTopic: SubTopic;
  resources: LearningResource[];
  onSelectScene: (sceneId: WebGLSceneId) => void;
  onNavigateRoadmap: () => void;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  module,
  activeSubTopic,
  resources,
  onSelectScene,
  onNavigateRoadmap,
}) => {
  const matchedResources = resources.filter((r) => r.moduleIds.includes(module.id));

  return (
    <aside className="w-72 shrink-0 h-full overflow-y-auto bg-[var(--bg-pane)] border-l border-[var(--border-grid)] font-mono text-xs p-3 space-y-4 hidden xl:block">
      <div>
        <div className="text-[var(--accent-primary)] font-bold pb-1 border-b border-[var(--border-grid)]">
          ┌─ [SYSTEM_INSPECTOR]
        </div>
        <div className="mt-2 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">MODULE_ID:</span>
            <span className="text-[var(--text-primary)]">{module.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">EST_MASTERY:</span>
            <span className="text-[var(--accent-warn)]">{module.estimatedHours} HOURS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">COUPLED_3D_LAB:</span>
            <button
              type="button"
              onClick={() => onSelectScene(module.defaultSceneId)}
              className="text-[var(--accent-param)] underline cursor-pointer"
            >
              {module.defaultSceneId} ↗
            </button>
          </div>
        </div>
      </div>

      {/* Mental Model Summary */}
      <div className="p-2.5 bg-[var(--bg-canvas)] border border-[var(--border-grid)]">
        <div className="text-[10px] text-[var(--accent-primary)] font-bold mb-1">
          CORE_MENTAL_MODEL:
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] font-sans leading-relaxed">
          {module.mentalModelSummary}
        </p>
      </div>

      {/* Core Production Stack */}
      <div>
        <div className="text-[11px] text-[var(--text-secondary)] font-semibold mb-1.5">
          CORE_LIBRARIES_&_STACK:
        </div>
        <div className="flex flex-wrap gap-1">
          {module.coreTools.map((tool) => (
            <span
              key={tool}
              className="px-1.5 py-0.5 bg-[var(--bg-canvas)] border border-[var(--border-grid)] text-[10px] text-[var(--accent-param)]"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Equations in Current Buffer */}
      <div>
        <div className="text-[11px] text-[var(--text-secondary)] font-semibold mb-1.5">
          EQUATIONS_IN_BUFFER ({activeSubTopic.mathFormulas.length}):
        </div>
        <div className="space-y-1">
          {activeSubTopic.mathFormulas.map((f) => (
            <div
              key={f.id}
              className="p-1.5 bg-[var(--bg-canvas)] border border-[var(--border-grid)] text-[10px] text-[var(--text-primary)]"
            >
              ◆ {f.title}
            </div>
          ))}
        </div>
      </div>

      {/* Curated Free Resources for this Module */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-semibold mb-1.5">
          <span>FREE_DEEP_DIVE_RESOURCES:</span>
          <span className="text-[var(--accent-primary)]">[{matchedResources.length}]</span>
        </div>
        <div className="space-y-2">
          {matchedResources.map((res) => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noreferrer"
              className="block p-2 bg-[var(--bg-canvas)] border border-[var(--border-grid)] hover:border-[var(--accent-primary)] transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] text-[var(--accent-primary)]">
                <span>[{res.type}]</span>
                <span>[FREE ↗]</span>
              </div>
              <div className="text-[11px] text-[var(--text-primary)] font-semibold mt-0.5">
                {res.title}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                {res.authorOrOrg}
              </div>
            </a>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNavigateRoadmap}
        className="w-full py-1.5 border border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 font-semibold text-xs cursor-pointer"
      >
        [BUILD_WITH_IT: ROADMAP_DAG ❯]
      </button>
    </aside>
  );
};

export default InspectorSidebar;
