import { TaxonomyModule } from '../types';
import { MODULES_PART_1 } from './modulesPart1';
import { MODULES_PART_2 } from './modulesPart2';

export const TAXONOMY_MODULES: TaxonomyModule[] = [
  ...MODULES_PART_1,
  ...MODULES_PART_2,
];

export const CLI_MAN_PAGES: Record<
  string,
  { title: string; summary: string; command: string; moduleId: string; subTopicId: string }
> = {
  svd: {
    title: 'WTF is a Matrix, SVD & LoRA?',
    summary: 'Singular Value Decomposition (W = U Sigma V^T) decomposes any matrix into rotation-stretch-rotation and powers Low-Rank Adaptation (Delta W = B A).',
    command: 'wtf svd',
    moduleId: '00_foundations',
    subTopicId: 'wtf-is-vectors-svd',
  },
  lora: {
    title: 'Low-Rank Adaptation (LoRA)',
    summary: 'Freezes base weights W_0 and trains rank-r bottleneck matrices B*A, cutting optimizer VRAM by >99%.',
    command: 'wtf lora',
    moduleId: '00_foundations',
    subTopicId: 'wtf-is-vectors-svd',
  },
  'gradient-descent': {
    title: 'WTF is Gradient Descent, Jacobians & The Hessian?',
    summary: 'First-order steepest descent vs second-order Hessian curvature eigenvalues (saddle points vs minima).',
    command: 'wtf gradient-descent',
    moduleId: '00_foundations',
    subTopicId: 'wtf-is-gradient-descent',
  },
  hessian: {
    title: 'Hessian Curvature Matrix & Saddle Points',
    summary: 'Second-derivative matrix H = nabla^2 L whose negative eigenvalues expose high-dimensional saddle points and bound max learning rate eta < 2/lambda_max.',
    command: 'wtf hessian',
    moduleId: '00_foundations',
    subTopicId: 'wtf-is-gradient-descent',
  },
  'cross-entropy': {
    title: 'WTF is Information Theory, Cross-Entropy & KL Divergence?',
    summary: 'Measures surprise in nats/bits; explains why Cross-Entropy avoids sigmoid saturation and links MLE/MAP to L2/L1 priors.',
    command: 'wtf cross-entropy',
    moduleId: '00_foundations',
    subTopicId: 'wtf-is-cross-entropy',
  },
  overfitting: {
    title: 'WTF is Overfitting, Bias-Variance & Double Descent?',
    summary: 'Decomposes generalization error into Bias^2 + Variance + Noise and explains the modern overparameterized interpolation regime.',
    command: 'wtf overfitting',
    moduleId: '01_classical_ml',
    subTopicId: 'wtf-is-overfitting',
  },
  xgboost: {
    title: 'WTF is XGBoost & Second-Order Gradient Boosting?',
    summary: 'Uses 1st derivative g_i and 2nd derivative Hessian h_i in a Taylor expansion to build regularized decision trees.',
    command: 'wtf xgboost',
    moduleId: '01_classical_ml',
    subTopicId: 'wtf-is-gradient-boosting',
  },
  umap: {
    title: 'WTF is an Embedding Space, PCA & UMAP?',
    summary: 'Compares spectral linear PCA, Student-t heavy-tailed t-SNE, and Riemannian fuzzy topological graphs in UMAP.',
    command: 'wtf umap',
    moduleId: '01_classical_ml',
    subTopicId: 'wtf-is-embeddings-manifolds',
  },
  backprop: {
    title: 'WTF is a Neural Network & Backpropagation?',
    summary: 'Reverse-mode automatic differentiation computing Vector-Jacobian Products (VJPs) across a dynamic computation graph.',
    command: 'wtf backprop',
    moduleId: '02_deep_learning',
    subTopicId: 'wtf-is-backprop',
  },
  rmsnorm: {
    title: 'WTF are Residual Streams, RMSNorm & SwiGLU?',
    summary: 'Pre-norm residual highways preserve gradient identity paths while SwiGLU bilinear gating boosts FFN expressivity.',
    command: 'wtf rmsnorm',
    moduleId: '02_deep_learning',
    subTopicId: 'wtf-is-residual-rmsnorm',
  },
  adamw: {
    title: 'WTF is an Optimizer (SGD, Momentum, AdamW & Muon)?',
    summary: 'Adaptive moment estimation with decoupled weight decay plus Newton-Schulz matrix orthogonalization in Muon.',
    command: 'wtf adamw',
    moduleId: '02_deep_learning',
    subTopicId: 'wtf-is-adamw',
  },
  attention: {
    title: 'WTF is Attention & KV-Cache Compression (MHA, GQA, MLA)?',
    summary: 'Scaled dot-product content lookup QK^T/sqrt(d_k) and low-rank latent KV cache compression (MLA).',
    command: 'wtf attention',
    moduleId: '03_sequence_arch',
    subTopicId: 'wtf-is-attention',
  },
  mla: {
    title: 'Multi-Head Latent Attention (MLA)',
    summary: 'Compresses Keys and Values jointly into a low-rank latent vector c_t^KV to slash inference memory bandwidth.',
    command: 'wtf mla',
    moduleId: '03_sequence_arch',
    subTopicId: 'wtf-is-attention',
  },
  transformer: {
    title: 'WTF is a Transformer & Rotary Position Embeddings (RoPE)?',
    summary: 'Full autoregressive decoder block and complex-plane 2D rotation matrices encoding relative token distance.',
    command: 'wtf transformer',
    moduleId: '03_sequence_arch',
    subTopicId: 'wtf-is-transformer-rope',
  },
  rope: {
    title: 'Rotary Position Embeddings (RoPE)',
    summary: 'Rotates Q and K pairs in 2D complex planes by angle m*theta_i so dot products depend strictly on relative distance (m - n).',
    command: 'wtf rope',
    moduleId: '03_sequence_arch',
    subTopicId: 'wtf-is-transformer-rope',
  },
  moe: {
    title: 'WTF is Mixture-of-Experts (MoE) & Mamba-2?',
    summary: 'Sparse top-k expert routing and O(N) Structured State Space Duality (SSD) hybrid sequence models.',
    command: 'wtf moe',
    moduleId: '03_sequence_arch',
    subTopicId: 'wtf-is-moe-ssm',
  },
  mamba: {
    title: 'State-Space Models (Mamba-2 / SSD)',
    summary: 'Linear O(N) sequence recurrence with input-dependent selective state transitions.',
    command: 'wtf mamba',
    moduleId: '03_sequence_arch',
    subTopicId: 'wtf-is-moe-ssm',
  },
  tokenization: {
    title: 'WTF is Tokenization (BPE), Pre-Training & Scaling Laws?',
    summary: 'Byte-Pair Encoding merges, Chinchilla C ≈ 6ND compute optimality, and Speculative Decoding.',
    command: 'wtf tokenization',
    moduleId: '04_generative_ai',
    subTopicId: 'wtf-is-llm-tokenization',
  },
  diffusion: {
    title: 'WTF is a Diffusion Model & Score Matching?',
    summary: 'Reverses Gaussian corruption by learning the Stein score function nabla_x log p_t(x).',
    command: 'wtf diffusion',
    moduleId: '04_generative_ai',
    subTopicId: 'wtf-is-diffusion',
  },
  'flow-matching': {
    title: 'WTF is Flow Matching & Optimal Transport?',
    summary: 'Learns straight-line deterministic ODE velocity fields v_theta(x_t,t) = x_1 - x_0 for fast 4-to-8 step generation.',
    command: 'wtf flow-matching',
    moduleId: '04_generative_ai',
    subTopicId: 'wtf-is-flow-matching',
  },
  rl: {
    title: 'WTF is Reinforcement Learning (MDPs, Q-Learning & PPO)?',
    summary: 'Bellman optimality, Advantage estimation, and clipped surrogate policy gradients.',
    command: 'wtf rl',
    moduleId: '05_post_training_rl',
    subTopicId: 'wtf-is-reinforcement-learning',
  },
  dpo: {
    title: 'WTF is Alignment (SFT, RLHF & DPO)?',
    summary: 'Closed-form Bradley-Terry preference optimization using the policy itself as an implicit reward model.',
    command: 'wtf dpo',
    moduleId: '05_post_training_rl',
    subTopicId: 'wtf-is-rlhf-dpo',
  },
  grpo: {
    title: 'WTF is a Reasoning Model, Test-Time Compute & GRPO?',
    summary: 'Critic-free Group Relative Policy Optimization paired with deterministic Verifiable Rewards (RLVR).',
    command: 'wtf grpo',
    moduleId: '05_post_training_rl',
    subTopicId: 'wtf-is-reasoning-grpo',
  },
  'agent-harness': {
    title: 'WTF is an Agent Harness & How Does a Model Turn a Request Into an Action?',
    summary: 'The deterministic runtime wrapping an LLM: tool schemas, stop-token interception, sandboxed execution, observation injection, and KV prefix caching.',
    command: 'wtf agent-harness',
    moduleId: '06_ai_systems_ops',
    subTopicId: 'wtf-is-agent-harness',
  },
  rag: {
    title: 'WTF is RAG, Vector Search (HNSW) & Hybrid Reranking?',
    summary: 'Hierarchical Navigable Small World graphs, BM25 + Dense Reciprocal Rank Fusion, and Cross-Encoder reranking.',
    command: 'wtf rag',
    moduleId: '06_ai_systems_ops',
    subTopicId: 'wtf-is-rag-vectordb',
  },
  flashattention: {
    title: 'WTF is GPU Inference, FlashAttention & PagedAttention?',
    summary: 'SRAM tiling with online softmax rescaling plus virtual block paging for KV caches in vLLM.',
    command: 'wtf flashattention',
    moduleId: '06_ai_systems_ops',
    subTopicId: 'wtf-is-flashattention-vllm',
  },
  sae: {
    title: 'WTF is Mechanistic Interpretability, Superposition & SAEs?',
    summary: 'Unpacking polysemantic neuron superposition polytopes into monosemantic features with Sparse Autoencoders.',
    command: 'wtf sae',
    moduleId: '07_interp_evals',
    subTopicId: 'wtf-is-superposition-sae',
  },
  evals: {
    title: 'WTF are AI Evals & Generalisation vs Failure Modes?',
    summary: 'Deterministic code graders, unbiased pass@k vs pass^k reliability, and TPR/TNR bias-corrected LLM judges.',
    command: 'wtf evals',
    moduleId: '07_interp_evals',
    subTopicId: 'wtf-is-ai-evals',
  },
  vlm: {
    title: 'WTF is a Vision Transformer (ViT), CLIP & Vision-Language Model?',
    summary: '16x16 image patchification, CLIP/SigLIP contrastive alignment, and multimodal MLP projectors.',
    command: 'wtf vlm',
    moduleId: '08_multimodal_world_gnn',
    subTopicId: 'wtf-is-vit-clip-vlm',
  },
  gnn: {
    title: 'WTF are Graph Neural Networks (GNNs) & E(3)-Equivariant AI?',
    summary: 'Permutation-invariant message passing and 3D rotational/translational equivariance for molecules.',
    command: 'wtf gnn',
    moduleId: '08_multimodal_world_gnn',
    subTopicId: 'wtf-is-gnn-geometric',
  },
  docker: {
    title: 'WTF is Docker for AI, Cog & Distributed 5D GPU Training?',
    summary: 'NVIDIA Container Toolkit, Replicate Cog (cog.yaml), and ZeRO/FSDP 16-bytes-per-param sharding.',
    command: 'wtf docker',
    moduleId: '09_prod_sdk_orchestration_deploy',
    subTopicId: 'wtf-is-docker-cog-gpu-deploy',
  },
  orchestration: {
    title: 'WTF is Multi-Agent Orchestration (Lead-Subagent, DAGs, Worktrees & MCP)?',
    summary: 'Context isolation via parallel subagents, Git worktrees, DAG task graphs, and Model Context Protocol.',
    command: 'wtf orchestration',
    moduleId: '09_prod_sdk_orchestration_deploy',
    subTopicId: 'wtf-is-multi-agent-orchestration',
  },
  sdk: {
    title: 'WTF Happens Under the Hood of NumPy, PyTorch (torch.compile) & OpenAI/DeepSeek SDKs?',
    summary: 'Zero-copy tensor strides, TorchInductor Triton kernel fusion, and universal AsyncOpenAI SSE streaming.',
    command: 'wtf sdk',
    moduleId: '09_prod_sdk_orchestration_deploy',
    subTopicId: 'wtf-is-numpy-pytorch-sdk-internals',
  },
};

export function findModuleByIdOrSlug(query: string): TaxonomyModule | undefined {
  const q = query.trim().toLowerCase();
  return TAXONOMY_MODULES.find(
    (m) =>
      m.id.toLowerCase() === q ||
      m.slug.toLowerCase() === q ||
      m.number === q ||
      m.title.toLowerCase().includes(q)
  );
}

export default TAXONOMY_MODULES;
