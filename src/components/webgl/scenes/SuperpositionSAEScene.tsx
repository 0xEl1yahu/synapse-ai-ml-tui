import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { SceneLabel } from '../SceneLabel';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SceneControlConfig } from '../../../types';

export interface SuperpositionSAESceneProps {
  config: SceneControlConfig;
}

const FEATURE_LABELS = [
  'F_01: python_syntax_err',
  'F_02: json_tool_schema',
  'F_03: sycophancy_guard',
  'F_04: sql_injection_tok',
  'F_05: math_chain_of_thought',
  'F_06: french_negation',
  'F_07: pointer_deref',
  'F_08: markdown_fence',
];

function computePolytopeVectors(featureCount: number, collapseFactor: number): [number, number, number][] {
  const raw: [number, number, number][] = [];

  if (featureCount <= 3) {
    // Orthogonal basis in R^3
    raw.push([1, 0, 0], [0, 1, 0], [0, 0, 1]);
  } else if (featureCount === 5) {
    // Triangular bipyramid (2 poles + 3 equatorial at 120 deg)
    raw.push([0, 1, 0], [0, -1, 0]);
    for (let k = 0; k < 3; k++) {
      const a = (k * 2 * Math.PI) / 3;
      raw.push([Math.cos(a), 0, Math.sin(a)]);
    }
  } else if (featureCount === 6) {
    // Octahedron (3 antipodal pairs)
    raw.push([1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]);
  } else {
    // Square Antiprism (8 features in R^3)
    const h = 0.62;
    const r = Math.sqrt(1 - h * h);
    for (let k = 0; k < 4; k++) {
      const aTop = (k * Math.PI) / 2;
      const aBot = aTop + Math.PI / 4;
      raw.push([r * Math.cos(aTop), h, r * Math.sin(aTop)]);
      raw.push([r * Math.cos(aBot), -h, r * Math.sin(aBot)]);
    }
  }

  return raw.slice(0, featureCount).map(([x, y, z], idx) => {
    // When sparsity is too low (collapseFactor high), features collapse toward a noisy rank-1 line
    if (collapseFactor > 0.05) {
      const sign = idx % 2 === 0 ? 1 : -1;
      const nx = THREE.MathUtils.lerp(x, 0.7 * sign, collapseFactor);
      const ny = THREE.MathUtils.lerp(y, 0.7 * sign, collapseFactor);
      const nz = THREE.MathUtils.lerp(z, 0.1 * sign, collapseFactor);
      return [nx * 2.2, ny * 2.2, nz * 2.2];
    }
    return [x * 2.2, y * 2.2, z * 2.2];
  });
}

