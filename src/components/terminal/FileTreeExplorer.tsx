import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Cpu,
  GitBranch,
  Database,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { TaxonomyModule, ViewMode, WebGLSceneId } from '../../types';

export interface FileTreeExplorerProps {
  modules: TaxonomyModule[];
  activeView: ViewMode;
  activeModuleId: string;
  activeSubTopicId: string;
  activeSceneId: WebGLSceneId;
  completedSubTopics: string[];
  onSelectOverview: () => void;
  onSelectSubTopic: (moduleId: string, subTopicId: string) => void;
  onSelectScene: (sceneId: WebGLSceneId) => void;
  onSelectRoadmap: () => void;
  onSelectResources: () => void;
}

const LAB_SCENES: { id: WebGLSceneId; file: string; label: string }[] = [
  { id: 'neural-lattice', file: '00_neural_lattice.webgl', label: '3D MLP & Forward Signal' },
  { id: 'loss-landscape', file: '01_sgd_vs_adamw.webgl', label: 'Loss Surface & Saddle Points' },
  { id: 'latent-galaxy', file: '02_embedding_pca.webgl', label: 'Latent Manifold & Cosine' },
  { id: 'attention-rope', file: '03_qk_attention_rope.webgl', label: 'Multi-Head Attention & RoPE' },
  { id: 'flow-matching', file: '04_diffusion_vs_flow.webgl', label: 'Diffusion vs Flow Matching' },
  { id: 'superposition-sae', file: '05_sparse_autoencoder.webgl', label: 'Superposition & SAE Dictionary' },
];

