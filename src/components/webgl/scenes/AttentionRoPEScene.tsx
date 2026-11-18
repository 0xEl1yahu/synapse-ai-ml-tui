import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { SceneLabel } from '../SceneLabel';
import { Line, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import { SceneControlConfig } from '../../../types';

export interface AttentionRoPESceneProps {
  config: SceneControlConfig;
  inspectorHost: HTMLElement | null;
}

const TOKENS = ['USER:', 'run', 'test', '->', '<tool:bash>', 'pytest', 'PASS'];

// Base unnormalized QK^T dot-product affinities for each Query index to causal Keys
const RAW_LOGITS: number[][] = [
  [2.4, 0, 0, 0, 0, 0, 0],
  [1.1, 2.2, 0, 0, 0, 0, 0],
  [0.8, 2.6, 2.1, 0, 0, 0, 0],
  [0.7, 1.9, 2.4, 1.8, 0, 0, 0],
  [1.4, 2.9, 3.1, 2.2, 2.5, 0, 0],
  [0.9, 2.1, 3.4, 1.5, 3.2, 2.4, 0],
  [1.2, 1.6, 2.8, 1.1, 2.9, 3.6, 2.3],
];

export const AttentionRoPEScene: React.FC<AttentionRoPESceneProps> = ({ config, inspectorHost }) => {
  const ropeGroupRef = useRef<THREE.Group>(null);
  const [activeQueryIdx, setActiveQueryIdx] = useState<number>(5); // Default to 'pytest'

  const isUniformEntropy = config.temperature > 1.55;
  const isArgmaxSpike = config.temperature < 0.22;

  const tokenPositions = useMemo<[number, number, number][]>(() => {
    const span = 10.2;
    const step = span / (TOKENS.length - 1);
    return TOKENS.map((_, idx) => [-span / 2 + idx * step, -0.8, 0]);
  }, []);

  // Compute causal softmax(QK^T / (sqrt(d_k) * T))
  const attentionMatrix = useMemo(() => {
    const temp = Math.max(0.08, config.temperature);
    return RAW_LOGITS.map((row, qIdx) => {
      const causalSlice = row.slice(0, qIdx + 1);
      const scaled = causalSlice.map((val) => val / temp);
      const maxLogit = Math.max(...scaled);
      const exps = scaled.map((v) => Math.exp(v - maxLogit));
      const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
      return exps.map((e) => e / sumExp);
    });
  }, [config.temperature]);

  useFrame((state) => {
    if (config.paused) return;
    const t = state.clock.getElapsedTime();
    if (ropeGroupRef.current) {
      ropeGroupRef.current.rotation.z = t * (0.35 + config.learningRate * 4.0);
    }
  });

  const activeWeights = attentionMatrix[activeQueryIdx] || [];

  return (
    <group>
      {/* Token Pillars & KV Cache Blocks */}
      {TOKENS.map((tok, idx) => {
        const pos = tokenPositions[idx];
        const isQuery = idx === activeQueryIdx;
        const attnWeight = idx <= activeQueryIdx ? activeWeights[idx] || 0 : 0;
        const isToolToken = tok.startsWith('<tool') || tok === 'pytest' || tok === 'PASS';

        const pillarColor = isUniformEntropy
          ? '#EF4444'
          : isQuery
          ? '#F59E0B'
          : isToolToken
          ? '#06B6D4'
          : '#10B981';

        const height = 0.65 + attnWeight * 2.2;

        return (
          <group key={tok} position={pos}>
            {/* Token Embedding Pillar */}
            <mesh
              position={[0, height / 2, 0]}
              onClick={(e) => {
                e.stopPropagation();
                setActiveQueryIdx(idx);
              }}
            >
              <boxGeometry args={[0.72, height, 0.72]} />
              <meshStandardMaterial
                color={pillarColor}
                emissive={pillarColor}
                emissiveIntensity={isQuery ? 0.95 : 0.25 + attnWeight * 0.85}
                wireframe={config.wireframe}
              />
            </mesh>

            {/* Causal KV-Cache Memory Slot Indicator behind each token */}
            <mesh position={[0, 0.22, -1.25]}>
              <boxGeometry args={[0.58, 0.35, 0.35]} />
              <meshBasicMaterial
                color={idx <= activeQueryIdx ? '#06B6D4' : '#1E2430'}
                wireframe
              />
            </mesh>

            {/* Token Label & Live Softmax Weight Badge */}
            <SceneLabel position={[0, -0.55, 0.55]} distanceFactor={13}>
              <button
                type="button"
                aria-pressed={isQuery}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveQueryIdx(idx);
                }}
                className={`cursor-pointer border px-1.5 py-0.5 font-mono text-[9px] whitespace-nowrap ${
                  isQuery
                    ? 'border-[#F59E0B] bg-[#F59E0B] text-[#08090C] font-bold'
                    : idx <= activeQueryIdx
                    ? 'border-[#10B981]/70 bg-[#08090C]/95 text-[#ECFDF5]'
                    : 'border-[#1E2430] bg-[#08090C]/75 text-[#475569]'
                }`}
              >
                <div>
                  [{idx}] {tok}
                </div>
                <div className="text-[8px]">
                  {idx <= activeQueryIdx ? `a=${(attnWeight * 100).toFixed(1)}%` : 'MASKED (-inf)'}
                </div>
              </button>
            </SceneLabel>
          </group>
        );
      })}

      {inspectorHost && (
        <SceneLabel position={[0, 0, 0]} panelHost={inspectorHost}>
          <div className="p-2 text-xs text-[var(--text-primary)]">
            <label className="flex flex-wrap items-center gap-2">
              Query token
              <select value={activeQueryIdx} onChange={event => setActiveQueryIdx(Number(event.target.value))}
                className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-1">
                {TOKENS.map((token, index) => <option key={index} value={index}>{index} · {token}</option>)}
              </select>
            </label>
            <p role="status" className="mt-1">
              Query {TOKENS[activeQueryIdx]} uses the displayed row. Selecting the same query keeps its weights.
              Later tokens are masked.
            </p>
          </div>
        </SceneLabel>
      )}

      {/* 3D Multi-Head Attention Bezier Arcs from Active Query to Causal Keys */}
      {activeWeights.map((weight, kIdx) => {
        if (weight < 0.03) return null;
        const qPos = tokenPositions[activeQueryIdx];
        const kPos = tokenPositions[kIdx];
        const midX = (qPos[0] + kPos[0]) / 2;
        const dist = Math.abs(activeQueryIdx - kIdx);
        const arcHeight = 1.4 + dist * 0.55 + weight * 1.6;

        const arcColor = isUniformEntropy
          ? '#EF4444'
          : weight > 0.32
          ? '#10B981'
          : weight > 0.16
          ? '#06B6D4'
          : '#F59E0B';

        return (
          <QuadraticBezierLine
            key={`arc-${activeQueryIdx}-${kIdx}`}
            start={[qPos[0], 0.5, qPos[2]]}
            end={[kPos[0], 0.5, kPos[2]]}
            mid={[midX, arcHeight, 0.4]}
            color={arcColor}
            lineWidth={Math.max(1.0, weight * 7.5)}
            transparent
            opacity={Math.min(1, 0.35 + weight * 0.9)}
          />
        );
      })}

      {/* Background Multi-Head Secondary Context Arcs */}
      {TOKENS.map((_, qIdx) => {
        if (qIdx === activeQueryIdx || qIdx === 0) return null;
        const row = attentionMatrix[qIdx];
        return row.map((w, kIdx) => {
          if (w < 0.24 || qIdx === kIdx) return null;
          const qPos = tokenPositions[qIdx];
          const kPos = tokenPositions[kIdx];
          return (
            <QuadraticBezierLine
              key={`bg-${qIdx}-${kIdx}`}
              start={[qPos[0], 0.25, -0.3]}
              end={[kPos[0], 0.25, -0.3]}
              mid={[(qPos[0] + kPos[0]) / 2, 0.9 + Math.abs(qIdx - kIdx) * 0.35, -0.8]}
              color="#06B6D4"
              lineWidth={0.9}
              transparent
              opacity={0.22}
            />
          );
        });
      })}

      {/* 3D Rotary Position Embedding (RoPE) Complex-Plane Phase Ring */}
      <group position={[0, 2.35, -2.6]}>
        <group ref={ropeGroupRef}>
          <mesh>
            <torusGeometry args={[1.65, 0.03, 12, 48]} />
            <meshBasicMaterial color="#06B6D4" wireframe={config.wireframe} />
          </mesh>

          {TOKENS.map((tok, m) => {
            const theta = m * 0.68;
            const rx = Math.cos(theta) * 1.65;
            const ry = Math.sin(theta) * 1.65;
            const isActive = m === activeQueryIdx;
            return (
              <group key={`rope-${tok}`} position={[rx, ry, 0]}>
                <Line
                  points={[
                    [-rx, -ry, 0],
                    [0, 0, 0],
                  ]}
                  color={isActive ? '#F59E0B' : '#10B981'}
                  lineWidth={isActive ? 2.2 : 1.0}
                />
                <mesh>
                  <sphereGeometry args={[isActive ? 0.12 : 0.075, 10, 10]} />
                  <meshBasicMaterial color={isActive ? '#F59E0B' : '#10B981'} />
                </mesh>
              </group>
            );
          })}
        </group>

        <SceneLabel position={[0, -2.05, 0]} distanceFactor={14}>
          <div className="pointer-events-none border border-[#1E2430] bg-[#08090C]/90 px-2 py-0.5 font-mono text-[9px] text-[#06B6D4] whitespace-nowrap">
            RoPE PHASE RING: R(m*theta_i) // {isUniformEntropy ? 'WARN: HIGH_TEMP ENTROPY FLATTENING' : isArgmaxSpike ? 'MODE: HARD_ARGMAX_SPIKE' : 'CAUSAL_MASK: ACTIVE'}
          </div>
        </SceneLabel>
      </group>
    </group>
  );
};
