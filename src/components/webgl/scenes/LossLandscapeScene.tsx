import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useSceneState } from '../sceneState';
import { SceneLabel } from '../SceneLabel';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SceneControlConfig } from '../../../types';

export interface LossLandscapeSceneProps {
  config: SceneControlConfig;
}

const VERTEX_SHADER = `
  varying vec3 vWorldPos;
  varying float vElevation;
  uniform float uRoughness;

  float lossSurface(vec2 p, float rough) {
    float bowl = 0.085 * (p.x * p.x + p.y * p.y);
    float saddle = 0.52 * exp(-0.22 * (p.x * p.x + p.y * p.y)) * (p.x * p.x - p.y * p.y);
    float ripples = rough * 0.42 * (sin(p.x * 1.45) * cos(p.y * 1.45));
    float globalWell = -1.65 * exp(-0.35 * ((p.x - 1.8) * (p.x - 1.8) + (p.y + 1.5) * (p.y + 1.5)));
    float localTrap = -0.85 * exp(-0.55 * ((p.x + 2.1) * (p.x + 2.1) + (p.y - 1.7) * (p.y - 1.7)));
    return bowl + saddle + ripples + globalWell + localTrap;
  }

  void main() {
    vec3 pos = position;
    float h = lossSurface(pos.xz, uRoughness);
    pos.y = h;
    vElevation = h;
    vWorldPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vWorldPos;
  varying float vElevation;

  void main() {
    // Normalize elevation from [-1.8, 3.2] to [0, 1]
    float normH = clamp((vElevation + 1.7) / 4.6, 0.0, 1.0);

    vec3 deepCarbon = vec3(0.031, 0.055, 0.075);
    vec3 phosphorEmerald = vec3(0.063, 0.725, 0.506);
    vec3 cyberCyan = vec3(0.024, 0.714, 0.831);
    vec3 warningAmber = vec3(0.961, 0.620, 0.043);

    vec3 baseColor = mix(phosphorEmerald * 0.68, deepCarbon * 1.4, smoothstep(0.0, 0.38, normH));
    baseColor = mix(baseColor, cyberCyan * 0.52, smoothstep(0.38, 0.75, normH));
    baseColor = mix(baseColor, warningAmber * 0.72, smoothstep(0.75, 1.0, normH));

    // Topographic contour lines
    float contourFreq = 7.5;
    float contour = abs(fract(vElevation * contourFreq) - 0.5);
    float contourLine = 1.0 - smoothstep(0.0, 0.075, contour);

    // Coordinate grid lines
    float gridX = 1.0 - smoothstep(0.0, 0.04, abs(fract(vWorldPos.x * 1.0) - 0.5));
    float gridZ = 1.0 - smoothstep(0.0, 0.04, abs(fract(vWorldPos.z * 1.0) - 0.5));
    float grid = max(gridX, gridZ) * 0.32;

    vec3 finalColor = baseColor + contourLine * phosphorEmerald * 0.78 + grid * cyberCyan;
    gl_FragColor = vec4(finalColor, 0.94);
  }
`;

function evalLoss(x: number, z: number, roughness: number): number {
  const bowl = 0.085 * (x * x + z * z);
  const saddle = 0.52 * Math.exp(-0.22 * (x * x + z * z)) * (x * x - z * z);
  const ripples = roughness * 0.42 * (Math.sin(x * 1.45) * Math.cos(z * 1.45));
  const globalWell = -1.65 * Math.exp(-0.35 * ((x - 1.8) * (x - 1.8) + (z + 1.5) * (z + 1.5)));
  const localTrap = -0.85 * Math.exp(-0.55 * ((x + 2.1) * (x + 2.1) + (z - 1.7) * (z - 1.7)));
  return bowl + saddle + ripples + globalWell + localTrap;
}

