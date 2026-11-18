import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { SceneLabel } from '../SceneLabel';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SceneControlConfig } from '../../../types';

export interface LatentGalaxySceneProps {
  config: SceneControlConfig;
}

interface SemanticAnchor {
  id: string;
  token: string;
  clusterName: string;
  color: string;
  umapCenter: [number, number, number];
  pcaCenter: [number, number, number];
  neighbors: { token: string; offset: [number, number, number]; baseSim: number }[];
}

const SEMANTIC_ANCHORS: SemanticAnchor[] = [
  {
    id: 'grad-descent',
    token: 'vec("backpropagation")',
    clusterName: 'OPTIMIZATION_CLUSTER',
    color: '#10B981',
    umapCenter: [-3.1, 1.4, 1.2],
    pcaCenter: [-2.2, 0.2, 0.6],
    neighbors: [
      { token: 'chain_rule_jacobian', offset: [0.65, 0.42, -0.35], baseSim: 0.94 },
      { token: 'adamw_momentum', offset: [-0.58, -0.48, 0.45], baseSim: 0.89 },
      { token: 'vanishing_gradient', offset: [0.45, -0.62, 0.52], baseSim: 0.86 },
      { token: 'loss_hessian_eig', offset: [-0.72, 0.55, -0.4], baseSim: 0.82 },
    ],
  },
  {
    id: 'attn-kv',
    token: 'vec("flash_attention_v3")',
    clusterName: 'TRANSFORMER_CLUSTER',
    color: '#06B6D4',
    umapCenter: [2.9, 1.5, -1.1],
    pcaCenter: [2.1, 0.1, -0.5],
    neighbors: [
      { token: 'kv_cache_paged', offset: [-0.62, 0.48, 0.42], baseSim: 0.95 },
      { token: 'rotary_rope_theta', offset: [0.55, -0.52, 0.38], baseSim: 0.91 },
      { token: 'softmax_qk_scale', offset: [-0.48, -0.58, -0.44], baseSim: 0.88 },
      { token: 'grouped_query_gqa', offset: [0.7, 0.36, -0.5], baseSim: 0.84 },
    ],
  },
  {
    id: 'agent-tool',
    token: 'vec("agent_tool_harness")',
    clusterName: 'RL_AGENTIC_CLUSTER',
    color: '#F59E0B',
    umapCenter: [0.1, -2.1, 2.3],
    pcaCenter: [0.0, -0.35, 1.6],
    neighbors: [
      { token: 'grpo_verifiable_reward', offset: [0.68, 0.45, -0.45], baseSim: 0.92 },
      { token: 'sandbox_bash_exec', offset: [-0.64, 0.52, -0.38], baseSim: 0.89 },
      { token: 'context_compaction', offset: [0.42, -0.58, -0.52], baseSim: 0.85 },
      { token: 'mcp_json_schema', offset: [-0.55, -0.44, 0.48], baseSim: 0.81 },
    ],
  },
];

const POINT_COUNT = 3000;

