export type ThemeId = 'phosphor' | 'amber-crt' | 'cyber-cyan' | 'paper-lab';

export type WebGLSceneId =
  | 'neural-lattice'
  | 'loss-landscape'
  | 'latent-galaxy'
  | 'attention-rope'
  | 'flow-matching'
  | 'superposition-sae';

export type ViewMode =
  | 'overview'      // WTFIS.AI Landing Hero + Neural Lattice 3D + "WTF is...?" Search & Quick Start
  | 'module'        // "WTF is...?" Deep-dive reader + Plain-English -> Math -> Code -> Failure Modes + coupled 3D Lab
  | 'papers'        // Interactive Paper Dissector ("WTF is this Paper?": Attention Is All You Need, ResNet, LoRA, FlashAttention, DeepSeek-R1, etc.)
  | 'roadmap'       // Learning Through Building: Interactive git-graph DAG + Track selector + Milestone Projects
  | 'resources'     // Filterable Zero-Gatekeeping Resource Database
  | 'webgl-lab';    // AI Systems Lab: Fullscreen Interactive Systems & WebGL Sandbox (Neural Net, Attention, RL/Agent Harness, Evals)

export interface CanonicalPaper {
  id: string;
  shortSlug: string;          // e.g. 'attention-is-all-you-need', 'resnet', 'lora', 'flashattention', 'deepseek-r1-grpo'
  title: string;
  authors: string;
  year: number;
  venueOrArxiv: string;
  url: string;
  moduleId: string;
  subTopicId: string;
  coupledSceneId: WebGLSceneId;
  wtfInvention: string;       // 1-sentence plain-English breakthrough
  whatBrokeBefore: string;    // Exact failure mode before this paper existed
  coreEquation: string;       // Symbolic equation
  tensorFlowAscii: string;    // Annotated tensor shape step-through diagram
  equationSteps: {
    stepTitle: string;
    expression: string;
    tensorShapes: string;
    plainMeaning: string;
  }[];
  minimalCode: string;        // 15-30 line exact PyTorch reproduction of the paper's core mechanism
  productionImpact: string[];
}

export type TrackId = 'builder' | 'ml-engineer' | 'researcher';

export interface MathFormula {
  id: string;
  title: string;
  latexLike: string;          // Clean symbolic representation for terminal display
  asciiBreakdown: string;     // Multi-line box-drawing variable breakdown
  intuition: string;          // Plain-English geometric meaning
  variables: { symbol: string; name: string; role: string }[];
}

export interface CodeImplementation {
  title: string;
  language: 'python' | 'glsl' | 'bash' | 'typescript';
  description: string;
  code: string;
}

export interface SubTopic {
  libraries: { name: string; url: string; purpose: string }[];
  hasLab?: boolean;
  architectureDiagram?: string;
  readingIds?: string[];
  knowledgeCheck?: { question: string; answer: string };
  id: string;
  title: string;              // e.g. "WTF is Backpropagation?" or "WTF is an Agent Harness?"
  commandSlug: string;        // e.g. "wtf-is-backprop", "wtf-is-attention", "wtf-is-agent-harness", "wtf-is-grpo"
  practice?: { inputLabel: string; starter: number; multiplier: number; offset: number; divisor: number; solution: string };
  wtfQuestion: string;        // e.g. "How does a network actually know which weight caused the error?"
  plainEnglish: string;       // Direct, zero-jargon explanation before any math
  whyItMatters: string;       // Why engineers care in real systems
  realWorldSystems: string[]; // Where this runs in production (e.g. "PyTorch Autograd", "vLLM", "Claude Code / Agent Harnesses")
  summary: string;
  deepDiveParagraphs: string[];
  keyTakeaways: string[];
  mathFormulas: MathFormula[];
  codeExamples: CodeImplementation[];
  pitfalls: string[];         // Failure modes, overfitting, silent bugs, and how to break/fix it
}

export interface TaxonomyModule {
  id: string;                 // e.g., "00_foundations" .. "07_interp_evals"
  number: string;             // "00" .. "07"
  slug: string;               // "foundations", "classical-ml", etc.
  filePath: string;           // "~/wtfis-ai/00_foundations/index.md"
  title: string;
  shortTitle: string;
  subtitle: string;
  layerCategory: 'MATH' | 'CLASSICAL' | 'DEEP_LEARNING' | 'FRONTIER_GENAI' | 'SYSTEMS_INTERP';
  defaultSceneId: WebGLSceneId;
  estimatedHours: number;
  prerequisites: string[];
  coreTools: string[];
  mentalModelSummary: string;
  asciiArchitectureDiagram: string;
  subTopics: SubTopic[];
}

export interface RoadmapNode {
  id: string;
  moduleId: string;
  title: string;
  command: string;
  tracks: TrackId[];
  dependencies: string[];     // IDs of parent nodes in the DAG
  estimatedWeeks: number;
  deliverable: string;
  verificationCheck: string;  // How the learner knows they mastered this node
}

export interface MilestoneProject {
  id: string;
  level: 1 | 2 | 3 | 4;
  title: string;
  track: TrackId | 'all';
  difficulty: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'FRONTIER';
  estimatedHours: number;
  problemStatement: string;
  architectureAscii: string;
  techStack: string[];
  implementationSteps: string[];
  evaluationMetrics: string[];
  starterCommand: string;
}

export interface LearningResource {
  id: string;
  title: string;
  authorOrOrg: string;
  url: string;
  type: 'COURSE' | 'BOOK' | 'VIDEO' | 'PAPER' | 'INTERACTIVE' | 'REPO' | 'READING' | 'CHANNEL';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'FRONTIER';
  moduleIds: string[];
  isFree: boolean;
  isInteractive: boolean;
  whyHighSignal: string;
  timeCommitment: string;
}

export interface SceneControlConfig {
  learningRate: number;       // 0.001 to 0.15
  temperature: number;        // 0.1 to 2.0
  layerDepth: number;         // 1 to 12
  sparsityPenalty: number;    // 0.0 to 1.0
  renderAscii: boolean;       // Toggles real-time ASCII glyph shader
  wireframe: boolean;
  paused: boolean;
  activePreset: string;       // Scene-specific mode e.g. 'ddpm' vs 'flow-matching'
}