export const SuperpositionSAEScene: React.FC<SuperpositionSAESceneProps> = ({ config }) => {
  const polytopeGroupRef = useRef<THREE.Group>(null);
  const [featureCount, setFeatureCount] = useState<number>(6);
  const [probedFeature, setProbedFeature] = useState<number>(1);

  // Low sparsity causes polysemantic interference collapse
  const collapseFactor = Math.max(0, 0.35 - config.sparsityPenalty) * 2.4;
  const isPolysemanticCollapse = config.sparsityPenalty < 0.2;

  const featureVectors = useMemo(
    () => computePolytopeVectors(featureCount, collapseFactor),
    [featureCount, collapseFactor]
  );

  // Polytope hull edges connecting pairs of vertices
  const hullEdges = useMemo(() => {
    const edges: [[number, number, number], [number, number, number]][] = [];
    for (let i = 0; i < featureVectors.length; i++) {
      for (let j = i + 1; j < featureVectors.length; j++) {
        edges.push([featureVectors[i], featureVectors[j]]);
      }
    }
    return edges;
  }, [featureVectors]);

  // Compute maximum off-diagonal interference max_{i != j} |w_i . w_j|
  const maxInterference = useMemo(() => {
    let maxDot = 0;
    for (let i = 0; i < featureVectors.length; i++) {
      const vi = new THREE.Vector3(...featureVectors[i]).normalize();
      for (let j = i + 1; j < featureVectors.length; j++) {
        const vj = new THREE.Vector3(...featureVectors[j]).normalize();
        const dot = Math.abs(vi.dot(vj));
        if (dot > maxDot) maxDot = dot;
      }
    }
    return maxDot;
  }, [featureVectors]);

  useFrame((state) => {
    if (config.paused) return;
    const t = state.clock.getElapsedTime();
    if (polytopeGroupRef.current) {
      polytopeGroupRef.current.rotation.y = t * 0.28;
      polytopeGroupRef.current.rotation.x = Math.sin(t * 0.4) * 0.18;
    }
  });

  return (
    <group>
      {/* Inner 3D Bottleneck Polytope (D=3 Neurons packing M Features) */}
      <group ref={polytopeGroupRef}>
        {/* Coordinate Reference Axes */}
        <Line points={[[-2.6, 0, 0], [2.6, 0, 0]]} color="#475569" lineWidth={1} transparent opacity={0.4} />
        <Line points={[[0, -2.6, 0], [0, 2.6, 0]]} color="#475569" lineWidth={1} transparent opacity={0.4} />
        <Line points={[[0, 0, -2.6], [0, 0, 2.6]]} color="#475569" lineWidth={1} transparent opacity={0.4} />

        {/* Polytope Wireframe Hull */}
        {hullEdges.map(([a, b], idx) => (
          <Line
            key={idx}
            points={[a, b]}
            color={isPolysemanticCollapse ? '#EF4444' : '#06B6D4'}
            lineWidth={1}
            transparent
            opacity={0.28}
          />
        ))}

        {/* Feature Direction Vectors from Origin */}
        {featureVectors.map((vec, idx) => {
          const isProbed = idx === probedFeature;
          return (
            <group key={idx}>
              <Line
                points={[[0, 0, 0], vec]}
                color={isProbed ? '#10B981' : '#F59E0B'}
                lineWidth={isProbed ? 3 : 1.5}
              />
              <mesh
                position={vec}
                onClick={(e) => {
                  e.stopPropagation();
                  setProbedFeature(idx);
                }}
              >
                <octahedronGeometry args={[isProbed ? 0.22 : 0.14, 0]} />
                <meshBasicMaterial
                  color={isProbed ? '#10B981' : '#F59E0B'}
                  wireframe={config.wireframe}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Outer Sparse Autoencoder (SAE) Overcomplete Dictionary Ring */}
      <group rotation={[Math.PI / 2.3, 0, 0]}>
        {FEATURE_LABELS.map((label, idx) => {
          const angle = (idx / FEATURE_LABELS.length) * Math.PI * 2;
          const radius = 4.1;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = idx === probedFeature % FEATURE_LABELS.length;
          return (
            <group key={label} position={[x, y, 0]}>
              <mesh
                onClick={() => setProbedFeature(idx % featureCount)}
              >
                <boxGeometry args={[0.26, 0.26, isActive ? 0.9 : 0.22]} />
                <meshBasicMaterial
                  color={isActive ? '#10B981' : '#1E2430'}
                  wireframe={config.wireframe}
                />
              </mesh>
              {isActive && (
                <SceneLabel position={[0, 0, 0.8]}>
                  <div className="pointer-events-none bg-[#08090C]/95 border border-[#10B981] px-2 py-1 font-mono text-[10px] text-[#10B981] whitespace-nowrap">
                    SAE_MONOSEMANTIC_ACTIVE: {label} (a={((1 - maxInterference * 0.4) * 3.8).toFixed(2)})
                  </div>
                </SceneLabel>
              )}
            </group>
          );
        })}
      </group>

      {/* Bottom Interactive Polytope Mode Selector */}
      <SceneLabel position={[0, -3.35, 0]}>
        <div className="bg-[#0D0F14]/95 border border-[var(--border-grid)] px-3 py-2 font-mono text-[11px] text-[var(--text-primary)] flex items-center gap-3 whitespace-nowrap">
          <span className="text-[#94A3B8]">PACK M FEATURES IN R^3:</span>
          {[
            { m: 3, name: 'M=3 (ORTHOGONAL)' },
            { m: 5, name: 'M=5 (TRIG_BIPYRAMID)' },
            { m: 6, name: 'M=6 (OCTAHEDRON)' },
            { m: 8, name: 'M=8 (ANTIPRISM)' },
          ].map((item) => (
            <button
              key={item.m}
              type="button"
              onClick={() => {
                setFeatureCount(item.m);
                setProbedFeature(0);
              }}
              className={`px-2 py-0.5 border cursor-pointer ${
                featureCount === item.m
                  ? 'border-[#10B981] bg-[#10B981]/20 text-[#10B981]'
                  : 'border-[#1E2430] text-[#94A3B8]'
              }`}
            >
              [{item.name}]
            </button>
          ))}
          <span className="text-[#06B6D4]">
            MAX_INTERFERENCE |w_i·w_j|: {maxInterference.toFixed(3)}
          </span>
          {isPolysemanticCollapse && (
            <span className="text-[#EF4444] font-semibold">
              [!POLYSEMANTIC COLLAPSE: SPARSITY TOO LOW]
            </span>
          )}
        </div>
      </SceneLabel>
    </group>
  );
};

export default SuperpositionSAEScene;
