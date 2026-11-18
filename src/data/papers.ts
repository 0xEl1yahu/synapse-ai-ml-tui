import { CanonicalPaper } from '../types';

export const CANONICAL_PAPERS: CanonicalPaper[] = [
  {
    id: 'paper-attention-is-all-you-need',
    shortSlug: 'attention-is-all-you-need',
    title: 'Attention Is All You Need (The Transformer)',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin',
    year: 2017,
    venueOrArxiv: 'NeurIPS 2017 // arXiv:1706.03762',
    url: 'https://arxiv.org/abs/1706.03762',
    moduleId: '03_sequence_arch',
    subTopicId: 'wtf-is-attention',
    coupledSceneId: 'attention-rope',
    wtfInvention:
      'Self-attention computes token interactions in parallel. Full attention connects each token pair in one layer and computes a quadratic number of scores. Causal attention masks future tokens.',
    whatBrokeBefore:
      'LSTMs and GRUs had to process token t strictly after token t-1, starving thousands of GPU tensor cores of parallel work and crushing long-range context through a fixed hidden state.',
    coreEquation: 'Attention(Q, K, V) = softmax( Q K^T / sqrt(d_k) + M ) V',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  Input X: [B, T, d_model=512]                                           │',
      '│     ├──▸ Q = X W_Q ──▸ Reshape & Transpose ──▸ [B, h=8, T, d_k=64]      │',
      '│     ├──▸ K = X W_K ──▸ Reshape & Transpose ──▸ [B, h=8, T, d_k=64]      │',
      '│     └──▸ V = X W_V ──▸ Reshape & Transpose ──▸ [B, h=8, T, d_v=64]      │',
      '│                                                                         │',
      '│  Scores S = (Q @ K^T) / sqrt(64) + CausalMask ──▸ [B, h=8, T, T]        │',
      '│  Weights A = softmax(S, dim=-1)               ──▸ [B, h=8, T, T]        │',
      '│  Heads Out = A @ V ──▸ Concat ──▸ W_O         ──▸ [B, T, d_model=512]   │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // Linear Q, K, V Projections & Head Split',
        expression: 'Q_i = X W_i^Q,  K_i = X W_i^K,  V_i = X W_i^V',
        tensorShapes: 'X: [B, T, 512] -> Q, K, V: [B, 8, T, 64]',
        plainMeaning:
          'Split the 512-dim embedding into 8 parallel subspaces (heads) of 64 dimensions so each head can look for a different grammatical, syntactic, or code relationship simultaneously.',
      },
      {
        stepTitle: '02 // Scaled Dot-Product Affinity & Variance Preservation',
        expression: 'S = (Q K^T) / sqrt(d_k)',
        tensorShapes: '[B, 8, T, 64] @ [B, 8, 64, T] -> S: [B, 8, T, T]',
        plainMeaning:
          'Assuming independent, zero-mean, unit-variance components of q and k, their dot product has variance d_k = 64. Dividing by sqrt(64) = 8 gives unit variance under these assumptions and reduces the risk of softmax saturation.',
      },
      {
        stepTitle: '03 // Causal Masking & Value Aggregation',
        expression: 'O = Concat(softmax(S + M_causal) V) W^O',
        tensorShapes: '[B, 8, T, T] @ [B, 8, T, 64] -> [B, T, 512]',
        plainMeaning:
          'Set future positions j > i to -infinity before softmax so token i cannot cheat by peeking ahead, then take the weighted average of Value vectors V.',
      },
    ],
    minimalCode: `import math, torch
import torch.nn as nn
import torch.nn.functional as F

class MultiHeadSelfAttention(nn.Module):
    def __init__(self, d_model: int = 512, n_heads: int = 8):
        super().__init__()
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        self.qkv = nn.Linear(d_model, 3 * d_model, bias=False)
        self.proj = nn.Linear(d_model, d_model, bias=False)

    def forward(self, x: torch.Tensor):
        B, T, C = x.shape
        q, k, v = self.qkv(x).chunk(3, dim=-1)
        q = q.view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        k = k.view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        v = v.view(B, T, self.n_heads, self.d_k).transpose(1, 2)

        scores = (q @ k.transpose(-2, -1)) / math.sqrt(self.d_k)
        mask = torch.triu(torch.ones(T, T, device=x.device, dtype=torch.bool), diagonal=1)
        scores = scores.masked_fill(mask, float("-inf"))
        attn = F.softmax(scores, dim=-1)
        out = (attn @ v).transpose(1, 2).contiguous().view(B, T, C)
        return self.proj(out)`,
    productionImpact: [
      'Foundation of GPT-4, Claude, Gemini, Llama, DeepSeek, ViT, and Diffusion Transformers (DiT)',
      'Unlocked massive multi-GPU data & tensor parallelism during pre-training',
    ],
  },
  {
    id: 'paper-resnet',
    shortSlug: 'resnet',
    title: 'Deep Residual Learning for Image Recognition (ResNet)',
    authors: 'Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun',
    year: 2015,
    venueOrArxiv: 'CVPR 2016 // arXiv:1512.03385',
    url: 'https://arxiv.org/abs/1512.03385',
    moduleId: '02_deep_learning',
    subTopicId: 'wtf-is-residual-rmsnorm',
    coupledSceneId: 'neural-lattice',
    wtfInvention:
      'Introduced the additive skip connection x_{l+1} = x_l + F(x_l), creating an unimpeded gradient superhighway (the Residual Stream) that allowed networks to scale from 16 layers to 152+ layers.',
    whatBrokeBefore:
      'Stacking plain neural layers deeper than ~20 layers caused training loss itself to degrade because multiplying 50 layer Jacobians together either vanished gradients to 0 or scrambled them.',
    coreEquation: 'x_L = x_l + sum_{i=l}^{L-1} F(x_i, W_i)   =>   dL/dx_l = dL/dx_L * (I + d/dx_l sum F_i)',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  Residual Stream x_l ───────────────────────────┐ (Identity Highway +I) │',
      '│         │                                       │                       │',
      '│         └──▸ [RMSNorm] ──▸ [Layer F(x_l)] ──────┴──▸ (+) ──▸ x_{l+1}    │',
      '│                                                                         │',
      '│  Backward Pass: Upstream gradient dL/dx_L flows straight through (+I)   │',
      '│  to Layer 1 untouched, even if dF/dx_l is tiny!                         │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // Additive Residual Reformulation',
        expression: 'x_{l+1} = x_l + F(x_l, W_l)',
        tensorShapes: 'x_l: [B, T, d_model] -> x_{l+1}: [B, T, d_model]',
        plainMeaning:
          'Instead of forcing a layer to re-learn the identity mapping from scratch, let the layer learn only a small additive delta F(x_l) on top of the shared residual stream.',
      },
      {
        stepTitle: '02 // Identity Jacobian in Backpropagation',
        expression: 'dL / dx_l = dL / dx_L + dL / dx_L * (d / dx_l sum_{i=l}^{L-1} F_i)',
        tensorShapes: 'Gradient norm O(1) across arbitrary depth L',
        plainMeaning:
          'Because the derivative of x_l with respect to x_l is the Identity Matrix I, the first term dL/dx_L travels straight from the loss function back to the very first layer without being multiplied by any weights!',
      },
    ],
    minimalCode: `import torch
import torch.nn as nn

class PreNormResidualBlock(nn.Module):
    def __init__(self, d_model: int):
        super().__init__()
        self.norm = nn.RMSNorm(d_model)
        self.sublayer = nn.Sequential(
            nn.Linear(d_model, 4 * d_model),
            nn.SiLU(),
            nn.Linear(4 * d_model, d_model),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Clean residual stream highway (no activation function on the trunk!)
        return x + self.sublayer(self.norm(x))`,
    productionImpact: [
      'Every Transformer block in existence is a 2-step Pre-Norm Residual Block: x = x + Attn(Norm(x)); x = x + FFN(Norm(x))',
      'Forms the "Residual Stream" linear communication bus analyzed in Mechanistic Interpretability',
    ],
  },
  {
    id: 'paper-lora',
    shortSlug: 'lora',
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    authors: 'Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen',
    year: 2021,
    venueOrArxiv: 'ICLR 2022 // arXiv:2106.09685',
    url: 'https://arxiv.org/abs/2106.09685',
    moduleId: '00_foundations',
    subTopicId: 'wtf-is-vectors-svd',
    coupledSceneId: 'loss-landscape',
    wtfInvention:
      'Proved that fine-tuning weight updates have a tiny "intrinsic rank", allowing us to freeze the 70B base model and train two skinny rank-r matrices (Delta W = B A) using <1% of the parameters and VRAM.',
    whatBrokeBefore:
      'Full fine-tuning duplicated 12–16 bytes per parameter for FP32 master weights, gradients, and Adam optimizer states, requiring >780 GB of GPU memory just to adapt a 65B model.',
    coreEquation: 'h = W_0 x + (alpha / r) B A x,   where B in R^{d x r}, A in R^{r x k}, r << min(d, k)',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  Input x: [B, T, 4096]                                                  │',
      '│     ├──▸ Frozen W_0 [4096 x 4096] (16.7M params, 0 Adam states)         │',
      '│     └──▸ LoRA A [4096 x 16] ──▸ LoRA B [16 x 4096] (131K params, 0.78%) │',
      '│                                                                         │',
      '│  Deploy Merge: W_prod = W_0 + (alpha/r) * (B @ A) -> ZERO latency cost! │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // Asymmetric Zero Initialization',
        expression: 'A ~ N(0, sigma^2),   B = 0   =>   Delta W_0 = B A = 0',
        tensorShapes: 'A: [r=16, d_in=4096], B: [d_out=4096, r=16]',
        plainMeaning:
          'At step 0, B is all zeros so Delta W is exactly 0 (preserving pretrained behavior), while A is random Gaussian so the gradient dL/dB = (dL/dh)(Ax)^T is non-zero on step 1.',
      },
      {
        stepTitle: '02 // Zero-Overhead Inference Weight Folding',
        expression: 'W_merged = W_0 + (alpha / r) B A',
        tensorShapes: 'W_merged: [4096, 4096]',
        plainMeaning:
          'By linearity of matrix multiplication, W_0 x + (alpha/r) B A x = (W_0 + (alpha/r) B A) x. You fold the adapter into W_0 once before serving.',
      },
    ],
    minimalCode: `import math, torch
import torch.nn as nn

class LoRALinear(nn.Module):
    def __init__(self, base: nn.Linear, r: int = 16, alpha: float = 32.0):
        super().__init__()
        self.base = base
        self.base.weight.requires_grad_(False)
        self.scale = alpha / r
        self.lora_A = nn.Parameter(torch.empty(r, base.in_features))
        self.lora_B = nn.Parameter(torch.zeros(base.out_features, r))
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.base(x) + (x @ self.lora_A.T @ self.lora_B.T) * self.scale`,
    productionImpact: [
      'Standard method for fine-tuning open-weights LLMs and Diffusion models on a single consumer GPU (especially when paired with 4-bit NF4 QLoRA)',
      'Allows serving 100+ customer-specific LoRA adapters simultaneously on one shared base model in vLLM / Punica / S-LoRA',
    ],
  },
  {
    id: 'paper-flashattention',
    shortSlug: 'flashattention',
    title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    authors: 'Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Re',
    year: 2022,
    venueOrArxiv: 'NeurIPS 2022 // arXiv:2205.14135',
    url: 'https://arxiv.org/abs/2205.14135',
    moduleId: '06_ai_systems_ops',
    subTopicId: 'wtf-is-flashattention-vllm',
    coupledSceneId: 'attention-rope',
    wtfInvention:
      'Used GPU SRAM tiling and an "online softmax" rescaling recurrence to compute exact self-attention without ever reading or writing the quadratic N x N attention matrix to slow GPU HBM VRAM.',
    whatBrokeBefore:
      'Standard attention materialized an N x N matrix in HBM VRAM—At 32k context, that single intermediate matrix consumed gigabytes per head and left Tensor Cores waiting 90% of the time on memory wires.',
    coreEquation: 'm_new = max(m_old, m_tile),   O_new = diag(exp(m_old - m_new)) O_old + exp(S_tile - m_new) V_tile',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  HBM VRAM (80GB @ 3.3 TB/s) ──(Stream 128x64 Q, K, V Tiles)──▸          │',
      '│  On-Chip SRAM (256KB/SM @ 20+ TB/s)                                     │',
      '│     ├──▸ Compute S_ij = Q_i K_j^T / sqrt(d) inside registers            │',
      '│     ├──▸ Update running row max m_i & rescale previous output O_i       │',
      '│     └──▸ Write ONLY final O: [B, H, N, d] back to HBM (Zero N x N!)     │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // The Online Softmax Trick',
        expression: 'l_new = l_old * exp(m_old - m_new) + sum(exp(S_tile - m_new))',
        tensorShapes: 'SRAM Tile: [B_r=128, B_c=64] (Fits inside 192KB shared memory)',
        plainMeaning:
          'Normally softmax needs two passes over a full row (one for max/sum, one to divide). By multiplying the old accumulator by exp(m_old - m_new) whenever a new tile has a bigger max, you compute exact softmax in one streaming pass.',
      },
      {
        stepTitle: '02 // O(N) Memory Complexity & Backward Recomputation',
        expression: 'HBM Accesses: O(N^2 d^2 / M_sram) << O(N^2)',
        tensorShapes: 'Saved for backward: Output O [N, d] + logsumexp L [N, 1]',
        plainMeaning:
          'During backpropagation, instead of saving the giant N x N attention matrix from the forward pass, FlashAttention saves only the N-element logsumexp vector and recomputes attention tiles on the fly in SRAM—which is actually faster because it avoids HBM traffic!',
      },
    ],
    minimalCode: `import torch

def flash_attention_online_reference(Q: torch.Tensor, K: torch.Tensor, V: torch.Tensor, tile: int = 64):
    N, d = Q.shape
    scale = d ** -0.5
    O = torch.zeros_like(Q)
    m = torch.full((N, 1), float("-inf"), device=Q.device)
    l = torch.zeros((N, 1), device=Q.device)

    for j in range(0, N, tile):
        K_j, V_j = K[j:j+tile], V[j:j+tile]
        S_ij = (Q @ K_j.T) * scale
        m_ij = S_ij.max(dim=-1, keepdim=True).values
        m_new = torch.maximum(m, m_ij)
        alpha = torch.exp(m - m_new)
        P_ij = torch.exp(S_ij - m_new)
        l = l * alpha + P_ij.sum(dim=-1, keepdim=True)
        O = O * alpha + P_ij @ V_j
        m = m_new
    return O / l`,
    productionImpact: [
      'Built directly into PyTorch `F.scaled_dot_product_attention`, vLLM, TensorRT-LLM, and every modern LLM training cluster',
      'Enabled context windows to jump from 2,048 tokens to 128k–1M+ tokens',
    ],
  },
  {
    id: 'paper-roformer-rope',
    shortSlug: 'rope',
    title: 'RoFormer: Enhanced Transformer with Rotary Position Embedding (RoPE)',
    authors: 'Jianlin Su, Yu Lu, Shengfeng Pan, Ahmed Murtadha, Bo Wen, Yunfeng Liu',
    year: 2021,
    venueOrArxiv: 'Neurocomputing // arXiv:2104.09864',
    url: 'https://arxiv.org/abs/2104.09864',
    moduleId: '03_sequence_arch',
    subTopicId: 'wtf-is-transformer-rope',
    coupledSceneId: 'attention-rope',
    wtfInvention:
      'Encoded token positions by rotating 2D pairs of Query and Key vectors in the complex plane by angle m*theta_i, so attention dot products depend strictly on relative token distance (m - n).',
    whatBrokeBefore:
      'Additive position embeddings added position noise directly into the semantic residual stream and failed to generalize when sequence lengths exceeded training bounds.',
    coreEquation: '<R_m q, R_n k> = Re( sum_{i=0}^{d/2-1} q_i k_i^* exp(i * (m - n) * theta_i) )',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  Pair (q_0, q_1) at token index m:                                      │',
      '│  [ cos(m*theta)  -sin(m*theta) ] [ q_0 ]   Rotates vector on 2D clock!  │',
      '│  [ sin(m*theta)   cos(m*theta) ] [ q_1 ]                                │',
      '│  Dot product with k at index n depends ONLY on angle diff (m - n)*theta │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // Multi-Frequency Geometric Clock Bank',
        expression: 'theta_i = 10000^{-2i / d}   for i in [0, d/2)',
        tensorShapes: 'Frequencies: [d_head / 2]',
        plainMeaning:
          'Early dimension pairs rotate rapidly like a stopwatch second hand (capturing local syntax), while late dimension pairs rotate slowly like an hour hand (capturing long-range document structure).',
      },
      {
        stepTitle: '02 // Orthogonal Rotation Preserves Norm',
        expression: '(R_m q)^T (R_n k) = q^T R_m^T R_n k = q^T R_{n-m} k',
        tensorShapes: 'Zero trainable parameters added',
        plainMeaning:
          'Because rotation matrices are orthogonal (R_m^T R_n = R_{n-m}), absolute positions m and n cancel out inside the dot product, leaving pure relative distance n - m.',
      },
    ],
    minimalCode: `import torch

def apply_rope(x: torch.Tensor, pos: torch.Tensor, base: float = 10000.0) -> torch.Tensor:
    # x: [B, T, H, D], pos: [T]
    D = x.shape[-1]
    inv_freq = 1.0 / (base ** (torch.arange(0, D, 2, device=x.device).float() / D))
    angles = torch.outer(pos.float(), inv_freq)  # [T, D/2]
    cos, sin = angles.cos()[None, :, None, :], angles.sin()[None, :, None, :]
    x1, x2 = x[..., 0::2], x[..., 1::2]
    return torch.stack([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1).flatten(-2)`,
    productionImpact: [
      'Used in Llama-3, DeepSeek-V3, Qwen, Gemma, Mistral, and Flux (2D RoPE)',
      'Allows context length extension (128k+) via frequency interpolation (YaRN / NTK-aware scaling)',
    ],
  },
  {
    id: 'paper-deepseek-r1-grpo',
    shortSlug: 'deepseek-r1-grpo',
    title: 'DeepSeek-R1 & DeepSeekMath: Incentivizing Reasoning via GRPO',
    authors: 'Zhihong Shao et al. / DeepSeek-AI',
    year: 2025,
    venueOrArxiv: 'Nature / arXiv:2402.03300 & arXiv:2501.12948',
    url: 'https://arxiv.org/abs/2501.12948',
    moduleId: '05_post_training_rl',
    subTopicId: 'wtf-is-reasoning-grpo',
    coupledSceneId: 'loss-landscape',
    wtfInvention:
      'Eliminated PPO\'s massive Value Critic network via Group Relative Policy Optimization (GRPO) and proved that pure RL against deterministic verifiers (RLVR) causes self-verification and reasoning chains to emerge naturally.',
    whatBrokeBefore:
      'PPO required keeping a Value Critic network as large as the Policy in GPU memory (doubling VRAM) and struggled to assign token-level credit across 16,000-token reasoning traces.',
    coreEquation: 'A_i = (r_i - mean(r_1..r_G)) / std(r_1..r_G),   L_GRPO = E[ min(ratio * A_i, clip(ratio) * A_i) - beta * D_KL ]',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  Prompt q ──▸ Policy pi_theta samples Group G=8 Rollouts {o_1 .. o_8}   │',
      '│                       │                                                 │',
      '│                       ▼                                                 │',
      '│  Deterministic Verifier (Unit Test / Math Parser) ──▸ r = [1,0,1,0..]   │',
      '│                       │                                                 │',
      '│                       ▼                                                 │',
      '│  Group Z-Score Baseline: A_i = (r_i - mu_r) / sigma_r (0 Critic VRAM!)  │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // Group Rollout Sampling & Verifiable Grading',
        expression: 'o_1, ..., o_G ~ pi_{theta_old}(. | q),   r_i = Verifier(q, o_i)',
        tensorShapes: 'Rollouts: [B_prompts, G=8, seq_len]',
        plainMeaning:
          'For each coding or math problem, sample 8 parallel completions and grade them with a compiler or symbolic answer checker—no neural reward model to hack!',
      },
      {
        stepTitle: '02 // Critic-Free Group Advantage Normalization',
        expression: 'A_{i,t} = (r_i - mean(r)) / (std(r) + eps)',
        tensorShapes: 'Advantages broadcast across all tokens t of rollout i',
        plainMeaning:
          'The group mean acts as an automatic difficulty baseline for that exact prompt. Rollouts that beat the group average get positive advantage; rollouts below average get suppressed.',
      },
    ],
    minimalCode: `import torch

def grpo_loss(logp_new, logp_old, logp_ref, rewards, eps: float = 0.2, beta: float = 0.04):
    # rewards: [B, G], logp_*: [B, G, T]
    A = ((rewards - rewards.mean(dim=1, keepdim=True)) / (rewards.std(dim=1, keepdim=True) + 1e-6)).unsqueeze(-1)
    ratio = torch.exp(logp_new - logp_old)
    surr = torch.minimum(ratio * A, torch.clamp(ratio, 1.0 - eps, 1.0 + eps) * A)
    kl = torch.exp(logp_ref - logp_new) - (logp_ref - logp_new) - 1.0
    return -(surr - beta * kl).mean()`,
    productionImpact: [
      'Standard post-training algorithm for open-weights reasoning models, coding agents, and verifiable theorem provers',
      'Cuts RL post-training cluster VRAM requirements by ~50% compared to PPO',
    ],
  },
  {
    id: 'paper-dpo',
    shortSlug: 'dpo',
    title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model',
    authors: 'Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D. Manning, Chelsea Finn',
    year: 2023,
    venueOrArxiv: 'NeurIPS 2023 // arXiv:2305.18290',
    url: 'https://arxiv.org/abs/2305.18290',
    moduleId: '05_post_training_rl',
    subTopicId: 'wtf-is-rlhf-dpo',
    coupledSceneId: 'loss-landscape',
    wtfInvention:
      'Solved the KL-constrained RLHF objective in closed form so you can align an LLM directly on (chosen, rejected) preference pairs using simple binary cross-entropy—with zero RL loop or separate Reward Model.',
    whatBrokeBefore:
      'Classical RLHF required training a separate Reward Model, tuning unstable PPO hyperparameters, and keeping 4 models in memory simultaneously.',
    coreEquation: 'L_DPO = - E[ log sigmoid( beta * log(pi_theta(y_w|x)/pi_ref(y_w|x)) - beta * log(pi_theta(y_l|x)/pi_ref(y_l|x)) ) ]',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  Preference Pair (x, y_win, y_lose)                                     │',
      '│     ├──▸ Policy pi_theta  ──▸ log P_theta(y_w|x), log P_theta(y_l|x)    │',
      '│     └──▸ Frozen pi_ref    ──▸ log P_ref(y_w|x),   log P_ref(y_l|x)      │',
      '│  Implicit Reward r(x,y) = beta * log(pi_theta / pi_ref)                 │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // Closed-Form Optimal Policy Reparameterization',
        expression: 'r(x, y) = beta * log( pi*(y|x) / pi_ref(y|x) ) + beta * log Z(x)',
        tensorShapes: 'Scalar sequence log-likelihoods [B]',
        plainMeaning:
          'Any policy pi_theta paired with its reference policy pi_ref implicitly defines a reward function! Substituting this into the Bradley-Terry preference model cancels the intractable partition function Z(x).',
      },
    ],
    minimalCode: `import torch.nn.functional as F

def dpo_loss(pi_w, pi_l, ref_w, ref_l, beta: float = 0.1):
    margin = beta * ((pi_w - ref_w) - (pi_l - ref_l))
    return -F.logsigmoid(margin).mean()`,
    productionImpact: [
      'Powers offline preference alignment across Llama, Zephyr, Qwen, and enterprise post-training pipelines',
    ],
  },
  {
    id: 'paper-flow-matching',
    shortSlug: 'flow-matching',
    title: 'Flow Matching for Generative Modeling & Rectified Flow',
    authors: 'Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, Matt Le (Meta AI)',
    year: 2022,
    venueOrArxiv: 'ICLR 2023 // arXiv:2210.02747',
    url: 'https://arxiv.org/abs/2210.02747',
    moduleId: '04_generative_ai',
    subTopicId: 'wtf-is-flow-matching',
    coupledSceneId: 'flow-matching',
    wtfInvention:
      'Replaced curved stochastic diffusion paths with straight-line Optimal Transport ODE trajectories x_t = (1-t)x_0 + t x_1, enabling 4-to-8 step generation of images, video, audio, and robot actions.',
    whatBrokeBefore:
      'Diffusion SDEs followed curved trajectories that accumulated high truncation error unless integrated over 50–1,000 denoising steps.',
    coreEquation: 'x_t = (1 - t)x_0 + t x_1,   L_CFM(theta) = E_{t, x_0, x_1}[ || v_theta(x_t, t) - (x_1 - x_0) ||_2^2 ]',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  Noise x_0 ~ N(0,I) ══════(Straight Line x_t)══════▸ Data x_1           │',
      '│  Target Velocity along ray: dx_t / dt = x_1 - x_0 (Constant!)           │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // Straight-Line Optimal Transport Interpolant',
        expression: 'x_t = (1 - t) x_0 + t x_1,   dx_t / dt = x_1 - x_0',
        tensorShapes: 'x_0, x_1, x_t: [B, C, H, W]',
        plainMeaning:
          'Draw a straight line in latent space between a random noise sample x_0 and a real data sample x_1. The velocity along a straight line is constant: x_1 - x_0.',
      },
    ],
    minimalCode: `import torch

def conditional_flow_matching_loss(v_net, x1: torch.Tensor):
    x0 = torch.randn_like(x1)
    t = torch.rand(x1.size(0), 1, 1, 1, device=x1.device)
    xt = (1.0 - t) * x0 + t * x1
    return ((v_net(xt, t.squeeze()) - (x1 - x0)) ** 2).mean()`,
    productionImpact: [
      'Backbone of Black Forest Labs FLUX, Stable Diffusion 3, Meta MovieGen, and pi_0 Robotics VLA models',
    ],
  },
  {
    id: 'paper-pagedattention-vllm',
    shortSlug: 'pagedattention',
    title: 'Efficient Memory Management for LLM Serving with PagedAttention (vLLM)',
    authors: 'Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Ion Stoica et al.',
    year: 2023,
    venueOrArxiv: 'SOSP 2023 // arXiv:2309.06180',
    url: 'https://arxiv.org/abs/2309.06180',
    moduleId: '06_ai_systems_ops',
    subTopicId: 'wtf-is-flashattention-vllm',
    coupledSceneId: 'neural-lattice',
    wtfInvention:
      'Brought operating-system virtual memory paging to the GPU KV cache, storing Keys and Values in non-contiguous 16-token physical blocks to eliminate memory fragmentation and boost serving throughput by 2–4x.',
    whatBrokeBefore:
      'Serving frameworks pre-allocated contiguous VRAM for every request\'s maximum possible length (e.g. 8192 tokens), wasting 60–80% of GPU memory on empty reserved slots.',
    coreEquation: 'PhysicalBlock = PageTable[request_id][ floor(token_idx / BlockSize) ]',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  Logical KV Tokens: [Block 0: Tok 0..15] ──▸ Physical VRAM Block #42    │',
      '│                     [Block 1: Tok 16..31] ──▸ Physical VRAM Block #07   │',
      '│  Shared System Prompt Prefix ──▸ RefCount=8 (Zero duplicate VRAM!)      │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // Non-Contiguous KV Block Table Lookup',
        expression: 'KV_cache_waste < 4% (only inside the final partially filled 16-token block)',
        tensorShapes: 'Block shape: [2, n_kv_heads, block_size=16, d_head]',
        plainMeaning:
          'Just like Linux virtual memory maps logical pages to physical RAM frames on demand, PagedAttention allocates a new 16-token block only when a sequence actually generates token 17.',
      },
    ],
    minimalCode: `# Conceptual PagedAttention Block Allocator
class KVBlockTable:
    def __init__(self, num_blocks: int = 1024, block_size: int = 16):
        self.block_size = block_size
        self.free_blocks = list(range(num_blocks))
        self.seq_tables: dict[int, list[int]] = {}

    def append_token(self, seq_id: int, token_pos: int) -> tuple[int, int]:
        table = self.seq_tables.setdefault(seq_id, [])
        if token_pos % self.block_size == 0:
            table.append(self.free_blocks.pop())
        return table[token_pos // self.block_size], token_pos % self.block_size`,
    productionImpact: [
      'Powers vLLM, TensorRT-LLM, and SGLang across virtually all production LLM inference clusters',
    ],
  },
  {
    id: 'paper-superposition-sae',
    shortSlug: 'superposition-sae',
    title: 'Toy Models of Superposition & Scaling Monosemanticity (Sparse Autoencoders)',
    authors: 'Nelson Elhage, Trenton Bricken, Adly Templeton, Chris Olah et al. (Anthropic)',
    year: 2023,
    venueOrArxiv: 'Transformer Circuits Thread // Anthropic 2022–2024',
    url: 'https://transformer-circuits.pub/2023/monosemantic-features/index.html',
    moduleId: '07_interp_evals',
    subTopicId: 'wtf-is-superposition-sae',
    coupledSceneId: 'superposition-sae',
    wtfInvention:
      'Explained why individual neurons are polysemantic (packing M >> D sparse concepts into almost-orthogonal polytopes) and proved overcomplete Sparse Autoencoders (SAEs) can extract clean, steerable monosemantic features.',
    whatBrokeBefore:
      'Inspecting individual neurons in LLMs revealed chaotic mixtures of unrelated concepts (code, poetry, chemistry), making mechanistic auditing seem impossible.',
    coreEquation: 'f(x) = ReLU(W_enc(x - b_dec) + b_enc),   x_hat = W_dec f(x) + b_dec,   L = ||x - x_hat||_2^2 + lambda ||f(x)||_1',
    tensorFlowAscii: [
      '┌─────────────────────────────────────────────────────────────────────────┐',
      '│  Polysemantic Residual Stream x [d_model = 4,096]                       │',
      '│         │                                                               │',
      '│         ▼                                                               │',
      '│  SAE Overcomplete Dictionary f(x) [d_sae = 65,536] (L0 ≈ 25 active!)    │',
      '└─────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    equationSteps: [
      {
        stepTitle: '01 // Johnson-Lindenstrauss Quasi-Orthogonal Packing',
        expression: 'max_{i != j} |w_i . w_j| <= eps   =>   M <= O(exp(eps^2 * D)) features',
        tensorShapes: 'W_dec: [d_sae=65536, d_model=4096] with unit-norm rows',
        plainMeaning:
          'In 4,096 dimensions, you can fit exponentially many vectors that are 89-degrees apart instead of 90-degrees apart, using ReLU thresholds to zero out the small interference cross-talk.',
      },
    ],
    minimalCode: `import torch, torch.nn as nn, torch.nn.functional as F

class TopKSparseAutoencoder(nn.Module):
    def __init__(self, d_model: int = 4096, d_sae: int = 65536, k: int = 32):
        super().__init__()
        self.k = k
        self.W_enc = nn.Linear(d_model, d_sae)
        self.W_dec = nn.Linear(d_sae, d_model, bias=True)

    def forward(self, x: torch.Tensor):
        pre_acts = F.relu(self.W_enc(x - self.W_dec.bias))
        vals, idx = torch.topk(pre_acts, k=self.k, dim=-1)
        f = torch.zeros_like(pre_acts).scatter_(-1, idx, vals)
        return self.W_dec(f), f`,
    productionImpact: [
      'Used in Anthropic Claude 3 Sonnet SAE feature steering and Google DeepMind Gemma Scope',
    ],
  },
];

export default CANONICAL_PAPERS;
