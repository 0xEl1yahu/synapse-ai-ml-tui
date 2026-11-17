import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { SceneControlConfig } from '../../../types';

export interface NeuralLatticeSceneProps {
  config: SceneControlConfig;
}

interface NeuronNode {
  id: string;
  layerIdx: number;
  nodeIdx: number;
  position: [number, number, number];
  baseActivation: number;
  bias: number;
  weightScale: number;
}

interface SynapseEdge {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  layerIdx: number;
  weight: number;
}

export const NeuralLatticeScene: React.FC<NeuralLatticeSceneProps> = ({ config }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pulseGroupRef = useRef<THREE.Group>(null);
  const [selectedNeuronId, setSelectedNeuronId] = useState<string>('L1-N1');
  const [perturbations, setPerturbations] = useState<Record<string, { biasDelta: number; dropped: boolean }>>({});

  const effectiveLayers = Math.max(3, Math.min(8, Math.round(config.layerDepth)));
  const isExploding = config.learningRate > 0.10;
  const isVanishing = config.layerDepth >= 9 && config.learningRate < 0.015;

  const { neurons, synapses } = useMemo(() => {
    const nodes: NeuronNode[] = [];
    const edges: SynapseEdge[] = [];
    const xSpan = 11.5;
    const xStart = -xSpan / 2;
    const layerStep = effectiveLayers > 1 ? xSpan / (effectiveLayers - 1) : 0;

    const layerCounts: number[] = [];
    for (let l = 0; l < effectiveLayers; l++) {
      if (l === 0) layerCounts.push(4);
      else if (l === effectiveLayers - 1) layerCounts.push(3);
      else if (l % 2 === 1) layerCounts.push(6);
      else layerCounts.push(5);
    }

    const layerNodes: NeuronNode[][] = [];

    for (let l = 0; l < effectiveLayers; l++) {
      const count = layerCounts[l];
      const currentLayer: NeuronNode[] = [];
      const x = xStart + l * layerStep;
      const radius = count > 4 ? 2.15 : 1.55;

      for (let n = 0; n < count; n++) {
        const angle = (n / count) * Math.PI * 2 + l * 0.45;
        const y = Math.sin(angle) * radius;
        const z = Math.cos(angle) * (radius * 0.72);
        const id = `L${l}-N${n}`;
        const seed = (l + 1) * 13.37 + (n + 1) * 7.91;
        const baseActivation = 0.25 + (Math.sin(seed) * 0.5 + 0.5) * 0.65;
        const bias = Number(((Math.cos(seed * 1.7) * 0.4)).toFixed(2));
        const weightScale = Number((0.4 + Math.sin(seed * 0.9) * 0.5).toFixed(2));

        const node: NeuronNode = {
          id,
          layerIdx: l,
          nodeIdx: n,
          position: [x, y, z],
          baseActivation,
          bias,
          weightScale,
        };
        nodes.push(node);
        currentLayer.push(node);
      }
      layerNodes.push(currentLayer);
    }

    for (let l = 0; l < effectiveLayers - 1; l++) {
      const srcLayer = layerNodes[l];
      const dstLayer = layerNodes[l + 1];
      srcLayer.forEach((src, sIdx) => {
        dstLayer.forEach((dst, dIdx) => {
          const weightVal = Math.sin((l + 1) * 5.1 + sIdx * 2.7 + dIdx * 3.9);
          // Prune weak connections based on sparsityPenalty
          if (Math.abs(weightVal) >= config.sparsityPenalty * 0.72) {
            edges.push({
              id: `${src.id}->${dst.id}`,
              from: src.position,
              to: dst.position,
              layerIdx: l,
              weight: weightVal,
            });
          }
        });
      });
    }

    return { neurons: nodes, synapses: edges };
  }, [effectiveLayers, config.sparsityPenalty]);

  const pulseEdges = useMemo(() => {
    return synapses.filter((_, idx) => idx % 2 === 0).slice(0, 48);
  }, [synapses]);

  useFrame((state) => {
    if (config.paused) return;
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.16) * 0.12;
      if (isExploding) {
        // High-frequency jitter on gradient explosion
        groupRef.current.position.x = (Math.random() - 0.5) * 0.16;
        groupRef.current.position.y = (Math.random() - 0.5) * 0.16;
      } else {
        groupRef.current.position.set(0, 0, 0);
      }
    }

    if (pulseGroupRef.current) {
      const speed = 0.75 + config.learningRate * 8.0;
      const cycle = (t * speed) % 2.0; // 0..1 forward pass, 1..2 backward pass
      const isBackprop = cycle >= 1.0;
      const phaseProgress = isBackprop ? 2.0 - cycle : cycle;

      pulseGroupRef.current.children.forEach((child, idx) => {
        const edge = pulseEdges[idx];
        if (!edge) return;
        const mesh = child as THREE.Mesh;

        const layerNorm = edge.layerIdx / Math.max(1, effectiveLayers - 1);
        const localProgress = ((phaseProgress * effectiveLayers - edge.layerIdx) + (idx % 5) * 0.14);
        const clamped = localProgress - Math.floor(localProgress);

        const tPos = isBackprop ? 1.0 - clamped : clamped;
        mesh.position.set(
          THREE.MathUtils.lerp(edge.from[0], edge.to[0], tPos),
          THREE.MathUtils.lerp(edge.from[1], edge.to[1], tPos),
          THREE.MathUtils.lerp(edge.from[2], edge.to[2], tPos)
        );

        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (isExploding) {
          mat.color.set('#EF4444');
          mesh.scale.setScalar(1.6 + Math.sin(t * 25 + idx) * 0.6);
        } else if (isVanishing && layerNorm < 0.5 && isBackprop) {
          mat.color.set('#475569');
          mesh.scale.setScalar(0.35);
        } else if (isBackprop) {
          mat.color.set('#F59E0B');
          mesh.scale.setScalar(1.05);
        } else {
          mat.color.set('#10B981');
          mesh.scale.setScalar(0.95);
        }
      });
    }
  });

  const selectedNeuron = useMemo(
    () => neurons.find((n) => n.id === selectedNeuronId) || neurons[Math.min(5, neurons.length - 1)],
    [neurons, selectedNeuronId]
  );

  const selectedState = selectedNeuron ? perturbations[selectedNeuron.id] || { biasDelta: 0, dropped: false } : { biasDelta: 0, dropped: false };

  const handlePerturb = (delta: number) => {
    if (!selectedNeuron) return;
    setPerturbations((prev) => {
      const cur = prev[selectedNeuron.id] || { biasDelta: 0, dropped: false };
      return {
        ...prev,
        [selectedNeuron.id]: {
          ...cur,
          biasDelta: Number((cur.biasDelta + delta).toFixed(2)),
        },
      };
    });
  };

  const handleToggleDropout = () => {
    if (!selectedNeuron) return;
    setPerturbations((prev) => {
      const cur = prev[selectedNeuron.id] || { biasDelta: 0, dropped: false };
      return {
        ...prev,
        [selectedNeuron.id]: {
          ...cur,
          dropped: !cur.dropped,
        },
      };
    });
  };

  return (
    <group ref={groupRef}>
      {/* Synaptic Weight Connections */}
      {synapses.map((edge) => {
        const srcDropped = perturbations[edge.id.split('->')[0]]?.dropped;
        const dstDropped = perturbations[edge.id.split('->')[1]]?.dropped;
        if (srcDropped || dstDropped) return null;

        const isPositive = edge.weight >= 0;
        const lineColor = isExploding
          ? '#EF4444'
          : isPositive
          ? '#10B981'
          : '#06B6D4';

        return (
          <Line
            key={edge.id}
            points={[edge.from, edge.to]}
            color={lineColor}
            lineWidth={isExploding ? 1.8 : Math.max(0.6, Math.abs(edge.weight) * 1.6)}
            transparent
            opacity={isExploding ? 0.65 : 0.26}
          />
        );
      })}

      {/* Forward Activation & Backprop Gradient Pulses */}
      <group ref={pulseGroupRef}>
        {pulseEdges.map((edge) => (
          <mesh key={`pulse-${edge.id}`}>
            <octahedronGeometry args={[0.09, 0]} />
            <meshBasicMaterial color="#10B981" wireframe={config.wireframe} />
          </mesh>
        ))}
      </group>

      {/* Layer Nodes */}
      {neurons.map((node) => {
        const isSelected = selectedNeuron?.id === node.id;
        const p = perturbations[node.id] || { biasDelta: 0, dropped: false };
        const rawAct = p.dropped
          ? 0
          : isExploding
          ? 999.9
          : Math.max(0, node.baseActivation + p.biasDelta + node.bias * 0.4);

        const nodeColor = p.dropped
          ? '#334155'
          : isExploding
          ? '#EF4444'
          : isSelected
          ? '#F59E0B'
          : rawAct > 0.75
          ? '#10B981'
          : '#06B6D4';

        return (
          <group key={node.id} position={node.position}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNeuronId(node.id);
              }}
            >
              <icosahedronGeometry args={[isSelected ? 0.34 : 0.24, isSelected ? 1 : 0]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={p.dropped ? 0.05 : isExploding ? 1.4 : isSelected ? 0.9 : 0.45}
                wireframe={config.wireframe || p.dropped}
              />
            </mesh>

            {/* Outer selection wireframe halo */}
            {isSelected && (
              <mesh scale={1.55}>
                <octahedronGeometry args={[0.3, 0]} />
                <meshBasicMaterial color="#F59E0B" wireframe />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Interactive 3D Terminal Inspector Badge for Selected Neuron */}
      {selectedNeuron && (
        <Html
          position={[
            selectedNeuron.position[0],
            selectedNeuron.position[1] + 0.85,
            selectedNeuron.position[2],
          ]}
          center
          distanceFactor={12}
          zIndexRange={[4, 0]}
        >
          <div className="w-60 border border-[#10B981] bg-[#08090C]/95 p-2 font-mono text-[10px] text-[#ECFDF5] shadow-none select-none">
            <div className="flex items-center justify-between border-b border-[#1E2430] pb-1">
              <span className="font-bold text-[#10B981]">NODE::{selectedNeuron.id}</span>
              <span className={isExploding ? 'text-[#EF4444] font-bold' : 'text-[#06B6D4]'}>
                {isExploding ? 'GRAD: NaN!' : selectedState.dropped ? 'DROPPED_OUT' : 'RELU_ACTIVE'}
              </span>
            </div>

            <div className="mt-1.5 grid grid-cols-2 gap-1 text-[9px] text-[#94A3B8]">
              <div>
                ACT(a):{' '}
                <span className="text-[#ECFDF5]">
                  {isExploding
                    ? 'INF / NaN'
                    : selectedState.dropped
                    ? '0.000'
                    : Math.max(0, selectedNeuron.baseActivation + selectedState.biasDelta).toFixed(3)}
                </span>
              </div>
              <div>
                BIAS(b):{' '}
                <span className="text-[#F59E0B]">
                  {(selectedNeuron.bias + selectedState.biasDelta).toFixed(2)}
                </span>
              </div>
              <div>
                dL/dw:{' '}
                <span className={isExploding ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                  {isExploding
                    ? '+8.42e+14'
                    : isVanishing
                    ? '0.000001'
                    : (config.learningRate * selectedNeuron.weightScale * -4.2).toFixed(4)}
                </span>
              </div>
              <div>
                SPARSE:{' '}
                <span className="text-[#06B6D4]">{Math.round(config.sparsityPenalty * 100)}%</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1 border-t border-[#1E2430] pt-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePerturb(0.45);
                }}
                className="border border-[#10B981] bg-[#0D0F14] px-1.5 py-0.5 text-[9px] text-[#10B981] hover:bg-[#10B981] hover:text-[#08090C] cursor-pointer"
              >
                [+BIAS]
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePerturb(-0.45);
                }}
                className="border border-[#06B6D4] bg-[#0D0F14] px-1.5 py-0.5 text-[9px] text-[#06B6D4] hover:bg-[#06B6D4] hover:text-[#08090C] cursor-pointer"
              >
                [-BIAS]
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleDropout();
                }}
                className="border border-[#F59E0B] bg-[#0D0F14] px-1.5 py-0.5 text-[9px] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#08090C] cursor-pointer"
              >
                {selectedState.dropped ? '[RESTORE]' : '[KILL_NODE]'}
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