export const FileTreeExplorer: React.FC<FileTreeExplorerProps> = ({
  modules,
  activeView,
  activeModuleId,
  activeSubTopicId,
  activeSceneId,
  completedSubTopics,
  onSelectOverview,
  onSelectSubTopic,
  onSelectScene,
  onSelectRoadmap,
  onSelectResources,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach((m) => {
      initial[m.id] = m.id === activeModuleId || m.number === '00' || m.number === '03' || m.number === '06';
    });
    return initial;
  });
  const [labFolderOpen, setLabFolderOpen] = useState(true);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  if (isCollapsed) {
    return (
      <aside
        className="w-10 border-r flex flex-col items-center py-2 justify-between select-none font-mono shrink-0"
        style={{
          backgroundColor: 'var(--bg-pane)',
          borderColor: 'var(--border-grid)',
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 border transition-colors cursor-pointer"
          style={{
            borderColor: 'var(--border-grid)',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--accent-primary)',
          }}
          title="Expand File Tree Explorer"
        >
          <PanelLeftOpen className="w-3.5 h-3.5" />
        </button>

        <div
          className="text-[10px] tracking-widest uppercase"
          style={{
            writingMode: 'vertical-rl',
            color: 'var(--text-muted)',
          }}
        >
          ┌─ [FS // TREE] ─┐
        </div>

        <div className="text-[10px]" style={{ color: 'var(--accent-primary)' }}>
          10M
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="w-64 lg:w-72 border-r flex flex-col select-none font-mono text-xs shrink-0 overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-pane)',
        borderColor: 'var(--border-grid)',
      }}
    >
      {/* Pane Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b text-[11px]"
        style={{
          borderColor: 'var(--border-grid)',
          backgroundColor: 'var(--bg-elevated)',
        }}
      >
        <span className="font-semibold tracking-tight" style={{ color: 'var(--text-secondary)' }}>
          ┌─ [FS // WTFIS_INDEX] ──┐
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:opacity-80 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          title="Collapse Explorer"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable Tree Content */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-1">
        {/* Root Overview File: ~/README.wtf */}
        <button
          onClick={onSelectOverview}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-left border transition-colors cursor-pointer"
          style={{
            borderColor: activeView === 'overview' ? 'var(--border-active)' : 'transparent',
            backgroundColor: activeView === 'overview' ? 'var(--bg-elevated)' : 'transparent',
            color: activeView === 'overview' ? 'var(--accent-primary)' : 'var(--text-primary)',
          }}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
          <span className="truncate font-semibold">~/README.wtf</span>
          <span
            className="ml-auto text-[10px] px-1 border"
            style={{
              borderColor: 'var(--border-grid)',
              color: 'var(--text-muted)',
            }}
          >
            START
          </span>
        </button>

        {/* Section Header: Curriculum Taxonomy */}
        <div
          className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider flex items-center justify-between"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>├─ /curriculum (00..09)</span>
          <span>[WTF?]</span>
        </div>

        {/* 8 Modules & SubTopics */}
        <div className="space-y-0.5">
          {modules.map((mod) => {
            const isModActive = activeView === 'module' && activeModuleId === mod.id;
            const isExpanded = !!expandedModules[mod.id] || isModActive;
            const completedInMod = mod.subTopics.filter((s) =>
              completedSubTopics.includes(s.id)
            ).length;

            return (
              <div key={mod.id} className="space-y-0.5">
                {/* Module Directory Row */}
                <div
                  className="flex items-center justify-between px-1.5 py-1 border transition-colors cursor-pointer"
                  style={{
                    borderColor: isModActive ? 'var(--border-grid)' : 'transparent',
                    backgroundColor: isModActive ? 'var(--bg-elevated)' : 'transparent',
                  }}
                  onClick={() => {
                    toggleModule(mod.id);
                    if (!isModActive && mod.subTopics.length > 0) {
                      onSelectSubTopic(mod.id, mod.subTopics[0].id);
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    )}
                    {isExpanded ? (
                      <FolderOpen
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: isModActive ? 'var(--accent-primary)' : 'var(--accent-param)' }}
                      />
                    ) : (
                      <Folder
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: 'var(--text-secondary)' }}
                      />
                    )}
                    <span
                      className="text-[11px] font-medium truncate"
                      style={{
                        color: isModActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {mod.number}_{mod.slug}/
                    </span>
                  </div>

                  <span
                    className="text-[10px] shrink-0 ml-1"
                    style={{
                      color:
                        completedInMod === mod.subTopics.length && mod.subTopics.length > 0
                          ? 'var(--accent-primary)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {completedInMod}/{mod.subTopics.length}
                  </span>
                </div>

                {/* Subtopics inside Module */}
                {isExpanded && (
                  <div
                    className="ml-3 pl-2 border-l space-y-0.5"
                    style={{ borderColor: 'var(--border-grid)' }}
                  >
                    {mod.subTopics.map((sub, idx) => {
                      const isSubActive =
                        activeView === 'module' &&
                        activeModuleId === mod.id &&
                        activeSubTopicId === sub.id;
                      const isDone = completedSubTopics.includes(sub.id);
                      const isLast = idx === mod.subTopics.length - 1;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => onSelectSubTopic(mod.id, sub.id)}
                          className="w-full flex items-center justify-between gap-1.5 px-2 py-1 text-left text-[11px] border transition-colors cursor-pointer"
                          style={{
                            borderColor: isSubActive ? 'var(--border-active)' : 'transparent',
                            backgroundColor: isSubActive ? 'var(--bg-canvas)' : 'transparent',
                            color: isSubActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          }}
                          title={`${sub.title} — ${sub.wtfQuestion}`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span style={{ color: 'var(--text-muted)' }}>
                              {isLast ? '└─' : '├─'}
                            </span>
                            <span className="truncate">{sub.title}</span>
                          </div>
                          <span
                            className="text-[10px] shrink-0 font-bold"
                            style={{
                              color: isDone
                                ? 'var(--accent-primary)'
                                : isSubActive
                                ? 'var(--accent-param)'
                                : 'var(--text-muted)',
                            }}
                          >
                            {isDone ? '[✓]' : isSubActive ? '[▸]' : '[ ]'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section Header: 3D Systems Lab */}
        <div
          className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider flex items-center justify-between"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>├─ /systems-lab (3D WebGL)</span>
          <span>[GPU]</span>
        </div>

        <div>
          <button
            onClick={() => setLabFolderOpen((prev) => !prev)}
            className="w-full flex items-center gap-1.5 px-1.5 py-1 text-left cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            {labFolderOpen ? (
              <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            )}
            <Cpu className="w-3.5 h-3.5" style={{ color: 'var(--accent-warn)' }} />
            <span className="text-[11px] font-medium">~/systems-lab/</span>
          </button>

          {labFolderOpen && (
            <div
              className="ml-3 pl-2 border-l space-y-0.5 mt-0.5"
              style={{ borderColor: 'var(--border-grid)' }}
            >
              {LAB_SCENES.map((scene) => {
                const isSceneActive =
                  activeView === 'webgl-lab' && activeSceneId === scene.id;
                return (
                  <button
                    key={scene.id}
                    onClick={() => onSelectScene(scene.id)}
                    className="w-full flex items-center justify-between px-2 py-1 text-left text-[11px] border transition-colors cursor-pointer"
                    style={{
                      borderColor: isSceneActive ? 'var(--border-active)' : 'transparent',
                      backgroundColor: isSceneActive ? 'var(--bg-elevated)' : 'transparent',
                      color: isSceneActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    }}
                    title={scene.label}
                  >
                    <span className="truncate">▸ {scene.file}</span>
                    {isSceneActive && (
                      <span
                        className="text-[9px] px-1"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        LIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Section Header: DAG Roadmap & Resource DB */}
        <div
          className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          └─ /execution_&_index
        </div>

        <button
          onClick={onSelectRoadmap}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-left border transition-colors cursor-pointer"
          style={{
            borderColor: activeView === 'roadmap' ? 'var(--border-active)' : 'transparent',
            backgroundColor: activeView === 'roadmap' ? 'var(--bg-elevated)' : 'transparent',
            color: activeView === 'roadmap' ? 'var(--accent-primary)' : 'var(--text-secondary)',
          }}
        >
          <GitBranch className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-param)' }} />
          <span className="truncate">~/build-roadmap.dag</span>
        </button>

        <button
          onClick={onSelectResources}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-left border transition-colors cursor-pointer"
          style={{
            borderColor: activeView === 'resources' ? 'var(--border-active)' : 'transparent',
            backgroundColor: activeView === 'resources' ? 'var(--bg-elevated)' : 'transparent',
            color: activeView === 'resources' ? 'var(--accent-primary)' : 'var(--text-secondary)',
          }}
        >
          <Database className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
          <span className="truncate">~/resources.db</span>
        </button>
      </div>

      {/* Footer Keybinding Hint */}
      <div
        className="px-3 py-2 border-t text-[10px] flex items-center justify-between"
        style={{
          borderColor: 'var(--border-grid)',
          backgroundColor: 'var(--bg-canvas)',
          color: 'var(--text-muted)',
        }}
      >
        <span>ZERO_GATEKEEPING</span>
        <span style={{ color: 'var(--accent-primary)' }}>100% FREE</span>
      </div>
    </aside>
  );
};
export default FileTreeExplorer;
