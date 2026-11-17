import { TaxonomyModule } from '../types';

export const MODULES_PART_2: TaxonomyModule[] = [
  {
    id: '04_generative_ai',
    number: '04',
    slug: 'generative-ai',
    filePath: '~/wtfis-ai/04_generative_ai/index.md',
    title: 'Generative AI: Autoregressive LLMs, Diffusion & Flow Matching',
    shortTitle: 'Generative AI',
    subtitle: 'How models synthesize text, images, video, and continuous worlds from noise and tokens.',
    layerCategory: 'FRONTIER_GENAI',
    defaultSceneId: 'flow-matching',
    estimatedHours: 28,
    prerequisites: ['00_foundations', '02_deep_learning', '03_sequence_arch'],
    coreTools: ['HuggingFace Transformers', 'Diffusers', 'tiktoken', 'PyTorch', 'vLLM'],
    mentalModelSummary:
      'Discrete autoregressive models factor joint probabilities token-by-token via P(x_t | x_<t), whereas continuous generative models (Diffusion & Flow Matching) learn a vector field that transports Gaussian noise N(0,I) onto the complex data manifold.',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│        DISCRETE AUTOREGRESSION vs CONTINUOUS FLOW MATCHING ODE             │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│  [AUTOREGRESSIVE LLM]                                                      │',
      '│  Text ▸ [BPE Tokenizer] ▸ [Causal Transformer] ▸ Softmax P(x_t | x_<t)     │',
      '│                                                                            │',
      '│  [DIFFUSION SDE vs FLOW MATCHING ODE]                                      │',
      '│  Noise x_0 ~ N(0,I) ──(DDPM Curved Stochastic SDE)──▸ Data Manifold x_1    │',
      '│  Noise x_0 ~ N(0,I) ══(Flow Matching Straight ODE)══▸ v_theta(x_t,t)=x1-x0 │',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: 'wtf-is-llm-tokenization',
        title: 'WTF is Tokenization (BPE), Pre-Training & Scaling Laws?',
        commandSlug: 'wtf-is-llm-tokenization',
        wtfQuestion: 'How does an LLM read raw text, why does it struggle to count letters in "strawberry", and how do we know how big to make a model vs its dataset?',
        plainEnglish:
          'LLMs never see words or individual characters—they see integer IDs called tokens produced by Byte-Pair Encoding (BPE). BPE starts with raw UTF-8 bytes and repeatedly merges the most frequent adjacent pairs into single vocabulary tokens (around 100k–128k tokens in modern models). Because "strawberry" gets merged into chunks like ["str", "aw", "berry"], the model sees 3 opaque integers rather than individual "r" characters! During pre-training, the model plays one game trillions of times: given tokens 1 to t, predict probability distribution of token t+1. Chinchilla Scaling Laws proved that to minimize loss for a fixed compute budget C ≈ 6*N*D, parameter count N and training tokens D must scale together (roughly 20+ tokens per parameter, or 100+ tokens/param when optimizing for cheap inference).',
        whyItMatters:
          'Tokenization controls context window efficiency, multilingual fertility, arithmetic accuracy, and code indentation overhead. Scaling laws dictate whether you should train a 70B model for 1T tokens or an 8B model for 15T tokens so inference fits on a single GPU.',
        realWorldSystems: [
          'OpenAI tiktoken (cl100k_base / o200k_base)',
          'Llama-3 / DeepSeek-V3 Pre-Training Pipelines',
          'Speculative Decoding (Draft + Parallel Verifier Engines)',
        ],
        summary:
          'Byte-Pair Encoding compresses raw byte streams into subword integer IDs, while Chinchilla & inference-aware scaling laws govern the optimal balance between model parameters N and training tokens D.',
        deepDiveParagraphs: [
          'Byte-Pair Encoding (BPE) operates at the UTF-8 byte level (base vocabulary of 256 bytes) so it never encounters an <UNK> out-of-vocabulary token. During tokenizer training, it counts all adjacent token pairs and merges the highest-frequency pair into a new token ID until reaching vocabulary size V (e.g., 128,256). A larger vocabulary V compresses text into fewer tokens (reducing quadratic attention cost and KV cache footprint) at the cost of a heavier embedding/unembedding matrix (V x d_model).',
          'Autoregressive language modeling applies the chain rule of probability: log P(x_1, ..., x_T) = sum_{t=1}^T log P_theta(x_t | x_{<t}). Because causal masking prevents token t from attending to future tokens > t, all T predictions in a sequence are trained simultaneously in a single forward/backward pass on the GPU.',
          'Hoffmann et al. (Chinchilla, 2022) modeled pre-training loss as a parametric power law L(N, D) = E + A / N^alpha + B / D^beta, where E is the irreducible entropy of natural text, N is parameter count, and D is token count. However, modern open-weights models (Llama-3, Qwen, Gemma) intentionally "overtrain" small models (e.g., 8B parameters on 15 Trillion tokens—nearly 10x past Chinchilla optimality) because pre-training happens once, whereas inference compute is paid billions of times in production.',
        ],
        keyTakeaways: [
          'Byte-level BPE guarantees lossless encoding of any UTF-8 string while balancing sequence length against embedding table memory.',
          'Autoregressive training maximizes exact log-likelihood across all sequence positions in parallel via causal triangular attention masks.',
          'Compute required for one forward + backward pass of a dense Transformer is approximately C ≈ 6 * N * D FLOPs.',
          'Speculative Decoding speeds up memory-bound autoregressive generation by 2–3x without changing output distribution: a tiny draft model proposes K tokens, and the target LLM verifies all K in a single parallel forward pass.',
        ],
        mathFormulas: [
          {
            id: 'chinchilla-scaling-law',
            title: 'Chinchilla Parametric Scaling Law & FLOP Budget',
            latexLike: 'L(N, D) = E + A / N^α + B / D^β     subject to   C ≈ 6 N D',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Total Loss L(N,D) = E (Irreducible Entropy)                         │',
              '│                    + A / N^0.34 (Model Capacity Bottleneck)          │',
              '│                    + B / D^0.28 (Data Scarcity Bottleneck)           │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Making a model bigger without feeding it proportionally more data wastes FLOPs, and feeding endless data to a tiny model hits a capacity wall.',
            variables: [
              { symbol: 'N', name: 'Non-embedding parameter count', role: 'Controls functional approximation capacity (2N FLOPs forward, 4N backward per token)' },
              { symbol: 'D', name: 'Training dataset tokens', role: 'Total tokens processed during pre-training' },
              { symbol: 'E', name: 'Entropy floor (~1.69 nats)', role: 'Intrinsic unpredictability of human language' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Minimal Byte-Pair Encoding (BPE) Tokenizer & Speculative Verification Step',
            language: 'python',
            description: 'From-scratch BPE merge loop plus exact rejection sampling used in Speculative Decoding.',
            code: `from collections import Counter

def train_bpe(text: str, num_merges: int = 10):
    ids = list(text.encode("utf-8"))
    merges = {}
    for i in range(num_merges):
        pairs = Counter(zip(ids, ids[1:]))
        if not pairs:
            break
        best_pair = max(pairs, key=pairs.get)
        new_id = 256 + i
        merges[best_pair] = new_id
        # Replace best_pair across sequence
        out, idx = [], 0
        while idx < len(ids):
            if idx < len(ids) - 1 and (ids[idx], ids[idx + 1]) == best_pair:
                out.append(new_id)
                idx += 2
            else:
                out.append(ids[idx])
                idx += 1
        ids = out
    return ids, merges`,
          },
        ],
        pitfalls: [
          'Trailing whitespace bugs: Passing prompt="SELECT * FROM " with a trailing space splits the final BPE token differently than "SELECT * FROM", degrading completion accuracy.',
          'Glitch tokens: Rare strings present in tokenizer training corpora but filtered out of pre-training data leave uninitialized rows in the embedding matrix.',
        ],
      },
      {
        id: 'wtf-is-diffusion',
        title: 'WTF is a Diffusion Model & Score Matching?',
        commandSlug: 'wtf-is-diffusion',
        wtfQuestion: 'How can a neural network generate photorealistic images just by learning how to subtract static Gaussian noise?',
        plainEnglish:
          'Imagine dropping a drop of ink into a glass of water: over time, random molecular collisions spread the ink into uniform gray cloudiness. Reversing that process directly seems impossible—unless you record the microscopic statistical push at every millisecond. A Denoising Diffusion Model takes clean images x_0 and progressively corrupts them with Gaussian noise over T steps until only pure static x_T ~ N(0,I) remains. A neural network (U-Net or Diffusion Transformer DiT) is trained on a remarkably simple regression task: given a noisy image x_t and timestamp t, predict the exact noise vector epsilon that was added. Subtracting a fraction of that predicted noise step-by-step walks the sample uphill along the log-probability gradient (the Score Function) back to a crisp image.',
        whyItMatters:
          'Diffusion and Score-Based SDEs unlocked high-dimensional continuous synthesis across images, video, 3D geometry, protein folding (AlphaFold3), and audio without the mode-collapse instabilities of GANs.',
        realWorldSystems: [
          'Stable Diffusion / SDXL & Latent Diffusion',
          'Diffusion Transformers (DiT) in Sora & Video Generators',
          'AlphaFold 3 Molecular Coordinate Diffusion',
        ],
        summary:
          'Diffusion models reverse a forward Gaussian corruption process by estimating the Stein score function nabla_x log p_t(x) via noise prediction.',
        deepDiveParagraphs: [
          'In the forward diffusion process, we define a variance schedule beta_1, ..., beta_T. Using the reparameterization trick with alpha_bar_t = prod_{s=1}^t (1 - beta_s), we can jump directly from a clean sample x_0 to any noise level t in closed form: x_t = sqrt(alpha_bar_t) x_0 + sqrt(1 - alpha_bar_t) epsilon, where epsilon ~ N(0, I).',
          'Song et al. unified discrete DDPMs with Score-Based Generative Modeling through Stochastic Differential Equations (SDEs). The predicted noise epsilon_theta(x_t, t) is directly proportional to the Stein score function—the gradient of the log probability density with respect to data: nabla_{x_t} log p_t(x_t) = -epsilon_theta(x_t, t) / sqrt(1 - alpha_bar_t). Following this score vector pushes arbitrary noise particles toward high-density regions of the data manifold.',
          'Running diffusion directly in 1024x1024x3 pixel space is computationally prohibitive. Latent Diffusion Models (LDMs) first compress images 8x spatially into a compact latent space z via a perceptual VAE, and replace convolutional U-Nets with scalable Diffusion Transformers (DiT) modulated via Adaptive LayerNorm (adaLN-Zero).',
        ],
        keyTakeaways: [
          'The closed-form forward kernel x_t = sqrt(alpha_bar_t) x_0 + sqrt(1 - alpha_bar_t) eps allows sampling arbitrary timesteps t during training in O(1).',
          'Noise prediction is mathematically equivalent to estimating the score vector field nabla_x log p_t(x).',
          'Classifier-Free Guidance (CFG) amplifies prompt adherence by extrapolating between conditional and unconditional score predictions: eps_cfg = eps_uncond + w * (eps_cond - eps_uncond).',
        ],
        mathFormulas: [
          {
            id: 'ddpm-forward-score',
            title: 'Closed-Form Forward Corruption & Score Equivalence',
            latexLike: 'x_t = √(ᾱ_t) x_0 + √(1 - ᾱ_t) ε,     ∇_{x_t} log p_t(x_t) = - ε_θ(x_t, t) / √(1 - ᾱ_t)',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  x_t   =   sqrt(alpha_bar_t) * x_0   +   sqrt(1 - alpha_bar_t) * eps │',
              '│  Noisy     Signal Attenuation            Isotropic Gaussian Noise    │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'At any noise level t, the direction pointing back toward the clean data manifold is simply the negative of the added noise scaled by the noise standard deviation.',
            variables: [
              { symbol: 'ᾱ_t', name: 'Cumulative signal retention', role: 'Monotonically decreases from 1.0 (t=0) toward 0.0 (t=T)' },
              { symbol: 'ε_θ', name: 'Denoising network', role: 'U-Net or DiT predicting the Gaussian noise realization' },
              { symbol: '∇_x log p_t', name: 'Stein Score Function', role: 'Vector field pointing toward higher data probability density' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'PyTorch DDPM Training Step & Classifier-Free Guidance',
            language: 'python',
            description: 'Exact forward noise injection and MSE score-matching loss.',
            code: `import torch
import torch.nn.functional as F

def ddpm_training_loss(model, x0: torch.Tensor, alpha_bar: torch.Tensor):
    B = x0.size(0)
    t = torch.randint(0, len(alpha_bar), (B,), device=x0.device)
    eps = torch.randn_like(x0)
    a_bar = alpha_bar[t].view(B, 1, 1, 1)
    # Jump to timestep t in O(1)
    x_t = torch.sqrt(a_bar) * x0 + torch.sqrt(1.0 - a_bar) * eps
    eps_pred = model(x_t, t)
    return F.mse_loss(eps_pred, eps)`,
          },
        ],
        pitfalls: [
          'Zero-Terminal SNR bug: Standard linear beta schedules leave tiny residual signal at t=T during training, causing washed-out contrast when sampling from pure Gaussian noise at inference.',
          'High CFG scale burn: Setting Classifier-Free Guidance w > 10 saturates latent channels and creates high-frequency visual artifacts.',
        ],
      },
      {
        id: 'wtf-is-flow-matching',
        title: 'WTF is Flow Matching & Optimal Transport?',
        commandSlug: 'wtf-is-flow-matching',
        wtfQuestion: 'Why did frontier image, audio, and robotics models ditch curved diffusion paths for straight-line Flow Matching?',
        plainEnglish:
          'Traditional diffusion models take a curved, drunken random walk from noise to data, requiring 30 to 100 neural network evaluations to carefully step along the curve without flying off course. Flow Matching asks a dead-simple geometric question: what if we connect each noise point x_0 to a data point x_1 with a perfectly straight line x_t = (1 - t)*x_0 + t*x_1, and train the neural network to predict the constant velocity vector v = x_1 - x_0 along that line? Because a straight line has zero curvature, an ODE solver like Euler can take giant leaps from t=0 to t=1 in just 4 to 8 steps!',
        whyItMatters:
          'Flow Matching (and Rectified Flows) powers Flux, Stable Diffusion 3, modern audio synthesis, and Flow-GRPO robotics control policies because straight optimal-transport trajectories slash inference latency and simplify training.',
        realWorldSystems: [
          'Black Forest Labs FLUX & SD3 Rectified Flow Transformers',
          'Meta MovieGen & AudioBox Continuous Normalizing Flows',
          'Physical Intelligence pi_0 Robotics Action Flow Matching',
        ],
        summary:
          'Conditional Flow Matching regresses a continuous velocity vector field v_theta(x_t, t) onto straight-line Optimal Transport interpolants x_t = (1-t)x_0 + t x_1.',
        deepDiveParagraphs: [
          'Continuous Normalizing Flows (CNFs) define a time-dependent velocity field v_t(x) that pushes samples forward via the ordinary differential equation (ODE) dx_t / dt = v_t(x_t). Historically, training CNFs required expensive trace computations through ODE solvers during backpropagation.',
          'Lipman et al. (Flow Matching) and Liu et al. (Rectified Flow) proved that you can train v_theta(x_t, t) without any ODE simulation at train time by conditioning on pairs (x_0, x_1). Using the Optimal Transport linear interpolant x_t = (1 - t) x_0 + t x_1, the instantaneous target velocity is simply dx_t / dt = x_1 - x_0. Minimizing the conditional L2 loss E_{t, x_0, x_1} [ || v_theta(x_t, t) - (x_1 - x_0) ||^2 ] converges to the exact marginal probability path!',
        ],
        keyTakeaways: [
          'Linear interpolation x_t = (1-t)x_0 + t x_1 yields constant target velocity u_t(x_t | x_0, x_1) = x_1 - x_0.',
          'Straight transport paths minimize discretization truncation error in Euler ODE solvers, enabling high-quality 4-to-8 step generation.',
          'Logit-Normal timestep sampling concentrates training compute around t = 0.5 where trajectory crossings are hardest to resolve.',
        ],
        mathFormulas: [
          {
            id: 'conditional-flow-matching',
            title: 'Optimal Transport Conditional Flow Matching Objective',
            latexLike: 'x_t = (1 - t)x_0 + t x_1,     L_CFM(θ) = E_{t, x_0, x_1} [ || v_θ(x_t, t) - (x_1 - x_0) ||_2^2 ]',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  x_0 ~ N(0,I) ──────────▸ x_t = (1-t)x_0 + t*x_1 ──────────▸ x_1     │',
              '│  Velocity Target: dx_t/dt = (x_1 - x_0)  (Constant along straight ray)│',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Draw a straight ruler between a random noise vector x_0 and a real data sample x_1, pick a random point t along the ruler, and train the network to point straight toward x_1.',
            variables: [
              { symbol: 'v_θ(x_t, t)', name: 'Learned velocity field', role: 'Neural network predicting instantaneous ODE tangent vector' },
              { symbol: 'x_1 - x_0', name: 'Optimal transport direction', role: 'Constant displacement vector from source noise to target data' },
              { symbol: 't ∈ [0,1]', name: 'Continuous flow time', role: 'Interpolates smoothly from noise (t=0) to data manifold (t=1)' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Complete Flow Matching Training & 8-Step Euler ODE Sampler',
            language: 'python',
            description: 'Zero-SDE straight-line flow training and fast deterministic Euler integration.',
            code: `import torch

def flow_matching_loss(v_net, x1: torch.Tensor):
    x0 = torch.randn_like(x1)
    # Logit-normal timestep sampling (concentrates near t=0.5)
    t = torch.sigmoid(torch.randn(x1.size(0), 1, device=x1.device))
    x_t = (1.0 - t) * x0 + t * x1
    target_v = x1 - x0
    pred_v = v_net(x_t, t)
    return ((pred_v - target_v) ** 2).mean()

@torch.no_grad()
def euler_flow_sample(v_net, shape, steps: int = 8, device="cuda"):
    x = torch.randn(shape, device=device)
    dt = 1.0 / steps
    for i in range(steps):
        t = torch.full((shape[0], 1), i * dt, device=device)
        x = x + dt * v_net(x, t)
    return x`,
          },
        ],
        pitfalls: [
          'Trajectory intersections at t ≈ 0.5: When independent (x_0, x_1) pairs cross in space, v_theta predicts the conditional expectation, slightly curving the marginal flow unless reflow/distillation is applied.',
        ],
      },
    ],
  },
  {
    id: '05_post_training_rl',
    number: '05',
    slug: 'post-training-rl',
    filePath: '~/wtfis-ai/05_post_training_rl/index.md',
    title: 'Post-Training, Reinforcement Learning & Reasoning Models (PPO, DPO, GRPO)',
    shortTitle: 'RL & Reasoning',
    subtitle: 'How base token predictors become aligned assistants and self-verifying System-2 reasoners.',
    layerCategory: 'FRONTIER_GENAI',
    defaultSceneId: 'loss-landscape',
    estimatedHours: 30,
    prerequisites: ['00_foundations', '02_deep_learning', '03_sequence_arch'],
    coreTools: ['TRL', 'vLLM', 'OpenRLHF', 'verl', 'Gymnasium'],
    mentalModelSummary:
      'Pre-training teaches a model what exists on the internet; Post-Training & Reinforcement Learning reshape the probability landscape by amplifying trajectories that achieve high human preference (RLHF/DPO) or pass verifiable programmatic checks (RLVR/GRPO).',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│              GRPO & VERIFIABLE REASONING POST-TRAINING LOOP                │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│  Prompt q ──▸ [Policy pi_theta] ──▸ Sample Group {o_1, o_2, ..., o_G}      │',
      '│                                            │                               │',
      '│  [No Critic Network Needed!]               ▼                               │',
      '│  Advantage A_i = (r_i - mean(r))/std(r) ◂── [Verifier: Compiler/Math Test] │',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: 'wtf-is-reinforcement-learning',
        title: 'WTF is Reinforcement Learning (MDPs, Q-Learning & PPO)?',
        commandSlug: 'wtf-is-reinforcement-learning',
        wtfQuestion: 'How do you train a neural network when there is no "correct label", only a delayed reward signal at the end of a game or reasoning chain?',
        plainEnglish:
          'In supervised learning, a teacher hands the model the exact right answer after every guess. In Reinforcement Learning (RL), the model is an agent dropped into an environment (a game, a robot body, or a code terminal): it takes a sequence of actions and only gets a scalar reward r at the end (e.g., +1 for passing unit tests, -1 for crashing). Because sampling discrete actions is non-differentiable, the Policy Gradient trick (REINFORCE / PPO) differentiates the log-probability of the chosen action weighted by its "Advantage" (how much better that action turned out than expected). Proximal Policy Optimization (PPO) clips how far the policy can jump in a single update so a lucky rollout does not collapse the entire network.',
        whyItMatters:
          'RL is the engine behind AlphaGo, robotic locomotion, RLHF alignment, and modern autonomous coding and math reasoning agents.',
        realWorldSystems: [
          'OpenAI PPO Post-Training Infrastructure',
          'DeepMind AlphaZero & MuZero',
          'Autonomous Robotics Locomotion Controllers',
        ],
        summary:
          'Reinforcement Learning optimizes sequential decision-making in Markov Decision Processes via Bellman value recursion and clipped surrogate policy gradients (PPO).',
        deepDiveParagraphs: [
          'A Markov Decision Process (MDP) is defined by states S, actions A, transition dynamics P(s\'|s,a), and rewards R(s,a). The Bellman optimality equation states that the value of a state is the immediate reward plus the discounted value of the best next state: Q*(s,a) = r + gamma * E[max_{a\'} Q*(s\', a\')].',
          'Policy Gradient methods directly parameterize the stochastic policy pi_theta(a|s). Using the log-derivative identity nabla_theta P_theta(tau) = P_theta(tau) nabla_theta log P_theta(tau), we can estimate the gradient of expected return without differentiating through the environment dynamics.',
          'Schulman et al. introduced PPO to prevent destructive policy updates when doing multiple epochs on a batch of rollout data. By clipping the probability ratio r_t(theta) = pi_theta(a_t|s_t) / pi_old(a_t|s_t) to [1 - epsilon, 1 + epsilon], PPO removes the incentive to push probabilities excessively far in a single step.',
        ],
        keyTakeaways: [
          'The log-derivative trick turns non-differentiable environment sampling into an expectation of grad_theta log pi_theta(a|s) * A_t.',
          'Advantage A(s,a) = Q(s,a) - V(s) centers rewards around a baseline, drastically reducing gradient variance.',
          'PPO clips the importance-sampling ratio r_t(theta) inside [1 - eps, 1 + eps] to enforce a trust region without computing second-order Fisher matrices.',
        ],
        mathFormulas: [
          {
            id: 'ppo-clipped-objective',
            title: 'PPO Clipped Surrogate Objective',
            latexLike: 'L_CLIP(θ) = E_t [ min( r_t(θ) Â_t,  clip(r_t(θ), 1 - ε, 1 + ε) Â_t ) ]',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  r_t(theta) = pi_theta(a_t | s_t) / pi_old(a_t | s_t)                │',
              '│  If A_t > 0 (Good Action): Cap ratio increase at (1 + eps)           │',
              '│  If A_t < 0 (Bad Action):  Cap ratio decrease at (1 - eps)           │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Increase the probability of actions that beat expectations (Â_t > 0), decrease actions that underperformed (Â_t < 0), but stop updating once the probability ratio changes by more than ±20%.',
            variables: [
              { symbol: 'r_t(θ)', name: 'Probability ratio', role: 'Measures policy drift between current policy and rollout policy' },
              { symbol: 'Â_t', name: 'Generalized Advantage Estimate', role: 'How much better action a_t performed vs baseline value V(s_t)' },
              { symbol: 'ε', name: 'Clipping threshold (~0.2)', role: 'Prevents catastrophic policy collapse across mini-batch epochs' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'PyTorch PPO Clipped Surrogate Loss with KL Penalty',
            language: 'python',
            description: 'Exact token-level PPO loss used in RL post-training.',
            code: `import torch

def ppo_loss(logprobs_new, logprobs_old, advantages, clip_eps=0.2):
    ratio = torch.exp(logprobs_new - logprobs_old)
    surr1 = ratio * advantages
    surr2 = torch.clamp(ratio, 1.0 - clip_eps, 1.0 + clip_eps) * advantages
    policy_loss = -torch.min(surr1, surr2).mean()
    approx_kl = (logprobs_old - logprobs_new).mean()
    return policy_loss, approx_kl`,
          },
        ],
        pitfalls: [
          'Reward Hacking (Goodhart\'s Law): Policies exploit loopholes in proxy reward models (e.g., outputting verbose markdown tables or sycophantic praise) unless regularized by a KL penalty or deterministic verifier.',
        ],
      },
      {
        id: 'wtf-is-rlhf-dpo',
        title: 'WTF is Alignment (SFT, RLHF & Direct Preference Optimization)?',
        commandSlug: 'wtf-is-rlhf-dpo',
        wtfQuestion: 'How do we align a raw base model with human preferences without running four giant neural networks in memory at once?',
        plainEnglish:
          'A freshly pre-trained base LLM is just an internet document autocompleter: if you ask "How do I sort a list in Python?", it might reply with "...and here are 5 more interview questions!" Supervised Fine-Tuning (SFT) teaches it the format of an assistant. Classical RLHF then trains a separate Reward Model on human A/B comparisons (chosen y_w vs rejected y_l) and runs PPO—which requires keeping 4 models in GPU memory simultaneously (Policy, Reference, Critic, Reward). Direct Preference Optimization (DPO) used a clever mathematical change-of-variables on the Bradley-Terry preference equation to prove that the policy ITSELF defines an implicit reward model, turning RLHF into a simple binary cross-entropy loss over (prompt, chosen, rejected) triples!',
        whyItMatters:
          'Understanding SFT, RLHF, and DPO explains how behavioral alignment works, why DPO is so memory-efficient for offline preference datasets, and where online RL still beats offline DPO.',
        realWorldSystems: [
          'HuggingFace TRL (SFTTrainer / DPOTrainer)',
          'Llama-3 & Zephyr Post-Training Recipes',
          'Anthropic Constitutional AI & Preference Pipelines',
        ],
        summary:
          'DPO analytically solves the KL-constrained reward maximization objective to optimize policies directly on human preference pairs without an explicit reward or critic network.',
        deepDiveParagraphs: [
          'Under the Bradley-Terry preference model, the probability that human raters prefer response y_w over y_l given prompt x is P(y_w > y_l | x) = sigma(r(x, y_w) - r(x, y_l)). Classical RLHF first fits r_phi(x, y) via binary cross-entropy, then maximizes E[r_phi(x, y)] - beta * D_KL(pi_theta || pi_ref).',
          'Rafailov et al. (2023) observed that the optimal policy pi* for the KL-constrained RL objective has a closed-form analytical solution: r(x, y) = beta * log(pi*(y|x) / pi_ref(y|x)) + beta * log Z(x). Substituting this expression into the Bradley-Terry likelihood cancels the intractable partition function Z(x) completely!',
        ],
        keyTakeaways: [
          'Classical PPO-based RLHF requires 4 models in VRAM (Actor, Reference, Critic, Reward); DPO requires only 2 (Actor and frozen Reference).',
          'In DPO, the implicit reward of a completion is beta * log(pi_theta(y|x) / pi_ref(y|x)).',
          'Online iterative RL (PPO/GRPO) outperforms offline DPO on reasoning tasks because it samples and evaluates fresh on-policy mistakes.',
        ],
        mathFormulas: [
          {
            id: 'dpo-loss-equation',
            title: 'Direct Preference Optimization (DPO) Closed-Form Objective',
            latexLike: 'L_DPO(θ) = - E_{(x, y_w, y_l)} [ log σ ( β log(π_θ(y_w|x)/π_ref(y_w|x)) - β log(π_θ(y_l|x)/π_ref(y_l|x)) ) ]',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Implicit Margin = beta * [ log(pi/pi_ref)(y_w) - log(pi/pi_ref)(y_l)]│',
              '│  Loss            = -log sigmoid( Implicit Margin )                   │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Widen the log-probability gap between the winning response y_w and the losing response y_l, measured relative to the starting reference model pi_ref.',
            variables: [
              { symbol: 'y_w, y_l', name: 'Chosen & Rejected completions', role: 'Preferred vs dispreferred outputs for prompt x' },
              { symbol: 'π_ref', name: 'Frozen SFT reference policy', role: 'Anchors the policy so it does not drift into degenerate text' },
              { symbol: 'β', name: 'KL temperature coefficient (~0.1)', role: 'Controls how aggressively pi_theta can deviate from pi_ref' },
            ],
          },
        ],
        codeExamples: [
          {
            title: '12-Line PyTorch DPO Loss Implementation',
            language: 'python',
            description: 'Exact DPO objective computed from sequence log-probabilities.',
            code: `import torch.nn.functional as F

def dpo_loss(pi_win_logp, pi_lose_logp, ref_win_logp, ref_lose_logp, beta: float = 0.1):
    win_logratios = pi_win_logp - ref_win_logp
    lose_logratios = pi_lose_logp - ref_lose_logp
    logits = beta * (win_logratios - lose_logratios)
    losses = -F.logsigmoid(logits)
    implicit_acc = (logits > 0).float().mean()
    return losses.mean(), implicit_acc`,
          },
        ],
        pitfalls: [
          'Likelihood displacement in DPO: Offline DPO can decrease the absolute probability of BOTH y_w and y_l as long as y_l drops faster, causing out-of-distribution hallucinations if trained for too many epochs.',
        ],
      },
      {
        id: 'wtf-is-reasoning-grpo',
        title: 'WTF is a Reasoning Model, Test-Time Compute & GRPO?',
        commandSlug: 'wtf-is-reasoning-grpo',
        wtfQuestion: 'How did models like DeepSeek-R1 and o1 learn to "think", backtrack, and solve Olympiad math without human step-by-step labels?',
        plainEnglish:
          'Instead of forcing a model to blurt out an answer in a fixed number of forward layers, Reasoning Models scale Test-Time Compute by generating an internal Chain-of-Thought (<think>...</think>) trace before answering. To train this behavior without expensive human annotations, we use Reinforcement Learning with Verifiable Rewards (RLVR): give the model a math problem or coding test, let it generate 8 different reasoning attempts, and grade them automatically with a deterministic compiler or symbolic verifier (1.0 if correct, 0.0 if wrong). Group Relative Policy Optimization (GRPO) deletes the massive Critic model used in PPO by simply comparing each of the 8 attempts against the group average!',
        whyItMatters:
          'GRPO + RLVR is the single biggest paradigm shift in post-2024 AI: it cuts RL memory overhead by nearly 50% while causing self-verification, backtracking, and "aha moments" to emerge purely from outcome rewards.',
        realWorldSystems: [
          'DeepSeek-R1 & DeepSeekMath GRPO Training',
          'OpenAI o1 / o3 Test-Time Reasoning Scaling',
          'Verifiable Code & Formal Theorem Proving Agents (Lean 4)',
        ],
        summary:
          'Group Relative Policy Optimization (GRPO) replaces the learned value critic with group-normalized verifiable rewards across G parallel rollouts per prompt.',
        deepDiveParagraphs: [
          'In standard PPO, training a 70B policy requires a 70B Critic (Value) network to estimate V(s_t) at every token, doubling optimizer memory and compute. In Group Relative Policy Optimization (GRPO), for each prompt q we sample a group of G completions {o_1, o_2, ..., o_G} from pi_{theta_old} and score each completion with a deterministic verifier to obtain scalar rewards r = {r_1, ..., r_G}.',
          'The advantage of every token in completion i is then computed simply by normalizing its reward against the group mean and standard deviation: A_i = (r_i - mean(r)) / (std(r) + eps). Attempts in the group that beat the group average get reinforced; attempts below the group average get suppressed.',
          'When trained with RLVR on verifiable domains (unit tests, compiler checks, exact math answers), models spontaneously learn to allocate more thinking tokens to harder problems, spot their own arithmetic mistakes mid-stream, and backtrack.',
        ],
        keyTakeaways: [
          'GRPO eliminates the Critic network completely, saving ~50% of RL training memory.',
          'Group-relative advantage A_i = (r_i - mu_r) / sigma_r acts as a natural, adaptive curriculum baseline for every prompt difficulty.',
          'Reinforcement Learning with Verifiable Rewards (RLVR) is immune to neural reward-model hacking because a unit test or math checker cannot sweet-talked.',
        ],
        mathFormulas: [
          {
            id: 'grpo-group-advantage',
            title: 'Group Relative Policy Optimization (GRPO) Advantage & Objective',
            latexLike: 'Â_{i,t} = (r_i - mean(r_1..r_G)) / std(r_1..r_G),     L_GRPO = E [ min(ratio * Â, clip(ratio) * Â) - β D_KL(π_θ || π_ref) ]',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Prompt q ──▸ Rollout Group G=8:  r = [1, 0, 1, 0, 0, 1, 0, 0]       │',
              '│  Group Mean mu = 0.375,  Group Std sigma = 0.484                     │',
              '│  Passing Rollouts (r=1) ──▸ Advantage = +1.29  (Reinforce trace!)    │',
              '│  Failing Rollouts (r=0) ──▸ Advantage = -0.77  (Suppress trace!)     │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Generate 8 candidate solutions to the same problem, grade all 8 with a deterministic test, and push up the tokens of the winners relative to the losers.',
            variables: [
              { symbol: 'G', name: 'Group rollout size (e.g. 8 or 16)', role: 'Number of parallel reasoning traces sampled per prompt' },
              { symbol: 'r_i', name: 'Verifiable outcome + format reward', role: 'Deterministic score from unit test / answer parser' },
              { symbol: 'D_KL', name: 'Schulman unbiased KL estimator', role: 'exp(log pi_ref - log pi_theta) - (log pi_ref - log pi_theta) - 1' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'GRPO Critic-Free Group Advantage & Unbiased KL Loss in PyTorch',
            language: 'python',
            description: 'Core GRPO step used to train reasoning models with verifiable rewards.',
            code: `import torch

def grpo_step_loss(logp_new, logp_old, logp_ref, group_rewards, clip_eps=0.2, beta=0.04):
    # group_rewards shape: [batch_prompts, G]
    mean_r = group_rewards.mean(dim=1, keepdim=True)
    std_r = group_rewards.std(dim=1, keepdim=True) + 1e-6
    advantages = ((group_rewards - mean_r) / std_r).reshape(-1, 1)  # [B*G, 1]

    ratio = torch.exp(logp_new - logp_old)
    surr1 = ratio * advantages
    surr2 = torch.clamp(ratio, 1.0 - clip_eps, 1.0 + clip_eps) * advantages
    # Unbiased per-token KL estimator: exp(ref - new) - (ref - new) - 1
    log_diff = logp_ref - logp_new
    kl_div = torch.exp(log_diff) - log_diff - 1.0
    loss = -(torch.min(surr1, surr2) - beta * kl_div).mean()
    return loss`,
          },
        ],
        pitfalls: [
          'Zero-variance prompt collapse: If a prompt is so easy that all G rollouts score 1.0 (or so hard all score 0.0), std(r) = 0 and advantages vanish; dynamic curriculum filtering skips zero-variance groups.',
          'Length bias in token-averaged GRPO: Dividing loss by sequence length can encourage overly long rambling on negative-advantage traces (fixed by Dr. GRPO constant normalization).',
        ],
      },
    ],
  },
  {
    id: '06_ai_systems_ops',
    number: '06',
    slug: 'ai-systems-ops',
    filePath: '~/wtfis-ai/06_ai_systems_ops/index.md',
    title: 'AI Systems Engineering: Agent Harnesses, RAG, FlashAttention & GPU Serving',
    shortTitle: 'AI Systems & Harnesses',
    subtitle: 'How models turn user requests into real actions, search vector graphs, and saturate GPU SRAM.',
    layerCategory: 'SYSTEMS_INTERP',
    defaultSceneId: 'neural-lattice',
    estimatedHours: 32,
    prerequisites: ['02_deep_learning', '03_sequence_arch'],
    coreTools: ['vLLM', 'Triton', 'FlashAttention', 'Qdrant / pgvector', 'MCP'],
    mentalModelSummary:
      'An LLM by itself is a stateless function mapping token arrays to next-token logits; an AI System wraps that stateless kernel inside an Agent Harness (state loop, tool execution sandbox, KV memory manager, and hybrid retrieval engine).',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│        HOW AN AGENT HARNESS TURNS A USER REQUEST INTO AN ACTION            │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│  [User Request] + [System Prompt] + [JSON Tool Schemas]                    │',
      '│         │                                                                  │',
      '│         ▼                                                                  │',
      '│  [KV-Cached LLM Inference (FlashAttention + PagedAttention)]               │',
      '│         │                                                                  │',
      '│         ├──▸ Emits Stop Token `<|tool_call|>` + `{name:"bash", cmd:"pytest"}`│',
      '│         ▼                                                                  │',
      '│  [AGENT HARNESS RUNTIME] ──▸ Validates Schema & Sandbox Policy             │',
      '│         │                ──▸ Executes OS Process / API / MCP Tool          │',
      '│         ▼                                                                  │',
      '│  [Observation Appended to Context] ──▸ Loop Resumes Until Task Complete    │',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: 'wtf-is-agent-harness',
        title: 'WTF is an Agent Harness & How Does a Model Turn a Request Into an Action?',
        commandSlug: 'wtf-is-agent-harness',
        wtfQuestion: 'A neural network only outputs token probabilities—so how does it actually run terminal commands, edit files, and manage multi-step state?',
        plainEnglish:
          'A language model has no hands, no memory between calls, and no ability to run code on its own—it literally just takes an array of token IDs and outputs probabilities for the next token. The "Agent Harness" is the deterministic systems runtime (like Claude Code, Antigravity, or a custom ReAct loop) wrapped around the model. When you type "Fix the bug in auth.py", the Harness assembles a context payload containing a System Prompt plus strict JSON schemas of available tools (read_file, edit_file, run_command). As the LLM streams tokens, it emits reasoning tokens followed by a special stop sequence (<|tool_call|>) and a structured JSON call. The Harness intercepts that stream, pauses the GPU, validates permissions, executes the real shell/filesystem operation in a sandbox, formats the stdout/stderr as a <tool_result> message, appends it directly onto the existing KV-cache prefix, and resumes generation in a closed feedback loop!',
        whyItMatters:
          'In production AI engineering, 80% of reliability comes from the Agent Harness—tool ergonomics, context compaction, deterministic verification gates,KV-cache prefix reuse, and sandbox boundaries—not just swapping model checkpoints.',
        realWorldSystems: [
          'Antigravity / Claude Code / Cursor Agent Harnesses',
          'Model Context Protocol (MCP) Tool Servers',
          'Sandboxed Code Execution Loops & SWE-bench Agents',
        ],
        summary:
          'An Agent Harness orchestrates the stateful ReAct loop: Context Assembly -> Constrained Tool-Call Generation -> Sandboxed Execution -> Observation Injection -> Context Compaction.',
        deepDiveParagraphs: [
          'Step 1 (Context & Schema Injection): Before the first forward pass, the harness serializes every available tool into a TypeScript-like or JSON Schema signature inside the system prompt. Because KV-cache prefix caching hashes the token prefix, a well-designed harness keeps system instructions and tool definitions strictly static at the very beginning of the context so 95%+ of the prompt prefill is cached across turns.',
          'Step 2 (Constrained Decoding & Stop Interception): During autoregressive decoding, the model generates internal reasoning (<thought>) followed by a tool invocation token. Production harnesses often apply Finite-State-Machine (FSM) constrained decoding (e.g., Outlines / XGrammar) over the vocabulary logits so the model is mathematically guaranteed to emit valid JSON matching the tool schema.',
          'Step 3 (Sandbox Execution & Observation Loop): The harness parses the JSON arguments, checks security/permission policies, runs the command or file diff, truncates runaway stdout (preventing a 50MB log dump from blowing up the context window), and appends the observation back into the message array. The loop repeats until the model emits a final user-facing stop token or hits max_steps.',
        ],
        keyTakeaways: [
          'The LLM never executes tools directly; it emits structured text tokens that the deterministic Agent Harness intercepts and executes.',
          'Keeping system prompts and tool schemas immutable at index 0 maximizes KV-cache prefix hit rates, cutting latency and cost by 5x–10x.',
          'Context engineering (truncating large tool outputs, compacting stale turns, providing line-numbered file views) prevents mid-context attention degradation.',
        ],
        mathFormulas: [
          {
            id: 'agent-trajectory-probability',
            title: 'Agentic Trajectory Factorization (Model Policy x Environment Dynamics)',
            latexLike: 'P(τ | u) = ∏_{k=1}^{K} π_θ(th_k, a_k | H_{k-1}) · T_env(o_k | s_k, a_k)',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  History H_{k-1} ──▸ LLM Policy pi_theta ──▸ (Thought th_k, Action a_k)│',
              '│  Action a_k      ──▸ Harness Sandbox T_env ──▸ Observation o_k       │',
              '│  Next State      ──▸ H_k = H_{k-1} ++ [th_k, a_k, o_k]               │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'An agent rollout alternates between stochastic neural token sampling (choosing thoughts and tool calls) and deterministic OS/environment transitions (executing the tool and returning stdout).',
            variables: [
              { symbol: 'π_θ(th_k, a_k | H)', name: 'Model reasoning & tool policy', role: 'Autoregressive probability of generating thought and tool call JSON' },
              { symbol: 'T_env(o_k | s_k, a_k)', name: 'Harness execution kernel', role: 'Sandboxed OS/API execution returning observation o_k' },
              { symbol: 'H_k', name: 'Accumulated KV-cached state', role: 'Append-only token transcript managed with compaction' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Production-Style Agent Harness Execution Loop in Python',
            language: 'python',
            description: 'Complete stateful agent loop showing schema dispatch, output truncation, and multi-turn feedback.',
            code: `import json, subprocess

TOOLS = {
    "run_cmd": lambda cmd: subprocess.run(
        cmd, shell=True, capture_output=True, text=True, timeout=10
    ).stdout[:4000]
}

def run_agent_harness(llm_client, user_request: str, max_steps: int = 8):
    messages = [
        {"role": "system", "content": "You are a systems agent. Emit tool_call JSON when needed."},
        {"role": "user", "content": user_request},
    ]
    for step in range(max_steps):
        response = llm_client.generate(messages)  # Reuses KV prefix cache
        messages.append({"role": "assistant", "content": response.text, "tool_calls": response.tool_calls})
        if not response.tool_calls:
            return response.text  # Task complete!
        for call in response.tool_calls:
            fn = TOOLS.get(call["name"])
            obs = fn(**json.loads(call["arguments"])) if fn else "ERROR: Unknown tool"
            messages.append({"role": "tool", "tool_call_id": call["id"], "content": obs})
    raise RuntimeError("Max agent steps exceeded")`,
          },
        ],
        pitfalls: [
          'Context pollution from raw tool dumps: Returning 20,000 lines of unpaginated JSON or build logs buries the instructions and degrades reasoning accuracy.',
          'Mutating the system prompt mid-session: Changing a timestamp in the system prompt invalidates the entire KV prefix cache on every turn.',
        ],
      },
      {
        id: 'wtf-is-rag-vectordb',
        title: 'WTF is RAG, Vector Search (HNSW) & Hybrid Reranking?',
        commandSlug: 'wtf-is-rag-vectordb',
        wtfQuestion: 'How do you search 100 million documents in 5 milliseconds without checking every vector, and why does naive vector search fail on exact error codes?',
        plainEnglish:
          'Naive Retrieval-Augmented Generation (RAG) chops PDFs into arbitrary 500-word chunks, embeds them into vectors, and runs cosine similarity. That fails in production for two reasons: (1) comparing a query vector against 100M vectors via brute-force takes seconds, and (2) dense embeddings are blurry semantic summaries that completely miss exact identifiers like "ERR_409_CONFLICT" or "SKU-9981". Production RAG solves speed with HNSW (Hierarchical Navigable Small World graphs—a multi-layer express-highway skip-list over vectors that finds nearest neighbors in logarithmic steps) and solves precision with Hybrid Search (combining exact BM25 keyword scores with dense vector scores via Reciprocal Rank Fusion, then scoring the top 25 candidates with a Cross-Encoder Reranker).',
        whyItMatters:
          'Every enterprise knowledge assistant, code search indexer, and long-term agent memory relies on hybrid HNSW + BM25 + Cross-Encoder pipelines.',
        realWorldSystems: [
          'Qdrant / Milvus / pgvector HNSW Indexes',
          'Cohere / BGE Cross-Encoder Rerankers',
          'Contextual Retrieval & AST-Aware Code Chunkers',
        ],
        summary:
          'Production retrieval combines HNSW sub-linear graph search, BM25 lexical matching via Reciprocal Rank Fusion (RRF), and Cross-Encoder full-attention reranking.',
        deepDiveParagraphs: [
          'HNSW constructs a multi-layer proximity graph where Layer 0 contains all N vectors with short-range edges, and upper layers contain exponentially fewer nodes with long-range "express highway" edges (analogous to a 1D skip list generalized to high-dimensional graphs). Searching starts at the top sparse layer and greedily hops toward the query before zooming into denser lower layers in O(log N) hops.',
          'Bi-encoder embeddings compress an entire passage into a single d-dimensional vector independent of the user query, creating an information bottleneck. By pairing dense HNSW retrieval with sparse BM25 keyword scoring via Reciprocal Rank Fusion—RRF(d) = sum_m 1 / (k + rank_m(d))—you get both semantic recall and exact lexical precision without calibrating incompatible score scales.',
          'Finally, a Cross-Encoder Reranker concatenates [CLS] Query [SEP] Document [SEP] and runs full bidirectional self-attention across every query token and document token simultaneously over the top 20–50 candidates.',
        ],
        keyTakeaways: [
          'HNSW achieves millisecond ANN search in O(log N) via hierarchical skip-graph navigation.',
          'Reciprocal Rank Fusion (RRF) merges lexical BM25 and dense vector rankings using only rank positions (k=60), requiring zero score normalization.',
          'Bi-encoders are fast for 10M-scale candidate retrieval; Cross-Encoders provide full token-to-token attention for top-K precision.',
        ],
        mathFormulas: [
          {
            id: 'reciprocal-rank-fusion',
            title: 'Reciprocal Rank Fusion (RRF) Hybrid Scoring',
            latexLike: 'RRF_score(d ∈ D) = 1 / (k + rank_BM25(d)) + 1 / (k + rank_Dense(d))',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Doc #42: Rank #2 in BM25, Rank #5 in Dense Vector (with k = 60)     │',
              '│  RRF = 1/(60 + 2) + 1/(60 + 5) = 0.0161 + 0.0154 = 0.0315 (Winner!)  │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Instead of adding raw cosine similarity (0.82) to unbounded BM25 scores (14.7), combine their reciprocal rank positions so documents that rank well in both systems bubble to the top.',
            variables: [
              { symbol: 'rank_m(d)', name: '1-based rank of document d', role: 'Position returned by retriever m (BM25 or Dense HNSW)' },
              { symbol: 'k', name: 'Smoothing constant (typically 60)', role: 'Dampens outlier dominance from a single #1 rank' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Reciprocal Rank Fusion (BM25 + Dense Vector) in Python',
            language: 'python',
            description: 'Zero-hyperparameter rank fusion used in hybrid RAG pipelines.',
            code: `def reciprocal_rank_fusion(bm25_ids: list[str], dense_ids: list[str], k: int = 60):
    scores: dict[str, float] = {}
    for rank, doc_id in enumerate(bm25_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    for rank, doc_id in enumerate(dense_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)`,
          },
        ],
        pitfalls: [
          'Orphaned pronoun chunks: Splitting a financial table from its header leaves chunks saying "It grew 14%" without saying which company or year (solved by prepending document/section context headers before embedding).',
        ],
      },
      {
        id: 'wtf-is-flashattention-vllm',
        title: 'WTF is GPU Inference, FlashAttention, PagedAttention & Quantization?',
        commandSlug: 'wtf-is-flashattention-vllm',
        wtfQuestion: 'If an H100 GPU can do 1,000 Trillion math ops per second, why does LLM generation spend 90% of its time waiting on memory wires?',
        plainEnglish:
          'A modern GPU is like a chef who can chop 10,000 vegetables per second (Tensor Cores / SRAM) but has to walk down a narrow hallway to a warehouse (HBM VRAM) to fetch each carrot one by one. Standard attention computes an N x N matrix Q*K^T, writes that giant matrix back out to slow HBM warehouse memory, reads it back to do softmax, writes it out again, and reads it back to multiply by V. FlashAttention fuses all of those steps into a single GPU kernel inside ultra-fast on-chip SRAM using an "online softmax" trick—never writing the N x N matrix to VRAM! Meanwhile, during batch serving, vLLM\'s PagedAttention manages the KV cache like OS virtual memory pages so GPU memory isn\'t wasted on pre-allocated empty sequence slots.',
        whyItMatters:
          'Understanding the GPU Roofline Model (Compute-bound prefill vs Memory-bandwidth-bound decode) is essential for serving models quickly and cheaply.',
        realWorldSystems: [
          'Tri Dao FlashAttention-2 / FlashAttention-3 Kernels',
          'vLLM PagedAttention & SGLang RadixAttention',
          'AWQ / GPTQ / FP8 Weight & KV Quantization',
        ],
        summary:
          'FlashAttention eliminates O(N^2) HBM memory reads/writes via SRAM tiling and online softmax rescaling, while PagedAttention eliminates KV-cache fragmentation via virtual block tables.',
        deepDiveParagraphs: [
          'On an NVIDIA H100, FP16 Tensor Core compute reaches ~989 TFLOPs/s, while HBM3 memory bandwidth is ~3.35 TB/s. The ratio (989 / 3.35 ≈ 295 FLOPs/Byte) is the Roofline Ridge Point: any operation doing fewer than 295 math ops per byte fetched from VRAM is strictly memory-bandwidth bound. Autoregressive token decoding (batch size 1) performs only 2 FLOPs per parameter byte fetched, leaving 99% of compute units idle waiting on HBM!',
          'FlashAttention loads small tiles of Q, K, V from HBM into fast on-chip SRAM (~20 TB/s). Because exact softmax requires the global row maximum m(x) and denominator sum l(x), FlashAttention maintains running statistics (m_new = max(m_old, m_block)) and rescales the accumulated output O on the fly by exp(m_old - m_new) in a single pass.',
        ],
        keyTakeaways: [
          'Prompt Prefill is compute-bound (high arithmetic intensity); Single-token Decode is memory-bandwidth-bound (arithmetic intensity ~1–2 FLOPs/Byte).',
          'FlashAttention computes exact attention (zero approximation) in O(N) HBM accesses by keeping intermediate N x N tiles inside on-chip SRAM.',
          'Quantizing weights from FP16 (16-bit) to INT4/AWQ (4-bit) cuts memory traffic by 4x, directly speeding up memory-bound token generation by ~3.5x.',
        ],
        mathFormulas: [
          {
            id: 'online-softmax-flashattention',
            title: 'Online Softmax Recurrence & GPU Arithmetic Intensity',
            latexLike: 'm_new = max(m_old, m_tile),     O_new = diag(e^{m_old - m_new}) O_old + e^{S_tile - m_new} V_tile',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  [Slow HBM VRAM: 80GB @ 3.3 TB/s] ──(Load Q,K,V Tiles)──▸            │',
              '│  [Fast On-Chip SRAM: 256KB/SM @ 20+ TB/s]                            │',
              '│     └──▸ Compute S_ij = Q_i K_j^T, update running max m_i & O_i      │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'You can compute exact softmax over a 100k-token row one small tile at a time by multiplying your previous running sum by e^(old_max - new_max) whenever you discover a larger logit.',
            variables: [
              { symbol: 'm_new', name: 'Running row maximum logit', role: 'Prevents exp() overflow across streamed K/V tiles' },
              { symbol: 'e^{m_old - m_new}', name: 'Online rescaling factor', role: 'Retroactively corrects previous tile accumulations in SRAM' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Tiled Online Softmax (FlashAttention Core Algorithm) in Python/NumPy',
            language: 'python',
            description: 'Proves how tiled single-pass online softmax matches full-matrix attention to machine precision.',
            code: `import numpy as np

def flash_attention_tiled(Q, K, V, block_size=4):
    N, d = Q.shape
    O = np.zeros((N, d))
    for i in range(N):
        q_i = Q[i]
        m_i = -np.inf
        l_i = 0.0
        o_i = np.zeros(d)
        for j in range(0, N, block_size):
            K_tile = K[j:j+block_size]
            V_tile = V[j:j+block_size]
            s_tile = (q_i @ K_tile.T) / np.sqrt(d)
            m_new = max(m_i, np.max(s_tile))
            exp_old = np.exp(m_i - m_new)
            exp_tile = np.exp(s_tile - m_new)
            l_i = l_i * exp_old + np.sum(exp_tile)
            o_i = o_i * exp_old + exp_tile @ V_tile
            m_i = m_new
        O[i] = o_i / l_i
    return O`,
          },
        ],
        pitfalls: [
          'Naive INT4 round-to-nearest quantization: Crushing the 1% of salient outlier activation channels destroys perplexity; AWQ (Activation-Aware Weight Quantization) scales salient channels before quantizing.',
        ],
      },
    ],
  },
  {
    id: '07_interp_evals',
    number: '07',
    slug: 'interp-evals',
    filePath: '~/wtfis-ai/07_interp_evals/index.md',
    title: 'Mechanistic Interpretability, Superposition, SAEs & Rigorous AI Evals',
    shortTitle: 'Interp & Evals',
    subtitle: 'How to open the neural black box, extract monosemantic features, and catch silent failure modes.',
    layerCategory: 'SYSTEMS_INTERP',
    defaultSceneId: 'superposition-sae',
    estimatedHours: 24,
    prerequisites: ['00_foundations', '02_deep_learning', '03_sequence_arch'],
    coreTools: ['TransformerLens', 'SAELens', 'Inspect AI', 'Promptfoo', 'PyTorch Hooks'],
    mentalModelSummary:
      'Neural networks compress millions of sparse real-world concepts into fewer neurons via almost-orthogonal Superposition polytopes; Sparse Autoencoders (SAEs) unpack those activations into interpretable features that we can inspect, steer, and evaluate.',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│       SUPERPOSITION POLYTOPE -> SPARSE AUTOENCODER (SAE) UNFOLDING         │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│  Polysemantic Residual Stream x in R^d  (M >> d features packed tightly)   │',
      '│         │                                                                  │',
      '│         ▼                                                                  │',
      '│  [SAE Encoder: f(x) = ReLU(W_enc(x - b_dec) + b_enc)]  (+ L1 Sparsity)     │',
      '│         │                                                                  │',
      '│         ├──▸ Monosemantic Feature #4102 ("Golden Gate Bridge")             │',
      '│         ├──▸ Monosemantic Feature #8819 ("Python Off-By-One Bug")          │',
      '│         ▼                                                                  │',
      '│  [Activation Steering: x_steered = x + alpha * d_feature]                  │',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: 'wtf-is-superposition-sae',
        title: 'WTF is Mechanistic Interpretability, Superposition & Sparse Autoencoders?',
        commandSlug: 'wtf-is-superposition-sae',
        wtfQuestion: 'Why does a single neuron fire on completely unrelated things (like cats, car bumpers, and Korean verbs), and how do we untangle it?',
        plainEnglish:
          'Early researchers hoped each neuron in a network would represent one clean concept (a "grandmother neuron"). Instead, they found neurons are wildly polysemantic—one neuron fires on Python docstrings, pasta recipes, and base64 strings! Why? Because the world has millions of useful concepts (M), while a layer only has a few thousand neurons (D). The Superposition Hypothesis explains that because most concepts are sparse (rarely active at the exact same moment), the network packs M >> D concepts as "almost-orthogonal" directions in D-dimensional space (forming geometric polytopes like octahedra and antiprisms), using ReLU to filter out the small cross-talk interference. A Sparse Autoencoder (SAE) reverses this compression by projecting the D-dimensional residual stream up into a massive overcomplete dictionary (e.g., 64,000 features) with an L1 sparsity penalty, isolating clean, single-meaning (monosemantic) features!',
        whyItMatters:
          'Mechanistic Interpretability turns AI from alchemy into engineering: it lets us see internal circuits (like induction heads), diagnose why a model hallucinated or lied, and steer features directly.',
        realWorldSystems: [
          'Anthropic Golden Gate Claude & Scaling Monosemanticity SAEs',
          'Google DeepMind Gemma Scope Sparse Autoencoders',
          'TransformerLens Circuit & Induction Head Analysis',
        ],
        summary:
          'Networks pack M > D sparse features into almost-orthogonal polytopes via superposition; Sparse Autoencoders recover monosemantic features via overcomplete dictionary learning.',
        deepDiveParagraphs: [
          'In D-dimensional Euclidean space, you can fit at most D mutually orthogonal vectors (w_i . w_j = 0). However, by the Johnson-Lindenstrauss lemma, if you allow a tiny epsilon of off-diagonal interference (|w_i . w_j| <= eps), you can pack exponentially many vectors: O(exp(eps^2 * D)) almost-orthogonal directions! When features are sparse (active with probability S -> 0), the non-linear ReLU(W^T W x + b) suppresses the negative interference noise while preserving the active feature.',
          'To decompose a polysemantic residual stream vector x in R^d, we train a Sparse Autoencoder with dictionary size d_sae = 16 * d: f(x) = ReLU(W_enc (x - b_dec) + b_enc), and reconstruct x_hat = W_dec f(x) + b_dec. Minimizing ||x - x_hat||_2^2 + lambda ||f(x)||_1 forces each column of W_dec to align with a true monosemantic feature direction.',
        ],
        keyTakeaways: [
          'Polysemanticity is not a bug—it is the network using compressed sensing (Superposition) to represent more sparse features than it has physical neurons.',
          'As feature sparsity increases, Toy Models of Superposition transition from orthogonal axes to 3D polytopes (pentagonal bipyramids, octahedra, antiprisms).',
          'Sparse Autoencoders (SAEs) unfold the residual stream into an overcomplete, human-interpretable dictionary of monosemantic features.',
        ],
        mathFormulas: [
          {
            id: 'sae-objective',
            title: 'Sparse Autoencoder (SAE) Dictionary Learning Objective',
            latexLike: 'f(x) = ReLU(W_enc(x - b_dec) + b_enc),     L_SAE = || x - (W_dec f(x) + b_dec) ||_2^2 + λ || f(x) ||_1',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Residual x (d=4096) ──▸ [W_enc] ──▸ Sparse Code f(x) (d_sae=65536)  │',
              '│  (Only ~30 of 65,536 features fire > 0 on any given token!)          │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Force the autoencoder to reconstruct the neural activation x using a huge vocabulary of 65,536 concept vectors, while charging an L1 tax on every concept it turns on so only the 20–30 true underlying concepts fire.',
            variables: [
              { symbol: 'f(x)', name: 'Sparse feature activations', role: 'High-dimensional monosemantic concept vector' },
              { symbol: 'W_dec', name: 'Feature dictionary matrix', role: 'Unit-norm columns representing true directions in activation space' },
              { symbol: 'λ ||f(x)||_1', name: 'L1 sparsity penalty', role: 'Drives almost all feature activations to exact zero' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Sparse Autoencoder (SAE) with Unit-Norm Decoder Columns in PyTorch',
            language: 'python',
            description: 'Complete SAE module with decoder norm constraint to prevent L1 cheating.',
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SparseAutoencoder(nn.Module):
    def __init__(self, d_model: int, d_sae: int, l1_coeff: float = 3e-3):
        super().__init__()
        self.l1_coeff = l1_coeff
        self.b_dec = nn.Parameter(torch.zeros(d_model))
        self.b_enc = nn.Parameter(torch.zeros(d_sae))
        self.W_enc = nn.Parameter(torch.randn(d_model, d_sae) / (d_model ** 0.5))
        self.W_dec = nn.Parameter(F.normalize(torch.randn(d_sae, d_model), dim=-1))

    def forward(self, x: torch.Tensor):
        f = F.relu((x - self.b_dec) @ self.W_enc + self.b_enc)
        x_hat = f @ F.normalize(self.W_dec, dim=-1) + self.b_dec
        mse = ((x - x_hat) ** 2).sum(dim=-1).mean()
        l1 = self.l1_coeff * f.abs().sum(dim=-1).mean()
        return x_hat, f, mse + l1`,
          },
        ],
        pitfalls: [
          'Decoder norm cheating: If columns of W_dec are not constrained to unit L2 norm, the optimizer shrinks f(x) by 100x and scales W_dec by 100x to lower the L1 penalty without actually becoming sparse!',
          'Dead latents & feature splitting: High L1 penalties early in training can permanently kill SAE latents (fixed by TopK SAEs or JumpReLU SAEs).',
        ],
      },
      {
        id: 'wtf-is-ai-evals',
        title: 'WTF are AI Evals & How Do You Measure Generalisation vs Failure Modes?',
        commandSlug: 'wtf-is-ai-evals',
        wtfQuestion: 'How do you scientifically test a non-deterministic AI system when "vibe-checking" 5 prompts lies to you every time?',
        plainEnglish:
          'When engineers build traditional software, a unit test is binary: 2 + 2 == 4. When engineers build AI systems, changing two words in a prompt or swapping a chunking strategy can fix 3 examples you looked at while silently breaking 40% of edge cases you didn\'t check. "AI Evals" replace vibe-checking with an automated engineering harness: (1) Deterministic Code Graders (AST syntax checks, JSON schema validation, SQL execution diffs, regex assertions), (2) Retrieval Metrics (Recall@K, MRR, NDCG), and (3) Calibrated LLM-as-a-Judge rubrics (which must be bias-corrected against human gold labels using TPR/TNR calibration).',
        whyItMatters:
          'You cannot improve what you cannot measure. High-velocity AI teams spend more time building domain-specific eval datasets and failure-mode taxonomies than tweaking prompts.',
        realWorldSystems: [
          'UK AISI Inspect AI & Promptfoo Eval Harnesses',
          'SWE-bench Verified (Containerized Unit-Test Grading)',
          'Ragas / Braintrust Production Eval Pipelines',
        ],
        summary:
          'Rigorous AI evaluation combines deterministic functional graders, pass@k sampling estimators, and Rohan-style TPR/TNR bias-corrected LLM judges.',
        deepDiveParagraphs: [
          'For code generation and reasoning tasks, greedy decoding (pass@1) hides whether a model possesses a capability in its distribution. Chen et al. (Codex) introduced the unbiased pass@k estimator: generate n >= k samples per problem, count c passing samples, and compute pass@k = 1 - comb(n - c, k) / comb(n, k).',
          'When using an LLM-as-a-Judge for open-ended outputs, naive pairwise comparisons suffer from position bias (preferring the first option), verbosity bias (preferring longer answers), and self-preference bias. Instead of multi-point 1–10 scales (which have high variance), production evals use binary pass/fail criteria backed by a human-labeled alignment set to measure the judge\'s True Positive Rate (TPR) and True Negative Rate (TNR).',
        ],
        keyTakeaways: [
          'Always prefer deterministic code assertions (schema validation, execution sandbox tests, exact regex) before reaching for an LLM judge.',
          'Never ask an LLM judge to score on a vague 1-to-10 scale; use decomposed binary (PASS/FAIL) rubrics with reference examples.',
          'Use the unbiased combinatorial pass@k estimator (with n >= 2k samples) to measure capability ceilings vs pass^k to measure production reliability.',
        ],
        mathFormulas: [
          {
            id: 'unbiased-pass-at-k',
            title: 'Unbiased Combinatorial pass@k & Judge Bias Correction',
            latexLike: 'pass@k = 1 - C(n - c, k) / C(n, k),     θ_true = (p_obs + TNR - 1) / (TPR + TNR - 1)',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Sample n=20 rollouts -> c=4 pass unit tests                         │',
              '│  pass@k: Probability at least 1 of k random rollouts passes          │',
              '│  pass^k: (c/n)^k -> Probability ALL k consecutive runs succeed!      │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'pass@k measures whether a model CAN solve a problem given k tries (search ceiling); pass^k measures whether an enterprise customer gets a reliable answer every single time.',
            variables: [
              { symbol: 'n, c, k', name: 'Total samples, passing samples, budget k', role: 'Combinatorial estimator with dramatically lower variance than 1 - (1 - p)^k' },
              { symbol: 'TPR, TNR', name: 'Judge sensitivity & specificity', role: 'Measured on a 100-item human-annotated golden calibration set' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Unbiased pass@k & Rogan-Gladen LLM-Judge Bias Estimator',
            language: 'python',
            description: 'Exact numerical implementation of Codex pass@k and calibrated judge accuracy.',
            code: `import numpy as np

def estimate_pass_at_k(n: int, c: int, k: int) -> float:
    if n - c < k:
        return 1.0
    return float(1.0 - np.prod(1.0 - k / np.arange(n - c + 1, n + 1)))

def corrected_true_success_rate(observed_pass_rate: float, tpr: float, tnr: float) -> float:
    # Rogan-Gladen correction for imperfect binary LLM judge
    denom = tpr + tnr - 1.0
    if abs(denom) < 1e-6:
        raise ValueError("Judge is no better than random guessing")
    return float(np.clip((observed_pass_rate + tnr - 1.0) / denom, 0.0, 1.0))`,
          },
        ],
        pitfalls: [
          'Benchmark data contamination: Evaluating on public benchmarks leaked into pre-training corpora measures memorization rather than generalization.',
          'Optimizing pass@k when users experience pass^1: A customer support agent that fails 1 out of 3 tool calls has a 70% pass@1 but only a 34% pass^3 reliability across a 3-turn workflow!',
        ],
      },
      {
        id: 'wtf-is-activation-steering',
        title: 'WTF is Activation Steering, Guardrails & Prompt Injection?',
        commandSlug: 'wtf-is-activation-steering',
        wtfQuestion: 'How can you alter what an LLM thinks by adding a vector directly into its middle layers at runtime, and why is prompt injection so hard to patch?',
        plainEnglish:
          'Prompt engineering tries to steer a model from the outside using words. Activation Steering (or Representation Engineering) reaches directly inside Layer L of the Transformer during the forward pass and adds a "concept vector" (+alpha * v_concept) straight onto the residual stream! How do you find that vector? Either grab a monosemantic column from a Sparse Autoencoder (like Anthropic\'s "Golden Gate Bridge" feature), or compute a Contrastive Activation Addition (CAA) vector by subtracting the average activation of 50 negative prompts from 50 positive prompts. Meanwhile, Prompt Injection happens because LLMs process system instructions and untrusted external data (emails, web pages) inside the exact same attention stream—meaning true security requires architectural privilege separation in the Agent Harness, not just polite system prompts.',
        whyItMatters:
          'Activation steering enables zero-training behavior control and honesty probing, while understanding the mechanics of indirect prompt injection is mandatory for securing tool-using agents.',
        realWorldSystems: [
          'PyTorch register_forward_hook Activation Steering',
          'Linear Probes for Hallucination & Deception Detection',
          'Capability-Based Agent Sandboxes & Dual-LLM Privilege Separation',
        ],
        summary:
          'Activation steering intervenes directly on residual stream vectors x_l <- x_l + alpha * d_concept during inference, while system-level privilege separation defends against indirect prompt injection.',
        deepDiveParagraphs: [
          'Because the Transformer residual stream x_l = x_0 + sum_{i=1}^l (Attn_i + MLP_i) acts as a shared linear communication bus across layers, high-level behavioral concepts (refusal, sycophancy, code security, persona) are often encoded as linear directions (the Linear Representation Hypothesis). Adding or projecting out a unit direction v_steer at middle layers (typically 40%–65% of model depth) reliably shifts generation without fine-tuning.',
          'Indirect Prompt Injection occurs because self-attention computes QK^T across all tokens in the context window without hardware-level separation between "code" (system instructions) and "data" (retrieved web pages or emails)—the exact equivalent of a classic von Neumann buffer overflow.',
        ],
        keyTakeaways: [
          'The Linear Representation Hypothesis shows high-level behaviors often correspond to single linear directions in middle-layer residual streams.',
          'Directional ablation x <- x - (x . v_hat) v_hat erases a concept direction completely from the residual stream.',
          'Never rely solely on prompt-level guardrails to protect destructive tools; enforce deterministic capability policies inside the Agent Harness.',
        ],
        mathFormulas: [
          {
            id: 'contrastive-activation-steering',
            title: 'Contrastive Activation Addition (CAA) & Directional Ablation',
            latexLike: 'v_steer = E[x_l(p^+)] - E[x_l(p^-)],     x_l^steered = x_l + α v_steer,     x_l^ablated = x_l - (x_l · v̂) v̂',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Layer L Residual x_l ──▸ (+) alpha * v_steer ──▸ Layer L+1          │',
              '│  (Intervenes in O(d_model) during forward pass with zero training!)  │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Find the vector pointing from "sycophantic response" to "honest response" in Layer 16, and add a multiple of that vector during inference.',
            variables: [
              { symbol: 'v_steer', name: 'Steering vector in R^{d_model}', role: 'Difference-in-means or SAE decoder feature vector' },
              { symbol: 'α', name: 'Steering multiplier', role: 'Positive amplifies the concept; negative suppresses it' },
              { symbol: 'v̂', name: 'Unit concept vector', role: 'Used for orthogonal projection ablation' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'PyTorch Forward Hook for Live Residual Stream Activation Steering',
            language: 'python',
            description: 'Injects a steering vector directly into a Transformer layer during generation.',
            code: `import torch

def attach_steering_hook(transformer_layer, steering_vec: torch.Tensor, alpha: float = 2.5):
    steering_vec = steering_vec / steering_vec.norm()
    def hook_fn(module, inputs, output):
        hidden = output[0] if isinstance(output, tuple) else output
        steered = hidden + alpha * steering_vec.to(hidden.device, hidden.dtype)
        return (steered,) + output[1:] if isinstance(output, tuple) else steered
    return transformer_layer.register_forward_hook(hook_fn)`,
          },
        ],
        pitfalls: [
          'Over-steering saturation (alpha too large): Pushing residual stream norm far outside its natural sphere breaks LayerNorm/RMSNorm scaling and causes repetitive token loops.',
        ],
      },
    ],
  },
];

export default MODULES_PART_2;
