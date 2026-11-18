import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useFrame, useThree, type ThreeElements } from '@react-three/fiber';
import { Group, PerspectiveCamera, Vector3 } from 'three';

interface SceneLabelProps {
  position: ThreeElements['group']['position'];
  distanceFactor?: number;
  children: ReactNode;
  panelHost?: HTMLElement | null;
}

export function SceneLabel({ position, distanceFactor, children, panelHost }: SceneLabelProps) {
  const anchor = useRef<Group>(null);
  const element = useRef<HTMLDivElement | null>(null);
  const root = useRef<Root | null>(null);
  const [point] = useState(() => new Vector3());
  const canvasHost = useThree(state => state.gl.domElement.parentElement);
  const host = panelHost ?? canvasHost;

  useLayoutEffect(() => {
    if (!host) return;
    // Each mount owns a fresh container, including during React's effect replay.
    const label = document.createElement('div');
    if (!panelHost) label.style.cssText = 'position:absolute;top:0;left:0;width:max-content;z-index:4;transform-origin:0 0';
    host.appendChild(label);
    const labelRoot = createRoot(label);
    root.current = labelRoot;
    element.current = label;
    return () => {
      element.current = null;
      root.current = null;
      label.remove();
      // Finish the Three renderer's commit before unmounting the DOM root.
      queueMicrotask(() => labelRoot.unmount());
    };
  }, [host, panelHost]);

  useLayoutEffect(() => {
    root.current?.render(children);
  }, [host, children]);

  useFrame(({ camera, size }) => {
    if (panelHost || !element.current || !anchor.current) return;
    anchor.current.getWorldPosition(point);
    const distance = point.distanceTo(camera.position);
    point.project(camera);
    const label = element.current;
    label.hidden = point.z < -1 || point.z > 1;
    if (label.hidden) return;
    const x = (point.x + 1) * size.width / 2;
    const y = (1 - point.y) * size.height / 2;
    const scale = distanceFactor && camera instanceof PerspectiveCamera
      ? distanceFactor / (2 * Math.tan(camera.fov * Math.PI / 360) * distance)
      : 1;
    label.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale}) translate(-50%,-50%)`;
  });

  return <group position={position} ref={anchor} />;
}
