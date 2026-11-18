import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Terminal,
  Cpu,
  BookOpen,
  CornerDownLeft,
  X,
} from 'lucide-react';
import {
  LearningResource,
  TaxonomyModule,
  ViewMode,
  WebGLSceneId,
} from '../../types';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: TaxonomyModule[];
  resources: LearningResource[];
  onSelectSubTopic: (moduleId: string, subTopicId: string) => void;
  onSelectScene: (sceneId: WebGLSceneId) => void;
  onSelectResource: (query: string) => void;
  onNavigateView: (view: ViewMode) => void;
}

interface PaletteItem {
  id: string;
  category: 'WTF_IS_MODULE' | '3D_SYSTEMS_LAB' | 'RESOURCE' | 'NAVIGATION';
  title: string;
  subtitle: string;
  badge: string;
  action: () => void;
}

const LAB_ITEMS: { id: WebGLSceneId; title: string; subtitle: string }[] = [
  {
    id: 'neural-lattice',
    title: '3D Lab: Neural Lattice & Forward Signal Propagation',
    subtitle: 'Interactive MLP activations, weights & layer transformations',
  },
  {
    id: 'loss-landscape',
    title: '3D Lab: Non-Convex Loss Landscape (SGD vs AdamW)',
    subtitle: 'Saddle points, learning rate explosions & momentum trajectories',
  },
  {
    id: 'latent-galaxy',
    title: '3D Lab: High-Dimensional Embedding Manifold & Cosine',
    subtitle: 'Semantic token clusters, temperature scaling & vector arithmetic',
  },
  {
    id: 'attention-rope',
    title: '3D Lab: Multi-Head Causal Attention & RoPE Rotations',
    subtitle: 'Query-Key dot products, softmax routing arcs & rotary position phase',
  },
  {
    id: 'flow-matching',
    title: '3D Lab: Diffusion Score Paths vs Optimal Transport Flow Matching',
    subtitle: 'Stochastic DDPM trajectories vs straight ODE vector fields',
  },
  {
    id: 'superposition-sae',
    title: '3D Lab: Polysemanticity, Superposition & Sparse Autoencoders',
    subtitle: 'Disentangling compressed neural features into monosemantic directions',
  },
];

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  modules,
  resources,
  onSelectSubTopic,
  onSelectScene,
  onSelectResource,
  onNavigateView,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const allItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = [];

    // 1. All SubTopics ("WTF is...?")
    modules.forEach((mod) => {
      mod.subTopics.forEach((sub) => {
        items.push({
          id: `sub-${mod.id}-${sub.id}`,
          category: 'WTF_IS_MODULE',
          title: sub.title,
          subtitle: `${sub.wtfQuestion} — ${sub.plainEnglish}`,
          badge: `MOD_${mod.number}`,
          action: () => {
            onSelectSubTopic(mod.id, sub.id);
            onClose();
          },
        });
      });
    });

    // 2. 3D WebGL Labs
    LAB_ITEMS.forEach((lab) => {
      items.push({
        id: `lab-${lab.id}`,
        category: '3D_SYSTEMS_LAB',
        title: lab.title,
        subtitle: lab.subtitle,
        badge: '3D_WEBGL',
        action: () => {
          onSelectScene(lab.id);
          onClose();
        },
      });
    });

    // 3. System Views
    items.push(
      {
        id: 'nav-roadmap',
        category: 'NAVIGATION',
        title: 'Build Roadmap & Milestone Projects DAG',
        subtitle: 'Interactive skill tree for Builder, ML Engineer & Researcher tracks',
        badge: 'VIEW_04',
        action: () => {
          onNavigateView('roadmap');
          onClose();
        },
      },
      {
        id: 'nav-resources',
        category: 'NAVIGATION',
        title: 'Zero-Gatekeeping Free AI/ML Resource Index',
        subtitle: 'Curated courses, papers, repos & interactive visualizers',
        badge: 'VIEW_05',
        action: () => {
          onNavigateView('resources');
          onClose();
        },
      }
    );

    // 4. Resources
    resources.forEach((res) => {
      items.push({
        id: `res-${res.id}`,
        category: 'RESOURCE',
        title: `${res.title} (${res.authorOrOrg})`,
        subtitle: res.whyHighSignal,
        badge: res.type,
        action: () => {
          onSelectResource(res.title);
          onClose();
        },
      });
    });

    return items;
  }, [modules, resources, onSelectSubTopic, onSelectScene, onSelectResource, onNavigateView, onClose]);

  const filteredItems = useMemo(() => {
    const clean = query
      .toLowerCase()
      .replace(/^wtf\s+is\s+/i, '')
      .replace(/^wtf\s+/i, '')
      .trim();

    if (!clean) return allItems.slice(0, 14);

    return allItems
      .filter((item) => {
        const hay = `${item.title} ${item.subtitle} ${item.badge}`.toLowerCase();
        return clean.split(/\s+/).every((token) => hay.includes(token));
      })
      .slice(0, 14);
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredItems.length > 0
          ? (prev - 1 + filteredItems.length) % filteredItems.length
          : 0
      );
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 font-mono"
      style={{ backgroundColor: 'rgba(5, 7, 10, 0.82)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-pane)',
          borderColor: 'var(--border-active)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-3 py-2 border-b text-[11px]"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-grid)',
          }}
        >
          <span style={{ color: 'var(--accent-primary)' }}>
            ┌─ [WTFIS.AI // GLOBAL_CONCEPT_&_LAB_LOCATOR] ──┐
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-1.5 py-0.5 border text-[10px] cursor-pointer"
            style={{
              borderColor: 'var(--border-grid)',
              color: 'var(--text-secondary)',
            }}
          >
            <span>ESC</span>
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Search Input Box */}
        <div
          className="flex items-center gap-2.5 px-3 py-3 border-b"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-grid)',
          }}
        >
          <Search
            className="w-4 h-4 shrink-0"
            style={{ color: 'var(--accent-primary)' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Ask "WTF is attention?", "agent harness", "backprop", "GRPO", "LoRA", "SAE"...'
            className="w-full bg-transparent focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)] px-1 text-sm font-mono"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[10px] px-1.5 py-0.5 border cursor-pointer"
              style={{
                borderColor: 'var(--border-grid)',
                color: 'var(--text-muted)',
              }}
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div
          className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b text-[10px]"
          style={{
            backgroundColor: 'var(--bg-pane)',
            borderColor: 'var(--border-grid)',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>HOT QUERIES:</span>
          {[
            'attention',
            'agent harness',
            'orchestration',
            'sdk',
            'docker',
            'vlm',
            'grpo',
            'flow matching',
            'sae',
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => setQuery(preset)}
              className="px-1.5 py-0.5 border cursor-pointer hover:opacity-90"
              style={{
                borderColor: 'var(--border-grid)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--accent-param)',
              }}
            >
              wtf {preset}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y" style={{ borderColor: 'var(--border-grid)' }}>
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              No matching concepts or 3D labs found for &quot;{query}&quot;. Try searching &quot;attention&quot;, &quot;backprop&quot;, or &quot;agent&quot;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className="w-full flex items-start justify-between gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
                    borderColor: 'var(--border-grid)',
                  }}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {item.category === 'WTF_IS_MODULE' ? (
                        <Terminal
                          className="w-3.5 h-3.5"
                          style={{
                            color: isSelected
                              ? 'var(--accent-primary)'
                              : 'var(--text-secondary)',
                          }}
                        />
                      ) : item.category === '3D_SYSTEMS_LAB' ? (
                        <Cpu
                          className="w-3.5 h-3.5"
                          style={{ color: 'var(--accent-warn)' }}
                        />
                      ) : (
                        <BookOpen
                          className="w-3.5 h-3.5"
                          style={{ color: 'var(--accent-param)' }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold truncate"
                          style={{
                            color: isSelected
                              ? 'var(--accent-primary)'
                              : 'var(--text-primary)',
                          }}
                        >
                          {item.title}
                        </span>
                      </div>
                      <p
                        className="text-[11px] line-clamp-1 mt-0.5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[10px] px-1.5 py-0.5 border"
                      style={{
                        borderColor: 'var(--border-grid)',
                        backgroundColor: 'var(--bg-canvas)',
                        color:
                          item.category === '3D_SYSTEMS_LAB'
                            ? 'var(--accent-warn)'
                            : 'var(--accent-param)',
                      }}
                    >
                      {item.badge}
                    </span>
                    {isSelected && (
                      <CornerDownLeft
                        className="w-3.5 h-3.5"
                        style={{ color: 'var(--accent-primary)' }}
                      />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="flex items-center justify-between px-3 py-2 border-t text-[10px]"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-grid)',
            color: 'var(--text-muted)',
          }}
        >
          <span>↑↓ TO NAVIGATE // ENTER TO MOUNT BUFFER</span>
          <span>{filteredItems.length} RESULTS</span>
        </div>
      </div>
    </div>
  );
};
export default CommandPaletteModal;
