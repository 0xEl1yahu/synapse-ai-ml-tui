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
        libraries: [{
          name: "Hugging Face Tokenizers",
          url: "https://huggingface.co/docs/tokenizers/quicktour",
          purpose: "Train a tokenizer on sample text and inspect the resulting token IDs.",
        }],
        title: 'WTF is Tokenization (BPE), Pre-Training & Scaling Laws?',
        commandSlug: 'wtf-is-llm-tokenization',
        wtfQuestion: 'How does an LLM read raw text, why does it struggle to count letters in "strawberry", and how do we know how big to make a model vs its dataset?',
        plainEnglish:
          'LLMs never see words or individual characters—they see integer IDs called tokens produced by Byte-Pair Encoding (BPE). BPE starts with raw UTF-8 bytes and repeatedly merges the most frequent adjacent pairs into single vocabulary tokens (around 100k–128k tokens in modern models). Because "strawberry" gets merged into chunks like ["str", "aw", "berry"], the model sees 3 opaque integers rather than individual "r" characters! During pre-training, the model plays one game trillions of times: given tokens 1 to t, predict probability distribution of token t+1. Chinchilla Scaling Laws proved that to minimize loss for a fixed compute budget C ≈ 6*N*D, parameter count N and training tokens D must scale together (roughly 20+ tokens per parameter, or 100+ tokens/param when optimizing for cheap inference).',
        whyItMatters:
          'Tokenization controls context window efficiency, multilingual fertility, arithmetic accuracy, and code indentation overhead. Scaling laws dictate whether you should train a 70B model for 1T tokens or an 8B model for 15T tokens so inference fits on a single GPU.',
        realWorldSystems: [
          'OpenAI tiktoken (the open-source fast BPE tokenizer library behind GPT-4 / GPT-4o)',
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
        libraries: [{
          name: "Diffusers schedulers",
          url: "https://huggingface.co/docs/diffusers/using-diffusers/schedulers",
          purpose: "Compare the update rules used to remove noise over several sampling steps.",
        }],
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
        libraries: [{
          name: "Flow Matching",
          url: "https://github.com/facebookresearch/flow_matching",
          purpose: "Explore probability paths and solvers in the PyTorch examples.",
        }],
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
        libraries: [{
          name: "Gymnasium",
          url: "https://gymnasium.farama.org/introduction/basic_usage/",
          purpose: "Step through an environment and inspect observations, rewards and episode termination.",
        }],
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
        libraries: [{
          name: "TRL DPOTrainer",
          url: "https://huggingface.co/docs/trl/dpo_trainer",
          purpose: "Inspect the chosen and rejected responses used to train on preferences.",
        }],
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
        libraries: [{
          name: "TRL GRPOTrainer",
          url: "https://huggingface.co/docs/trl/grpo_trainer",
          purpose: "Follow how a reward function scores a group of candidate completions.",
        }],
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
          'Reinforcement Learning with Verifiable Rewards (RLVR) is immune to neural reward-model hacking because a unit test or math checker cannot be sweet-talked.',
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
        libraries: [{
          name: "OpenAI Agents SDK",
          url: "https://openai.github.io/openai-agents-python/",
          purpose: "Trace a tool request from model output through the runner to a tool result.",
        }],
        title: 'WTF is an Agent Harness & How Does a Model Turn a Request Into an Action?',
        commandSlug: 'wtf-is-agent-harness',
        wtfQuestion: 'When I ask an assistant to find a date in my notes, who actually reads the note?',
        plainEnglish:
          'The model can ask to search your notebook. The harness is the program that checks whether the notebook is in scope, runs the search, and gives the result back to the model. The assistant can then answer with the date and the note it came from.',
        whyItMatters:
          'The harness decides what the assistant may read or change. A calendar lookup and a calendar invitation need different permissions, even when the same model proposes both.',
        readingIds: ["res-anthropic-effective-agents"],
        knowledgeCheck: {"question": "The notebook is unavailable. What should the assistant report?", "answer": "It should say the lookup failed and ask for an accessible note. A plausible date is still a guess."},
        realWorldSystems: [
          'Antigravity / Claude Code / Cursor Agent Harnesses',
          'Model Context Protocol (MCP) Tool Servers',
          'Sandboxed Code Execution Loops & SWE-bench Agents',
        ],
        summary:
          'An Agent Harness orchestrates the stateful ReAct loop: Context Assembly -> Constrained Tool-Call Generation -> Sandboxed Execution -> Observation Injection -> Context Compaction.',
        deepDiveParagraphs: [
          "You select the project notebook. The model requests a search for “design review”. The harness checks your access, calls the search tool, and returns the matching line. The assistant can now answer “Thursday at 10”, with a link to check.",
          "The model proposes the lookup. The tool searches. The harness tracks the conversation, enforces permissions, and stops after an answer, a failure, or a limit on steps. If a note asks to forward the notebook, that text grants no permission to send it.",
          "An agent harness runs a task. An evaluation harness measures performance by running known cases and comparing outcomes with expectations. For this assistant, a useful evaluation checks the date, the source, and whether private notebooks stayed private.",
          'First the harness supplies the task, relevant history and descriptions of the tools available for this user. A tool description says which inputs a tool accepts.',
          'A model can respond with a proposed tool name and arguments. Different providers encode this differently. Valid formatting alone says nothing about whether this user may perform the operation.',
          'The harness checks the request against the signed-in user’s permissions, executes an allowed action, and returns the observation. It stops at a final answer or a step limit and reports tool failures explicitly.',
        ],
        keyTakeaways: [
          'The LLM never executes tools directly; it emits structured text tokens that the deterministic Agent Harness intercepts and executes.',
          'Some providers can reuse a shared prompt prefix. Measure cache usage with your provider before relying on savings.',
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
            title: 'A read-only tool dispatcher',
            language: 'python',
            description: 'Run with standard Python. The two requests stand in for model output. Only the selected sample note can be read.',
            code: `notes = {"design review": "Thursday at 10"}
def dispatch(tool, note):
    if tool != "read_note" or note not in notes:
        return "Request denied"
    return notes[note]

print(dispatch("read_note", "design review"))  # Thursday at 10
print(dispatch("send_note", "design review"))  # Request denied`,
          },
        ],
        pitfalls: [
          'Context pollution from raw tool dumps: Returning 20,000 lines of unpaginated JSON or build logs buries the instructions and degrades reasoning accuracy.',
          'Mutating the system prompt mid-session: Changing a timestamp in the system prompt invalidates the entire KV prefix cache on every turn.',
        ],
      },
      {
        id: 'wtf-is-agent-skills',
        libraries: [{
          name: "Agent Skills reference tools",
          url: "https://github.com/agentskills/agentskills/tree/main/skills-ref",
          purpose: "Validate a skill directory and its metadata before sharing it.",
        }],
        title: 'WTF is an Agent Skill?',
        commandSlug: 'wtf-is-agent-skills',
        wtfQuestion: 'How can an assistant prepare the same stock report every Friday?',
        plainEnglish: 'Write down how you prepare the report once. A skill gives an assistant those reusable instructions. Your stock-report skill might say to group items by shop, flag anything below five units, and show when the stock count was taken.',
        whyItMatters: 'If the team changes its low-stock threshold, you can update the procedure in one place and check the next report against a small sample.',
        realWorldSystems: ['Inventory reports', 'Preparing release notes', 'Checking a document against a house style'],
        summary: 'A skill packages a repeatable procedure in a directory that an agent can discover and read.',
        architectureDiagram: 'Report requested → select stock-report skill → read SKILL.md → apply steps to stock counts',
        deepDiveParagraphs: [
          'In the Agent Skills format, a folder called stock-report contains a SKILL.md file. Its opening metadata gives the name (stock-report) and a description of when to use it. The rest of the file gives the steps. You can keep an example report under assets/ or longer guidance under references/.',
          'A host can show the assistant only skill names and descriptions at first, then load the full instructions when a task matches. If the numbers are available in a spreadsheet, the assistant can use the spreadsheet you supplied. If it needs live stock, it needs an authorized connection to the stock system.',
        ],
        keyTakeaways: ['Use the description to tell the assistant when to choose the skill.', 'Test the instructions with sample stock counts whose report you can check by hand.'],
        hasLab: false,
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ['A skill can include executable scripts. Inspect their behavior and required access before enabling them.', 'If the stock count is missing, the procedure should say how to report that gap.'],
        knowledgeCheck: { question: 'The threshold changes from five units to eight. Where do you make the change?', answer: 'Update the reporting skill and test it with an item that has six units. It should now appear on the low-stock list.' },
        readingIds: ['res-agent-skills-spec'],
      },
      {
        id: 'wtf-is-mcp',
        libraries: [{
          name: "MCP Python SDK",
          url: "https://py.sdk.modelcontextprotocol.io/servers/",
          purpose: "Compare the tools, resources and prompts an MCP server can offer a client.",
        }],
        title: 'WTF is the Model Context Protocol (MCP)?',
        commandSlug: 'wtf-is-mcp',
        wtfQuestion: 'How does the assistant get today’s stock count for that Friday report?',
        plainEnglish: 'MCP is a shared way for an assistant app to connect to another program. A shop can provide a stock lookup through an MCP server. When you ask for the Friday report, the app can use that lookup to get a current count, then follow the reporting skill to format it.',
        whyItMatters: 'A shop can offer the same lookup to several compatible apps. The shop still controls which shops and records each signed-in user can access.',
        realWorldSystems: ['Claude Desktop with an MCP server', 'A read-only inventory lookup', 'A searchable document collection'],
        summary: 'MCP defines how a host discovers capabilities and requests data or actions from a server.',
        architectureDiagram: 'Assistant app (host) → MCP client → inventory server → authorized stock records',
        deepDiveParagraphs: [
          'The host is the app you use. Inside it, an MCP client communicates with the inventory server. The server can advertise tools (operations such as looking up stock), resources (data you can read), and prompts (reusable message templates). A server can offer just one of these.',
          'For the Friday report, the app requests the count for your shop. The server checks your access and returns six units with a timestamp. The skill determines which section of the report gets that row. Changing a stock count is a separate operation with different authorization.',
        ],
        keyTakeaways: ['Use a skill to describe how to prepare the report. Use an MCP connection when the app needs current stock data.', 'A listed tool may still deny a request. The service must check access for each operation.'],
        hasLab: false,
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ['A disconnected server leaves you without a fresh count. Show the failure or label cached figures with their timestamp.', 'Keep a reporting connection read-only when the task only needs a lookup.'],
        knowledgeCheck: { question: 'The stock server is offline. Which part of the Friday report can the assistant still prepare?', answer: 'It can use the skill to prepare the headings and explain that current counts are unavailable. It needs another authorized source to fill in the figures.' },
        readingIds: ['res-mcp-architecture'],
      },
      {
        id: 'wtf-is-rag-vectordb',
        libraries: [{
          name: "Qdrant client",
          url: "https://python-client.qdrant.tech/",
          purpose: "Store sample policy passages and search for the one that answers the shopper’s question.",
        }],
        title: 'WTF is RAG?',
        commandSlug: 'wtf-is-rag-vectordb',
        wtfQuestion: '“Can I return shoes I bought on sale?” How does a shop assistant find the right answer?',
        plainEnglish:
          'Imagine a shop whose policy says “Unworn sale shoes can be returned within 14 days.” The assistant searches the shop’s current policy, finds that sentence, and gives it to the model along with your question. The model can now answer “Yes, if they’re unworn and you return them within 14 days” and link you to the rule. Looking up information and using it to write an answer is called retrieval-augmented generation, or RAG.',
        whyItMatters:
          'If the shop changes its return window, it can update the policy the assistant searches. If the assistant only finds a rule for full-price shoes, it should tell the shopper it could not confirm the sale policy.',
        realWorldSystems: ['Shop assistants answering policy questions', 'Help desks searching product manuals', 'Staff looking up company procedures'],
        summary:
          'RAG retrieves passages to support an answer. Hybrid search can combine vector search (HNSW), keyword search (BM25), reciprocal rank fusion and cross-encoder reranking.',
        architectureDiagram: 'Shopper’s question → search the policy → select the passage → answer with a source',
        deepDiveParagraphs: [
          'First, split the policy into passages and keep each heading and source link with its text. The heading “Sale footwear” gives the 14-day rule its scope. Store a numerical representation of each passage, called an embedding, so a search for “shoes” can also find “footwear”.',
          'At search time, the question gets an embedding too. An HNSW index connects nearby vectors in a layered graph, letting the search visit promising passages without comparing every vector. A keyword search such as BM25 can also look for a particular product code. Each search produces a ranked list.',
          'Reciprocal rank fusion combines those lists using each passage’s position. An optional cross-encoder reranker reads the question alongside each shortlisted passage to score how well they match. The model receives the selected passage and its source. Check whether the answer preserves both conditions in the policy: the shoes must be unworn and the return must be within 14 days.',
        ],
        keyTakeaways: [
          'Keep headings with passages so exceptions remain attached to the right products.',
          'Keyword and vector searches can surface different passages. Rank fusion combines their results.',
          'Test retrieval and answering separately. Did the search find the sale policy? Did the answer preserve its conditions?',
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
        libraries: [{
          name: "vLLM",
          url: "https://docs.vllm.ai/en/latest/",
          purpose: "Explore how an inference engine schedules requests and manages attention memory.",
        }],
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
    title: 'Mechanistic Interpretability, Superposition, SAEs, AI Evals & Security',
    shortTitle: 'Interp, Evals & Security',
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
        libraries: [{
          name: "SAELens",
          url: "https://github.com/jbloomAus/SAELens",
          purpose: "Inspect features learned by a sparse autoencoder on model activations.",
        }],
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
        libraries: [{
          name: "DeepEval",
          url: "https://deepeval.com/docs/metrics-exact-match",
          purpose: "Score an exact classification label against its expected value without calling a judge model.",
        }],
        title: 'WTF are AI Evals & How Do You Measure Generalisation vs Failure Modes?',
        commandSlug: 'wtf-is-ai-evals',
        wtfQuestion: 'If we update a delivery assistant, how can we tell whether its answers improve?',
        plainEnglish: 'Keep examples with answers you can check. Give the assistant the same examples after a change and compare the results. For a parcel that missed its delivery date, the expected status might be “delayed”. DeepEval is a Python library that can check whether the assistant returned that exact label.',
        whyItMatters: 'A change that fixes one parcel may break another. Include routine deliveries, missing tracking records and late parcels so you can see who benefits and where the assistant still fails.',
        readingIds: ['res-deepeval'],
        knowledgeCheck: { question: 'Would exact matching fairly grade a friendly explanation of a late parcel?', answer: 'Several explanations could be equally accurate. Check the exact status label separately, then assess the explanation against criteria such as accuracy and clarity.' },
        realWorldSystems: [
          'DeepEval classification tests',
          'UK AISI Inspect AI & Promptfoo Eval Harnesses',
          'SWE-bench Verified (Containerized Unit-Test Grading)',
          'Ragas / Braintrust Production Eval Pipelines',
        ],
        summary:
          'Rigorous AI evaluation combines deterministic functional graders, pass@k sampling estimators, and Rogan-Gladen TPR/TNR bias-corrected LLM judges.',
        deepDiveParagraphs: [
          'Pass@1 measures success on a single attempt under the decoding settings you chose. Pass@k asks whether at least one of k attempts succeeds. With n samples per problem, c passing samples and n ≥ k, the estimate is 1 − C(n − c, k) / C(n, k).',
          'When using an LLM-as-a-Judge for open-ended outputs, naive pairwise comparisons suffer from position bias (preferring the first option), verbosity bias (preferring longer answers), and self-preference bias. Instead of multi-point 1–10 scales (which have high variance), production evals use binary pass/fail criteria backed by a human-labeled alignment set to measure the judge\'s True Positive Rate (TPR) and True Negative Rate (TNR).',
        ],
        keyTakeaways: [
          'Always prefer deterministic code assertions (schema validation, execution sandbox tests, exact regex) before reaching for an LLM judge.',
          'Never ask an LLM judge to score on a vague 1-to-10 scale; use decomposed binary (PASS/FAIL) rubrics with reference examples.',
          'Choose a metric that matches the user’s task. If users need three steps to succeed in sequence, evaluate the whole sequence.',
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
              '│  Independent attempts with success rate p: all k succeed with p^k.  │',
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
            title: 'Check a parcel status with DeepEval',
            language: 'python',
            description: 'Install deepeval in a Python environment. These two recorded outputs demonstrate a pass and a failure without a model call.',
            code: `from deepeval.metrics import ExactMatchMetric
from deepeval.test_case import LLMTestCase

for recorded_status in ["delayed", "delivered"]:
    case = LLMTestCase(
        input="The parcel missed its delivery date. Return its status.",
        actual_output=recorded_status,
        expected_output="delayed",
    )
    metric = ExactMatchMetric()
    metric.measure(case)
    print(recorded_status, metric.score)  # delayed: 1, delivered: 0`,
          },
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
          'Three independent steps that each succeed 70% of the time all succeed together about 34% of the time. Real steps can depend on earlier outputs. Test complete support conversations to measure that workflow.',
        ],
      },
      {
        id: "wtf-is-prompt-injection",
        libraries: [{
          name: "OPA policy engine",
          url: "https://www.openpolicyagent.org/docs",
          purpose: "Enforce which tool actions are allowed even when untrusted text changes the model’s request.",
        }],
        title: "WTF is prompt injection?",
        commandSlug: "wtf-is-prompt-injection",
        wtfQuestion: "What if a web page gives my assistant instructions?",
        plainEnglish: "A model reads instructions and material such as emails or web pages. Prompt injection happens when text steers it away from the task the user authorized. A direct attempt comes from the person messaging the model. An indirect attempt arrives inside something the assistant was asked to read.",
        whyItMatters: "An assistant with access to other accounts can turn a misleading instruction into an unauthorized action.",
        realWorldSystems: ["Browser assistants", "Document summarizers"],
        summary: "Only the user or application can authorize a new action.",
        hasLab: false,
        architectureDiagram: "Page → summary request → scoped tools → answer",
        deepDiveParagraphs: [
          "In 2025, Brave researchers asked the Comet browser assistant to summarize a web page. They showed that instructions embedded in page content could steer the assistant into actions involving another site. This was a researcher demonstration. Its importance is that access to another signed-in site can turn a bad summary into a privacy problem.",
          "Give a summarizer read-only access to the selected page. Keep account credentials outside the conversation. If a different task genuinely requires sharing a file, show its contents and destination for approval. The application must enforce that choice even if the model proposes something else.",
        ],
        keyTakeaways: ["Only the user or application can authorize a new action."],
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ["Instructions in a retrieved document cannot expand a tool’s permissions."],
        knowledgeCheck: {"question": "A document asks your summarizer to send a private note. Who authorized that?", "answer": "The user authorized a summary. The document is evidence to read. The harness should deny the send and keep the private note outside the task."},
        readingIds: ["res-owasp-injection", "res-brave-report"],
      },
      {
        id: "wtf-is-jailbreaking",
        libraries: [{
          name: "Inspect AI",
          url: "https://inspect.aisi.org.uk/",
          purpose: "Organize safety evaluation cases, scorers and logs to compare model behavior across releases.",
        }],
        title: "WTF is jailbreaking?",
        commandSlug: "wtf-is-jailbreaking",
        wtfQuestion: "Can a long conversation change how a model follows safety rules?",
        plainEnglish: "Jailbreaking is an attempt to make a model disregard its safety rules. The goal distinguishes it from the broader problem of prompt injection, which can also redirect an ordinary task or distort an answer.",
        whyItMatters: "Safety evaluations need to cover conversations, model versions and settings used in practice.",
        realWorldSystems: ["Safety evaluations", "Tool authorization services"],
        summary: "Check behavior again when the model or conversation length changes.",
        hasLab: false,
        architectureDiagram: "Conversation → model response → separate permission check",
        deepDiveParagraphs: [
          "In 2024 Anthropic reported that examples in a long conversation could influence how models responded to later requests, including weakening safety behavior in controlled evaluations. The study describes behavior under test conditions. It does not establish that customer accounts were compromised.",
          "Evaluate safety across long conversations and after model changes. Record which model and settings you measured. Keep authorization for files, messages and payments outside the model, so an unsafe answer cannot grant access to an account.",
        ],
        keyTakeaways: ["Check behavior again when the model or conversation length changes."],
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ["Passing a single safety evaluation cannot guarantee safe access to a credential."],
        knowledgeCheck: {"question": "If a model always declines one unsafe request in testing, can it safely hold a master account credential?", "answer": "One evaluation covers a limited set of inputs. Use a narrowly scoped tool outside the conversation and enforce authorization on every call."},
        readingIds: ["res-jailbreak-study", "res-owasp-injection"],
      },
      {
        id: "wtf-is-model-and-data-security",
        libraries: [{
          name: "Safetensors",
          url: "https://huggingface.co/docs/safetensors/index",
          purpose: "Load tensor weights in a format designed to avoid executing arbitrary code during deserialization.",
        }],
        title: "How do I protect my model and my data?",
        commandSlug: "wtf-is-model-and-data-security",
        wtfQuestion: "Where does a private file go after I give it to an assistant?",
        plainEnglish: "Trace where information goes. A private file might reach a model provider, a saved conversation, a connected tool and an application log. Each copy needs an owner, an access rule and a deletion policy.",
        whyItMatters: "A file may leave copies in a tool, a conversation and a log. Each copy needs an access rule.",
        realWorldSystems: ["Private document search", "User-scoped caches", "Model registries"],
        summary: "Trace both the original data and every stored copy.",
        hasLab: false,
        architectureDiagram: "File → retrieval → model provider → conversation and logs",
        deepDiveParagraphs: [
          "On March 20, 2023, a cache-library bug allowed some ChatGPT users to see titles from another active user’s history. OpenAI took the service offline and patched the bug. This was a software isolation failure. Even a perfectly followed prompt would leave that failure in place.",
          "Share the smallest excerpt needed. Review connected apps, recipients and saved history. If a secret was exposed, revoke or rotate it at the service that issued it and review access logs. Deleting a chat alone leaves an exposed credential usable.",
          "Restrict access to model weights and checkpoints, verify their source and integrity before loading them, and restrict who can publish a new version. Keep provider keys on the server. Enforce user access before retrieving documents, isolate caches by user, and limit sensitive data in logs.",
        ],
        keyTakeaways: ["Trace both the original data and every stored copy."],
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ["Deleting a chat cannot revoke an exposed credential."],
        knowledgeCheck: {"question": "Two users ask the same question about “my invoice”. What makes reusing the first answer unsafe?", "answer": "The words match but the authorized records differ. Scope retrieval and cached results to the user and permissions that produced them."},
        readingIds: ["res-outage"],
      },
      {
        id: 'wtf-is-activation-steering',
        libraries: [{
          name: "TransformerLens",
          url: "https://github.com/TransformerLensOrg/TransformerLens",
          purpose: "Use activation hooks to inspect or modify an intermediate representation.",
        }],
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
          'An assistant can interpret text in a retrieved page as new instructions. Treat retrieved material as untrusted and enforce tool permissions outside the model.',
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
  {
    id: '08_multimodal_world_gnn',
    number: '08',
    slug: 'multimodal-world-gnn',
    filePath: '~/wtfis-ai/08_multimodal_world_gnn/index.md',
    title: 'Multimodal AI, Vision-Language Models (VLMs), World Models (JEPA/VLA) & Graph Neural Networks',
    shortTitle: 'Multimodal, VLA & GNNs',
    subtitle: 'How AI sees images, hears audio waveforms, predicts physical world states, and reasons over molecular graphs.',
    layerCategory: 'FRONTIER_GENAI',
    defaultSceneId: 'latent-galaxy',
    estimatedHours: 26,
    prerequisites: ['02_deep_learning', '03_sequence_arch', '04_generative_ai'],
    coreTools: ['PyTorch', 'HuggingFace Transformers', 'OpenAI CLIP / SigLIP', 'PyTorch Geometric'],
    mentalModelSummary:
      'Everything in the physical world can be tokenized or embedded into a geometric manifold: images become 16x16 ViT patch tokens, audio waveforms become Residual Vector Quantization (RVQ) codebook IDs, robot actions become Flow-Matching trajectories, and molecules become E(3)-equivariant graphs.',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│       UNIFIED MULTIMODAL, AUDIO RVQ & ROBOTICS VLA ARCHITECTURE            │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│  [Image HxWx3] ──▸ [16x16 ViT Patches] ──▸ [MLP Projector] ──┐             │',
      '│  [Audio 24kHz] ──▸ [EnCodec/Mimi RVQ Codebooks 1..K] ────────┼─▸ [LLM KV]  │',
      '│  [Text Prompt] ──▸ [BPE Token IDs] ──────────────────────────┘      │      │',
      '│                                                                     ▼      │',
      '│  [Action Chunking Flow-Matching Head] ◂── Predicts Robot Joints A_{t:t+H}  │',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: 'wtf-is-vit-clip-vlm',
        libraries: [{
          name: "Transformers CLIP",
          url: "https://huggingface.co/docs/transformers/model_doc/clip",
          purpose: "Compare image and text embeddings in a shared representation.",
        }],
        title: 'WTF is a Vision Transformer (ViT), CLIP/SigLIP & Vision-Language Model (VLM)?',
        commandSlug: 'wtf-is-vit-clip-vlm',
        wtfQuestion: 'How do you feed a 2D photograph into a 1D text Transformer so it can read charts, write UI code from screenshots, and locate objects?',
        plainEnglish:
          'A language Transformer expects a 1D list of token vectors. To make an image look like a sentence, a Vision Transformer (ViT) slices a 224x224 image into a 14x14 chessboard of 16x16 pixel squares ("patches"). Each 16x16x3 patch is flattened into 768 numbers and multiplied by a linear matrix to become a single "visual token"—giving 196 visual tokens! Next, how do we align those visual tokens with English words? CLIP and SigLIP train an Image Encoder and a Text Encoder on 400M+ (image, caption) pairs so matching pairs have cosine similarity near +1 and mismatched pairs near -1. Finally, to build a Vision-Language Model (like LLaVA, Qwen-VL, or GPT-4o), we take a frozen/pretrained ViT, pass its visual patch tokens through a 2-layer MLP "Projector" into the LLM\'s embedding dimension, and concatenate them right in front of the user\'s text tokens!',
        whyItMatters:
          'VLMs power document OCR, medical imaging, screenshot-to-code agents, autonomous driving perception, and multimodal search.',
        realWorldSystems: [
          'OpenAI CLIP & Google SigLIP Contrastive Vision Encoders',
          'Qwen2.5-VL / LLaVA / Pixtral Multimodal Projectors & 2D M-RoPE',
          'Claude Computer Use & Screenshot Grounding Agents',
        ],
        summary:
          'ViT converts 2D image grids into patch token sequences, CLIP/SigLIP aligns vision and language via contrastive/sigmoid loss, and VLM projectors splice visual tokens directly into the LLM residual stream.',
        deepDiveParagraphs: [
          'In Dosovitskiy et al. (ViT, 2020), an image X in R^{H x W x C} is reshaped into N = (H*W)/P^2 flattened patches x_p in R^{N x (P^2 * C)} using a single strided 2D convolution `nn.Conv2d(3, d_model, kernel_size=16, stride=16)`. Because self-attention is permutation-equivariant, 2D positional embeddings (or 2D Rotary Position Embeddings in Qwen-VL / Pixtral) must be injected so the model knows which patch is top-left vs bottom-right.',
          'CLIP (Radford et al., 2021) aligns image embeddings u_i and text embeddings v_i across a giant mini-batch of N = 32,768 pairs using symmetric InfoNCE softmax loss. However, computing an N x N softmax denominator across hundreds of GPUs requires expensive global `all_gather` synchronization. Zhai et al. (SigLIP, 2023) replaced the row/column softmax with independent pairwise binary sigmoid logistic loss on every (i, j) pair—scaling cleanly to arbitrary batch sizes with better small-batch stability.',
        ],
        keyTakeaways: [
          'A Conv2d with kernel_size=P and stride=P is mathematically identical to slicing an image into P x P patches and applying a linear projection.',
          'SigLIP replaces CLIP\'s batch-coupled softmax denominator with pairwise sigmoid binary cross-entropy.',
          'Modern VLMs use Dynamic High-Resolution Tiling (AnyRes) + Pixel-Shuffle 2x2 token merging to read tiny OCR text in 4K screenshots without exploding visual token counts.',
        ],
        mathFormulas: [
          {
            id: 'clip-vs-siglip-loss',
            title: 'CLIP InfoNCE Contrastive Loss vs SigLIP Pairwise Sigmoid Loss',
            latexLike: 'L_CLIP = - (1/N) sum_i log [ exp(u_i · v_i / τ) / sum_j exp(u_i · v_j / τ) ],   L_SigLIP = (1/N^2) sum_i sum_j log(1 + exp(-z_{ij} (t u_i · v_j + b)))',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Similarity Matrix S = U @ V^T / tau   (N x N image-text pairs)      │',
              '│  Diagonal S_{ii}: Matching image + caption -> Push toward +1.0!      │',
              '│  Off-Diagonal S_{ij}: Mismatched pairs     -> Push toward -1.0!      │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'In an N x N grid of images and captions, pull the diagonal entries together and push all N^2 - N off-diagonal impostors apart.',
            variables: [
              { symbol: 'u_i, v_j', name: 'L2-normalized image & text vectors', role: 'Unit vectors on the hypersphere S^{d-1}' },
              { symbol: 'τ', name: 'Learnable temperature parameter', role: 'Initialized to 0.07; sharpens cosine similarity logits' },
              { symbol: 'z_{ij}', name: 'Pairwise label (+1 match, -1 non-match)', role: 'Allows SigLIP to score pairs without global softmax normalization' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'ViT Patchification + VLM Multimodal Connector & CLIP Loss in PyTorch',
            language: 'python',
            description: 'Shows how a 2D image becomes visual tokens spliced into an LLM embedding stream.',
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class VisionLanguageProjector(nn.Module):
    def __init__(self, img_channels=3, patch_size=16, d_vis=768, d_llm=4096):
        super().__init__()
        self.patch_embed = nn.Conv2d(img_channels, d_vis, kernel_size=patch_size, stride=patch_size)
        self.mlp_projector = nn.Sequential(
            nn.Linear(d_vis, d_llm),
            nn.GELU(),
            nn.Linear(d_llm, d_llm),
        )

    def forward(self, images: torch.Tensor, text_embeds: torch.Tensor):
        # images: [B, 3, 224, 224] -> [B, 768, 14, 14] -> [B, 196, 768]
        patches = self.patch_embed(images).flatten(2).transpose(1, 2)
        vis_tokens = self.mlp_projector(patches)  # [B, 196, 4096]
        # Concatenate visual tokens directly in front of text tokens!
        return torch.cat([vis_tokens, text_embeds], dim=1)`,
          },
        ],
        pitfalls: [
          'Visual token explosion: A raw 1024x1024 image with 14x14 patches creates 5,329 visual tokens per image—requiring 2x2 pixel-shuffle downsampling or Perceiver resamplers.',
        ],
      },
      {
        id: 'wtf-is-audio-rvq-world-vla',
        libraries: [{
          name: "EnCodec",
          url: "https://github.com/facebookresearch/encodec",
          purpose: "Inspect how an audio codec represents a waveform with discrete codes.",
        }],
        title: 'WTF are Audio Codecs (RVQ), World Models (JEPA) & Robotics VLA Policies?',
        commandSlug: 'wtf-is-audio-rvq-world-vla',
        wtfQuestion: 'How do voice models stream speech in real time, and how do robot policies translate camera frames into smooth motor actions?',
        plainEnglish:
          'Raw audio at 24kHz is 24,000 numbers per second—way too long for a Transformer! Neural Audio Codecs (like EnCodec and Mimi in Kyutai Moshi) compress audio into 12.5 or 50 frames per second and discretize each frame using Residual Vector Quantization (RVQ): Codebook 1 snaps the vector to the closest coarse centroid (capturing semantic words), Codebook 2 quantizes the leftover error (capturing pitch/prosody), and Codebooks 3–8 capture fine acoustic texture. Meanwhile, in Robotics and Physical AI, instead of predicting blurry future pixels, JEPA (Joint-Embedding Predictive Architecture) predicts future states in abstract representation space, while Vision-Language-Action (VLA) models like pi_0 attach a Flow-Matching action head to a VLM to output 50Hz continuous robot joint trajectories!',
        whyItMatters:
          'RVQ audio codecs and Flow-Matching VLA heads are the bridge taking AI out of text chatboxes into full-duplex voice assistants and physical humanoid/industrial robots.',
        realWorldSystems: [
          'Kyutai Moshi / Mimi & Meta EnCodec Residual Vector Quantizers',
          'Physical Intelligence pi_0 & OpenVLA Robotics Policies',
          'Meta I-JEPA & V-JEPA Representation World Models',
        ],
        summary:
          'Residual Vector Quantization (RVQ) recursively quantizes continuous residuals into discrete codebook IDs, while VLA models pair VLM backbones with Flow-Matching action chunking heads.',
        deepDiveParagraphs: [
          'In Residual Vector Quantization (RVQ), a continuous latent frame z in R^d is approximated by the sum of K codebook lookups: z_hat = sum_{k=1}^K e_{c_k}^{(k)}. Since argmin codebook lookup is non-differentiable, training uses the Straight-Through Estimator (STE): `z_q = z + (z_q - z).detach()`, copying gradients directly from the decoder input to the encoder output.',
          'In Embodied Robotics, predicting a single motor torque at a time fails due to compounding covariate shift and multi-modal human demonstrations (e.g., going left OR right around an obstacle). Action Chunking with Flow Matching predicts an entire horizon of H = 50 future actions A_{t:t+H} simultaneously by integrating a learned velocity field v_theta(A_tau, tau | VLM_KV_Cache) in 5–10 Euler steps.',
        ],
        keyTakeaways: [
          'RVQ achieves exponential codebook resolution (V^K combinations) with only linear O(K * V) memory storage.',
          'The Straight-Through Estimator `z + (z_q - z).detach()` bypasses non-differentiable argmin quantization during backpropagation.',
          'JEPA predicts abstract target embeddings rather than raw pixels, avoiding wasting capacity on unpredictable background leaf/water noise.',
        ],
        mathFormulas: [
          {
            id: 'rvq-ste-equation',
            title: 'Residual Vector Quantization (RVQ) & Straight-Through Estimator',
            latexLike: 'r_0 = z,   c_k = argmin_j || r_{k-1} - e_j^{(k)} ||_2,   r_k = r_{k-1} - e_{c_k}^{(k)},   z_hat = ∑_{k=1}^K e_{c_k}^{(k)}',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Audio Frame z ──▸ [Codebook 1: Semantic] ──▸ Residual r_1           │',
              '│                ──▸ [Codebook 2: Pitch/Tone] ──▸ Residual r_2         │',
              '│                ──▸ [Codebooks 3..8: Acoustic Detail]                 │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Like paying $47.83 with bills and coins: Codebook 1 pays the $40, Codebook 2 pays the $7, Codebook 3 pays the $0.80, and Codebook 4 pays the $0.03.',
            variables: [
              { symbol: 'r_k', name: 'k-th quantization residual', role: 'Error remaining after subtracting the first k codebook vectors' },
              { symbol: 'e_j^{(k)}', name: 'Codebook k embedding table', role: 'Learnable dictionary of V=1024 prototype vectors' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Residual Vector Quantizer (RVQ) with Straight-Through Estimator in PyTorch',
            language: 'python',
            description: 'Core discretization layer used in neural audio codecs (EnCodec / Mimi).',
            code: `import torch
import torch.nn as nn

class ResidualVectorQuantizer(nn.Module):
    def __init__(self, num_codebooks: int = 4, vocab_size: int = 1024, dim: int = 128):
        super().__init__()
        self.codebooks = nn.ModuleList([nn.Embedding(vocab_size, dim) for _ in range(num_codebooks)])

    def forward(self, z: torch.Tensor):
        residual = z
        z_q = torch.zeros_like(z)
        indices = []
        for cb in self.codebooks:
            dists = torch.cdist(residual, cb.weight)
            idx = dists.argmin(dim=-1)
            quant = cb(idx)
            residual = residual - quant
            z_q = z_q + quant
            indices.append(idx)
        # Straight-Through Estimator: forward uses z_q, backward flows to z!
        z_ste = z + (z_q - z).detach()
        return z_ste, torch.stack(indices, dim=-1)`,
          },
        ],
        pitfalls: [
          'Codebook collapse in VQ/RVQ: Without EMA dead-code expiration or k-means initialization, 90% of codebook vectors never get selected and die.',
        ],
      },
      {
        id: "wtf-is-graph-engineering",
        libraries: [{
          name: "Neo4j Python driver",
          url: "https://neo4j.com/docs/python-manual/current/",
          purpose: "Query connected records and follow prerequisite relationships.",
        }],
        title: "WTF is graph engineering?",
        commandSlug: "wtf-is-graph-engineering",
        wtfQuestion: "What must I learn before model training?",
        plainEnglish: "A graph stores things and the relationships between them. In a course catalogue, each course can be a point, called a node. An arrow labelled “requires” connects one course to a prerequisite.",
        whyItMatters: "Following prerequisites can uncover a course that sits several steps away.",
        realWorldSystems: ["Course catalogues", "Software dependency databases"],
        summary: "Record the direction and source of every relationship.",
        hasLab: false,
        architectureDiagram: "Training ─requires→ Data preparation ─requires→ Python",
        deepDiveParagraphs: [
          "“What must I learn before model training?” gives you a design to work backwards from. Record Training → requires → Data preparation and Data preparation → requires → Python. Following two arrows finds an indirect prerequisite. A spreadsheet is often sufficient for listing courses by name.",
          "Give each course a stable ID. Store the source and review date for each prerequisite. Two courses can share a title. Merging them just because their names match can invent a learning path. Check for loops when prerequisites must be completed in order.",
          "A knowledge graph records facts and their sources. A workflow graph routes work between steps. A graph neural network learns from connected examples, such as atoms linked by chemical bonds. A database can answer the prerequisite question by following edges without training a model.",
        ],
        keyTakeaways: ["Record the direction and source of every relationship."],
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ["Two courses with the same name can be different entities."],
        knowledgeCheck: {"question": "Python appears two steps away. Does the catalogue say Training directly requires Python?", "answer": "It establishes an indirect dependency through Data preparation. Preserve both edges and their sources when explaining the answer."},
        readingIds: ["res-graph-course"],
      },
      {
        id: 'wtf-is-gnn-geometric',
        libraries: [{
          name: "PyTorch Geometric",
          url: "https://pytorch-geometric.readthedocs.io/en/latest/",
          purpose: "Represent a graph as nodes and edges and apply a message-passing layer.",
        }],
        title: 'WTF are Graph Neural Networks (GNNs) & E(3)-Equivariant Molecular AI?',
        commandSlug: 'wtf-is-gnn-geometric',
        wtfQuestion: 'How do you run deep learning on molecules, social networks, and knowledge graphs that don\'t fit on a flat pixel grid?',
        plainEnglish:
          'Images live on a rigid 2D grid, and text lives on a 1D line—but molecules, chip layouts, transaction networks, and 3D proteins are arbitrary Graphs made of Nodes (atoms/users) and Edges (bonds/transactions). A Graph Neural Network (GNN) works by "Message Passing": in each layer, every node gathers feature messages from its connected neighbors, aggregates them with a permutation-invariant function (sum, mean, or attention), and updates its own embedding. Better yet, when modeling 3D molecules in AlphaFold or materials discovery, rotating a molecule in 3D space should rotate its predicted atomic forces identically—a physical symmetry baked directly into E(3)-Equivariant Graph Neural Networks!',
        whyItMatters:
          'GNNs and Geometric Deep Learning power AlphaFold, drug discovery, GNoME crystal material generation, chip placement, and financial fraud detection.',
        realWorldSystems: [
          'DeepMind AlphaFold & GNoME Materials Discovery',
          'PyTorch Geometric (PyG) & DGL Relational Graph Engines',
          'Pinterest PinSage & Stripe Transaction Fraud GNNs',
        ],
        summary:
          'GNNs generalize convolutions to arbitrary topologies via permutation-equivariant message passing, while E(3)-equivariant networks preserve 3D rotational and translational symmetries.',
        deepDiveParagraphs: [
          'In a Message Passing Neural Network (MPNN), node i updates its state at layer l+1 via h_i^{(l+1)} = phi(h_i^{(l)}, Aggregate_{j in N(i)} psi(h_i^{(l)}, h_j^{(l)}, e_{ij})), where Aggregate is a permutation-invariant operator (sum, mean, or max). Note that a Transformer is literally a Graph Neural Network operating on a fully connected graph where attention weights alpha_{ij} are dynamically computed edge weights!',
          'In 3D physical systems (atoms with feature h_i and 3D coordinate x_i in R^3), Satorras et al. (E(n)-Equivariant GNN) proved you can achieve exact rotational, translational, and reflectional equivariance without expensive spherical harmonics simply by conditioning messages on pairwise squared distances ||x_i - x_j||^2 (which are scalar invariants!) and updating coordinates along relative displacement vectors (x_i - x_j).',
        ],
        keyTakeaways: [
          'Message passing must use a permutation-invariant aggregation (sum, mean, max) because graph neighbors have no canonical ordering.',
          'Transformers are a special case of GNNs on complete graphs with learned dot-product edge weights.',
          'Stacking too many GNN layers (L > 6) causes Over-Smoothing, where all connected node embeddings converge to the exact same stationary vector.',
        ],
        mathFormulas: [
          {
            id: 'egnn-equivariant-layer',
            title: 'GCN Spectral Propagation & E(3)-Equivariant Coordinate Update',
            latexLike: 'H^{(l+1)} = σ( D̃^{-1/2} Ã D̃^{-1/2} H^{(l)} W^{(l)} ),     x_i^{(l+1)} = x_i^{(l)} + ∑_{j≠i} (x_i^{(l)} - x_j^{(l)}) φ_x(m_{ij})',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Scalar Invariant Distance: d_{ij}^2 = ||x_i - x_j||_2^2             │',
              '│  Message m_{ij} = phi_e(h_i, h_j, d_{ij}^2)                          │',
              '│  Equivariant 3D Force Update: x_i <- x_i + sum_j (x_i - x_j) phi_x(m)│',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'If you compute messages using only inter-atomic distances ||x_i - x_j||^2 and push atoms along the line connecting them (x_i - x_j), rotating the input molecule in 3D space automatically rotates the output by the exact same 3D rotation matrix!',
            variables: [
              { symbol: 'Ã = A + I', name: 'Adjacency matrix with self-loops', role: 'Connects each node to its immediate 1-hop graph neighbors' },
              { symbol: 'D̃^{-1/2}', name: 'Symmetric degree normalization', role: 'Prevents high-degree hub nodes from exploding feature norms' },
              { symbol: '||x_i - x_j||^2', name: 'E(3) distance invariant', role: 'Unchanged under any 3D rotation R or translation t' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'E(3)-Equivariant Graph Layer (EGNN) in Pure PyTorch',
            language: 'python',
            description: 'Rotational and translational equivariant message passing on 3D coordinates.',
            code: `import torch
import torch.nn as nn

class EquivariantGNNLayer(nn.Module):
    def __init__(self, d_hidden: int = 64):
        super().__init__()
        self.edge_mlp = nn.Sequential(nn.Linear(2 * d_hidden + 1, d_hidden), nn.SiLU())
        self.coord_mlp = nn.Sequential(nn.Linear(d_hidden, 1, bias=False))
        self.node_mlp = nn.Sequential(nn.Linear(2 * d_hidden, d_hidden), nn.SiLU())

    def forward(self, h: torch.Tensor, x: torch.Tensor):
        # h: [N, d], x: [N, 3]
        diff = x.unsqueeze(1) - x.unsqueeze(0)          # [N, N, 3]
        dist_sq = (diff ** 2).sum(dim=-1, keepdim=True) # [N, N, 1] invariant!
        h_i = h.unsqueeze(1).expand(-1, h.size(0), -1)
        h_j = h.unsqueeze(0).expand(h.size(0), -1, -1)
        m_ij = self.edge_mlp(torch.cat([h_i, h_j, dist_sq], dim=-1))
        x_next = x + (diff * self.coord_mlp(m_ij)).mean(dim=1)
        h_next = h + self.node_mlp(torch.cat([h, m_ij.sum(dim=1)], dim=-1))
        return h_next, x_next`,
          },
        ],
        pitfalls: [
          'Over-smoothing & Over-squashing: Deep GNNs compress exponentially growing k-hop neighborhood trees into a fixed-size vector while blurring local node distinctions.',
        ],
      },
    ],
  },
  {
    id: '09_prod_sdk_orchestration_deploy',
    number: '09',
    slug: 'prod-sdk-orchestration-deploy',
    filePath: '~/wtfis-ai/09_prod_sdk_orchestration_deploy/index.md',
    title: 'Build, Orchestrate & Deploy: Python/NumPy/PyTorch Internals, OpenAI/DeepSeek SDKs, Multi-Agent Topologies, Agent Frameworks & Docker GPU Ops',
    shortTitle: 'SDKs, Orchestration & Docker',
    subtitle: 'From NumPy memory strides and torch.compile to OpenAI/DeepSeek streaming SDKs, parallel subagent orchestration, and multi-stage GPU Dockerfiles.',
    layerCategory: 'SYSTEMS_INTERP',
    defaultSceneId: 'neural-lattice',
    estimatedHours: 34,
    prerequisites: ['02_deep_learning', '06_ai_systems_ops'],
    coreTools: ['Python / NumPy', 'PyTorch (torch.compile / FSDP)', 'OpenAI & DeepSeek SDK', 'HuggingFace & Cog', 'Docker / NVIDIA Toolkit', 'MCP'],
    mentalModelSummary:
      'Production AI engineering requires mastering four concrete layers: (1) zero-copy memory strides & kernel fusion in NumPy/PyTorch, (2) streaming structured wire protocols via the OpenAI/DeepSeek/HuggingFace SDKs, (3) deterministic multi-agent orchestration topologies (Orchestrator-Worker, DAGs, Git Worktrees, MCP), and (4) reproducible GPU containers with Docker, Cog, and vLLM.',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│       END-TO-END PRODUCTION AI STACK: SDK -> ORCHESTRATOR -> DOCKER        │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│  [Lead Orchestrator Agent] ──(Spawns Parallel Isolated Workers)──┐         │',
      '│       ├──▸ [Worker A (Git Worktree)] ──▸ OpenAI / DeepSeek SDK   │         │',
      '│       ├──▸ [Worker B (MCP Tool Host)] ──▸ Structured JSON Schema │         │',
      '│       └──▸ [Evaluator / Verifier Gate] ◂─────────────────────────┘         │',
      '│                   │                                                        │',
      '│                   ▼                                                        │',
      '│  [Docker + nvidia-container-toolkit + Cog + vLLM + PyTorch torch.compile]  │',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: 'wtf-is-numpy-pytorch-sdk-internals',
        libraries: [{
          name: "NumPy array internals",
          url: "https://numpy.org/doc/stable/dev/internals.html",
          purpose: "Inspect how strides and data buffers allow multiple views of an array.",
        }],
        title: 'WTF Happens Under the Hood of Python, NumPy, PyTorch (`torch.compile`), OpenAI SDK & DeepSeek?',
        commandSlug: 'wtf-is-numpy-pytorch-sdk-internals',
        wtfQuestion: 'Why is a NumPy array 100x faster than a Python list, what does `torch.compile` actually compile, and how does the OpenAI SDK talk to DeepSeek and vLLM?',
        plainEnglish:
          'A Python list is an array of pointers scattered across RAM where every `a + b` boxes and unboxes heap objects. A NumPy `ndarray` or PyTorch `Tensor` is a raw C pointer to a contiguous slab of memory plus a `strides` tuple `(byte_step_dim0, byte_step_dim1)`. When you transpose `x.T` or broadcast a `(1, 4096)` bias onto a `(32, 4096)` batch, zero bytes are copied—NumPy/PyTorch simply changes the stride to `0`! In PyTorch 2.x, `@torch.compile` uses TorchDynamo to capture your Python bytecode into an FX computation graph and TorchInductor to generate fused Triton GPU kernels (fusing `x * sigmoid(x)` into one SRAM pass instead of 3 HBM round-trips). At the API layer, the `openai` Python/TypeScript SDK has become the universal wire standard: changing `base_url="https://api.deepseek.com"` or `"http://localhost:8000/v1"` (vLLM) lets you stream SSE tokens, parse DeepSeek\'s `reasoning_content` (`<think>`), and enforce strict JSON schemas with the exact same client!',
        whyItMatters:
          'Knowing memory strides, `torch.compile`, and `asyncio` OpenAI/DeepSeek streaming separates engineers who write slow, OOM-prone glue scripts from engineers who build high-throughput AI systems.',
        realWorldSystems: [
          'NumPy C-Contiguous Strides & Zero-Copy Views',
          'PyTorch 2.x TorchDynamo + TorchInductor Triton Kernel Fusion',
          'OpenAI / DeepSeek / vLLM Universal Chat Completions & Responses Wire Protocol',
        ],
        summary:
          'Zero-copy stride metadata powers NumPy/PyTorch tensor views, TorchInductor fuses memory-bound elementwise ops into Triton kernels, and the OpenAI SDK provides a unified streaming/structured-output interface across frontier and local models.',
        deepDiveParagraphs: [
          'Memory Strides & Contiguity: A 2D float32 tensor of shape `(M, N)` in row-major (C-contiguous) layout has strides `(4*N, 4)` bytes. Calling `.transpose(0, 1)` swaps the shape to `(N, M)` and strides to `(4, 4*N)` in O(1) time without touching VRAM. However, passing a non-contiguous tensor to a CUDA kernel that expects contiguous memory forces an implicit `.contiguous()` allocation—which is why `.view()` raises an error on transposed tensors unless you understand stride geometry.',
          'PyTorch `torch.compile` & Mixed Precision: Eager-mode PyTorch launches a separate CUDA kernel for every operator (`linear`, `gelu`, `dropout`, `add`), paying HBM read/write overhead each time. `torch.compile` traces the graph and fuses chains of point-wise and reduction ops into a single Triton kernel inside GPU SRAM. Pairing `torch.compile` with `torch.amp.autocast("cuda", dtype=torch.bfloat16)` uses BF16 (which shares FP32\'s 8-bit exponent range, eliminating FP16 underflow/grad-scaler complexity).',
          'Universal OpenAI / DeepSeek / HuggingFace SDKs: In production, you rarely hardcode vendor-specific HTTP requests. Using `AsyncOpenAI(base_url=...)` with `asyncio.gather` or `TaskGroup` allows concurrent streaming of tool calls, structured Pydantic schemas (`client.beta.chat.completions.parse`), and DeepSeek-R1 reasoning traces (`delta.reasoning_content`).',
        ],
        keyTakeaways: [
          'Broadcasting a dimension of size 1 simply sets its memory stride to 0—reading the same memory address repeatedly with zero memory duplication.',
          'Always prefer `torch.bfloat16` over `float16` on Ampere/Hopper/Blackwell GPUs because BF16 has the exact same dynamic exponent range as FP32 (8 exponent bits).',
          '`torch.compile` speeds up memory-bound layers (RMSNorm, SwiGLU, RoPE) by 1.5x–3x via automatic Triton operator fusion.',
          'The OpenAI SDK (`AsyncOpenAI`) works natively against OpenAI, DeepSeek (`api.deepseek.com`), vLLM, SGLang, and HuggingFace TGI.',
        ],
        mathFormulas: [
          {
            id: 'tensor-stride-offset',
            title: 'N-Dimensional Tensor Memory Offset & Zero-Copy Broadcast Stride',
            latexLike: 'ByteAddress(i_0, i_1, ..., i_{k-1}) = BasePtr + ∑_{d=0}^{k-1} i_d · stride[d],     (Broadcast dim_d = 1  ⇒  stride[d] = 0)',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  x: shape (2, 3), float32 (4 bytes)  ──▸ strides = (12, 4)           │',
              '│  x.T: shape (3, 2)                   ──▸ strides = (4, 12) (0 copy!) │',
              '│  bias: shape (1, 3) broadcast to (2,3) ▸ strides = (0, 4)  (0 copy!) │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'A tensor is just a 1D flat array in RAM plus a formula telling the CPU/GPU how many bytes to jump when incrementing each index.',
            variables: [
              { symbol: 'stride[d]', name: 'Byte step along dimension d', role: 'Number of bytes to advance in flat memory to move +1 along axis d' },
              { symbol: 'stride[d] = 0', name: 'Zero-copy broadcast trick', role: 'Reuses a single row/scalar across an entire batch without allocating RAM' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'NumPy/PyTorch Stride Inspection + torch.compile + Universal OpenAI/DeepSeek Async SDK',
            language: 'python',
            description: 'Demonstrates zero-copy strides, BF16 compiled PyTorch, and streaming DeepSeek/vLLM via AsyncOpenAI.',
            code: `import asyncio, numpy as np, torch
from openai import AsyncOpenAI

# 1. Zero-copy NumPy broadcasting via stride=0
a = np.ones((3, 1), dtype=np.float32)
b = np.broadcast_to(a, (3, 4096))
assert b.strides == (4, 0)  # 0 bytes stepped along columns!

# 2. PyTorch 2.x Triton Kernel Fusion via torch.compile + BF16
@torch.compile
def fused_swiglu(x: torch.Tensor, w_gate: torch.Tensor, w_up: torch.Tensor):
    return torch.nn.functional.silu(x @ w_gate) * (x @ w_up)

# 3. Universal AsyncOpenAI Client (Works for OpenAI, DeepSeek-R1 & local vLLM)
async def stream_reasoning_and_tools(prompt: str):
    client = AsyncOpenAI(base_url="https://api.deepseek.com", api_key="YOUR_KEY")
    stream = await client.chat.completions.create(
        model="deepseek-reasoner",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta
        if getattr(delta, "reasoning_content", None):
            print(delta.reasoning_content, end="", flush=True)
        if delta.content:
            print(delta.content, end="", flush=True)`,
          },
        ],
        pitfalls: [
          'Calling synchronous `requests.post` or sync `OpenAI()` inside an `async def` FastAPI endpoint blocks the entire Python event loop thread, dropping concurrent throughput to 1 request at a time.',
          'Dynamic tensor shapes inside `@torch.compile` without `dynamic=True` trigger repeated graph recompilations on every new sequence length.',
        ],
      },
      {
        id: "wtf-is-openclaw",
        libraries: [{
          name: "OpenClaw",
          url: "https://docs.openclaw.ai/",
          purpose: "Follow how the gateway connects a messaging channel to an assistant.",
        }],
        title: "WTF is OpenClaw?",
        commandSlug: "wtf-is-openclaw",
        wtfQuestion: "How can I reach my own assistant from chat?",
        plainEnglish: "OpenClaw connects a chat channel to an AI assistant you run on your infrastructure. Its gateway receives a message, routes it to an agent, and sends the result back to the conversation.",
        whyItMatters: "A gateway lets someone request a briefing in the channel they already use.",
        realWorldSystems: ["Personal calendar briefings", "Chat-based assistants"],
        summary: "Decide who can use the channel before connecting a private account.",
        hasLab: false,
        architectureDiagram: "Chat → gateway → agent → calendar lookup",
        deepDiveParagraphs: [
          "Imagine asking in chat for a morning briefing. A connected calendar supplies today’s events, the configured model drafts the summary, and the gateway delivers it. You choose which accounts and tools that assistant can reach.",
          "Decide who can message the assistant, which calendar it may read, and where replies may appear. Running the gateway yourself still leaves a separate decision about the model provider that receives the text. A shared chat needs its own access rules.",
        ],
        keyTakeaways: ["Decide who can use the channel before connecting a private account."],
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ["A self-hosted gateway may still send content to a remote model provider."],
        knowledgeCheck: {"question": "Which permission does a calendar briefing need?", "answer": "Reading the relevant calendar is enough. Creating events or sending invitations would require a separate reason."},
        readingIds: ["res-openclaw"],
      },
      {
        id: "wtf-is-hermes-agent",
        libraries: [{
          name: "Hermes Agent",
          url: "https://github.com/NousResearch/hermes-agent",
          purpose: "Inspect the agent’s skill and memory features before connecting personal data.",
        }],
        title: "WTF is Hermes Agent?",
        commandSlug: "wtf-is-hermes-agent",
        wtfQuestion: "How can an assistant reuse a procedure next week?",
        plainEnglish: "Hermes Agent is an assistant from Nous Research that can use tools and keep reusable instructions called skills. Here “Hermes” means the agent software. Nous also uses the name for a family of language models.",
        whyItMatters: "Saved procedures let a recurring task use the same steps with fresh inputs.",
        realWorldSystems: ["Weekly inventory reports", "Reusable assistant skills"],
        summary: "Review stored procedures when a process changes.",
        hasLab: false,
        architectureDiagram: "Report request → saved skill → current inventory → summary",
        deepDiveParagraphs: [
          "Suppose you prepare the same weekly inventory report. A skill can record the steps for reading a table and formatting a summary. Another session can reuse that procedure with this week’s figures.",
          "A saved skill records a procedure. Memory can hold details across sessions. Both need review when a process changes. Keep customer records out of reusable instructions and review a skill before allowing it to act on important files. Saving a skill does not retrain the model.",
        ],
        keyTakeaways: ["Review stored procedures when a process changes."],
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ["Putting a customer record in a shared skill can expose it on later runs."],
        knowledgeCheck: {"question": "The report layout changes next week. What should you update?", "answer": "Review the saved reporting skill and try the revised procedure on a sample table."},
        readingIds: ["res-hermes"],
      },
      {
        id: "wtf-is-langchain",
        libraries: [{
          name: "LangChain",
          url: "https://docs.langchain.com/oss/python/langchain/overview",
          purpose: "Connect a chat model to a tool in a custom application.",
        }],
        title: "WTF is LangChain?",
        commandSlug: "wtf-is-langchain",
        wtfQuestion: "How do I add an assistant to an existing product?",
        plainEnglish: "LangChain is a library developers use to build their own AI applications. It gives an application a common way to call models and offer tools. The developer supplies the interface, data access rules and user experience.",
        whyItMatters: "A developer can connect models and tools while the application controls access to customer records.",
        realWorldSystems: ["Order tracking", "Product support assistants"],
        summary: "Check access in the service that supplies the data.",
        hasLab: false,
        architectureDiagram: "Order page → assistant → authorized order lookup",
        deepDiveParagraphs: [
          "A shop wants a support assistant inside its order page. Its developer can give the model a tool for checking delivery status. The application looks up the signed-in customer and only returns orders that customer may see.",
          "For an assistant reached through an existing chat channel, explore OpenClaw. For repeated personal tasks that can become saved skills, explore Hermes Agent. For a feature inside a product you build, LangChain supplies building blocks. The use cases overlap. A fixed order-status button can simply call the order service directly.",
        ],
        keyTakeaways: ["Check access in the service that supplies the data."],
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ["An order number supplied by a model is insufficient proof of ownership."],
        knowledgeCheck: {"question": "Who checks that a customer owns the order?", "answer": "The application or order service must check the signed-in identity for every lookup. A model-generated order number cannot establish ownership."},
        readingIds: ["res-langchain", "res-anthropic-effective-agents"],
      },
      {
        id: "wtf-is-langgraph",
        libraries: [{
          name: "LangGraph",
          url: "https://docs.langchain.com/oss/python/langgraph/overview",
          purpose: "Define workflow steps and checkpoints for a task that can pause and resume.",
        }],
        title: "WTF is LangGraph?",
        commandSlug: "wtf-is-langgraph",
        wtfQuestion: "How can an automated task wait for a person and resume tomorrow?",
        plainEnglish: "LangGraph is a runtime for arranging work into steps with shared state. In a workflow graph, each point represents a step and each arrow indicates where execution can go next.",
        whyItMatters: "A saved checkpoint lets a reviewer approve a pending step hours later.",
        realWorldSystems: ["Refund approvals", "Long-running review workflows"],
        summary: "Store the pending step and a stable request identifier.",
        hasLab: false,
        architectureDiagram: "Lookup → calculate → wait for approval → refund",
        deepDiveParagraphs: [
          "For a refund request, look up the order, calculate the amount, then wait for approval. A checkpoint saves the current state so the workflow can continue when the reviewer returns.",
          "A workflow can resume after a failure. Give the refund request a stable identifier and have the payment service recognize retries, so resuming the workflow cannot issue a second refund. LangChain offers higher-level agent tools built on LangGraph. LangGraph can also be used directly.",
        ],
        keyTakeaways: ["Store the pending step and a stable request identifier."],
        mathFormulas: [],
        codeExamples: [],
        pitfalls: ["Retrying a payment without checking its request identifier can issue two refunds."],
        knowledgeCheck: {"question": "What needs to survive the overnight wait?", "answer": "The order, amount, request identifier, approval status and pending step. Repeating the conversation from memory would lose the record of what was approved."},
        readingIds: ["res-langgraph"],
      },
      {
        id: 'wtf-is-multi-agent-orchestration',
        libraries: [{
          name: "LangGraph workflows and agents",
          url: "https://docs.langchain.com/oss/python/langgraph/workflows-agents",
          purpose: "Compare routing, parallel work and orchestrator-worker patterns.",
        }],
        title: 'WTF is Multi-Agent Orchestration (Lead-Subagent, DAGs, Git Worktrees & MCP)?',
        commandSlug: 'wtf-is-multi-agent-orchestration',
        wtfQuestion: 'Why does a single monolithic agent fall apart on complex 20-file tasks, and how do we orchestrate parallel subagents without merge conflicts or context rot?',
        plainEnglish:
          'When a single agent tries to research 30 files, write backend code, build shaders, and debug tests in one conversation, its context window fills up with noisy tool outputs ("Context Rot")—causing it to forget earlier constraints and hallucinate. Multi-Agent Orchestration solves this through Context Isolation and Division of Labor: a **Lead Orchestrator Agent** holds the high-level architectural plan and shared interface contract (`types/index.ts`), then spawns specialized **Subagents** in parallel—each running in its own fresh, clean context window! To prevent parallel coding agents from overwriting each other\'s files, we use either **Strict Directory Ownership Matrices** or **Git Worktree Isolation** (`git worktree add ../agent-b-branch`), followed by an **Evaluator-Optimizer Verification Gate** (`tsc -b && pytest`) before merging!',
        whyItMatters:
          'Multi-agent orchestration is how modern autonomous engineering systems (Antigravity, Claude Code Subagents, Devin, OpenAI Agents SDK, LangGraph) tackle repository-scale software engineering and deep research.',
        realWorldSystems: [
          'Lead Orchestrator + Parallel Subagent Context Isolation',
          'Git Worktree Parallel Agent Sandboxes (`git worktree add`)',
          'Model Context Protocol (MCP) JSON-RPC 2.0 Tool & Resource Servers',
        ],
        summary:
          'Multi-agent orchestration scales intelligence by isolating sub-tasks into clean subagent contexts governed by shared type contracts, DAG dependencies, Git worktrees, and deterministic verification gates.',
        deepDiveParagraphs: [
          'Five Core Orchestration Topologies: (1) **Prompt Chaining / Sequential Pipeline** (Step A output feeds Step B), (2) **Routing / Triage Handoff** (a fast classifier routes queries to specialized domain agents), (3) **Orchestrator-Workers / Parallel Fan-Out & Fan-In** (Lead agent locks the interface schema first, dispatches N parallel subagents with isolated file ownership, and synthesizes their outputs), (4) **Evaluator-Optimizer Loop** (Generator agent proposes code; Verifier agent runs deterministic tests/critiques and loops until green), and (5) **DAG Task Graph** (nodes execute as soon as all parent dependencies complete).',
          'Why Context Isolation Beats Giant Context Windows: Even with a 200k–1M token window, attention entropy increases with sequence length, and you pay quadratic prefill/KV-cache costs on every turn. When a subagent explores 40 files to answer a research question and returns a compact 500-token structured summary to the Lead Orchestrator, the parent context stays razor-sharp.',
          'Model Context Protocol (MCP): Instead of writing N x M custom integrations between every agent host and every database/tool, MCP defines a standardized JSON-RPC 2.0 protocol over `stdio` or `Streamable HTTP` exposing three primitives: `Tools` (model-controlled actions), `Resources` (app-controlled context files), and `Prompts` (user-controlled slash templates).',
        ],
        keyTakeaways: [
          'Never fan out parallel coding subagents before locking the shared TypeScript/Python interface contract in Phase 0.',
          'Use Git Worktrees (`git worktree add`) or disjoint file ownership directories so parallel workers never race on the same file.',
          'Subagents should act as "Context Compressors": doing heavy noisy exploration in an isolated context and returning only high-signal structured artifacts to the orchestrator.',
        ],
        mathFormulas: [
          {
            id: 'multi-agent-reliability-cost',
            title: 'Context Isolation KV Cost Savings & Parallel Verification Reliability',
            latexLike: 'Cost_monolith ∝ (∑_{k=1}^K L_k)^2   vs   Cost_subagents ∝ ∑_{k=1}^K L_k^2,     P(Pass_ensemble) = 1 - (1 - p_single)^K',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  [PHASE 0: Lead Orchestrator Locks Shared Contract `types.ts`]       │',
              '│         ├──▸ [Subagent A: Data]     (Isolated Context + File Scope)  │',
              '│         ├──▸ [Subagent B: WebGL]    (Isolated Context + File Scope)  │',
              '│         └──▸ [Subagent C: UI/CLI]   (Isolated Context + File Scope)  │',
              '│         ▼                                                            │',
              '│  [PHASE 2: Deterministic Build & Test Verification Gate (`tsc -b`)]  │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Splitting a 100k-token task across 4 isolated 25k-token subagents cuts cross-context attention complexity by 4x and keeps each agent focused on one job.',
            variables: [
              { symbol: 'L_k', name: 'Subagent k token trace length', role: 'Discarded after subagent returns its concise structured summary' },
              { symbol: 'K', name: 'Parallel worker / verifier count', role: 'Increases pass@K discovery while keeping wall-clock time constant' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Async Python Orchestrator-Worker Fan-Out with Deterministic Verification Gate',
            language: 'python',
            description: 'Production pattern for running parallel subagents with schema contracts and a verification loop.',
            code: `import asyncio
from dataclasses import dataclass

@dataclass
class SubagentTask:
    role: str
    owned_paths: list[str]
    prompt: str

async def run_subagent(client, task: SubagentTask) -> str:
    resp = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": f"Role: {task.role}. ONLY edit: {task.owned_paths}"},
            {"role": "user", "content": task.prompt},
        ],
    )
    return resp.choices[0].message.content

async def orchestrate_feature(client, tasks: list[SubagentTask]):
    # Fan-out: execute all isolated subagents concurrently
    results = await asyncio.gather(*(run_subagent(client, t) for t in tasks))
    return dict(zip([t.role for t in tasks], results))`,
          },
        ],
        pitfalls: [
          'Unbounded agent-to-agent chatter: Letting peer agents chat freely in a group loop without a central orchestrator or deterministic termination condition leads to infinite token-burning loops.',
          'Overlapping file writes: Launching two subagents that both edit `App.tsx` simultaneously causes race conditions unless isolated in separate git worktrees or sequenced after fan-in.',
        ],
      },
      {
        id: 'wtf-is-docker-cog-gpu-deploy',
        libraries: [{
          name: "Cog",
          url: "https://github.com/replicate/cog",
          purpose: "Package model dependencies and expose a prediction interface.",
        }],
        title: 'WTF is Docker for AI, NVIDIA GPU Containers, Cog (`cog.yaml`) & Distributed 5D Training?',
        commandSlug: 'wtf-is-docker-cog-gpu-deploy',
        wtfQuestion: 'How do you package a messy PyTorch/CUDA project into a reproducible GPU container and scale it across multi-GPU servers?',
        plainEnglish:
          '"It works on my machine" is ten times worse in AI because of CUDA driver versions, cuDNN mismatches, C++ FlashAttention wheels, and 15GB model weights. **Docker + NVIDIA Container Toolkit** solves this by packaging the user-space CUDA runtime, Python environment, and compiled wheels into an immutable image while exposing the host machine\'s physical GPUs via `--gpus all`. For custom ML models, **Cog (`cog.yaml`)** auto-generates best-practice CUDA/PyTorch Dockerfiles and wraps your `Predictor` class in an async HTTP/queue worker. And when a model is too big for one GPU, **5D Parallelism (DDP, ZeRO/FSDP, Tensor Parallelism, Pipeline Parallelism, and Context/Ring Parallelism)** shards weights, gradients, and optimizer states across NVLink and InfiniBand!',
        whyItMatters:
          'A model in a Jupyter notebook creates zero value until it is containerized, health-checked, and served with predictable latency and GPU utilization.',
        realWorldSystems: [
          'Docker Multi-Stage Builds + `nvidia-container-toolkit` (`--gpus all`)',
          'Replicate Cog (`cog.yaml` + `predict.py`) GPU Packaging',
          'PyTorch FSDP (ZeRO-3) & Megatron-LM Tensor Parallelism',
        ],
        summary:
          'Multi-stage Dockerfiles and Cog standardize CUDA/PyTorch packaging, while ZeRO/FSDP and Tensor Parallelism shard the 16-bytes-per-parameter training footprint across multi-GPU clusters.',
        deepDiveParagraphs: [
          'The 16-Bytes-Per-Parameter Mixed-Precision Rule: Why does full AdamW training of a 7B model require >112 GB of VRAM even in 16-bit precision? Because for every parameter Psi, you store: 2 bytes (BF16 weight) + 2 bytes (BF16 gradient) + 4 bytes (FP32 master weight) + 4 bytes (FP32 Adam momentum m_t) + 4 bytes (FP32 Adam variance v_t) = 16 * Psi bytes (plus activations)! ZeRO-3 / PyTorch FSDP shards all 16 bytes across N_gpu GPUs, gathering layer weights via `AllGather` just-in-time for each forward/backward layer.',
          'Docker & Cog GPU Best Practices: Never bake 20GB of `.safetensors` weights directly into a code layer that rebuilds on every 1-line Python edit. Use multi-stage builds with `uv` or `pip --mount=type=cache`, pin the base `nvidia/cuda` or `vllm/vllm-openai` image digest, mount model weights from a shared NVMe volume or VPC object store, and pre-compile CUDA kernels (`TORCH_CUDA_ARCH_LIST="8.0;8.9;9.0"`).',
        ],
        keyTakeaways: [
          'Mixed-precision AdamW training consumes 16 * Psi bytes of model/optimizer state before counting activations; FSDP/ZeRO-3 divides that by N_gpus.',
          'Tensor Parallelism (TP) splits individual matrix multiplies across fast intra-node NVLink (up to 8 GPUs); Pipeline/Data Parallelism scales across inter-node InfiniBand.',
          'Cog (`cog.yaml`) turns a standard Python `Predictor` class (`setup()` + `predict()`) into a production-ready CUDA container with automatic OpenAPI schemas.',
        ],
        mathFormulas: [
          {
            id: 'zero-fsdp-memory-formula',
            title: 'Mixed-Precision AdamW Memory Rule & ZeRO-1/2/3 (FSDP) Sharding',
            latexLike: 'VRAM_baseline = (2 + 2 + 12)Ψ = 16Ψ,     VRAM_ZeRO3 = 16Ψ / N_gpu + VRAM_activations',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Per Parameter Ψ in Mixed-Precision AdamW:                           │',
              '│  [BF16 Weight: 2B] + [BF16 Grad: 2B] + [FP32 Master+m+v: 12B] = 16B  │',
              '│  ZeRO-1 shards 12B | ZeRO-2 shards 14B | ZeRO-3 (FSDP) shards all 16B│',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Instead of replicating the same 112GB of weights and optimizer states on all 8 GPUs (DDP), each GPU owns 1/8th (14GB) and streams layer shards over NVLink right when needed.',
            variables: [
              { symbol: 'Ψ', name: 'Total parameter count', role: 'e.g. 7e9 for a 7B model -> 112 GB baseline state memory' },
              { symbol: 'N_gpu', name: 'Data/FSDP parallel degree', role: 'Number of GPUs sharding optimizer, gradient, and weight tensors' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Production Multi-Stage GPU Dockerfile + Replicate Cog (`cog.yaml` & `predict.py`)',
            language: 'bash',
            description: 'Complete blueprint for containerizing a PyTorch / vLLM / Cog inference service with GPU access.',
            code: `# 1. cog.yaml — Reproducible GPU Container Spec (Zero Manual Dockerfile Hassle)
build:
  gpu: true
  cuda: "12.4"
  python_version: "3.11"
  python_packages:
    - "torch==2.5.1"
    - "transformers==4.48.0"
    - "accelerate==1.2.1"
predict: "predict.py:Predictor"

# -------------------------------------------------------------------------
# 2. Production Docker Compose for Local vLLM + Agent Harness Gateway
# Run with: docker compose up -d
# -------------------------------------------------------------------------
# services:
#   vllm-engine:
#     image: vllm/vllm-openai:latest
#     command: --model deepseek-ai/DeepSeek-R1-Distill-Qwen-7B --max-model-len 16384 --gpu-memory-utilization 0.90
#     ports: ["8000:8000"]
#     deploy:
#       resources:
#         reservations:
#           devices:
#             - driver: nvidia
#               count: all
#               capabilities: [gpu]`,
          },
        ],
        pitfalls: [
          'Running Tensor Parallelism (TP > 8) across slow multi-node Ethernet instead of intra-node NVLink stalls GPUs on every single layer\'s AllReduce barrier.',
          'Downloading 15GB HuggingFace weights inside `predict()` instead of `setup()` or a mounted volume causes 3-minute cold-start timeouts on every request.',
        ],
      },
    ],
  },
];

export default MODULES_PART_2;

