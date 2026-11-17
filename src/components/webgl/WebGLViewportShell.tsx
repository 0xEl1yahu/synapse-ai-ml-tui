import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SceneControlConfig, WebGLSceneId } from '../../types';
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
  learningRate: 0.035,
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [config, setConfig] = useState<SceneControlConfig>({
    ...DEFAULT_CONFIG,
    renderAscii: initialAscii,
  });

  useEffect(() => {
    setConfig((prev) => ({ ...prev, renderAscii: initialAscii }));
  }, [initialAscii]);

  const activeMeta = SCENE_TABS.find((s) => s.id === activeScene) || SCENE_TABS[0];

  const isDiverged =
    config.learningRate > 0.095 ||
    config.temperature > 1.65 ||
    config.sparsityPenalty < 0.18;

  const triggerBreakItPreset = () => {
    if (activeScene === 'loss-landscape' || activeScene === 'neural-lattice') {
      setConfig((prev) => ({
        ...prev,
        learningRate: 0.135,
        temperature: 1.4,
        activePreset: 'break-diverged',
      }));
    } else if (activeScene === 'attention-rope' || activeScene === 'flow-matching') {
      setConfig((prev) => ({
        ...prev,
        temperature: 1.9,
        learningRate: 0.11,
        activePreset: 'ddpm',
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        sparsityPenalty: 0.05,
        temperature: 1.75,
        activePreset: 'break-collapse',
      }));
    }
  };

  const resetConfig = () => {
    setConfig((prev) => ({
      ...DEFAULT_CONFIG,
      renderAscii: prev.renderAscii,
    }));
  };

  const toggleAscii = () => {
    const next = !config.renderAscii;
    setConfig((prev) => ({ ...prev, renderAscii: next }));
    onAsciiChange?.(next);
  };

  return (
    <div className="flex flex-col w-full h-full bg-[var(--bg-canvas)] border border-[var(--border-grid)] font-mono select-none">
      {/* Top Viewport Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[var(--bg-pane)] border-b border-[var(--border-grid)] text-xs">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[var(--accent-primary)] font-bold mr-1">
            ┌─ [WEBGL2_LAB]
          </span>
          {SCENE_TABS.map((tab) => {
            const isSelected = tab.id === activeScene;
            return (
              <button
                key={tab.id}
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
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={triggerBreakItPreset}
            className="px-2 py-0.5 text-[11px] border border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/30 font-semibold cursor-pointer"
            title="Intentionally inject extreme hyperparameters to observe failure modes live"
          >
            [BREAK_IT_PRESET !]
          </button>
          <button
            type="button"
            onClick={toggleAscii}
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
        className={`relative w-full ${compact ? 'h-[360px]' : 'flex-1 min-h-[420px]'} bg-[#08090C] overflow-hidden`}
      >
        <Canvas
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{ position: [0, 3.8, 11.5], fov: 44 }}
        >
          <color attach="background" args={['#08090C']} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[8, 12, 8]} intensity={1.1} />
          <gridHelper args={[24, 24, '#1E2430', '#12161F']} position={[0, -3.5, 0]} />

          {activeScene === 'neural-lattice' && <NeuralLatticeScene config={config} />}
          {activeScene === 'loss-landscape' && <LossLandscapeScene config={config} />}
          {activeScene === 'latent-galaxy' && <LatentGalaxyScene config={config} />}
          {activeScene === 'attention-rope' && <AttentionRoPEScene config={config} />}
          {activeScene === 'flow-matching' && <FlowMatchingScene config={config} />}
          {activeScene === 'superposition-sae' && <SuperpositionSAEScene config={config} />}

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

        {/* Top-Left Telemetry Overlay */}
        <div className="pointer-events-none absolute top-2.5 left-3 bg-[#08090C]/90 border border-[var(--border-grid)] px-2.5 py-1.5 text-[11px] leading-relaxed">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent-primary)] font-bold">
              ◆ {activeMeta.label}
            </span>
            <span
              className={`px-1.5 py-0.2 text-[10px] border ${
                isDiverged
                  ? 'border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444]'
                  : 'border-[#10B981]/50 text-[#10B981]'
              }`}
            >
              {isDiverged
                ? 'STATUS: FAILURE_MODE / INSTABILITY_TRIGGERED'
                : 'STATUS: STABLE_CONVERGENCE (60FPS)'}
            </span>
          </div>
          <div className="text-[var(--text-secondary)] text-[10px] mt-0.5">
            EQUATION: <span className="text-[var(--accent-param)]">{activeMeta.equation}</span>
          </div>
        </div>

        {/* Top-Right Camera Hint */}
        <div className="pointer-events-none absolute top-2.5 right-3 bg-[#08090C]/85 border border-[var(--border-grid)] px-2 py-1 text-[10px] text-[var(--text-secondary)]">
          [DRAG: ORBIT_3D] [SCROLL: ZOOM] [CLICK_NODES: PROBE]
        </div>
      </div>

      {/* Bottom Interactive Hyperparameter & Telemetry Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 px-3 py-2 bg-[var(--bg-pane)] border-t border-[var(--border-grid)] text-[11px]">
        <div className="flex flex-col gap-1 border-r border-[var(--border-grid)] pr-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">--learning-rate (η):</span>
            <span
              className={
                config.learningRate > 0.095
                  ? 'text-[#EF4444] font-bold'
                  : 'text-[var(--accent-primary)]'
              }
            >
              {config.learningRate.toFixed(3)}
              {config.learningRate > 0.095 ? ' [EXPLODING!]' : ''}
            </span>
          </div>
          <input
            type="range"
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

        <div className="flex flex-col gap-1 border-r border-[var(--border-grid)] pr-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">--temperature (τ):</span>
            <span
              className={
                config.temperature > 1.55
                  ? 'text-[#F59E0B] font-bold'
                  : 'text-[var(--accent-param)]'
              }
            >
              {config.temperature.toFixed(2)}
              {config.temperature < 0.22
                ? ' [ARGMAX]'
                : config.temperature > 1.55
                ? ' [HIGH_ENTROPY]'
                : ''}
            </span>
          </div>
          <input
            type="range"
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

        <div className="flex flex-col gap-1 border-r border-[var(--border-grid)] pr-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">--network-depth (L):</span>
            <span className="text-[var(--text-primary)]">{config.layerDepth} LAYERS</span>
          </div>
          <input
            type="range"
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
      </div>
    </div>
  );
};

export default WebGLViewportShell;
