import React, { useEffect, useMemo, useState } from 'react';
import { FieldGuide } from './components/curriculum/FieldGuide';
import { GUIDE_LESSONS } from './data/fieldGuide';
import { ThemeId, TrackId, ViewMode, WebGLSceneId } from './types';
import { TAXONOMY_MODULES, CLI_MAN_PAGES } from './data/taxonomy';
import { ROADMAP_NODES, MILESTONE_PROJECTS, TRACK_DEFINITIONS } from './data/tracks';
import { LEARNING_RESOURCES } from './data/resources';
import { TopStatusBar } from './components/terminal/TopStatusBar';
import { FileTreeExplorer } from './components/terminal/FileTreeExplorer';
import { CommandLineBar } from './components/terminal/CommandLineBar';
import { CommandPaletteModal } from './components/terminal/CommandPaletteModal';
import { InspectorSidebar } from './components/terminal/InspectorSidebar';
import { ModuleReaderPane } from './components/curriculum/ModuleReaderPane';
import { AgentHarnessSimulator } from './components/curriculum/AgentHarnessSimulator';
import { PaperDissectorPane } from './components/curriculum/PaperDissectorPane';
import { VRAMSystemsCalculator } from './components/curriculum/VRAMSystemsCalculator';
import { WebGLViewportShell } from './components/webgl/WebGLViewportShell';
import { GitGraphRoadmap } from './components/roadmap/GitGraphRoadmap';
import { ResourceDirectoryPane } from './components/resources/ResourceDirectoryPane';
import {
  WTFBrandLogo,
  EcosystemLogoStrip,
  EcosystemToolBadge,
} from './components/terminal/EcosystemLogos';

const STORAGE_KEYS = {
  SUBTOPICS: 'wtfis_ai_completed_subtopics_v1',
  ROADMAP: 'wtfis_ai_completed_nodes_v1',
  THEME: 'wtfis_ai_theme_v1',
  TRACK: 'wtfis_ai_track_v1',
  PROJECTS: 'wtfis_ai_completed_projects_v1',
};

