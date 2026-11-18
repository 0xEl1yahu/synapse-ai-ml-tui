import { createContext, useContext, useState, type SetStateAction } from 'react';

export const SceneStateContext = createContext<Map<string, unknown> | null>(null);

/** Remember local controls when a scene unmounts, while keeping animation state local. */
export function useSceneState<T>(key: string, initial: T): [T, (update: SetStateAction<T>) => void] {
  const controls = useContext(SceneStateContext);
  const [local, setLocal] = useState(initial);
  if (!controls) return [local, setLocal];

  const get = () => controls.has(key) ? controls.get(key) as T : initial;
  return [get(), update => {
    const next = typeof update === 'function' ? (update as (previous: T) => T)(get()) : update;
    controls.set(key, next);
    setLocal(next);
  }];
}
