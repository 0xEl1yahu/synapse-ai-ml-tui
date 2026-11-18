import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneState } from '../sceneState';
import { SceneLabel } from '../SceneLabel';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SceneControlConfig } from '../../../types';

export interface FlowMatchingSceneProps {
  config: SceneControlConfig;
  inspectorHost: HTMLElement | null;
}

const PARTICLE_COUNT = 2400;

export const FlowMatchingScene: React.FC<FlowMatchingSceneProps> = ({ config, inspectorHost }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [solverMode, setSolverMode] = useSceneState<'flow-matching' | 'ddpm-sde'>('solver', 'flow-matching');
  const [scrubTime, setScrubTime] = useSceneState<number | null>('scrubTime', null);

  const isHighVarianceNoise = config.temperature > 1.45;
  const activeMode = config.activePreset === 'ddpm' ? 'ddpm-sde' : solverMode;

  // Source Gaussian Noise x_0 ~ N(0, I) and Target 3D Torus Knot Manifold x_1
  const { sourcePositions, targetPositions, colors, vectorLines } = useMemo(() => {
    const src = new Float32Array(PARTICLE_COUNT * 3);
    const tgt = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const vLines: { start: [number, number, number]; end: [number, number, number] }[] = [];

    const emerald = new THREE.Color('#10B981');
    const cyan = new THREE.Color('#06B6D4');
    const amber = new THREE.Color('#F59E0B');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Box-Muller Gaussian sample on left side x_0
      const u1 = Math.max(1e-6, Math.random());
      const u2 = Math.random();
      const r = Math.sqrt(-2.0 * Math.log(u1));
      const theta = 2.0 * Math.PI * u2;

      const sx = -4.2 + r * Math.cos(theta) * 1.1;
      const sy = r * Math.sin(theta) * 1.3;
      const sz = (Math.random() - 0.5) * 3.4;

      src[i * 3] = sx;
      src[i * 3 + 1] = sy;
      src[i * 3 + 2] = sz;

      // Target: Structured 3D Double-Helix / Torus Tensor Manifold on right side x_1
      const tAngle = (i / PARTICLE_COUNT) * Math.PI * 6;
      const tubeRadius = 0.55 + 0.25 * Math.sin(tAngle * 3);
      const majorR = 2.1;
      const tx = 4.0 + (majorR + tubeRadius * Math.cos(tAngle * 2)) * Math.cos(tAngle) * 0.75;
      const ty = (majorR + tubeRadius * Math.cos(tAngle * 2)) * Math.sin(tAngle) * 0.75;
      const tz = tubeRadius * Math.sin(tAngle * 2) * 1.6;

      tgt[i * 3] = tx;
      tgt[i * 3 + 1] = ty;
      tgt[i * 3 + 2] = tz;

      const mixRatio = i / PARTICLE_COUNT;
      const c = emerald.clone().lerp(cyan, mixRatio).lerp(amber, config.sparsityPenalty * 0.35);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      if (i % 80 === 0) {
        vLines.push({
          start: [sx, sy, sz],
          end: [tx, ty, tz],
        });
      }
    }

    return { sourcePositions: src, targetPositions: tgt, colors: col, vectorLines: vLines };
  }, [config.sparsityPenalty]);

  const livePositions = useMemo(() => new Float32Array(sourcePositions), [sourcePositions]);

  useFrame((state) => {
    if (config.paused && scrubTime === null) return;
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;

    const elapsed = state.clock.getElapsedTime();
    const cycleT = scrubTime !== null ? scrubTime : (Math.sin(elapsed * 0.85) * 0.5 + 0.5);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const sx = sourcePositions[ix];
      const sy = sourcePositions[ix + 1];
      const sz = sourcePositions[ix + 2];

      const tx = targetPositions[ix];
      const ty = targetPositions[ix + 1];
      const tz = targetPositions[ix + 2];

      if (activeMode === 'flow-matching') {
        // Optimal Transport Straight-Line ODE: x_t = (1 - t) x_0 + t x_1
        posAttr.array[ix] = (1 - cycleT) * sx + cycleT * tx;
        posAttr.array[ix + 1] = (1 - cycleT) * sy + cycleT * ty;
        posAttr.array[ix + 2] = (1 - cycleT) * sz + cycleT * tz;
      } else {
        // Curved Stochastic Diffusion SDE with Langevin Score Jitter:
        // Bridge envelope 4 * t * (1 - t) injects stochastic curl & curved trajectory
        const bridge = 4.0 * cycleT * (1.0 - cycleT);
        const phase = i * 0.13 + elapsed * 2.4;
        const noiseAmp = bridge * (0.95 + config.temperature * 0.85);
        const archY = bridge * 1.85 * Math.sin(i * 0.05);

        posAttr.array[ix] = (1 - cycleT) * sx + cycleT * tx + Math.sin(phase) * noiseAmp * 0.55;
        posAttr.array[ix + 1] = (1 - cycleT) * sy + cycleT * ty + archY + Math.cos(phase * 1.3) * noiseAmp;
        posAttr.array[ix + 2] = (1 - cycleT) * sz + cycleT * tz + Math.sin(phase * 0.7) * noiseAmp;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <group>
      {/* Reference Source & Target Bounding Planes */}
      <mesh position={[-4.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <RingFrame radius={2.5} color="#F59E0B" />
      </mesh>
      <mesh position={[4.0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <RingFrame radius={2.5} color="#10B981" />
      </mesh>

      {/* Optimal Transport / Trajectory Reference Lines */}
      {vectorLines.map((line, idx) => {
        if (activeMode === 'flow-matching') {
          return (
            <Line
              key={idx}
              points={[line.start, line.end]}
              color="#10B981"
              lineWidth={1}
              transparent
              opacity={0.22}
            />
          );
        }
        const mid: [number, number, number] = [
          (line.start[0] + line.end[0]) * 0.5,
          (line.start[1] + line.end[1]) * 0.5 + 1.8 * Math.sin(idx),
          (line.start[2] + line.end[2]) * 0.5 + 1.4 * Math.cos(idx),
        ];
        return (
          <Line
            key={idx}
            points={[line.start, mid, line.end]}
            color="#F59E0B"
            lineWidth={1}
            transparent
            opacity={0.28}
          />
        );
      })}

      {/* Particle System */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[livePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={config.wireframe ? 0.05 : 0.085}
          vertexColors
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 3D Terminal HUD Callouts */}
      <SceneLabel position={[-4.2, 2.9, 0]}>
        <div className="pointer-events-none bg-[#08090C]/90 border border-[#F59E0B] px-2 py-1 font-mono text-[10px] text-[#F59E0B] whitespace-nowrap">
          t = 0.0 // SOURCE PRIOR x_0 ~ N(0, I)
        </div>
      </SceneLabel>

      <SceneLabel position={[4.0, 2.9, 0]}>
        <div className="pointer-events-none bg-[#08090C]/90 border border-[#10B981] px-2 py-1 font-mono text-[10px] text-[#10B981] whitespace-nowrap">
          t = 1.0 // TARGET DATA MANIFOLD p_1(x)
        </div>
      </SceneLabel>

      <SceneLabel position={[0, -3.3, 0]} panelHost={inspectorHost}>
        <div className="bg-[#0D0F14]/95 border border-[var(--border-grid)] px-3 py-2 font-mono text-[11px] text-[var(--text-primary)] flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-pressed={activeMode === 'flow-matching'}
            onClick={() => setSolverMode('flow-matching')}
            className={`px-2 py-0.5 border cursor-pointer ${
              activeMode === 'flow-matching'
                ? 'border-[#10B981] bg-[#10B981]/20 text-[#10B981]'
                : 'border-[#1E2430] text-[#94A3B8]'
            }`}
          >
            [DEMO: STRAIGHT FLOW PATH]
          </button>
          <button
            type="button"
            aria-pressed={activeMode === 'ddpm-sde'}
            onClick={() => setSolverMode('ddpm-sde')}
            className={`px-2 py-0.5 border cursor-pointer ${
              activeMode === 'ddpm-sde'
                ? 'border-[#F59E0B] bg-[#F59E0B]/20 text-[#F59E0B]'
                : 'border-[#1E2430] text-[#94A3B8]'
            }`}
          >
            [DEMO: NOISY DIFFUSION PATH]
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-[#06B6D4]">
            <span>SCRUB_t:</span>
            <input
              type="range"
              aria-label="Simulation time"
              min={0}
              max={1}
              step={0.01}
              value={scrubTime ?? 0.5}
              onChange={(e) => setScrubTime(parseFloat(e.target.value))}
              className="w-20 accent-[#06B6D4]"
            />
            {scrubTime !== null && (
              <button
                type="button"
                onClick={() => setScrubTime(null)}
                className="text-[#10B981] underline cursor-pointer"
              >
                [AUTO]
              </button>
            )}
          </div>
          <p className="basis-full text-[var(--text-secondary)]">
            These animations illustrate straight and noisy paths. Other flow paths and faster diffusion samplers are possible.
          </p>
          {activeMode === 'ddpm-sde' && isHighVarianceNoise && (
            <span className="text-[#EF4444] font-semibold">
              [DEMO: INCREASED NOISE AMPLITUDE (T={config.temperature.toFixed(2)})]
            </span>
          )}
        </div>
      </SceneLabel>
    </group>
  );
};

const RingFrame: React.FC<{ radius: number; color: string }> = ({ radius, color }) => {
  const pts = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      arr.push([Math.cos(a) * radius, Math.sin(a) * radius, 0]);
    }
    return arr;
  }, [radius]);
  return <Line points={pts} color={color} lineWidth={1} transparent opacity={0.4} />;
};

export default FlowMatchingScene;