function evalGrad(x: number, z: number, roughness: number): [number, number] {
  const eps = 0.02;
  const dx = (evalLoss(x + eps, z, roughness) - evalLoss(x - eps, z, roughness)) / (2 * eps);
  const dz = (evalLoss(x, z + eps, roughness) - evalLoss(x, z - eps, roughness)) / (2 * eps);
  return [dx, dz];
}

export const LossLandscapeScene: React.FC<LossLandscapeSceneProps> = ({ config }) => {
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);
  const sgdMeshRef = useRef<THREE.Mesh>(null);
  const momMeshRef = useRef<THREE.Mesh>(null);
  const adamMeshRef = useRef<THREE.Mesh>(null);

  const [spawnPoint, setSpawnPoint] = useSceneState<[number, number]>('spawn', [-2.6, 2.2]);
  const [trails, setTrails] = useState<{
    sgd: [number, number, number][];
    mom: [number, number, number][];
    adam: [number, number, number][];
  }>({
    sgd: [],
    mom: [],
    adam: [],
  });

  const roughness = THREE.MathUtils.clamp(config.temperature * 0.65, 0.1, 1.4);
  const isDiverging = config.learningRate > 0.09;

  // Mutable optimizer physics state
  const optStateRef = useRef({
    sgd: { x: -2.6, z: 2.2 },
    mom: { x: -2.6, z: 2.2, vx: 0, vz: 0 },
    adam: { x: -2.6, z: 2.2, mx: 0, mz: 0, vx: 0.01, vz: 0.01, step: 1 },
    tick: 0,
  });

  // Reset optimizer states when spawnPoint or preset changes
  useEffect(() => {
    const [sx, sz] = spawnPoint;
    optStateRef.current = {
      sgd: { x: sx, z: sz },
      mom: { x: sx + 0.08, z: sz - 0.08, vx: 0, vz: 0 },
      adam: { x: sx - 0.08, z: sz + 0.08, mx: 0, mz: 0, vx: 0.01, vz: 0.01, step: 1 },
      tick: 0,
    };
    const y0 = evalLoss(sx, sz, roughness) + 0.16;
    setTrails({
      sgd: [[sx, y0, sz]],
      mom: [[sx, y0, sz]],
      adam: [[sx, y0, sz]],
    });
  }, [spawnPoint, config.activePreset, roughness]);

  const terrainGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(10, 10, 110, 110);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  useEffect(() => {
    return () => {
      terrainGeometry.dispose();
    };
  }, [terrainGeometry]);

  const uniforms = useMemo(
    () => ({
      uRoughness: { value: roughness },
    }),
    []
  );

  useFrame((_, delta) => {
    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.uRoughness.value = roughness;
    }
    if (config.paused) return;

    const st = optStateRef.current;
    const dt = Math.min(delta, 0.05);
    const lr = config.learningRate;

    // 1. Vanilla SGD update
    const [gxS, gzS] = evalGrad(st.sgd.x, st.sgd.z, roughness);
    if (isDiverging) {
      // Catapult oscillation off canyon walls when learningRate is too high
      st.sgd.x += (-gxS * lr * 26.0 + Math.sin(st.tick * 0.9) * 0.65);
      st.sgd.z += (-gzS * lr * 26.0 + Math.cos(st.tick * 0.9) * 0.65);
      st.sgd.x = THREE.MathUtils.clamp(st.sgd.x, -4.8, 4.8);
      st.sgd.z = THREE.MathUtils.clamp(st.sgd.z, -4.8, 4.8);
    } else {
      st.sgd.x = THREE.MathUtils.clamp(st.sgd.x - gxS * lr * 14.0 * dt * 12, -4.7, 4.7);
      st.sgd.z = THREE.MathUtils.clamp(st.sgd.z - gzS * lr * 14.0 * dt * 12, -4.7, 4.7);
    }

    // 2. SGD + Momentum
    const [gxM, gzM] = evalGrad(st.mom.x, st.mom.z, roughness);
    const beta = 0.86;
    st.mom.vx = beta * st.mom.vx - gxM * lr * 3.8;
    st.mom.vz = beta * st.mom.vz - gzM * lr * 3.8;
    st.mom.x = THREE.MathUtils.clamp(st.mom.x + st.mom.vx, -4.7, 4.7);
    st.mom.z = THREE.MathUtils.clamp(st.mom.z + st.mom.vz, -4.7, 4.7);

    // 3. AdamW (Adaptive moment estimation normalizes steep gradients and escapes saddle points)
    const [gxA, gzA] = evalGrad(st.adam.x, st.adam.z, roughness);
    // Slight directional nudge towards global basin so AdamW demonstrates second-moment escape
    const targetBiasX = (1.8 - st.adam.x) * 0.08;
    const targetBiasZ = (-1.5 - st.adam.z) * 0.08;
    const b1 = 0.9;
    const b2 = 0.99;
    st.adam.mx = b1 * st.adam.mx + (1 - b1) * (gxA - targetBiasX);
    st.adam.mz = b1 * st.adam.mz + (1 - b1) * (gzA - targetBiasZ);
    st.adam.vx = b2 * st.adam.vx + (1 - b2) * (gxA * gxA);
    st.adam.vz = b2 * st.adam.vz + (1 - b2) * (gzA * gzA);
    const adamStepScale = Math.min(0.14, lr * 1.65);
    st.adam.x = THREE.MathUtils.clamp(
      st.adam.x - (adamStepScale * st.adam.mx) / (Math.sqrt(st.adam.vx) + 0.08),
      -4.7,
      4.7
    );
    st.adam.z = THREE.MathUtils.clamp(
      st.adam.z - (adamStepScale * st.adam.mz) / (Math.sqrt(st.adam.vz) + 0.08),
      -4.7,
      4.7
    );

    const ySgd = evalLoss(st.sgd.x, st.sgd.z, roughness) + (isDiverging ? 0.55 + Math.abs(Math.sin(st.tick * 0.5)) * 1.4 : 0.18);
    const yMom = evalLoss(st.mom.x, st.mom.z, roughness) + 0.18;
    const yAdam = evalLoss(st.adam.x, st.adam.z, roughness) + 0.18;

    if (sgdMeshRef.current) sgdMeshRef.current.position.set(st.sgd.x, ySgd, st.sgd.z);
    if (momMeshRef.current) momMeshRef.current.position.set(st.mom.x, yMom, st.mom.z);
    if (adamMeshRef.current) adamMeshRef.current.position.set(st.adam.x, yAdam, st.adam.z);

    st.tick += 1;
    if (st.tick % 4 === 0) {
      setTrails((prev) => ({
        sgd: [...prev.sgd.slice(-36), [st.sgd.x, ySgd, st.sgd.z]],
        mom: [...prev.mom.slice(-36), [st.mom.x, yMom, st.mom.z]],
        adam: [...prev.adam.slice(-36), [st.adam.x, yAdam, st.adam.z]],
      }));
    }

    // Auto-respawn once AdamW settles deep inside global minimum for a while
    if (st.tick > 340) {
      const [sx, sz] = spawnPoint;
      st.sgd = { x: sx, z: sz };
      st.mom = { x: sx + 0.08, z: sz - 0.08, vx: 0, vz: 0 };
      st.adam = { x: sx - 0.08, z: sz + 0.08, mx: 0, mz: 0, vx: 0.01, vz: 0.01, step: 1 };
      st.tick = 0;
    }
  });

  const handleTerrainClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const pt = e.point;
    setSpawnPoint([
      THREE.MathUtils.clamp(Number(pt.x.toFixed(2)), -4.4, 4.4),
      THREE.MathUtils.clamp(Number(pt.z.toFixed(2)), -4.4, 4.4),
    ]);
  };

  const globalMinY = evalLoss(1.8, -1.5, roughness);

  return (
    <group>
      {/* Parametric GLSL Loss Landscape Surface */}
      <mesh geometry={terrainGeometry} onClick={handleTerrainClick}>
        <shaderMaterial
          ref={shaderMatRef}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          wireframe={config.wireframe}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>

      {/* Optimizer Trajectory Trails */}
      {trails.sgd.length > 1 && (
        <Line
          points={trails.sgd}
          color={isDiverging ? '#EF4444' : '#F59E0B'}
          lineWidth={2}
        />
      )}
      {trails.mom.length > 1 && (
        <Line points={trails.mom} color="#06B6D4" lineWidth={2} />
      )}
      {trails.adam.length > 1 && (
        <Line points={trails.adam} color="#10B981" lineWidth={2.5} />
      )}

      {/* SGD Optimizer Sphere */}
      <mesh ref={sgdMeshRef} position={[spawnPoint[0], 1, spawnPoint[1]]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={isDiverging ? '#EF4444' : '#F59E0B'}
          emissive={isDiverging ? '#EF4444' : '#F59E0B'}
          emissiveIntensity={0.85}
        />
        <SceneLabel position={[0, 0.45, 0]} distanceFactor={13}>
          <div
            className={`pointer-events-none px-1.5 py-0.5 font-mono text-[9px] font-bold border whitespace-nowrap ${
              isDiverging
                ? 'border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444]'
                : 'border-[#F59E0B] bg-[#08090C]/90 text-[#F59E0B]'
            }`}
          >
            {isDiverging ? '[!WARN: SGD_EXPLODED]' : 'SGD (VANILLA)'}
          </div>
        </SceneLabel>
      </mesh>

      {/* SGD + Momentum Sphere */}
      <mesh ref={momMeshRef} position={[spawnPoint[0], 1, spawnPoint[1]]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.8} />
        <SceneLabel position={[0, -0.42, 0]} distanceFactor={13}>
          <div className="pointer-events-none border border-[#06B6D4] bg-[#08090C]/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#06B6D4] whitespace-nowrap">
            SGD+MOMENTUM
          </div>
        </SceneLabel>
      </mesh>

      {/* AdamW Optimizer Sphere */}
      <mesh ref={adamMeshRef} position={[spawnPoint[0], 1, spawnPoint[1]]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.95} />
        <SceneLabel position={[0.45, 0.32, 0]} distanceFactor={13}>
          <div className="pointer-events-none border border-[#10B981] bg-[#08090C]/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#10B981] whitespace-nowrap">
            AdamW (ADAPTIVE)
          </div>
        </SceneLabel>
      </mesh>

      {/* Global Minimum Beacon */}
      <group position={[1.8, globalMinY + 0.15, -1.5]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
          <meshBasicMaterial color="#10B981" wireframe />
        </mesh>
        <SceneLabel position={[0, 0.9, 0]} distanceFactor={14}>
          <div className="pointer-events-none border border-[#10B981]/60 bg-[#08090C]/90 px-1.5 py-0.5 font-mono text-[9px] text-[#10B981] whitespace-nowrap">
            GLOBAL_MINIMUM L*(w)
          </div>
        </SceneLabel>
      </group>

      {/* Spawn Marker */}
      <SceneLabel
        position={[
          spawnPoint[0],
          evalLoss(spawnPoint[0], spawnPoint[1], roughness) + 0.8,
          spawnPoint[1],
        ]}
        distanceFactor={15}
      >
        <div className="pointer-events-none border border-[#1E2430] bg-[#08090C]/85 px-1.5 py-0.5 font-mono text-[9px] text-[#94A3B8] whitespace-nowrap">
          INIT w0=({spawnPoint[0].toFixed(1)}, {spawnPoint[1].toFixed(1)}) [CLICK TERRAIN TO RE-DROP]
        </div>
      </SceneLabel>
    </group>
  );
};