const FEATURED_WTF_QUESTIONS: {
  label: string;
  question: string;
  moduleId: string;
  subTopicId: string;
  sceneId: WebGLSceneId;
  tag: string;
}[] = [
  {
    label: 'WTF is Attention & MLA?',
    question: 'Why do we divide QK^T by sqrt(d_k), and how does DeepSeek MLA compress the KV cache?',
    moduleId: '03_sequence_arch',
    subTopicId: 'wtf-is-attention',
    sceneId: 'attention-rope',
    tag: 'TRANSFORMERS',
  },
  {
    label: 'WTF is Backpropagation?',
    question: 'How does reverse-mode autodiff know which weight in Layer 1 caused the error in Layer 32?',
    moduleId: '02_deep_learning',
    subTopicId: 'wtf-is-backprop',
    sceneId: 'neural-lattice',
    tag: 'DEEP_LEARNING',
  },
  {
    label: 'WTF is Gradient Descent & The Hessian?',
    question: 'Why do high-dimensional networks get trapped near saddle points instead of local minima?',
    moduleId: '00_foundations',
    subTopicId: 'wtf-is-gradient-descent',
    sceneId: 'loss-landscape',
    tag: 'MATH_CORE',
  },
  {
    label: 'WTF is an Agent Harness?',
    question: 'How does a stateless token predictor actually execute bash commands, edit files & manage state?',
    moduleId: '06_ai_systems_ops',
    subTopicId: 'wtf-is-agent-harness',
    sceneId: 'neural-lattice',
    tag: 'AI_SYSTEMS',
  },
  {
    label: 'WTF is Reasoning RL & GRPO?',
    question: 'How do reasoning models learn to self-verify and backtrack without a Critic network?',
    moduleId: '05_post_training_rl',
    subTopicId: 'wtf-is-reasoning-grpo',
    sceneId: 'loss-landscape',
    tag: 'POST_TRAINING',
  },
  {
    label: 'WTF is Flow Matching?',
    question: 'Why did frontier generative models replace curved diffusion SDEs with straight Optimal Transport ODEs?',
    moduleId: '04_generative_ai',
    subTopicId: 'wtf-is-flow-matching',
    sceneId: 'flow-matching',
    tag: 'GENERATIVE_AI',
  },
  {
    label: 'WTF is Superposition & SAEs?',
    question: 'How does a neural network pack 50,000 concepts into 4,096 neurons, and how do we untangle them?',
    moduleId: '07_interp_evals',
    subTopicId: 'wtf-is-superposition-sae',
    sceneId: 'superposition-sae',
    tag: 'INTERPRETABILITY',
  },
  {
    label: 'WTF is 2nd-Order XGBoost?',
    question: 'Why do Gradient Boosted Trees use both 1st-order gradients (g_i) and 2nd-order Hessians (h_i)?',
    moduleId: '01_classical_ml',
    subTopicId: 'wtf-is-gradient-boosting',
    sceneId: 'latent-galaxy',
    tag: 'CLASSICAL_ML',
  },
  {
    label: 'WTF is Multi-Agent Orchestration?',
    question: 'How do Lead-Subagent topologies, Git Worktrees, and MCP scale coding agents without context rot?',
    moduleId: '09_prod_sdk_orchestration_deploy',
    subTopicId: 'wtf-is-multi-agent-orchestration',
    sceneId: 'neural-lattice',
    tag: 'ORCHESTRATION',
  },
  {
    label: 'WTF is PyTorch compile & OpenAI/DeepSeek SDK?',
    question: 'Why are zero-copy NumPy strides 100x faster, and how does TorchInductor fuse GPU kernels?',
    moduleId: '09_prod_sdk_orchestration_deploy',
    subTopicId: 'wtf-is-numpy-pytorch-sdk-internals',
    sceneId: 'neural-lattice',
    tag: 'SDKS_&_PYTORCH',
  },
  {
    label: 'WTF is Docker, Cog & 5D GPU Sharding?',
    question: 'How do you package CUDA/vLLM containers with Cog and shard 16-bytes/param across FSDP GPUs?',
    moduleId: '09_prod_sdk_orchestration_deploy',
    subTopicId: 'wtf-is-docker-cog-gpu-deploy',
    sceneId: 'neural-lattice',
    tag: 'DOCKER_&_GPU_OPS',
  },
  {
    label: 'WTF are VLMs (ViT/CLIP), Audio RVQ & GNNs?',
    question: 'How do Vision Transformers patchify images, RVQ codecs discretize voice, and E(3) GNNs model molecules?',
    moduleId: '08_multimodal_world_gnn',
    subTopicId: 'wtf-is-vit-clip-vlm',
    sceneId: 'latent-galaxy',
    tag: 'MULTIMODAL_&_VLA',
  },
];

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [guideId, setGuideId] = useState('python');
  const guide = GUIDE_LESSONS.find(item => item.id === guideId) || GUIDE_LESSONS[0];
  const mainRef = React.useRef<HTMLElement>(null);
  const openGuide = (id: string) => { setGuideId(id); setActiveView('guide'); };
  useEffect(() => { if (activeView === 'guide') mainRef.current?.scrollTo(0, 0); }, [activeView, guideId]);
  const [activeModuleId, setActiveModuleId] = useState<string>(TAXONOMY_MODULES[0].id);
  const [activeSubTopicId, setActiveSubTopicId] = useState<string>(
    TAXONOMY_MODULES[0].subTopics[0].id
  );
  const [activeSceneId, setActiveSceneId] = useState<WebGLSceneId>('neural-lattice');
  const [renderAscii, setRenderAscii] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [overviewFilter, setOverviewFilter] = useState<string>('');
  const [resourceSearchRequest, setResourceSearchRequest] = useState<string>('');

  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeId | null;
    return saved || 'phosphor';
  });

  const [activeTrack, setActiveTrack] = useState<TrackId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRACK) as TrackId | null;
    return saved || 'builder';
  });

  const [completedSubTopics, setCompletedSubTopics] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SUBTOPICS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [completedRoadmapNodes, setCompletedRoadmapNodes] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ROADMAP);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [completedProjects, setCompletedProjects] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRACK, activeTrack);
  }, [activeTrack]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBTOPICS, JSON.stringify(completedSubTopics));
  }, [completedSubTopics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(completedRoadmapNodes));
  }, [completedRoadmapNodes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(completedProjects));
  }, [completedProjects]);

  const handleToggleProjectComplete = (projectId: string) => {
    setCompletedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  // Global keyboard shortcuts (Cmd+K / Ctrl+K or '/' to open "WTF is...?" search)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((v) => !v);
      } else if (
        e.key === '/' &&
        !isPaletteOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPaletteOpen]);

  const activeModule = useMemo(
    () => TAXONOMY_MODULES.find((m) => m.id === activeModuleId) || TAXONOMY_MODULES[0],
    [activeModuleId]
  );

  const activeSubTopic = useMemo(
    () =>
      activeModule.subTopics.find((st) => st.id === activeSubTopicId) ||
      activeModule.subTopics[0],
    [activeModule, activeSubTopicId]
  );

  const totalSubTopicsCount = useMemo(
    () => TAXONOMY_MODULES.reduce((acc, m) => acc + m.subTopics.length, 0),
    []
  );

  const activePath = useMemo(() => {
    if (activeView === 'guide') return '~/wtfis-ai/guide/' + guideId;
    if (activeView === 'overview') return '~/wtfis-ai/README.wtf';
    if (activeView === 'papers') return '~/wtfis-ai/papers-decoded/attention_is_all_you_need.tex';
    if (activeView === 'roadmap') return `~/wtfis-ai/roadmap.dag (${activeTrack})`;
    if (activeView === 'resources') return '~/wtfis-ai/resources.db';
    if (activeView === 'webgl-lab') return `~/wtfis-ai/systems-lab/${activeSceneId}.glsl`;
    return `~/wtfis-ai/${activeModule.number}_${activeModule.slug}/${activeSubTopic.commandSlug}.md`;
  }, [activeView, activeTrack, activeSceneId, activeModule, activeSubTopic, guideId]);

  const handleSelectSubTopic = (moduleId: string, subTopicId: string) => {
    const targetMod = TAXONOMY_MODULES.find((m) => m.id === moduleId) || TAXONOMY_MODULES[0];
    const targetSub =
      targetMod.subTopics.find((s) => s.id === subTopicId) || targetMod.subTopics[0];
    setActiveModuleId(targetMod.id);
    setActiveSubTopicId(targetSub.id);
    setActiveSceneId(targetMod.defaultSceneId);
    setActiveView('module');
  };

  const handleToggleSubTopicComplete = (subTopicId: string) => {
    setCompletedSubTopics((prev) =>
      prev.includes(subTopicId) ? prev.filter((id) => id !== subTopicId) : [...prev, subTopicId]
    );
  };

  const handleToggleRoadmapNode = (nodeId: string) => {
    setCompletedRoadmapNodes((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  const filteredModulesForOverview = useMemo(() => {
    const q = overviewFilter.trim().toLowerCase();
    if (!q) return TAXONOMY_MODULES;
    return TAXONOMY_MODULES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.subTopics.some(
          (st) =>
            st.title.toLowerCase().includes(q) ||
            st.plainEnglish.toLowerCase().includes(q) ||
            st.wtfQuestion.toLowerCase().includes(q)
        )
    );
  }, [overviewFilter]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Top Terminal Status Bar */}
      <TopStatusBar
        activeView={activeView}
        onViewChange={setActiveView}
        activePath={activePath}
        activeTrack={activeTrack}
        onTrackChange={setActiveTrack}
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
        renderAscii={renderAscii}
        onToggleAscii={() => setRenderAscii((v) => !v)}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        completedCount={completedSubTopics.length}
        totalCount={totalSubTopicsCount}
      />

      {/* Main Middle Split-Pane Workbench */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Directory Tree Explorer */}
        <FileTreeExplorer
          modules={TAXONOMY_MODULES}
          activeView={activeView}
          activeModuleId={activeModule.id}
          activeSubTopicId={activeSubTopic.id}
          activeSceneId={activeSceneId}
          completedSubTopics={completedSubTopics}
          onSelectOverview={() => setActiveView('overview')}
          onSelectSubTopic={handleSelectSubTopic}
          onSelectScene={(sceneId) => {
            setActiveSceneId(sceneId);
            setActiveView('webgl-lab');
          }}
          onSelectRoadmap={() => setActiveView('roadmap')}
          onSelectResources={() => setActiveView('resources')}
        />

        {/* Center Active Viewport Buffer */}
        <main ref={mainRef} className="flex-1 min-w-0 h-full overflow-y-auto bg-[var(--bg-canvas)]">
          {activeView === 'guide' && <FieldGuide key={guide.id} lesson={guide} onChoose={openGuide} onOpenHarness={() => handleSelectSubTopic('06_ai_systems_ops', 'wtf-is-agent-harness')} />}
          {activeView === 'overview' && (
            <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
              {/* HERO SPLIT WORKBENCH: WTFIS.AI MANIFESTO + LIVE 3D WEBGL SANDBOX */}
              <div className="grid grid-cols-1 lg:grid-cols-12 border border-[var(--border-grid)] bg-[var(--bg-pane)]">
                {/* Left Column: Mission & Philosophy */}
                <div className="lg:col-span-6 p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--border-grid)] space-y-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 font-mono text-[11px] text-[var(--accent-primary)]">
                      <WTFBrandLogo className="w-4 h-4 shrink-0" />
                      <span>WTFIS.AI // 100% FREE &amp; OPEN AI/ML ENGINEERING PLAYGROUND</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text-primary)] leading-tight">
                      LEARN IT. INTERACT WITH IT. BREAK IT. BUILD WITH IT.
                    </h1>

                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      Learn how an assistant finds a note, how a model recognizes a digit, or how to write your first line of Python. Each topic starts with a question you can explore at your own pace.
                    </p>

                    <EcosystemLogoStrip isLightMode={activeTheme === 'paper-lab'} />

                    <button
                      type="button"
                      onClick={() => openGuide('python')}
                      className="px-3 py-1.5 bg-[var(--accent-primary)] text-black font-bold hover:opacity-90 cursor-pointer"
                    >
                      New to coding? Start with Python →
                    </button>

                    {/* Instant Search Trigger Input */}
                    <div className="pt-1">
                      <div className="flex items-center border border-[var(--accent-primary)] bg-[var(--bg-canvas)] px-3 py-2 font-mono text-xs">
                        <span className="text-[var(--accent-primary)] font-bold mr-2">
                          ASK "WTF IS...?" ❯
                        </span>
                        <input
                          type="text"
                          value={overviewFilter}
                          onChange={(e) => setOverviewFilter(e.target.value)}
                          placeholder="Filter topics: attention, backprop, agent harness, hessian, grpo, flow matching, sae..."
                          className="w-full bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)] px-1"
                        />
                        <button
                          type="button"
                          onClick={() => setIsPaletteOpen(true)}
                          className="ml-2 px-1.5 py-0.5 border border-[var(--border-grid)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] whitespace-nowrap cursor-pointer"
                        >
                          [⌘K FULL_SEARCH]
                        </button>
                      </div>
                    </div>

                    {/* Featured "WTF is...?" Rapid-Launch Matrix */}
                    <div className="pt-1">
                      <div className="font-mono text-[11px] text-[var(--text-secondary)] mb-2">
                        ◆ RAPID_JUMP // POPULAR "WTF IS...?" QUESTIONS:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono">
                        {FEATURED_WTF_QUESTIONS.slice(0, 4).map((item) => (
                          <button
                            key={item.subTopicId}
                            type="button"
                            onClick={() => handleSelectSubTopic(item.moduleId, item.subTopicId)}
                            className="p-2 border border-[var(--border-grid)] bg-[var(--bg-canvas)] hover:border-[var(--accent-primary)] text-left group transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between text-[10px] text-[var(--accent-param)]">
                              <span>[{item.tag}]</span>
                              <span className="text-[var(--accent-primary)] opacity-0 group-hover:opacity-100">
                                OPEN ❯
                              </span>
                            </div>
                            <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] mt-0.5">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-[var(--text-secondary)] font-sans line-clamp-1 mt-0.5">
                              {item.question}
                            </div>
                          </button>
                        ))}
                      </div>
                      <details className="mt-2 text-xs">
                        <summary className="w-fit cursor-pointer text-[var(--text-secondary)] hover:text-[var(--accent-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--accent-primary)]">
                          Browse all {FEATURED_WTF_QUESTIONS.length} popular questions
                        </summary>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono mt-2">
                          {FEATURED_WTF_QUESTIONS.slice(4).map((item) => (
                            <button
                              key={item.subTopicId}
                              type="button"
                              onClick={() => handleSelectSubTopic(item.moduleId, item.subTopicId)}
                              className="p-2 border border-[var(--border-grid)] bg-[var(--bg-canvas)] hover:border-[var(--accent-primary)] text-left group transition-colors cursor-pointer"
                            >
                              <div className="text-[10px] text-[var(--accent-param)]">[{item.tag}]</div>
                              <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] mt-0.5">{item.label}</div>
                              <div className="text-[10px] text-[var(--text-secondary)] font-sans line-clamp-1 mt-0.5">{item.question}</div>
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* Primary Action Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border-grid)] font-mono text-xs">

                    <button
                      type="button"
                      onClick={() => setActiveView('webgl-lab')}
                      className="px-3 py-1.5 border border-[var(--accent-param)] text-[var(--accent-param)] hover:bg-[var(--accent-param)]/15 font-semibold cursor-pointer"
                    >
                      [LAUNCH_3D_AI_SYSTEMS_LAB ↗]
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('papers')}
                      className="px-3 py-1.5 border border-[var(--accent-warn)] text-[var(--accent-warn)] hover:bg-[var(--accent-warn)]/15 font-semibold cursor-pointer"
                    >
                      [PAPERS_DECODED: ATTENTION_IS_ALL_YOU_NEED ❯]
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('roadmap')}
                      className="px-3 py-1.5 border border-[var(--border-grid)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] cursor-pointer"
                    >
                      [VIEW_BUILD_ROADMAP_DAG]
                    </button>
                  </div>
                </div>

                {/* Right Column: Live Interactive 3D WebGL & Shader Sandbox */}
                <div className="lg:col-span-6 flex flex-col">
                  <WebGLViewportShell
                    activeScene={activeSceneId}
                    onSceneChange={setActiveSceneId}
                    compact={true}
                    initialAscii={renderAscii}
                    onAsciiChange={setRenderAscii}
                  />
                </div>
              </div>

              {/* INTERACTIVE AGENT HARNESS TRACE & GPU VRAM CALCULATOR ON HOME WORKBENCH */}
              <details className="border border-[var(--border-grid)] bg-[var(--bg-pane)]">
                <summary className="cursor-pointer px-4 py-3 font-mono text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--accent-primary)]">
                  Explore interactive tools <span className="text-xs text-[var(--text-secondary)]">— agent harness and GPU memory calculator</span>
                </summary>
                <div className="p-3 space-y-3 border-t border-[var(--border-grid)]">
                  <AgentHarnessSimulator />
                  <VRAMSystemsCalculator />
                </div>
              </details>

              {/* THREE ENTRY TRACKS: WHERE SHOULD YOU START? */}
              <section className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs border-b border-[var(--border-grid)] pb-1.5">
                  <span className="text-[var(--accent-primary)] font-bold">
                    ┌─ [WHERE_WE_START // SELECT_YOUR_ENTRY_TRACK]
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    ACTIVE: --track={activeTrack}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                  {(Object.keys(TRACK_DEFINITIONS) as TrackId[]).map((tKey) => {
                    const track = TRACK_DEFINITIONS[tKey];
                    const isSelected = activeTrack === tKey;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setActiveTrack(track.id)}
                        className={`p-4 border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                            : 'border-[var(--border-grid)] bg-[var(--bg-pane)] hover:border-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--accent-primary)] font-bold">
                            {track.flag}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 border border-[var(--border-grid)]">
                            {isSelected ? 'ACTIVE_TRACK ✓' : 'SELECT'}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)] mt-1.5">
                          {track.title}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-sans mt-1 leading-relaxed">
                          {track.tagline}
                        </p>
                        <div className="mt-3 pt-2 border-t border-[var(--border-grid)] flex items-center justify-between text-[11px]">
                          <span className="text-[var(--accent-param)]">
                            {ROADMAP_NODES.filter((n) => n.tracks.includes(track.id)).length} DAG NODES
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTrack(track.id);
                              setActiveView('roadmap');
                            }}
                            className="text-[var(--accent-primary)] hover:underline cursor-pointer"
                          >
                            OPEN_TRACK_DAG ❯
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* COMPLETE 10-LAYER AI/ML TAXONOMY MATRIX (00 TO 09) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs border-b border-[var(--border-grid)] pb-1.5">
                  <span className="text-[var(--accent-primary)] font-bold">
                    ┌─ [COMPLETE_AI_ML_ARCHITECTURE_STACK // LAYERS_00_TO_09]
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    {filteredModulesForOverview.length} LAYERS_MOUNTED | {totalSubTopicsCount} DEEP-DIVE TOPICS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredModulesForOverview.map((mod) => {
                    const visibleTopics = overviewFilter.trim()
                      ? mod.subTopics
                      : mod.subTopics.slice(0, 2);
                    return (
                    <div
                      key={mod.id}
                      className="border border-[var(--border-grid)] bg-[var(--bg-pane)] flex flex-col justify-between"
                    >
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="px-1.5 py-0.5 bg-[var(--accent-primary)] text-black font-bold">
                            LAYER_{mod.number} // {mod.layerCategory}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSceneId(mod.defaultSceneId);
                              setActiveView('webgl-lab');
                            }}
                            className="text-[11px] text-[var(--accent-param)] hover:underline cursor-pointer"
                          >
                            [3D_LAB: {mod.defaultSceneId} ↗]
                          </button>
                        </div>

                        <h2 className="text-base font-bold font-mono text-[var(--text-primary)]">
                          {mod.title}
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {mod.mentalModelSummary}
                        </p>

                        {/* SubTopics List */}
                        <div className="space-y-1.5 pt-2">
                          {visibleTopics.map((st, idx) => {
                            const isDone = completedSubTopics.includes(st.id);
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => handleSelectSubTopic(mod.id, st.id)}
                                className="w-full p-2 bg-[var(--bg-canvas)] border border-[var(--border-grid)] hover:border-[var(--accent-primary)] text-left flex items-start justify-between gap-2 group cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <div className="font-mono text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] truncate">
                                    {isDone ? '[✓] ' : `[0${idx + 1}] `}
                                    {st.title}
                                  </div>
                                  <div className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                                    {st.wtfQuestion}
                                  </div>
                                </div>
                                <span className="font-mono text-xs text-[var(--accent-primary)] shrink-0">
                                  READ ❯
                                </span>
                              </button>
                            );
                          })}
                          {!overviewFilter.trim() && mod.subTopics.length > 2 && (
                            <details className="pt-1">
                              <summary className="cursor-pointer px-2 py-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--accent-primary)]">
                                Show {mod.subTopics.length - 2} more topics
                              </summary>
                              <div className="space-y-1.5 mt-1.5">
                                {mod.subTopics.slice(2).map((st, offset) => {
                                  const idx = offset + 2;
                                  const isDone = completedSubTopics.includes(st.id);
                                  return (
                                    <button
                                      key={st.id}
                                      type="button"
                                      onClick={() => handleSelectSubTopic(mod.id, st.id)}
                                      className="w-full p-2 bg-[var(--bg-canvas)] border border-[var(--border-grid)] hover:border-[var(--accent-primary)] text-left flex items-start justify-between gap-2 group cursor-pointer"
                                    >
                                      <div className="min-w-0">
                                        <div className="font-mono text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] truncate">
                                          {isDone ? '[✓] ' : `[${String(idx + 1).padStart(2, '0')}] `}{st.title}
                                        </div>
                                        <div className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">{st.wtfQuestion}</div>
                                      </div>
                                      <span className="font-mono text-xs text-[var(--accent-primary)] shrink-0">READ ❯</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>

                      <div className="px-4 py-2 bg-[var(--bg-elevated)] border-t border-[var(--border-grid)] flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-[var(--text-secondary)]">
                        <div className="flex flex-wrap items-center gap-1">
                          {mod.coreTools.map((tool) => (
                            <EcosystemToolBadge
                              key={tool}
                              name={tool}
                              isLightMode={activeTheme === 'paper-lab'}
                            />
                          ))}
                        </div>
                        <span>EST: {mod.estimatedHours}H</span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeView === 'module' && (
            <ModuleReaderPane
              module={activeModule}
              activeSubTopic={activeSubTopic}
              onSelectSubTopic={(subId) => setActiveSubTopicId(subId)}
              completedSubTopics={completedSubTopics}
              onToggleComplete={handleToggleSubTopicComplete}
              onNavigateModule={handleSelectSubTopic}
              allModules={TAXONOMY_MODULES}
              onOpenFullLab={(sceneId) => {
                setActiveSceneId(sceneId);
                setActiveView('webgl-lab');
              }}
              renderWebGLSlot={
                <WebGLViewportShell
                  activeScene={activeModule.defaultSceneId}
                  onSceneChange={setActiveSceneId}
                  compact={true}
                  initialAscii={renderAscii}
                  onAsciiChange={setRenderAscii}
                />
              }
            />
          )}

          {activeView === 'webgl-lab' && (
            <div className="h-full flex flex-col p-3 gap-3 overflow-y-auto">
              {/* Coupled Theory Bridge Banner inside Fullscreen Lab */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[var(--bg-pane)] border border-[var(--border-grid)] font-mono text-xs shrink-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-[var(--accent-primary)] text-black font-bold">
                    AI_SYSTEMS_LAB // ACTIVE_SCENE: {activeSceneId.toUpperCase()}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    Principle: Learn It ▸ Interact With It ▸ Break It ▸ Understand It
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const coupledMod =
                        TAXONOMY_MODULES.find((m) => m.defaultSceneId === activeSceneId) ||
                        TAXONOMY_MODULES[0];
                      handleSelectSubTopic(coupledMod.id, coupledMod.subTopics[0].id);
                    }}
                    className="px-2.5 py-1 border border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold hover:bg-[var(--accent-primary)]/25 cursor-pointer"
                  >
                    [READ_COUPLED_THEORY_&_MATH_FOR_THIS_LAB ❯]
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[500px]">
                <WebGLViewportShell
                  activeScene={activeSceneId}
                  onSceneChange={setActiveSceneId}
                  compact={false}
                  initialAscii={renderAscii}
                  onAsciiChange={setRenderAscii}
                />
              </div>
            </div>
          )}

          {activeView === 'papers' && (
            <PaperDissectorPane
              onOpenModule={(modId) => {
                const m = TAXONOMY_MODULES.find((x) => x.id === modId) || TAXONOMY_MODULES[0];
                handleSelectSubTopic(m.id, m.subTopics[0].id);
              }}
              onLaunch3DScene={(sceneId) => {
                setActiveSceneId(sceneId);
                setActiveView('webgl-lab');
              }}
            />
          )}

          {activeView === 'roadmap' && (
            <GitGraphRoadmap
              nodes={ROADMAP_NODES}
              projects={MILESTONE_PROJECTS}
              modules={TAXONOMY_MODULES}
              activeTrack={activeTrack}
              onTrackChange={setActiveTrack}
              completedNodeIds={completedRoadmapNodes}
              onToggleNode={handleToggleRoadmapNode}
              completedProjectIds={completedProjects}
              onToggleProject={handleToggleProjectComplete}
              onOpenModule={(modId) => {
                const m = TAXONOMY_MODULES.find((x) => x.id === modId) || TAXONOMY_MODULES[0];
                handleSelectSubTopic(m.id, m.subTopics[0].id);
              }}
            />
          )}

          {activeView === 'resources' && (
            <ResourceDirectoryPane
              resources={LEARNING_RESOURCES}
              modules={TAXONOMY_MODULES}
              initialSearchQuery={resourceSearchRequest}
            />
          )}
        </main>

        {/* Right Context Inspector Sidebar (Visible on Module & Overview views) */}
        {activeView === 'module' && (
          <InspectorSidebar
            module={activeModule}
            activeSubTopic={activeSubTopic}
            resources={LEARNING_RESOURCES}
            onSelectScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setActiveView('webgl-lab');
            }}
            onNavigateRoadmap={() => setActiveView('roadmap')}
          />
        )}
      </div>

      {/* Bottom Interactive CLI Prompt Bar */}
      <CommandLineBar
        onOpenGuide={openGuide}
        modules={TAXONOMY_MODULES}
        manPages={CLI_MAN_PAGES}
        onNavigateView={setActiveView}
        onSelectSubTopic={handleSelectSubTopic}
        onSelectScene={(sceneId) => setActiveSceneId(sceneId)}
        onToggleAscii={(force) =>
          setRenderAscii((prev) => (typeof force === 'boolean' ? force : !prev))
        }
        onChangeTrack={setActiveTrack}
        onChangeTheme={setActiveTheme}
        onOpenSearch={() => setIsPaletteOpen(true)}
      />

      {/* Global ⌘K / '/' "WTF is...?" Search & Command Modal */}
      <CommandPaletteModal
        onOpenGuide={openGuide}
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        modules={TAXONOMY_MODULES}
        resources={LEARNING_RESOURCES}
        onSelectSubTopic={(modId, subId) => {
          handleSelectSubTopic(modId, subId);
          setIsPaletteOpen(false);
        }}
        onSelectScene={(sceneId) => {
          setActiveSceneId(sceneId);
          setActiveView('webgl-lab');
          setIsPaletteOpen(false);
        }}
        onSelectResource={(query) => {
          setResourceSearchRequest(query);
          setActiveView('resources');
        }}
        onNavigateView={(view) => {
          setActiveView(view);
          setIsPaletteOpen(false);
        }}
      />
    </div>
  );
}