export const LatentGalaxyScene: React.FC<LatentGalaxySceneProps> = ({ config }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [activeAnchorIdx, setActiveAnchorIdx] = useState<number>(0);

  const isCollapsed = config.temperature > 1.55 || config.learningRate > 0.11;
  const projectionMode =
    config.activePreset === 'raw' || config.activePreset === 'pca' || config.activePreset === 'umap'
      ? config.activePreset
      : 'umap';

  const { geometry, rawPositions, pcaPositions, umapPositions } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const currentPos = new Float32Array(POINT_COUNT * 3);
    const rawPos = new Float32Array(POINT_COUNT * 3);
    const pcaPos = new Float32Array(POINT_COUNT * 3);
    const umapPos = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);

    const palette = [
      new THREE.Color('#10B981'),
      new THREE.Color('#06B6D4'),
      new THREE.Color('#F59E0B'),
      new THREE.Color('#ECFDF5'),
    ];

    for (let i = 0; i < POINT_COUNT; i++) {
      const i3 = i * 3;
      const clusterIdx = i % 4;
      const s1 = Math.sin(i * 12.9898) * 43758.5453;
      const s2 = Math.sin(i * 78.233) * 43758.5453;
      const s3 = Math.sin(i * 39.425) * 43758.5453;
      const r1 = s1 - Math.floor(s1) - 0.5;
      const r2 = s2 - Math.floor(s2) - 0.5;
      const r3 = s3 - Math.floor(s3) - 0.5;

      // 1. Raw isotropic Gaussian noise
      rawPos[i3] = r1 * 9.5;
      rawPos[i3 + 1] = r2 * 9.5;
      rawPos[i3 + 2] = r3 * 9.5;

      // 2. PCA Linear hyperplane projection
      const pcaCenters: [number, number, number][] = [
        [-2.2, 0.2, 0.6],
        [2.1, 0.1, -0.5],
        [0.0, -0.35, 1.6],
        [-0.3, 0.3, -1.9],
      ];
      const pc = pcaCenters[clusterIdx];
      pcaPos[i3] = pc[0] + r1 * 3.1;
      pcaPos[i3 + 1] = pc[1] + r2 * 0.45 + r1 * 0.25;
      pcaPos[i3 + 2] = pc[2] + r3 * 2.8;

      // 3. UMAP Non-linear manifold filaments
      const umapCenters: [number, number, number][] = [
        [-3.1, 1.4, 1.2],
        [2.9, 1.5, -1.1],
        [0.1, -2.1, 2.3],
        [-0.2, 0.2, -2.8],
      ];
      const uc = umapCenters[clusterIdx];
      const theta = r1 * Math.PI * 2;
      const rad = Math.abs(r2) * 1.65;
      umapPos[i3] = uc[0] + Math.cos(theta) * rad;
      umapPos[i3 + 1] = uc[1] + Math.sin(theta * 1.5) * rad * 0.85;
      umapPos[i3 + 2] = uc[2] + r3 * 1.45;

      currentPos[i3] = umapPos[i3];
      currentPos[i3 + 1] = umapPos[i3 + 1];
      currentPos[i3 + 2] = umapPos[i3 + 2];

      const col = palette[clusterIdx];
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return {
      geometry: geom,
      rawPositions: rawPos,
      pcaPositions: pcaPos,
      umapPositions: umapPos,
    };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    if (config.paused) return;
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    const targetArr =
      projectionMode === 'raw'
        ? rawPositions
        : projectionMode === 'pca'
        ? pcaPositions
        : umapPositions;

    // Temperature controls intra-cluster variance dispersion
    const spreadScale = 0.65 + config.temperature * 0.55;
    const lerpSpeed = Math.min(1, delta * 4.5);

    for (let i = 0; i < POINT_COUNT * 3; i += 3) {
      let tx = targetArr[i] * spreadScale;
      let ty = targetArr[i + 1] * spreadScale;
      let tz = targetArr[i + 2] * spreadScale;

      if (isCollapsed) {
        // Representation collapse: all embeddings squish onto a degenerate origin ring
        tx *= 0.18;
        ty *= 0.08;
        tz *= 0.18;
      }

      arr[i] += (tx - arr[i]) * lerpSpeed;
      arr[i + 1] += (ty - arr[i + 1]) * lerpSpeed;
      arr[i + 2] += (tz - arr[i + 2]) * lerpSpeed;
    }

    posAttr.needsUpdate = true;

    pointsRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.18) * 0.18;
  });

  const activeAnchor = SEMANTIC_ANCHORS[activeAnchorIdx];
  const spreadScale = isCollapsed ? 0.18 : 0.65 + config.temperature * 0.55;

  const getAnchorCenter = (anchor: SemanticAnchor): [number, number, number] => {
    const base =
      projectionMode === 'pca'
        ? anchor.pcaCenter
        : projectionMode === 'raw'
        ? ([anchor.umapCenter[0] * 0.35, anchor.umapCenter[1] * 0.35, anchor.umapCenter[2] * 0.35] as [
            number,
            number,
            number
          ])
        : anchor.umapCenter;
    return [base[0] * spreadScale, base[1] * spreadScale, base[2] * spreadScale];
  };

  const activeCenter = getAnchorCenter(activeAnchor);

  return (
    <group>
      {/* 3,000 Embedding Vector Point Cloud */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={config.wireframe ? 0.05 : 0.085}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>

      {/* Interactive Cluster Anchor Probes */}
      {SEMANTIC_ANCHORS.map((anchor, idx) => {
        const pos = getAnchorCenter(anchor);
        const isSelected = idx === activeAnchorIdx;
        return (
          <group key={anchor.id} position={pos}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setActiveAnchorIdx(idx);
              }}
            >
              <octahedronGeometry args={[isSelected ? 0.32 : 0.22, 0]} />
              <meshStandardMaterial
                color={isCollapsed ? '#EF4444' : anchor.color}
                emissive={isCollapsed ? '#EF4444' : anchor.color}
                emissiveIntensity={isSelected ? 1.1 : 0.45}
                wireframe={!isSelected || config.wireframe}
              />
            </mesh>

            <SceneLabel position={[0, 0.52, 0]} distanceFactor={13}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAnchorIdx(idx);
                }}
                className={`cursor-pointer border px-1.5 py-0.5 font-mono text-[9px] whitespace-nowrap ${
                  isSelected
                    ? 'border-[#10B981] bg-[#08090C]/95 text-[#ECFDF5] font-bold'
                    : 'border-[#1E2430] bg-[#08090C]/80 text-[#94A3B8] hover:border-[#06B6D4]'
                }`}
              >
                {isSelected ? '>> ' : ''}
                {anchor.token}
              </button>
            </SceneLabel>
          </group>
        );
      })}

      {/* Live k-NN Cosine Similarity Raycaster Lines & Similarity Badges */}
      {activeAnchor.neighbors.map((nb, idx) => {
        const targetPos: [number, number, number] = [
          activeCenter[0] + nb.offset[0] * spreadScale * 1.4,
          activeCenter[1] + nb.offset[1] * spreadScale * 1.4,
          activeCenter[2] + nb.offset[2] * spreadScale * 1.4,
        ];
        const effectiveSim = isCollapsed
          ? 0.999
          : projectionMode === 'raw'
          ? Number((nb.baseSim * 0.35).toFixed(2))
          : Number(Math.max(0.12, nb.baseSim - (config.temperature - 0.7) * 0.14).toFixed(2));

        return (
          <group key={nb.token}>
            <Line
              points={[activeCenter, targetPos]}
              color={isCollapsed ? '#EF4444' : activeAnchor.color}
              lineWidth={1.8}
              transparent
              opacity={0.85}
            />
            <mesh position={targetPos}>
              <boxGeometry args={[0.14, 0.14, 0.14]} />
              <meshBasicMaterial color={isCollapsed ? '#EF4444' : '#ECFDF5'} wireframe={config.wireframe} />
            </mesh>
            <SceneLabel position={targetPos} distanceFactor={14}>
              <div className="pointer-events-none border border-[#1E2430] bg-[#08090C]/90 px-1.5 py-0.5 font-mono text-[8px] text-[#ECFDF5] whitespace-nowrap">
                <span className="text-[#06B6D4]">#{idx + 1}</span> {nb.token}{' '}
                <span className={isCollapsed ? 'text-[#EF4444] font-bold' : 'text-[#10B981] font-bold'}>
                  cos={effectiveSim}
                </span>
              </div>
            </SceneLabel>
          </group>
        );
      })}
    </group>
  );
};
