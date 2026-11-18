import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SceneControlConfig, WebGLSceneId } from '../../types';
import { SceneStateContext } from './sceneState';
import { AsciiOverlayRenderer } from './AsciiOverlayRenderer';
import { NeuralLatticeScene } from './scenes/NeuralLatticeScene';
import { LossLandscapeScene } from './scenes/LossLandscapeScene';
import { LatentGalaxyScene } from './scenes/LatentGalaxyScene';
import { AttentionRoPEScene } from './scenes/AttentionRoPEScene';
import { FlowMatchingScene } from './scenes/FlowMatchingScene';
import { SuperpositionSAEScene } from './scenes/SuperpositionSAEScene';

export interface WebGLViewportShellProps {
  activeScene: WebGLSceneId;
  onSceneChange?: (scene: WebGLSceneId) => void;
  compact?: boolean;
  initialAscii?: boolean;
  onAsciiChange?: (ascii: boolean) => void;
}

const SCENE_TABS: { id: WebGLSceneId; code: string; label: string; equation: string }[] = [
  {
    id: 'neural-lattice',
    code: '01:NEURAL_NET_LAB',
    label: 'Forward Pass & Backprop Wave',
    equation: 'dL/dW_l = delta_l * a_{l-1}^T',
  },
  {
    id: 'loss-landscape',
    code: '02:LOSS_&_OPTIMIZERS',
    label: '3D Saddle Surface: SGD vs Momentum vs AdamW',
    equation: 'w_{t+1} = w_t - eta * m_hat / (sqrt(v_hat) + eps)',
  },
  {
    id: 'latent-galaxy',
    code: '03:EMBEDDING_MANIFOLD',
    label: 'High-D Latent Space: PCA vs UMAP + k-NN Raycaster',
    equation: 'cos(theta) = (u . v) / (||u|| ||v||)',
  },
  {
    id: 'attention-rope',
    code: '04:TRANSFORMER_ATTN',
    label: 'Causal Attention Arcs & RoPE Complex Rotation',
    equation: 'Attn(Q,K,V) = softmax(Q R_m (K R_n)^T / sqrt(d_k)) V',
  },
  {
    id: 'flow-matching',
    code: '05:FLOW_VS_DIFFUSION',
    label: 'Optimal Transport Flow Matching ODE vs DDPM SDE',
    equation: 'L_FM = E[ || v_theta(x_t, t) - (x_1 - x_0) ||^2 ]',
  },
  {
    id: 'superposition-sae',
    code: '06:SAE_SUPERPOSITION',
    label: 'Polysemantic Polytopes & Sparse Autoencoder Dictionary',
    equation: 'L_SAE = ||x - x_hat||_2^2 + lambda ||f(x)||_1',
  },
];

const DEFAULT_CONFIG: SceneControlConfig = {
  learningRate: 0.036,
  temperature: 0.65,
  layerDepth: 5,
  sparsityPenalty: 0.72,
  renderAscii: false,
  wireframe: false,
  paused: false,
  activePreset: 'default',
};

