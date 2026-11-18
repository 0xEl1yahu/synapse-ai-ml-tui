import { CANONICAL_PAPERS } from './data/papers';
import { TAXONOMY_MODULES } from './data/taxonomy';
import type { ViewMode, WebGLSceneId } from './types';

const scenes: WebGLSceneId[] = ['neural-lattice', 'loss-landscape', 'latent-galaxy', 'attention-rope', 'flow-matching', 'superposition-sae'];
export const firstPaperId = CANONICAL_PAPERS[0].id;

export function readLocation() {
  const [section, id] = window.location.hash.slice(1).split('/');
  const module = TAXONOMY_MODULES.find(item => item.subTopics.some(topic => topic.id === id));
  const view: ViewMode = section === 'lesson' && module ? 'module'
    : section === 'paper' && CANONICAL_PAPERS.some(paper => paper.id === id) ? 'papers'
    : section === 'lab' && scenes.includes(id as WebGLSceneId) ? 'webgl-lab'
    : section === 'roadmap' || section === 'resources' ? section : 'overview';
  const initialModule = view === 'module' && module ? module : TAXONOMY_MODULES[0];
  return {
    view,
    moduleId: initialModule.id,
    topicId: view === 'module' ? id : initialModule.subTopics[0].id,
    sceneId: view === 'webgl-lab' ? id as WebGLSceneId : view === 'module' ? initialModule.defaultSceneId : scenes[0],
    paperId: view === 'papers' ? id : firstPaperId,
  };
}