export const WebGLViewportShell: React.FC<WebGLViewportShellProps> = ({
  activeScene,
  onSceneChange,
  compact = false,
  initialAscii = false,
  onAsciiChange,
}) => {
  const [inspectorHost, setInspectorHost] = useState<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sceneConfigs, setSceneConfigs] = useState<Partial<Record<WebGLSceneId, SceneControlConfig>>>({});
  const [sceneControls] = useState(() =>
    new Map(SCENE_TABS.map(({ id }) => [id, new Map<string, unknown>()]))
  );
  const currentControls = sceneControls.get(activeScene)!;
  const [resetCount, setResetCount] = useState(0);
  const config = { ...(sceneConfigs[activeScene] ?? DEFAULT_CONFIG), renderAscii: initialAscii };
  const setConfig = (update: (previous: SceneControlConfig) => SceneControlConfig) => {
    setSceneConfigs(previous => ({
      ...previous,
      [activeScene]: update(previous[activeScene] ?? DEFAULT_CONFIG),
    }));
  };
  const activeMeta = SCENE_TABS.find(scene => scene.id === activeScene) ?? SCENE_TABS[0];
  const isNeural = activeScene === 'neural-lattice';
  const isLoss = activeScene === 'loss-landscape';
  const isAttention = activeScene === 'attention-rope';
  const isEmbedding = activeScene === 'latent-galaxy';
  const isSae = activeScene === 'superposition-sae';
  const canBreak = isNeural || isLoss;
  const warning = isNeural && config.learningRate > 0.10
    ? 'Simulated exploding gradients at a high learning rate'
    : isNeural && config.layerDepth >= 9 && config.learningRate < 0.015
      ? 'Simulated vanishing gradients in a deep network at a low learning rate'
      : isLoss && config.learningRate > 0.09
        ? 'Optimizer demo: high learning rate can overshoot the minimum'
        : isEmbedding && config.temperature > 1.55
          ? 'Illustrated embedding collapse at high temperature'
          : isSae && config.sparsityPenalty < 0.2
            ? 'Illustrated feature interference at low sparsity penalty'
            : null;

  const triggerBreakItPreset = () => setConfig(previous => ({
    ...previous,
    learningRate: 0.136,
    activePreset: 'break-diverged',
  }));

  const resetConfig = () => {
    setConfig(() => DEFAULT_CONFIG);
    currentControls.clear();
    setResetCount(count => count + 1);
  };

  return (
    <div className="flex flex-col w-full h-full bg-[var(--bg-canvas)] border border-[var(--border-grid)] font-mono select-none">
      {/* Top Viewport Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[var(--bg-pane)] border-b border-[var(--border-grid)] text-xs">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[var(--accent-primary)] font-bold mr-1">
            [WEBGL2_LAB]
          </span>
          {compact ? (
            <span className="px-2 py-0.5 text-[11px] border border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-semibold">
              {activeMeta.code}
            </span>
          ) : (
            SCENE_TABS.map((tab) => {
              const isSelected = tab.id === activeScene;
              return (
                <button
                  key={tab.id}
                  aria-pressed={isSelected}
                  type="button"
                  onClick={() => onSceneChange?.(tab.id)}
                  className={`px-2 py-0.5 text-[11px] border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold'
                      : 'border-[var(--border-grid)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  [{tab.code}]
                </button>
              );
            })
          )}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5 max-sm:[&_button]:min-h-10">
          {canBreak && <button
            type="button"
            onClick={triggerBreakItPreset}
            className="px-2 py-0.5 text-[11px] border border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/30 font-semibold cursor-pointer"
            title="Raise the learning rate to 0.136 and observe the demo"
          >
            [BREAK_IT_PRESET !]
          </button>}
          <button
            type="button"
            onClick={() => onAsciiChange?.(!config.renderAscii)}
            className={`px-2 py-0.5 text-[11px] border cursor-pointer ${
              config.renderAscii
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-black font-bold'
                : 'border-[var(--border-grid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            [--render={config.renderAscii ? 'ascii' : 'shader'}]
          </button>
          <button
            type="button"
            onClick={() => setConfig((p) => ({ ...p, wireframe: !p.wireframe }))}
            className={`px-2 py-0.5 text-[11px] border cursor-pointer ${
              config.wireframe
                ? 'border-[var(--accent-param)] text-[var(--accent-param)]'
                : 'border-[var(--border-grid)] text-[var(--text-secondary)]'
            }`}
          >
            [WIREFRAME]
          </button>
          <button
            type="button"
            onClick={() => setConfig((p) => ({ ...p, paused: !p.paused }))}
            className="px-2 py-0.5 text-[11px] border border-[var(--border-grid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            [{config.paused ? 'RESUME ▸' : 'PAUSE ❚❚'}]
          </button>
          <button
            type="button"
            onClick={resetConfig}
            className="px-2 py-0.5 text-[11px] border border-[var(--border-grid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            [RESET]
          </button>
        </div>
      </div>

      {/* Main 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        style={{ contain: 'layout paint' }}
        className={`relative isolate z-0 w-full ${compact ? 'h-[340px]' : 'flex-1 min-h-[420px]'} bg-[#08090C] overflow-hidden`}
      >
        <Canvas
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{ position: [0, 3.8, 11.5], fov: 44 }}
        >
          <color attach="background" args={['#08090C']} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[8, 12, 8]} intensity={1.1} />
          <gridHelper args={[24, 24, '#1E2430', '#12161F']} position={[0, -3.5, 0]} />

          <SceneStateContext.Provider value={currentControls}>
            {activeScene === 'neural-lattice' && <NeuralLatticeScene key={resetCount} config={config} inspectorHost={inspectorHost} />}
            {activeScene === 'loss-landscape' && <LossLandscapeScene key={resetCount} config={config} />}
            {activeScene === 'latent-galaxy' && <LatentGalaxyScene key={resetCount} config={config} inspectorHost={inspectorHost} />}
            {activeScene === 'attention-rope' && <AttentionRoPEScene key={resetCount} config={config} inspectorHost={inspectorHost} />}
            {activeScene === 'flow-matching' && <FlowMatchingScene key={resetCount} config={config} inspectorHost={inspectorHost} />}
            {activeScene === 'superposition-sae' && <SuperpositionSAEScene key={resetCount} config={config} inspectorHost={inspectorHost} />}
          </SceneStateContext.Provider>

          <OrbitControls
            makeDefault
            enablePan={true}
            enableZoom={true}
            maxDistance={24}
            minDistance={4}
          />
        </Canvas>

        {/* Optional Real-Time ASCII Glyph Matrix Post-Processor */}
        <AsciiOverlayRenderer containerRef={containerRef} enabled={config.renderAscii} />

        {/* Top-Right Camera Hint */}
        <div className="pointer-events-none absolute bottom-2.5 right-3 hidden sm:block bg-[#08090C]/85 border border-[var(--border-grid)] px-2 py-1 text-[10px] text-[var(--text-secondary)]">
          [DRAG: ORBIT_3D] [SCROLL: ZOOM] [CLICK_NODES: PROBE]
        </div>
      </div>

        {/* Top-Left Telemetry Overlay */}
        <div className="break-words bg-[#08090C]/90 border border-[var(--border-grid)] px-2.5 py-1.5 text-[11px] leading-relaxed">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--accent-primary)] font-bold">
              ◆ {activeMeta.label}
            </span>
            <span
              className={`px-1.5 py-0.2 text-[10px] border ${
                warning
                  ? 'border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444]'
                  : 'border-[#10B981]/50 text-[#10B981]'
              }`}
            >
              {warning ?? 'Ready to explore'}
            </span>
          </div>
          <div className="text-[var(--text-secondary)] text-[10px] mt-0.5">
            EQUATION: <span className="text-[var(--accent-param)]">{activeMeta.equation}</span>
          </div>
        </div>

      <div ref={setInspectorHost} />

      {canBreak && <p className="px-3 py-1 text-[11px] text-[var(--text-secondary)]">
        Break It raises the learning rate to 0.136. {isNeural ? 'Watch the simulated gradient in the neuron inspector.' : 'Compare the optimizer paths on the loss surface.'}
      </p>}

      {/* Bottom Interactive Hyperparameter & Telemetry Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-3 py-2 bg-[var(--bg-pane)] border-t border-[var(--border-grid)] text-[11px]">
        {canBreak && (
        <div className="flex flex-col gap-1 border-r border-[var(--border-grid)] pr-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">--learning-rate (η):</span>
            <span
              className={
                Boolean(warning)
                  ? 'text-[#EF4444] font-bold'
                  : 'text-[var(--accent-primary)]'
              }
            >
              {config.learningRate.toFixed(3)}

            </span>
          </div>
          <input
            type="range"
            aria-label="Learning rate"
            min={0.002}
            max={0.15}
            step={0.002}
            value={config.learningRate}
            onChange={(e) =>
              setConfig((p) => ({ ...p, learningRate: parseFloat(e.target.value) }))
            }
            className="w-full accent-[var(--accent-primary)] cursor-pointer"
          />
        </div>
        )}

        {!isNeural && !isSae && (
        <div className="flex flex-col gap-1 border-r border-[var(--border-grid)] pr-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">{isLoss ? "Surface roughness" : "Temperature (τ)"}</span>
            <span
              className={
                config.temperature > 1.55
                  ? 'text-[#F59E0B] font-bold'
                  : 'text-[var(--accent-param)]'
              }
            >
              {config.temperature.toFixed(2)}
              {isAttention && config.temperature < 0.22
                ? ' [ARGMAX]'
                : isAttention && config.temperature > 1.55
                ? ' [HIGH_ENTROPY]'
                : ''}
            </span>
          </div>
          <input
            type="range"
            aria-label={isLoss ? "Surface roughness" : "Temperature"}
            min={0.1}
            max={2.0}
            step={0.05}
            value={config.temperature}
            onChange={(e) =>
              setConfig((p) => ({ ...p, temperature: parseFloat(e.target.value) }))
            }
            className="w-full accent-[var(--accent-param)] cursor-pointer"
          />
        </div>
        )}

        {isNeural && (
        <div className="flex flex-col gap-1 border-r border-[var(--border-grid)] pr-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">--network-depth (L):</span>
            <span className="text-[var(--text-primary)]">{config.layerDepth} LAYERS</span>
          </div>
          <input
            type="range"
            aria-label="Network depth"
            min={2}
            max={10}
            step={1}
            value={config.layerDepth}
            onChange={(e) =>
              setConfig((p) => ({ ...p, layerDepth: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-[var(--accent-primary)] cursor-pointer"
          />
        </div>
        )}

        {(isNeural || isSae) && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">--l1-sparsity (λ):</span>
            <span
              className={
                config.sparsityPenalty < 0.2
                  ? 'text-[#EF4444] font-bold'
                  : 'text-[#F59E0B]'
              }
            >
              {config.sparsityPenalty.toFixed(2)}
              {config.sparsityPenalty < 0.2 ? ' [POLYSEMANTIC]' : ''}
            </span>
          </div>
          <input
            type="range"
            aria-label="Sparsity penalty"
            min={0.0}
            max={1.0}
            step={0.02}
            value={config.sparsityPenalty}
            onChange={(e) =>
              setConfig((p) => ({ ...p, sparsityPenalty: parseFloat(e.target.value) }))
            }
            className="w-full accent-[#F59E0B] cursor-pointer"
          />
        </div>
        )}
      </div>
    </div>
  );
};

export default WebGLViewportShell;
