import { TaxonomyModule } from '../types';

export const MODULES_PART_1: TaxonomyModule[] = [
  {
    id: '00_foundations',
    number: '00',
    slug: 'foundations',
    filePath: '~/wtfis-ai/00_foundations/index.md',
    title: 'Python & Mathematical Foundations: Linear Algebra, Calculus & Information Theory',
    shortTitle: 'Python & Math',
    subtitle: 'Why matrices warp space, gradients point uphill, and probabilities measure surprise.',
    layerCategory: 'MATH',
    defaultSceneId: 'loss-landscape',
    estimatedHours: 24,
    prerequisites: ['No prior coding for Python', 'High-school algebra for the math lessons'],
    coreTools: ['NumPy', 'PyTorch Tensors', 'einops', 'SciPy'],
    mentalModelSummary:
      'Many neural networks compose linear maps and nonlinear operations. Gradients describe how the objective changes locally. Cross-entropy is common for classification, while mean squared error is one option for regression.',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│                 GEOMETRY -> CALCULUS -> INFORMATION LOOP                   │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│                                                                            │',
      '│  [Input Vector x] ──▸ [Matrix W = U * Sigma * V^T] ──▸ [Logits z = Wx + b] │',
      '│        │               (Rotate -> Stretch -> Rotate)          │            │',
      '│        │                                                      ▼            │',
      '│  [Weight Update]  ◂── [Gradient dL/dW = (p - y)x^T] ◂── [Cross-Entropy L]  │',
      '│  W <- W - eta*g        (Reverse-Mode Chain Rule)        L = -sum y log(p)  │',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: "wtf-is-python",
        libraries: [{
          name: "Python statistics",
          url: "https://docs.python.org/3/library/statistics.html",
          purpose: "Use mean to calculate the average delivery time from the lesson.",
        }],
        title: "WTF is Python?",
        commandSlug: "wtf-is-python",
        wtfQuestion: "How can a few lines of Python calculate an average?",
        plainEnglish: "Python is a language for writing instructions a computer can repeat. Suppose you want the average of three deliveries. You can work it out once on paper. A small Python program can do the same job tomorrow when the numbers change.",
        whyItMatters: "One calculation can be reused with fresh data or to measure a model’s error.",
        realWorldSystems: ["Delivery reports", "Model evaluation scripts"],
        summary: "Use a list to hold several values and a variable to give that list a name.",
        hasLab: false,
        architectureDiagram: "minutes → sum and count → average",
        deepDiveParagraphs: [
          "The first line of the Code example names a list of delivery times. sum adds them together. len counts how many there are. print displays the result. Read it once and predict the number you will see.",
          "A model might predict a delivery time. Python can read past deliveries, give the examples to a training library, then compare the predictions with the actual times. You can learn that last step with a handful of numbers before training anything.",
          "A module groups reusable Python code under a name. For example, Python includes a statistics module. After writing “from statistics import mean”, you can use mean(minutes) to do the example calculation. Other libraries, such as pandas for tables, are installed separately.",
          "Start with variables and functions, then loops for repeating work, libraries for importing tools, and files for reading your own data. Harvard’s CS50P teaches these with exercises. For a first visual explanation of machine learning, follow the linked handwritten-digit lesson.",
        ],
        keyTakeaways: ["Use a list to hold several values and a variable to give that list a name."],
        mathFormulas: [],
        codeExamples: [{"title": "Calculate an average", "language": "python", "description": "Predict the output before changing the final delivery time.", "code": "minutes = [10, 20, 30]\nprint(sum(minutes) / len(minutes))"}],
        pitfalls: ["An empty list has no average. Check that it contains at least one observation."],
        knowledgeCheck: {"question": "If the last delivery takes 60 minutes instead of 30, what will Python display?", "answer": "30.0. The total is now 90 and there are still three deliveries. Changing one input changes the result without rewriting the calculation."},
        readingIds: ["res-cs50p", "res-python-video", "res-neural-intro"],
      },
      {
        id: 'wtf-is-vectors-svd',
        libraries: [{
          name: "NumPy linalg.svd",
          url: "https://numpy.org/doc/stable/reference/generated/numpy.linalg.svd.html",
          purpose: "Decompose a matrix and reconstruct it with fewer singular values.",
        }],
        title: 'WTF is a Matrix, SVD & Low-Rank Adaptation (LoRA)?',
        commandSlug: 'wtf-is-vectors-svd',
        wtfQuestion: 'What is a matrix actually doing to data, and why can we fine-tune a 70B LLM by updating less than 1% of its weights?',
        plainEnglish:
          'Stop thinking of a matrix as a spreadsheet of numbers. A matrix is a physical machine that warps space: you feed a vector (an arrow) in one side, and it spits out a rotated, stretched, or squashed arrow on the other side. Singular Value Decomposition (SVD) proves that ANY matrix, no matter how tangled, performs just three simple moves in sequence: a rotation, a pure stretch along perpendicular axes, and a second rotation. When we fine-tune a massive language model with LoRA, we exploit the fact that the change in weights only stretches space along a tiny handful of directions (low rank), so we can factor a giant 4096x4096 update matrix into two skinny matrices of size 4096x16 and 16x4096.',
        whyItMatters:
          'Every linear layer, attention projection, and KV-cache compression method in modern AI is governed by matrix rank and singular values. Understanding SVD explains why LoRA works, why activations collapse into low-dimensional subspaces, and how to compress models without destroying reasoning.',
        realWorldSystems: [
          'HuggingFace PEFT / LoRA & QLoRA Fine-Tuning',
          'DeepSeek-V2 / V3 Multi-Head Latent Attention (Low-Rank KV Compression)',
          'TensorRT-LLM Weight Factorization & SVD Quantization',
        ],
        summary:
          'Matrices are linear space transformations whose intrinsic dimensionality is revealed by Singular Value Decomposition (A = U Sigma V^T) and exploited by Low-Rank Adaptation (LoRA).',
        deepDiveParagraphs: [
          'When a neural network layer computes y = Wx, the columns of W tell you exactly where the standard basis vectors land after the transformation. If the columns of W are nearly collinear, an entire high-dimensional volume gets squashed onto a flat pancake—a phenomenon called rank collapse. The determinant det(W) measures how much a unit hypercube expands or shrinks in volume, while the eigenvectors of a square matrix define the invariant axes that only get scaled by their eigenvalues lambda without rotating.',
          'For rectangular weight matrices W in R^(m x n), eigenvalues do not exist directly, which is where Singular Value Decomposition (W = U Sigma V^T) becomes the Swiss Army knife of machine learning. Here, V^T rotates the input so its principal axes align with the coordinate axes; Sigma scales each axis by non-negative singular values sigma_1 >= sigma_2 >= ... >= sigma_r; and U rotates the stretched result into the output space. By the Eckart-Young-Mirsky theorem, keeping only the top k singular values gives the mathematically optimal rank-k approximation of W in both Frobenius and spectral norms.',
          'Hu et al. (2021) discovered that when you adapt a pre-trained LLM to a downstream task, the weight update matrix Delta W has a very low "intrinsic rank"—meaning almost all task adaptation energy lives in the top few singular vectors. Instead of storing optimizer states (Adam momentum and variance) for all d x k parameters of W_0, LoRA freezes W_0 and parameterizes Delta W = B * A, where A in R^(r x k) and B in R^(d x r) with r << min(d, k). Initializing A with Gaussian noise and B with zeros guarantees Delta W = 0 at step 0, preserving the pretrained model exactly while cutting trainable parameters by 100x to 1000x.',
        ],
        keyTakeaways: [
          'A matrix W in R^(m x n) is a linear map that rotates and stretches space; its rank is the number of independent dimensions that survive the transformation.',
          'SVD decomposes any matrix into W = U Sigma V^T (orthogonal rotation, diagonal singular value scaling, orthogonal rotation).',
          'LoRA freezes pretrained weights W_0 and learns Delta W = (alpha / r) B A with rank r in {8, 16, 64}, reducing VRAM requirements for optimizer states by over 99%.',
          'At inference time, LoRA adds zero latency because Delta W = B A can be merged directly into the base weight: W_merged = W_0 + (alpha / r) B A.',
        ],
        mathFormulas: [
          {
            id: 'svd-decomposition',
            title: 'Singular Value Decomposition & Eckart-Young Low-Rank Approximation',
            latexLike: 'W = U Σ V^T = ∑_{i=1}^{r} σ_i u_i v_i^T   ≈   W_k = ∑_{i=1}^{k} σ_i u_i v_i^T',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  W (m x n)  =  U (m x r)   *   Sigma (r x r)   *   V^T (r x n)       │',
              '│  Full Map      Left Ortho      Singular Scales     Right Ortho       │',
              '│                (Output Dir)    diag(s_1..s_r)      (Input Alignment) │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Every matrix is a sum of rank-1 outer products (u_i v_i^T) weighted by singular values sigma_i. Dropping small sigma_i strips away noise while keeping the dominant geometric directions.',
            variables: [
              { symbol: 'U', name: 'Left singular vectors', role: 'Orthonormal basis of output directions (U^T U = I)' },
              { symbol: 'Σ', name: 'Singular value matrix', role: 'Non-negative stretch factors ordered σ_1 >= σ_2 >= ... >= 0' },
              { symbol: 'V^T', name: 'Right singular vectors', role: 'Orthonormal basis of input directions (V^T V = I)' },
            ],
          },
          {
            id: 'lora-forward',
            title: 'Low-Rank Adaptation (LoRA) Forward Pass',
            latexLike: 'h = W_0 x + ΔW x = W_0 x + (α / r) B A x',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│                 x (d_in)                                             │',
              '│                 ├───▸ [Frozen W_0 (d_out x d_in)] ───┐               │',
              '│                 │                                    ├─▸ (+) ──▸ h   │',
              '│                 └───▸ [A (r x d_in)] ▸ [B (d_out x r)]┘  *(alpha/r)  │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Instead of learning a massive dense update matrix ΔW, project the input down to a tiny bottleneck of dimension r via A, then project back up via B.',
            variables: [
              { symbol: 'W_0', name: 'Pretrained frozen weight', role: 'Base knowledge matrix stored in FP16/BF16 or 4-bit NF4' },
              { symbol: 'A, B', name: 'Low-rank adapter matrices', role: 'Trainable bottleneck matrices (A ~ N(0, σ^2), B = 0 at init)' },
              { symbol: 'α / r', name: 'LoRA scaling factor', role: 'Stabilizes hyperparameter tuning when changing rank r' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'SVD Compression & Production LoRA Layer in PyTorch',
            language: 'python',
            description: 'Demonstrates optimal rank-k SVD reconstruction alongside a mergeable PyTorch LoRALinear module.',
            code: `import math
import torch
import torch.nn as nn

class LoRALinear(nn.Module):
    def __init__(self, in_features: int, out_features: int, rank: int = 16, alpha: float = 32.0):
        super().__init__()
        self.rank = rank
        self.scaling = alpha / rank
        
        # Frozen pretrained weight
        self.weight = nn.Parameter(torch.randn(out_features, in_features) * 0.02, requires_grad=False)
        
        # Trainable low-rank factors: A projects down to r, B projects up to out_features
        self.lora_A = nn.Parameter(torch.empty(rank, in_features))
        self.lora_B = nn.Parameter(torch.zeros(out_features, rank))
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        base_out = x @ self.weight.T
        lora_out = (x @ self.lora_A.T @ self.lora_B.T) * self.scaling
        return base_out + lora_out

    @torch.no_grad()
    def merge_weights(self) -> torch.Tensor:
        # Zero-overhead inference: fold B @ A directly into W_0
        return self.weight + (self.lora_B @ self.lora_A) * self.scaling

# Verify Eckart-Young SVD energy retention
W = torch.randn(512, 512)
U, S, Vh = torch.linalg.svd(W, full_matrices=False)
k = 32
W_approx = (U[:, :k] * S[:k]) @ Vh[:k, :]
rel_error = torch.linalg.norm(W - W_approx) / torch.linalg.norm(W)
print(f"Rank-{k} approximation error: {rel_error:.4f}")`,
          },
        ],
        pitfalls: [
          'Initializing both A and B to zero creates a saddle point where gradients for both matrices are identically zero forever; initializing both to random noise injects a massive destructive perturbation at step 0.',
          'Applying LoRA only to Query and Value projections (the original 2021 heuristic) underperforms on complex reasoning; modern best practice applies LoRA to all linear layers (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj).',
          'Forgetting to scale by alpha / r forces you to retune the learning rate every time you change the rank r.',
        ],
      },
      {
        id: 'wtf-is-gradient-descent',
        libraries: [{
          name: "PyTorch autograd",
          url: "https://docs.pytorch.org/docs/stable/autograd.html",
          purpose: "Compute the gradient of a small loss function before taking a descent step.",
        }],
        title: 'WTF is Gradient Descent, Jacobians & The Hessian?',
        commandSlug: 'wtf-is-gradient-descent',
        wtfQuestion: 'How do you find the bottom of a billion-dimensional canyon when you are blindfolded and can only feel the slope under your feet?',
        plainEnglish:
          'Imagine standing on a foggy mountain range where the elevation at any coordinate is your neural network’s error (loss). You cannot see the valley floor, so you tap your foot in every direction to feel which way slopes steepest uphill—that vector of slopes is the Gradient. Stepping in the exact opposite direction is Gradient Descent. The Jacobian generalizes this slope when a function outputs a vector instead of a single number, and the Hessian is a matrix of second derivatives that tells you how curved the terrain is—whether you are in a bowl, on a mountain peak, or stuck on a Pringles-shaped saddle point.',
        whyItMatters:
          'Every training crash, exploding loss spike, and slow convergence plateau comes down to the geometry of the Hessian matrix. The largest eigenvalue of the Hessian (sharpness) dictates the maximum safe learning rate before training diverges to NaN.',
        realWorldSystems: [
          'PyTorch torch.autograd / Functorch Jacobian-Vector Products',
          'Sharpness-Aware Minimization (SAM) & Edge-of-Stability Training',
          'Second-Order Pruning & GPTQ / SparseGPT Hessian Quantization',
        ],
        summary:
          'First-order gradients give the direction of steepest ascent, Jacobians propagate sensitivities across vector layers, and the Hessian matrix of second derivatives governs local curvature, saddle points, and step-size stability.',
        deepDiveParagraphs: [
          'For a scalar loss L(theta) with parameter vector theta in R^d, the gradient grad L(theta) points in the direction of greatest local increase. Why? Because the directional derivative along any unit vector u is the dot product grad L(theta) . u = ||grad L|| cos(phi), which is minimized when cos(phi) = -1, i.e., u points directly opposite the gradient. When a layer maps a vector x in R^n to a vector y in R^m, all partial derivatives assemble into the m x n Jacobian matrix J_ij = dy_i / dx_j, which linearly approximates how small nudges in x ripple into y.',
          'First derivatives alone cannot tell you how far to step. A second-order Taylor expansion around theta reveals L(theta + delta) approx L(theta) + g^T delta + 0.5 delta^T H delta, where H is the symmetric d x d Hessian matrix of second partial derivatives H_ij = d^2 L / (d theta_i d theta_j). Because H is symmetric, its eigenvectors form an orthogonal set of principal curvature axes, and its eigenvalues lambda_i measure how sharply curved each axis is.',
          'In high-dimensional neural networks (d > 10^8), true local minima (where all lambda_i > 0) are exponentially rare at high loss values; almost all critical points where grad L = 0 are saddle points with mixed positive and negative eigenvalues. Furthermore, if you step with learning rate eta along an eigenvector with sharpness lambda_max, the update multiplies the distance to the valley floor by (1 - eta * lambda_max). If eta > 2 / lambda_max, |1 - eta * lambda_max| > 1, causing the optimizer to catapult back and forth across the ravine walls with exponentially growing amplitude.',
        ],
        keyTakeaways: [
          'The gradient grad L(theta) is perpendicular to loss contour lines and points in the direction of steepest local ascent.',
          'The Jacobian matrix J in R^(m x n) represents the best linear approximation to a vector-valued function at a point.',
          'The Hessian H in R^(d x d) captures local curvature; its eigenvalues classify critical points into local minima (all lambda_i > 0), maxima (all lambda_i < 0), or saddle points (mixed signs).',
          'Step-size stability requires learning rate eta < 2 / lambda_max(H); exceeding this threshold causes oscillatory divergence along the sharpest ravine axis.',
        ],
        mathFormulas: [
          {
            id: 'second-order-taylor-hessian',
            title: 'Second-Order Taylor Expansion & Stability Condition',
            latexLike: 'L(θ - ηg) ≈ L(θ) - η ||g||^2 + (η^2 / 2) g^T H g,   Stability: η < 2 / λ_max(H)',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Loss Change  =  - eta * ||g||^2       +  0.5 * eta^2 * (g^T H g)    │',
              '│                  First-Order Descent      Curvature Penalty          │',
              '│                  (Always reduces L)       (Explodes if eta too big)  │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'If the terrain curves upward too sharply (large g^T H g) and your step size η is too large, the quadratic curvature term overwhelms the linear descent term and loss goes UP instead of down.',
            variables: [
              { symbol: 'g', name: 'Gradient vector ∇L(θ)', role: 'First-order slope vector in R^d' },
              { symbol: 'H', name: 'Hessian matrix ∇^2 L(θ)', role: 'Symmetric matrix of second partial derivatives' },
              { symbol: 'λ_max(H)', name: 'Maximum Hessian eigenvalue', role: 'Sharpness along the steepest ravine wall' },
            ],
          },
          {
            id: 'condition-number',
            title: 'Hessian Condition Number (Ill-Conditioned Ravines)',
            latexLike: 'κ(H) = |λ_max(H)| / |λ_min(H)|',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  kappa = 1 (Isotropic Bowl)      kappa >> 1000 (Narrow Ravine)       │',
              '│       ╭─────────╮                  ════════════════════════          │',
              '│      │   ( * )   │                 ───▸╲    ╱◂───Oscillates!         │',
              '│       ╰─────────╯                  ════════════════════════          │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'When κ(H) is huge, the loss surface is a narrow canyon: steep walls force a tiny learning rate, making progress along the flat canyon floor excruciatingly slow.',
            variables: [
              { symbol: 'κ(H)', name: 'Condition number', role: 'Ratio of sharpest to flattest curvature' },
              { symbol: 'λ_min(H)', name: 'Minimum eigenvalue', role: 'Curvature along the flat valley floor' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Computing Exact Hessian Eigenvalues & Power Iteration in PyTorch',
            language: 'python',
            description: 'Uses Hessian-Vector Products (HVPs) to find maximum sharpness without materializing a d x d matrix.',
            code: `import torch

def top_hessian_eigenvalue(loss_fn, params: torch.Tensor, iters: int = 25):
    """Estimate lambda_max(H) via Power Iteration using Hessian-Vector Products."""
    v = torch.randn_like(params)
    v = v / torch.linalg.norm(v)
    
    loss = loss_fn(params)
    grad = torch.autograd.grad(loss, params, create_graph=True)[0]
    
    eigval = 0.0
    for _ in range(iters):
        # Compute H @ v = grad(grad . v) in O(d) memory instead of O(d^2)
        hv = torch.autograd.grad(torch.dot(grad.view(-1), v.view(-1)), params, retain_graph=True)[0]
        eigval = torch.dot(v.view(-1), hv.view(-1)).item()
        v = hv / (torch.linalg.norm(hv) + 1e-12)
        
    max_safe_lr = 2.0 / abs(eigval)
    return eigval, max_safe_lr

# Example ill-conditioned quadratic ravine: L(x, y) = 50*x^2 + 0.5*y^2
theta = torch.tensor([1.0, 1.0], requires_grad=True)
lam_max, max_lr = top_hessian_eigenvalue(lambda p: 50.0 * p[0]**2 + 0.5 * p[1]**2, theta)
print(f"Max sharpness lambda_max = {lam_max:.1f} -> Max stable LR = {max_lr:.4f}")`,
          },
        ],
        pitfalls: [
          'Materializing the full Hessian H for a 1B parameter model requires 10^18 floats (~4 Exabytes of RAM); always use matrix-free Hessian-Vector Products (Pearlmutter’s trick) which cost only 2x a standard backward pass.',
          'Confusing grad L = 0 with a local minimum: in high dimensions, random critical points are almost always saddle points or flat plateaus.',
          'Using unscaled inputs where feature 1 is in [0, 1] and feature 2 is in [0, 10000] inflates the Hessian condition number kappa(H) by 10^8, paralyzing gradient descent.',
        ],
      },
      {
        id: 'wtf-is-cross-entropy',
        libraries: [{
          name: "PyTorch CrossEntropyLoss",
          url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html",
          purpose: "Compare unnormalized class scores with the correct class label.",
        }],
        title: 'WTF is Information Theory, Cross-Entropy & KL Divergence?',
        commandSlug: 'wtf-is-cross-entropy',
        wtfQuestion: 'Why do we train every LLM and classifier with Cross-Entropy instead of Mean Squared Error, and what does "bits of surprise" mean?',
        plainEnglish:
          'Information theory starts with a simple rule: hearing that an almost impossible event just happened gives you a lot of information (high surprise), while hearing that the sun rose today gives you almost zero information. Claude Shannon defined the exact "surprise" of an event with probability p as -log(p). Entropy is the average surprise of a true distribution P. Cross-Entropy measures how surprised your model Q is when reality follows P. Minimizing Cross-Entropy forces your model’s predicted probabilities Q to match reality P so it stops being surprised by the training data.',
        whyItMatters:
          'Cross-Entropy is the universal objective function of modern AI (GPT pre-training, image classification, speech recognition), while KL Divergence is the mathematical leash used in RLHF, GRPO, and VAEs to stop models from drifting into gibberish.',
        realWorldSystems: [
          'LLM Pre-Training Next-Token Cross-Entropy Loss & Perplexity (exp(H))',
          'RLHF / PPO / GRPO KL-Divergence Reference Policy Penalty',
          'Knowledge Distillation (Teacher-Student Temperature-Scaled KL)',
        ],
        summary:
          'Shannon entropy quantifies inherent uncertainty, Cross-Entropy measures the coding cost of predicting reality P using model Q, and KL Divergence measures the excess surprise from distribution mismatch.',
        deepDiveParagraphs: [
          'Why does Mean Squared Error (MSE) fail on classification probabilities? When you pass logits z through a softmax or sigmoid sigma(z) and compute L_MSE = 0.5 * (y - sigma(z))^2, the gradient with respect to z contains the derivative sigma\'(z) = sigma(z)(1 - sigma(z)). If your model is confidently wrong (say y = 1, but sigma(z) = 0.0001), sigma\'(z) is nearly zero! The gradient vanishes exactly when the model is most wrong. Cross-Entropy L_CE = -sum y_i log(p_i) uses the logarithm to mathematically cancel the exponential saturation of the softmax, yielding the remarkably clean gradient dL/dz = p - y: the gradient magnitude is directly proportional to how wrong the prediction is.',
          'Cross-Entropy H(P, Q) decomposes cleanly into two terms: H(P, Q) = H(P) + D_KL(P || Q). Here H(P) = -sum P(x) log P(x) is the irreducible entropy of the true data distribution, and D_KL(P || Q) = sum P(x) log(P(x) / Q(x)) is the Kullback-Leibler divergence—the extra bits wasted because your model Q does not match P. Since H(P) is fixed with respect to model parameters theta, minimizing Cross-Entropy is mathematically identical to minimizing KL divergence D_KL(P || Q_theta) and equivalent to Maximum Likelihood Estimation (MLE).',
          'Crucially, KL divergence is asymmetric: D_KL(P || Q) != D_KL(Q || P). Forward KL D_KL(P || Q) penalizes Q heavily wherever P(x) > 0 and Q(x) -> 0, forcing Q to spread out and cover all modes of P ("mode-covering" behavior seen in supervised pre-training). Reverse KL D_KL(Q || P) penalizes Q wherever Q(x) > 0 and P(x) -> 0, forcing Q to lock onto a single high-probability mode of P and ignore the rest ("mode-seeking" behavior used in RLHF and variational inference). Finally, this unifies Maximum Likelihood Estimation (MLE) and Maximum A Posteriori (MAP) estimation: minimizing Cross-Entropy is pure MLE (maximizing log P(D|theta)), whereas adding a prior log P(theta) yields MAP—where a zero-mean Gaussian prior on weights mathematically becomes L2 weight decay, and a Laplacian prior becomes L1 sparsity.',
        ],
        keyTakeaways: [
          'Surprise (self-information) is I(x) = -log P(x); Shannon Entropy H(P) is expected surprise.',
          'Cross-Entropy + Softmax yields the linear gradient dL/dz = p - y, preventing vanishing gradients when predictions are confidently wrong.',
          'Perplexity in LLMs is simply exp(Cross-Entropy): a perplexity of 8 means the model is as uncertain at each token as if rolling an 8-sided fair die.',
          'Forward KL D_KL(P||Q) is mode-covering (stretches over all data modes), whereas Reverse KL D_KL(Q||P) is mode-seeking (locks onto a single high-reward peak).',
        ],
        mathFormulas: [
          {
            id: 'cross-entropy-kl-decomposition',
            title: 'Cross-Entropy & KL Divergence Decomposition',
            latexLike: 'H(P, Q) = -∑_x P(x) log Q(x) = H(P) + D_KL(P || Q)',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  H(P, Q)           =  H(P)                  +  D_KL(P || Q)          │',
              '│  Total Surprise       Irreducible Reality      Model Mismatch Cost   │',
              '│  of Model Q           Entropy (Constant)       sum P(x) log(P/Q)>=0  │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Total surprise when using model Q equals the intrinsic randomness of reality H(P) plus the penalty D_KL(P||Q) paid for having an imperfect mental model.',
            variables: [
              { symbol: 'P(x)', name: 'True empirical distribution', role: 'Ground-truth target label or teacher distribution' },
              { symbol: 'Q(x)', name: 'Model predicted distribution', role: 'Softmax probability distribution parameterized by θ' },
              { symbol: 'D_KL(P||Q)', name: 'Kullback-Leibler Divergence', role: 'Non-negative measure of distribution drift (0 iff P = Q)' },
            ],
          },
          {
            id: 'logsumexp-softmax-grad',
            title: 'Numerically Stable Log-Softmax & Gradient Cancellation',
            latexLike: 'log p_i = z_i - m - log ∑_j exp(z_j - m),   ∂L_CE / ∂z_i = p_i - y_i',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  [Logits z] ──▸ [Subtract max m = max(z)] ──▸ [LogSumExp] ──▸ L_CE   │',
              '│       ▲                                                         │    │',
              '│       └─────────── Clean Gradient: dL/dz = p - y ───────────────┘    │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Subtracting the maximum logit m before exponentiating prevents exp(z) from overflowing to Infinity, while the log cancels the exp to give a linear gradient.',
            variables: [
              { symbol: 'z_i', name: 'Raw unnormalized logit', role: 'Output of final linear projection for token i' },
              { symbol: 'm', name: 'Maximum logit max_k(z_k)', role: 'Shift constant that guarantees exp(z_j - m) <= 1' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Numerically Stable Cross-Entropy & Forward vs Reverse KL in PyTorch',
            language: 'python',
            description: 'Implements LogSumExp cross-entropy from scratch and contrasts mode-covering vs mode-seeking KL.',
            code: `import torch

def stable_cross_entropy(logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
    """Numerically stable Cross-Entropy using the LogSumExp trick."""
    # Subtract max logit per row to prevent exp() overflow in FP16/BF16
    max_logits = logits.max(dim=-1, keepdim=True).values
    shifted = logits - max_logits
    log_probs = shifted - torch.log(torch.exp(shifted).sum(dim=-1, keepdim=True))
    
    # Gather log probability of the ground-truth token indices
    nll = -log_probs.gather(dim=-1, index=targets.unsqueeze(-1)).squeeze(-1)
    return nll.mean()

def kl_divergence(p: torch.Tensor, q: torch.Tensor, eps: float = 1e-8) -> torch.Tensor:
    """Computes D_KL(P || Q) = sum P(x) * log(P(x) / Q(x))."""
    p_safe = p.clamp(min=eps)
    q_safe = q.clamp(min=eps)
    return (p_safe * (p_safe.log() - q_safe.log())).sum(dim=-1)

# Verify gradient dL/dz = p - y
z = torch.tensor([[2.0, -1.0, 0.5]], requires_grad=True)
y = torch.tensor([0])
loss = stable_cross_entropy(z, y)
loss.backward()
print("Exact gradient dL/dz:", z.grad.round(decimals=4))`,
          },
        ],
        pitfalls: [
          'Computing torch.log(torch.softmax(logits, dim=-1)) separately causes catastrophic underflow to -inf when logits are negative and large; always fuse into F.cross_entropy or F.log_softmax.',
          'One-hot cross-entropy drives logits toward +infinity to make p_correct -> 1.0, causing overconfidence; Label Smoothing (e.g. epsilon = 0.1) or z-loss regularization keeps logits bounded.',
          'Swapping P and Q in KL divergence during RLHF/distillation silently switches between mode-covering and mode-seeking behavior.',
        ],
      },
    ],
  },
  {
    id: '01_classical_ml',
    number: '01',
    slug: 'classical-ml',
    filePath: '~/wtfis-ai/01_classical_ml/index.md',
    title: 'Classical Machine Learning: Generalization, Boosting & Manifolds',
    shortTitle: 'Classical ML',
    subtitle: 'Why models memorize noise, why XGBoost still rules tabular data, and how high-dimensional manifolds fold.',
    layerCategory: 'CLASSICAL',
    defaultSceneId: 'latent-galaxy',
    estimatedHours: 28,
    prerequisites: ['00_foundations'],
    coreTools: ['scikit-learn', 'XGBoost', 'LightGBM', 'UMAP-learn', 'Polars'],
    mentalModelSummary:
      'Statistical learning balances model flexibility against finite-sample noise. While neural networks thrive on smooth perceptual signals, second-order gradient boosted trees dominate jagged tabular boundaries, and spectral/topological projections reveal low-dimensional data manifolds.',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│                GENERALIZATION, BOOSTING & MANIFOLD GEOMETRY                │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│                                                                            │',
      '│  [Raw Features X] ──┬──▸ [Second-Order Tree Ensemble] ──▸ Sum f_k(x)       │',
      '│                     │     Split Gain = (G_L^2/H_L + G_R^2/H_R - G^2/H)/2   │',
      '│                     │                                                      │',
      '│                     └──▸ [Manifold Projection (PCA / UMAP)]                │',
      '│                           High-D k-NN Graph ──▸ Low-D Latent Clusters      │',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: 'wtf-is-overfitting',
        libraries: [{
          name: "scikit-learn model selection",
          url: "https://scikit-learn.org/stable/modules/cross_validation.html",
          purpose: "Estimate how a fitted model performs on held-out folds.",
        }],
        title: 'WTF is Overfitting, Bias-Variance & Double Descent?',
        commandSlug: 'wtf-is-overfitting',
        wtfQuestion: 'How can a model get 100% on its practice exam and fail completely in production—and why do massive neural networks break the classic textbook U-curve?',
        plainEnglish:
          'Imagine studying for a math test by memorizing the exact page numbers and font smudges of the practice sheet instead of learning how to multiply. That is Overfitting: your model fits the random noise in the training set rather than the underlying pattern. Classical statistics says there is a strict tug-of-war between Bias (being too rigid to learn the rule) and Variance (being so wiggly you memorize every outlier). Yet modern deep learning discovered a wild plot twist called Double Descent: once a network becomes massively larger than the number of training points, test error spikes at the interpolation threshold and then drops a SECOND time to its lowest level ever.',
        whyItMatters:
          'Diagnosing whether your system is failing from high bias (underfitting), high variance (overfitting), or train-test data leakage dictates whether you should scale model size, collect more data, or add regularization.',
        realWorldSystems: [
          'Time-Series & Financial Cross-Validation Pipelines (Purged K-Fold)',
          'Overparameterized LLM Scaling Regimes (Modern Interpolation Zone)',
          'Ridge (L2) & Lasso (L1) Feature Selection in Production Tabular ML',
        ],
        summary:
          'Expected test error decomposes into Bias^2 + Variance + Noise; while classical models overfit past the interpolation threshold, overparameterized models trained with gradient descent enter a smooth minimum-norm interpolation regime.',
        deepDiveParagraphs: [
          'For any regression target y = f(x) + epsilon where epsilon has variance sigma^2, the expected squared error on an unseen point x decomposes into three orthogonal pieces: E[(y - f_hat(x))^2] = Bias(f_hat(x))^2 + Var(f_hat(x)) + sigma^2. Bias measures systematic error—how far the average prediction across possible training sets sits from the truth. Variance measures sensitivity—how violently your model swings if you swap out a few training samples. Regularization methods like L2 (Ridge) and L1 (Lasso) intentionally inject a tiny amount of bias in exchange for a massive reduction in variance.',
          'Geometrically, L2 regularization restricts weights to a spherical ball ||w||_2^2 <= C, shrinking all weights proportionally (and corresponding to a Gaussian prior in Maximum A Posteriori estimation). L1 regularization restricts weights to a diamond-shaped cross-polytope ||w||_1 <= C; because the loss contours hit the sharp corners of the diamond along the coordinate axes, L1 drives irrelevant feature weights to exact zero (corresponding to a Laplacian prior).',
          'Why does Double Descent happen? When model parameters P equal the number of training examples N (the interpolation threshold P approx N), there is essentially only ONE fragile configuration of weights that can pass through every noisy training point, forcing weights to explode and test error to skyrocket. However, when P >> N, infinitely many weight configurations can interpolate the training data with zero loss! Gradient descent acts as an implicit regularizer, automatically selecting the interpolating solution with the smallest norm (the smoothest possible curve), causing test error to fall below the classical U-curve minimum.',
        ],
        keyTakeaways: [
          'Test Error = Bias^2 (underfitting) + Variance (sensitivity to sample noise) + Irreducible Noise sigma^2.',
          'L1 regularization (Lasso) induces exact sparsity via sharp diamond corners; L2 (Ridge) shrinks correlated weights smoothly.',
          'Double Descent peaks sharply at the interpolation threshold (Parameters approx Samples) before descending again in the overparameterized regime due to implicit minimum-norm bias of SGD.',
          'The #1 cause of fake 99% validation accuracy in industry is data leakage (fitting scalers/imputers before splitting or shuffling time-series data).',
        ],
        mathFormulas: [
          {
            id: 'bias-variance-decomposition',
            title: 'Bias-Variance Decomposition & ElasticNet Regularization',
            latexLike: 'E[(y - f̂(x))^2] = (E[f̂(x)] - f(x))^2 + E[(f̂(x) - E[f̂(x)])^2] + σ^2',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Test Error                        │     ^                           │',
              '│      ▲      Classical U-Curve      │     │    Overparameterized      │',
              '│      │       ╲        ╱            │     │    Minimum-Norm Regime    │',
              '│      │        ╲______╱             │     │      ╲                    │',
              '│      │                             │     │       ╲_______________    │',
              '│      └─────────────────────────────┴─────┴───────────────────────▸   │',
              '│                                  P ≈ N   Model Capacity (Parameters) │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'At P = N, the model is forced to contort violently to hit every noisy data point. For P >> N, extra dimensions provide room to interpolate smoothly with tiny weight norms.',
            variables: [
              { symbol: 'Bias^2', name: 'Squared Bias (E[f̂] - f)^2', role: 'Error from overly simplistic model assumptions' },
              { symbol: 'Var(f̂)', name: 'Estimator Variance', role: 'Error from memorizing random fluctuations in training data' },
              { symbol: 'σ^2', name: 'Aleatoric Noise', role: 'Irreducible randomness inherent in the data-generating process' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Empirical Bias-Variance Decomposition & Leakage-Free Pipeline',
            language: 'python',
            description: 'Computes exact bias and variance across bootstrap trials and shows leak-free preprocessing.',
            code: `import numpy as np

def estimate_bias_variance(degree: int, n_trials: int = 200, n_samples: int = 25):
    rng = np.random.default_rng(42)
    x_test = np.linspace(-1, 1, 100)
    f_true = np.sin(np.pi * x_test)
    preds = np.zeros((n_trials, len(x_test)))

    for t in range(n_trials):
        x_train = rng.uniform(-1, 1, n_samples)
        y_train = np.sin(np.pi * x_train) + rng.normal(0, 0.3, n_samples)
        coeffs = np.polyfit(x_train, y_train, deg=degree)
        preds[t] = np.polyval(coeffs, x_test)

    mean_pred = preds.mean(axis=0)
    bias_sq = np.mean((mean_pred - f_true) ** 2)
    variance = np.mean(np.var(preds, axis=0))
    return bias_sq, variance

for deg in [1, 3, 12]:
    b2, var = estimate_bias_variance(deg)
    print(f"Degree {deg:2d} -> Bias^2: {b2:.4f} | Variance: {var:.4f} | Total: {b2+var:.4f}")`,
          },
        ],
        pitfalls: [
          'Calling StandardScaler().fit_transform(X) on the entire dataset before train_test_split leaks global test statistics into training.',
          'Using random k-fold split on time-series or user-grouped data lets the model peek into the future or memorize user IDs; always use TimeSeriesSplit or GroupKFold.',
          'Stopping training early right at the interpolation threshold peak without realizing either stronger regularization or higher capacity resolves the spike.',
        ],
      },
      {
        id: 'wtf-is-gradient-boosting',
        libraries: [{
          name: "XGBoost",
          url: "https://xgboost.readthedocs.io/en/stable/python/python_intro.html",
          purpose: "Fit boosted trees and evaluate them on held-out rows.",
        }],
        title: 'WTF is XGBoost & Second-Order Gradient Boosting?',
        commandSlug: 'wtf-is-gradient-boosting',
        wtfQuestion: 'Why do Gradient Boosted Decision Trees still crush deep neural networks on structured tabular spreadsheets?',
        plainEnglish:
          'A single decision tree is like playing 20 Questions with your data ("Is age > 35? Is income > $80k?"), which makes it great at sharp rules but terrible at accuracy on its own. Gradient Boosting builds a relay team of hundreds of tiny trees where each new tree does NOT try to predict the answer from scratch—instead, it only predicts the leftover mistake (residual) of all the trees before it. XGBoost supercharges this by looking at both the first derivative (slope g_i) AND the second derivative (curvature h_i) of the loss for every single row, allowing each tree split to take a mathematically optimal Newton-Raphson step.',
        whyItMatters:
          'In production fraud detection, credit scoring, click-through rate prediction, and medical risk modeling, XGBoost/LightGBM/CatBoost deliver higher accuracy, 100x faster training, and native missing-value handling compared to deep neural networks.',
        realWorldSystems: [
          'Stripe / PayPal Real-Time Payment Fraud Scoring (XGBoost / LightGBM)',
          'Airbnb & Uber Search Ranking & Dynamic Pricing Ensembles',
          'Quantitative Finance Tabular Alpha Signals',
        ],
        summary:
          'XGBoost minimizes a regularized second-order Taylor expansion of the loss across additive trees, using exact gradient and Hessian statistics to score candidate splits and prune leaves.',
        deepDiveParagraphs: [
          'Why do neural networks struggle on tabular data while trees win? Tabular columns are heterogeneous (categorical IDs, skewed dollar amounts, timestamps), contain uninformative features, and have sharp axis-aligned decision boundaries (e.g., a tax bracket cliff at exactly $100,000). Neural networks are rotationally invariant and have a strong inductive bias toward overly smooth functions, making them vulnerable to uninformative noisy columns. Decision trees perform axis-aligned threshold splits that are completely invariant to monotonic feature scaling and naturally isolate sharp discontinuities.',
          'At boosting round t, we have current predictions y_hat^(t-1) and want to add a new tree f_t(x) to minimize sum_i L(y_i, y_hat_i^(t-1) + f_t(x_i)) + Omega(f_t), where Omega(f) = gamma * T + 0.5 * lambda * sum_j w_j^2 penalizes the number of leaves T and leaf weights w_j. Expanding the loss to second order via Taylor’s theorem gives a quadratic objective in terms of first-order gradients g_i = dL/dy_hat and second-order Hessians h_i = d^2L/dy_hat^2.',
          'Because every sample i lands in exactly one leaf j, we can sum the gradients G_j = sum_{i in I_j} g_i and Hessians H_j = sum_{i in I_j} h_i inside each leaf and solve for the optimal leaf weight in closed form: w_j* = -G_j / (H_j + lambda). Substituting w_j* back into the objective gives an exact formula for the Split Gain of dividing a node into Left and Right children—turning tree construction into a fast histogram scan over sorted feature buckets.',
        ],
        keyTakeaways: [
          'Boosting trains trees sequentially on residual errors (reduces bias), unlike Random Forests which train trees in parallel on bootstrap samples (reduces variance).',
          'XGBoost uses a second-order Taylor approximation (g_i and h_i), turning tree leaf assignment into a regularized Newton step: w_j* = -G_j / (H_j + lambda).',
          'Trees are invariant to monotonic feature transformations—you never need to standardize or log-scale numerical features for XGBoost.',
          'Histogram binning (LightGBM / XGBoost hist) buckets continuous features into 256 discrete bins, reducing split-finding complexity from O(N log N) to O(N).',
        ],
        mathFormulas: [
          {
            id: 'xgboost-split-gain',
            title: 'XGBoost Optimal Leaf Weight & Split Gain Formula',
            latexLike: 'w_j^* = - G_j / (H_j + λ),   Gain = (1/2) [ G_L^2/(H_L + λ) + G_R^2/(H_R + λ) - (G_L + G_R)^2/(H_L + H_R + λ) ] - γ',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│                  [Parent Node: G = G_L+G_R, H = H_L+H_R]             │',
              '│                        Split: Feature_k < threshold ?                │',
              '│                   ┌──────────────────┴──────────────────┐            │',
              '│                   ▼                                     ▼            │',
              '│        [Left Leaf: w_L* = -G_L/(H_L+λ)]     [Right Leaf: w_R*]       │',
              '│        Prune split if Gain < 0 (i.e. improvement < complexity γ)     │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Each leaf weight is the ratio of total slope G_j to total curvature H_j (plus damping λ). A split is only kept if the combined score of the two child leaves beats the parent score by more than the complexity tax γ.',
            variables: [
              { symbol: 'G_L, G_R', name: 'Sum of 1st-order gradients', role: 'Total residual force in left/right child node' },
              { symbol: 'H_L, H_R', name: 'Sum of 2nd-order Hessians', role: 'Total certainty/curvature weight in left/right child' },
              { symbol: 'λ, γ', name: 'L2 leaf damping & split penalty', role: 'Regularization hyperparameters preventing overfitting' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Second-Order XGBoost Split Finder From Scratch in NumPy',
            language: 'python',
            description: 'Computes exact Newton leaf weights and optimal threshold split gain using g_i and h_i.',
            code: `import numpy as np

def find_best_xgboost_split(x_feature: np.ndarray, g: np.ndarray, h: np.ndarray, reg_lambda: float = 1.0, gamma: float = 0.1):
    """Finds the exact feature threshold maximizing XGBoost 2nd-order Gain."""
    order = np.argsort(x_feature)
    x_sorted, g_sorted, h_sorted = x_feature[order], g[order], h[order]
    
    G_total, H_total = g_sorted.sum(), h_sorted.sum()
    parent_score = (G_total ** 2) / (H_total + reg_lambda)
    
    G_L, H_L = 0.0, 0.0
    best_gain, best_threshold = -np.inf, None
    
    for i in range(len(x_sorted) - 1):
        G_L += g_sorted[i]
        H_L += h_sorted[i]
        if x_sorted[i] == x_sorted[i + 1]:
            continue  # Skip identical feature values
        G_R, H_R = G_total - G_L, H_total - H_L
        gain = 0.5 * ((G_L**2)/(H_L + reg_lambda) + (G_R**2)/(H_R + reg_lambda) - parent_score) - gamma
        if gain > best_gain:
            best_gain = gain
            best_threshold = 0.5 * (x_sorted[i] + x_sorted[i + 1])
            
    return best_threshold, best_gain

# Demo on binary log-loss gradients: g_i = p_i - y_i, h_i = p_i * (1 - p_i)
x = np.array([10.0, 20.0, 30.0, 80.0, 90.0, 100.0])
y = np.array([0.0, 0.0, 0.0, 1.0, 1.0, 1.0])
p = np.full_like(y, 0.5)
thresh, gain = find_best_xgboost_split(x, g=p - y, h=p * (1 - p))
print(f"Optimal Split Threshold: {thresh} | Second-Order Gain: {gain:.4f}")`,
          },
        ],
        pitfalls: [
          'Decision trees CANNOT extrapolate linear trends outside the min/max range seen in training (e.g. inflation or stock prices): every input above max(x_train) falls into the exact same terminal leaf.',
          'One-hot encoding high-cardinality categorical variables (like 10,000 zip codes) ruins tree split balance; use native categorical partitioning or out-of-fold target statistics.',
          'Setting max_depth too high (>10) without tuning min_child_weight (minimum sum of Hessians H_j in a leaf) causes trees to isolate single noisy rows.',
        ],
      },
      {
        id: 'wtf-is-embeddings-manifolds',
        libraries: [{
          name: "UMAP",
          url: "https://umap-learn.readthedocs.io/en/latest/basic_usage.html",
          purpose: "Project high-dimensional observations into two dimensions and inspect their neighborhoods.",
        }],
        title: 'WTF is an Embedding Space, PCA & UMAP?',
        commandSlug: 'wtf-is-embeddings-manifolds',
        wtfQuestion: 'What does it actually mean to turn a paragraph or image into a 1536-dimensional vector, and how do we project it down to 3D without crushing its structure?',
        plainEnglish:
          'An embedding is a GPS coordinate for meaning. Instead of storing words or images by their spelling or pixel colors, an embedding model assigns every item a list of numbers (say, 1536 coordinates) so that items with similar meanings sit right next to each other in high-dimensional space. However, 1536-dimensional space is weird: almost all volume lives in the thin outer shell of a hypersphere, and straight-line Euclidean distances stop making sense ("the Curse of Dimensionality"). Even though the ambient space has 1536 dimensions, real-world data actually lies on a twisted, lower-dimensional ribbon called a Manifold. PCA flattens this space by shining a light from the angle of widest spread, while UMAP builds a neighborhood friendship graph in high dimensions and untangles it gently into 2D or 3D.',
        whyItMatters:
          'Embeddings power every vector database, semantic search engine, recommendation system, and multimodal bridge; PCA and UMAP are the primary diagnostic microscopes for inspecting latent representations and detecting cluster drift.',
        realWorldSystems: [
          'OpenAI text-embedding-3 / Cohere / BGE Dense Retrieval Spaces',
          'Single-Cell Genomics & Latent Space Visualization via UMAP',
          'FAISS Product Quantization & PCA Pre-Whitening Pipelines',
        ],
        summary:
          'Embeddings map discrete objects into continuous geometric spaces where semantic similarity equals angular proximity; PCA extracts linear variance axes via SVD while UMAP preserves local topological neighborhoods via fuzzy simplicial sets.',
        deepDiveParagraphs: [
          'Why do we almost always measure embedding similarity with Cosine Similarity rather than Euclidean distance? In high dimensions (d > 512), the Curse of Dimensionality causes the ratio between the farthest and nearest Euclidean distances of random points to converge toward 1. Furthermore, vector magnitude ||x|| often encodes token frequency or document length rather than semantic meaning. Projecting vectors onto the unit hypersphere (L2 normalization) makes Cosine Similarity identical to a fast dot product x . y = ||x|| ||y|| cos(theta), where Euclidean distance squared is simply ||x - y||^2 = 2 - 2(x . y).',
          'Principal Component Analysis (PCA) is a global linear projection: it centers the data matrix X and computes the top k eigenvectors of the covariance matrix C = (1/N) X^T X (or equivalently, the top k right singular vectors V_k of X via SVD). PCA guarantees that the projected coordinates preserve the maximum possible global pairwise variance, making distances and axes directly interpretable, but it will flatten a coiled 3D Swiss Roll like a pancake.',
          'Uniform Manifold Approximation and Projection (UMAP) and t-SNE both assume the data lies on a Riemannian manifold where local neighborhoods are flat. Why did t-SNE replace a Gaussian kernel in 2D with a heavy-tailed Student-t distribution (1 + ||z_i - z_j||^2)^{-1}? Because of the "Crowding Problem": the volume of a sphere in D dimensions grows as r^D, whereas in 2D it grows only as r^2, so moderate high-D distances crush together in the center of a 2D map unless the 2D similarity curve has heavy tails that stretch moderate distances apart. UMAP goes further by constructing a fuzzy simplicial k-NN graph normalized by each point’s distance to its closest neighbor and minimizing fuzzy cross-entropy (with both attractive and repulsive forces)—running much faster than t-SNE while preserving global cluster topology far better.',
        ],
        keyTakeaways: [
          'For L2-normalized embeddings on the unit hypersphere, Cosine Similarity, Dot Product, and Euclidean Distance produce the exact same nearest-neighbor ranking.',
          'The Johnson-Lindenstrauss Lemma proves that N points in any dimension can be projected down to O(log N / eps^2) dimensions while preserving pairwise distances within (1 +- eps).',
          'PCA is a deterministic linear projection maximizing global variance via SVD; UMAP is a non-linear topological projection preserving local neighborhood graphs.',
          'Never over-interpret cluster sizes or long-range gaps between separated islands in UMAP/t-SNE plots—density is locally normalized.',
        ],
        mathFormulas: [
          {
            id: 'cosine-pca-umap',
            title: 'Cosine Similarity vs Fuzzy Topological Cross-Entropy (UMAP)',
            latexLike: 'cos(θ) = (x · y) / (||x|| ||y||),   L_UMAP = ∑_{i≠j} [ p_ij log(p_ij / q_ij) + (1 - p_ij) log((1 - p_ij)/(1 - q_ij)) ]',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  p_ij * log(p_ij / q_ij)        +   (1 - p_ij) * log((1-p_ij)/(1-q)) │',
              '│  Attractive Force                   Repulsive Force                  │',
              '│  (Pulls true k-NN neighbors close)  (Pushes unrelated clusters away) │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Unlike t-SNE (which only normalizes over present edges), UMAP treats every edge as a Bernoulli coin flip and includes the (1 - p_ij) repulsive term, preserving much better global cluster arrangement.',
            variables: [
              { symbol: 'p_ij', name: 'High-D fuzzy simplicial weight', role: 'Symmetrized probability that points i and j are local neighbors' },
              { symbol: 'q_ij', name: 'Low-D layout similarity', role: 'Smooth curve (1 + a ||z_i - z_j||^{2b})^{-1} in 2D/3D space' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'SVD-Based PCA & Cosine Nearest-Neighbor Search in NumPy',
            language: 'python',
            description: 'Projects high-dimensional embeddings onto their top principal components and performs unit-sphere cosine search.',
            code: `import numpy as np

def pca_project(X: np.ndarray, k: int = 3):
    """Exact PCA via centered Singular Value Decomposition."""
    X_centered = X - X.mean(axis=0, keepdims=True)
    U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
    explained_var_ratio = (S[:k] ** 2) / np.sum(S ** 2)
    return X_centered @ Vt[:k].T, explained_var_ratio

def cosine_topk(query: np.ndarray, matrix: np.ndarray, k: int = 3):
    """Fast vector search via L2-normalized dot product."""
    q_norm = query / (np.linalg.norm(query) + 1e-12)
    m_norm = matrix / (np.linalg.norm(matrix, axis=1, keepdims=True) + 1e-12)
    scores = m_norm @ q_norm
    top_idx = np.argsort(-scores)[:k]
    return top_idx, scores[top_idx]

X_emb = np.random.randn(200, 128)
coords_3d, var_ratio = pca_project(X_emb, k=3)
print("Top-3 PCA variance captured:", np.round(var_ratio, 4))`,
          },
        ],
        pitfalls: [
          'Running clustering (like K-Means or DBSCAN) on 2D UMAP coordinates instead of high-D or PCA-reduced embeddings: UMAP can hallucinate tight clusters out of pure Gaussian noise if n_neighbors is small.',
          'Comparing embeddings from two different models (or two checkpoints) directly without Procrustes alignment: embedding spaces are invariant to arbitrary orthogonal rotations.',
          'Anisotropy ("the representation cone problem"): raw transformer embeddings often crowd into a narrow cone with high baseline cosine similarity; centering (subtracting the mean vector) restores isotropic retrieval accuracy.',
        ],
      },
    ],
  },
  {
    id: '02_deep_learning',
    number: '02',
    slug: 'deep-learning',
    filePath: '~/wtfis-ai/02_deep_learning/index.md',
    title: 'Deep Learning Core: Autograd, Residual Highways & Modern Optimizers',
    shortTitle: 'Deep Learning',
    subtitle: 'How reverse-mode autodiff flows backward, why Pre-Norm residual streams never vanish, and how AdamW & Muon navigate ravines.',
    layerCategory: 'DEEP_LEARNING',
    defaultSceneId: 'neural-lattice',
    estimatedHours: 36,
    prerequisites: ['00_foundations', '01_classical_ml'],
    coreTools: ['PyTorch', 'torch.autograd', 'einops', 'TorchCompile'],
    mentalModelSummary:
      'Deep learning is differentiable programming: programs composed of tensor operations built around an unblocked residual superhighway (x_{l+1} = x_l + F(RMSNorm(x_l))), differentiated automatically via reverse-mode Vector-Jacobian Products, and updated by moment-normalized optimizers.',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│                  MODERN PRE-NORM RESIDUAL STREAM & AUTOGRAD                │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│                                                                            │',
      '│  Residual Highway x_l ═══════════════════════════════════════▸ (+) ──▸ x_l+1',
      '│                        │                                        ▲          │',
      '│                        └──▸ [RMSNorm] ──▸ [SwiGLU / Attn] ──────┘          │',
      '│                                                                            │',
      '│  Backward Pass:  dL/dx_l  <═══  dL/dx_{l+1} * ( I  +  dF/dx_l )            │',
      '│                  (Identity "I" guarantees unimpeded gradient highway!)     │',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: 'wtf-is-backprop',
        libraries: [{
          name: "micrograd",
          url: "https://github.com/karpathy/micrograd",
          purpose: "Trace how a scalar computation graph accumulates gradients during a backward pass.",
        }],
        title: 'WTF is a Neural Network & Backpropagation?',
        commandSlug: 'wtf-is-backprop',
        wtfQuestion: 'How does backpropagation measure the sensitivity of the loss to each weight?',
        plainEnglish:
          'A neural network without non-linear activation functions is a total fraud—if you stack 100 matrices in a row without a non-linear bend in between, they collapse into a single matrix and can only draw flat lines. By inserting simple folds (like ReLU or SwiGLU) between matrices, the network can fold and sculpt space into any shape imaginable (Universal Approximation). Backpropagation is simply the Chain Rule from calculus combined with dynamic programming: during the forward pass, every operation writes down a tiny local receipt of its inputs. During the backward pass, the error signal starts at the end and walks backward through the receipts, multiplying local sensitivities (Vector-Jacobian Products) so every single weight learns its exact blame in just ONE backward sweep.',
        whyItMatters:
          'Understanding reverse-mode automatic differentiation explains why training uses 3x-4x more GPU memory than inference (storing forward activations for the backward pass) and why techniques like Gradient Checkpointing trade compute for VRAM.',
        realWorldSystems: [
          'PyTorch C++ Autograd Engine & TorchDynamo AOTAutograd',
          'JAX jax.vjp / jax.grad Functional Transformations',
          'Activation Checkpointing in Megatron-LM & DeepSpeed',
        ],
        summary:
          'Non-linear activations prevent linear layer collapse, while backpropagation computes exact gradients with respect to millions of parameters in O(1) passes via reverse-mode Vector-Jacobian Products (VJPs).',
        deepDiveParagraphs: [
          'Why can’t we just nudge each weight w_i by +0.0001 and measure whether the loss goes up or down (finite differences)? Because a 7-billion parameter model would require 7 billion separate forward passes just to take ONE step! Calculus distinguishes between Forward-Mode Autodiff (Jacobian-Vector Products, JVP), which computes the derivative of all outputs with respect to ONE input in a single pass, and Reverse-Mode Autodiff (Vector-Jacobian Products, VJP), which computes the derivative of ONE scalar output (the Loss!) with respect to ALL 7 billion parameters in a single backward pass.',
          'Consider a linear layer Y = X W + b during the backward pass, where the upstream layer hands us the gradient G = dL/dY of shape (Batch, d_out). Without ever building a massive 4D Jacobian tensor, the VJP rules tell us immediately: the gradient for the weights is dL/dW = X^T G, the gradient for the inputs is dL/dX = G W^T, and the gradient for the bias is dL/db = sum_batch(G). Notice that computing dL/dW = X^T G requires the forward activation X! That is why training memory scales linearly with sequence length and layer depth unless you recompute X on the fly (Activation Checkpointing).',
          'In the computation DAG, elementary operations act as gradient routers: an addition gate z = x + y distributes the upstream gradient equally to both branches (dz/dx = 1, dz/dy = 1), a multiplication gate z = x * y swaps inputs (dz/dx = y, dz/dy = x), and a max/ReLU gate routes 100% of the gradient to the winning active path and 0 to inactive paths.',
        ],
        keyTakeaways: [
          'Without non-linear activations, W_2(W_1 x) = (W_2 W_1)x = W_eff x: an arbitrarily deep linear network collapses to a single linear matrix.',
          'Reverse-mode autodiff propagates a row vector v^T = dL/dy backward via Vector-Jacobian Products (v^T J), computing all parameter gradients in roughly 2x the FLOPs of a forward pass.',
          'Training VRAM is dominated by cached forward activations X needed to compute dL/dW = X^T (dL/dY) during backprop, not by the weights themselves.',
          'Gradient Checkpointing discards intermediate activations during the forward pass and recomputes them layer-by-layer during backprop, reducing activation memory from O(L) to O(sqrt(L)).',
        ],
        mathFormulas: [
          {
            id: 'vjp-linear-backprop',
            title: 'Vector-Jacobian Products (VJP) for a Batched Linear Layer',
            latexLike: 'Y = XW + b   ⟹   ∂L/∂W = X^T (∂L/∂Y),   ∂L/∂X = (∂L/∂Y) W^T,   ∂L/∂b = ∑_n (∂L/∂Y)_n',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Forward:   X (B x d_in)  ──▸ [ * W (d_in x d_out) ] ──▸ Y (B x d_out)│',
              '│  Cache:     Save X in GPU HBM for backward pass                      │',
              '│  Backward:  dL/dX = dY @ W^T  ◂── [ dL/dW = X^T @ dY ] ◂── dY        │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Shape analysis never lies: to get a gradient with the exact shape of W (d_in x d_out) from X (B x d_in) and dY (B x d_out), the only valid contraction over batch B is X^T @ dY.',
            variables: [
              { symbol: 'X', name: 'Cached input activations', role: 'Tensor of shape (Batch, d_in) stored during forward pass' },
              { symbol: '∂L/∂Y', name: 'Upstream cotangent vector', role: 'Incoming error signal of shape (Batch, d_out)' },
              { symbol: '∂L/∂W', name: 'Weight gradient', role: 'Accumulated outer product over the batch dimension' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Micro-Tensor Autograd Engine with Reverse-Mode Topological Sort',
            language: 'python',
            description: 'A complete 45-line reverse-mode automatic differentiation engine supporting matrix multiply, ReLU, and broadcasting.',
            code: `import numpy as np

class Tensor:
    def __init__(self, data, prev=(), op=""):
        self.data = np.asarray(data, dtype=np.float64)
        self.grad = np.zeros_like(self.data)
        self._backward = lambda: None
        self._prev = set(prev)

    def __matmul__(self, other):
        out = Tensor(self.data @ other.data, (self, other), "@")
        def _backward():
            self.grad += out.grad @ other.data.T
            other.grad += self.data.T @ out.grad
        out._backward = _backward
        return out

    def relu(self):
        out = Tensor(np.maximum(0, self.data), (self,), "relu")
        def _backward():
            self.grad += (self.data > 0) * out.grad
        out._backward = _backward
        return out

    def sum(self):
        out = Tensor(self.data.sum(), (self,), "sum")
        def _backward():
            self.grad += np.ones_like(self.data) * out.grad
        out._backward = _backward
        return out

    def backward(self):
        topo, visited = [], set()
        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)
        build(self)
        self.grad = np.ones_like(self.data)
        for v in reversed(topo):
            v._backward()

X = Tensor([[1.0, -2.0], [3.0, 4.0]])
W1, W2 = Tensor([[0.5, -0.3], [0.8, 0.2]]), Tensor([[1.0], [-1.0]])
loss = (X @ W1).relu() @ W2
loss.sum().backward()
print("dL/dW1:\\n", W1.grad)`,
          },
        ],
        pitfalls: [
          'Dead ReLUs: if a large learning rate pushes a neuron’s bias strongly negative so z < 0 for every training example, its local derivative is 0 forever and the neuron permanently dies.',
          'Forgetting optimizer.zero_grad() in PyTorch: backward() accumulates (+=) gradients into param.grad by design (to support gradient accumulation across micro-batches).',
          'In-place tensor mutations (e.g. x += 1) overwrite cached forward activations needed by the backward graph, corrupting VJPs.',
        ],
      },
      {
        id: 'wtf-is-residual-rmsnorm',
        libraries: [{
          name: "PyTorch RMSNorm",
          url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.RMSNorm.html",
          purpose: "Apply root mean square normalization to a hidden state.",
        }],
        title: 'WTF are Residual Streams, RMSNorm & SwiGLU?',
        commandSlug: 'wtf-is-residual-rmsnorm',
        wtfQuestion: 'Why did networks deeper than 20 layers fail to train before 2015, and why does every modern LLM use Pre-RMSNorm and SwiGLU?',
        plainEnglish:
          'Before 2015, stacking more layers made neural networks WORSE, not better. Why? Because multiplying 100 layer Jacobians together is like playing a 100-person game of telephone: if each person whispers slightly softer (0.9x), the message vanishes to silence; if each shouts slightly louder (1.1x), it explodes into static. ResNets (and modern Transformers) solved this with a breathtakingly simple trick: instead of forcing the signal to pass THROUGH every layer, create an unbroken main highway—the Residual Stream—where each layer just reads from the highway, computes a small delta, and adds it back: x_{l+1} = x_l + F(x_l). Combine this highway with RMSNorm (a fast stabilizer at every layer entrance) and SwiGLU (a multiplicative gate that lets neurons dynamically filter their own activations), and you get the exact backbone of Llama-3, DeepSeek-V3, and Qwen.',
        whyItMatters:
          'Every frontier LLM today is built on the Pre-Norm Residual Stream + RMSNorm + SwiGLU triad. Understanding the residual stream as a shared communication bus is also the foundation of mechanistic interpretability and activation steering.',
        realWorldSystems: [
          'Llama-3 / DeepSeek-V3 / Mistral Pre-RMSNorm + SwiGLU Transformer Blocks',
          'He / Kaiming & Residual Depth-Scaled Initialization (1 / sqrt(2L))',
          'Fused Triton RMSNorm & SwiGLU CUDA Kernels',
        ],
        summary:
          'Pre-Norm residual connections create an identity gradient highway that prevents vanishing gradients, RMSNorm stabilizes activation scale without mean-centering overhead, and SwiGLU replaces static activations with learnable bilinear gating.',
        deepDiveParagraphs: [
          'Look at the calculus of a residual block x_L = x_0 + sum_{l=0}^{L-1} F_l(x_l). When you differentiate the loss with respect to an early layer x_0, the chain rule gives dL/dx_0 = dL/dx_L * (I + d/dx_0 sum F_l(x_l)). Notice that big identity matrix I! Even if the derivatives of all intermediate sub-layers F_l are tiny or noisy, the upstream gradient dL/dx_L travels straight back to layer 0 unimpeded through the +I term. In the modern mechanistic view, layers do not transform representations sequentially in isolation; instead, all attention heads and MLPs read from and write additive updates into a shared workspace called the Residual Stream.',
          'Where you place normalization changes everything. The original 2017 Transformer used Post-Norm: x_{l+1} = LayerNorm(x_l + F(x_l)). Because LayerNorm sits directly on the main highway, it divides the residual stream by its standard deviation at every single layer, attenuating early-layer gradients and requiring a fragile learning-rate warmup. Modern LLMs universally use Pre-Norm: x_{l+1} = x_l + F(RMSNorm(x_l)), keeping the main highway completely unobstructed. Furthermore, Zhang & Sennrich showed that LayerNorm’s mean-centering is redundant; Root Mean Square Layer Normalization (RMSNorm) simply divides x by sqrt(mean(x^2) + eps), saving 7%-15% of normalization memory bandwidth.',
          'Inside the MLP block, modern Transformers replaced simple ReLU/GELU layers with SwiGLU (Swish-Gated Linear Unit, introduced by Shazeer 2020). Instead of one up-projection, SwiGLU projects the input through two parallel matrices: a gate branch passed through Swish/SiLU(x) = x * sigmoid(x) and a linear value branch, multiplying them element-wise before projecting back down: MLP(x) = W_down (SiLU(x W_gate) odot (x W_up)). To keep total parameter count equal to a standard 4d MLP despite having three matrices instead of two, the hidden dimension is set to (8/3)d rounded to a hardware-friendly multiple of 256.',
        ],
        keyTakeaways: [
          'The Residual Stream x_{l+1} = x_l + F(x_l) puts an identity matrix I in the backward Jacobian, solving the vanishing gradient problem across hundreds of layers.',
          'Pre-Norm (x + F(Norm(x))) keeps the residual highway clean and stable at initialization, whereas Post-Norm (Norm(x + F(x))) blocks gradient flow and requires warmup.',
          'RMSNorm drops mean subtraction and bias terms, normalizing purely by root-mean-square magnitude: x / sqrt(mean(x^2) + eps) * gamma.',
          'SwiGLU uses element-wise multiplicative gating (SiLU(x W_gate) * (x W_up)) W_down, giving the MLP a multiplicative inductive bias.',
        ],
        mathFormulas: [
          {
            id: 'prenorm-rmsnorm-swiglu',
            title: 'Pre-RMSNorm Residual Highway & SwiGLU Feed-Forward Block',
            latexLike: 'RMSNorm(x) = (x / √(1/d ∑ x_i^2 + ε)) ⊙ γ,   SwiGLU(x) = (SiLU(x W_gate) ⊙ (x W_up)) W_down',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  x_l ══════════════════════════════════════════════════▸ (+) ──▸ x_l+1',
              '│   │                                                       ▲          │',
              '│   └──▸ [RMSNorm] ──┬──▸ [W_gate] ──▸ [SiLU] ──▸ ( * ) ────┤          │',
              '│                    └──▸ [W_up]   ───────────────▲   │     │          │',
              '│                                                     └──▸ [W_down]    │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'RMSNorm scales the input vector onto a sphere of radius sqrt(d); W_gate acts as a soft valve deciding how much of each feature in W_up gets written back into the residual highway.',
            variables: [
              { symbol: 'γ', name: 'Learned RMSNorm gain vector', role: 'Per-channel scale parameter initialized to 1.0' },
              { symbol: 'SiLU(z)', name: 'Swish / Sigmoid Linear Unit', role: 'Smooth non-monotonic activation z * σ(z)' },
              { symbol: 'W_gate, W_up, W_down', name: 'SwiGLU projection matrices', role: 'Three linear maps with hidden size ≈ (8/3) d_model' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Llama-3 Style RMSNorm & SwiGLU Residual Block in PyTorch',
            language: 'python',
            description: 'Production-accurate implementation of RMSNorm and SwiGLU with residual depth scaling.',
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class RMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Compute RMS in FP32 to prevent squaring overflow in BF16/FP16
        rms = torch.rsqrt(x.float().pow(2).mean(dim=-1, keepdim=True) + self.eps)
        return (x.float() * rms).type_as(x) * self.weight

class SwiGLUMLP(nn.Module):
    def __init__(self, d_model: int, hidden_dim: int):
        super().__init__()
        self.w_gate = nn.Linear(d_model, hidden_dim, bias=False)
        self.w_up   = nn.Linear(d_model, hidden_dim, bias=False)
        self.w_down = nn.Linear(hidden_dim, d_model, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.w_down(F.silu(self.w_gate(x)) * self.w_up(x))

# Pre-Norm Residual Block
x = torch.randn(2, 16, 256)
norm = RMSNorm(256)
mlp = SwiGLUMLP(256, hidden_dim=688)
out = x + mlp(norm(x))
print("Residual output shape & RMS:", out.shape, out.pow(2).mean().sqrt().item())`,
          },
        ],
        pitfalls: [
          'Computing x.pow(2).mean() directly in FP16 overflows to Inf whenever any activation exceeds 255; always upcast to FP32 inside RMSNorm before squaring.',
          'Without scaling the residual output projection W_down by 1 / sqrt(2 * num_layers) at initialization, the variance of the residual stream grows linearly with depth (Var(x_L) = 1 + L), causing early instability in 80+ layer models.',
          'Using BatchNorm instead of RMSNorm/LayerNorm in sequence models leaks tokens across batch elements and breaks autoregressive generation when batch size is 1.',
        ],
      },
      {
        id: 'wtf-is-adamw',
        libraries: [{
          name: "PyTorch AdamW",
          url: "https://docs.pytorch.org/docs/stable/generated/torch.optim.AdamW.html",
          purpose: "Compare the roles of learning rate and decoupled weight decay.",
        }],
        title: 'WTF is an Optimizer (SGD, Momentum, AdamW & Muon)?',
        commandSlug: 'wtf-is-adamw',
        wtfQuestion: 'Why does plain SGD bounce wildly in narrow valleys, why did AdamW replace Adam, and how does Muon optimize matrices directly?',
        plainEnglish:
          'Plain Stochastic Gradient Descent (SGD) has zero memory: if it is rolling down a long narrow canyon with steep walls, it spends all its energy ricocheting violently from wall to wall while barely creeping forward along the canyon floor. Momentum fixes this by turning the optimizer into a heavy bowling ball: the side-to-side wall bounces cancel out, while the downhill velocity builds up. Adam goes one step further by giving every single weight its own custom shock absorber—dividing each weight’s velocity by the running average of its recent gradient sizes so steep walls get damped down and flat directions get boosted. AdamW fixes a subtle math bug in how Adam handled weight decay, and Muon (2024) takes the next leap by treating 2D weight layers as actual matrices rather than flat lists of numbers, orthogonalizing the momentum update via Newton-Schulz iterations.',
        whyItMatters:
          'Optimizer choice dictates training speed, hyper-parameter robustness, and VRAM footprint: AdamW’s two state buffers (m_t and v_t) consume 8 bytes per parameter in FP32—doubling or tripling the memory needed to store the model weights.',
        realWorldSystems: [
          'PyTorch torch.optim.AdamW(fused=True) & bitsandbytes 8-bit AdamW',
          'DeepSeek / Moonshot Kimi K2 Muon + AdamW Hybrid Optimizer',
          'ZeRO-1 / FSDP Optimizer State Sharding across GPU Clusters',
        ],
        summary:
          'Momentum dampens high-curvature oscillations via exponential moving averages, AdamW normalizes per-parameter step sizes using first and second moments with decoupled weight decay, and Muon orthogonalizes 2D weight updates so all singular directions learn at equal speed.',
        deepDiveParagraphs: [
          'Why did Loshchilov & Hutter (2019) need to invent AdamW when Adam already existed? In standard SGD, adding an L2 penalty 0.5 * lambda * ||theta||^2 to the loss is mathematically identical to decaying the weights by (1 - eta * lambda) at each step. However, in Adam, if you add the L2 gradient (+lambda * theta) into g_t BEFORE computing the adaptive variance v_t, parameters with large historical gradients get their weight decay divided by a huge sqrt(v_t)—meaning the weights that need regularization the most get regularized the least! AdamW decouples weight decay completely from the adaptive gradient step: theta_t = theta_{t-1} * (1 - eta * lambda) - eta * m_hat_t / (sqrt(v_hat_t) + eps).',
          'Why does Adam require bias correction (dividing m_t by 1 - beta_1^t and v_t by 1 - beta_2^t)? Because both running averages m_0 and v_0 are initialized to 0! At step t = 1 with beta_2 = 0.999, v_1 = 0.001 * g_1^2, which is 1000x smaller than the true second moment. Without bias correction, step 1 divides by sqrt(0.001) approx 0.031, taking a catastrophic 31x oversized leap right at the start of training.',
          'Recently, Jordan et al. (2024) and Moonshot AI (Kimi) showed that treating a 2D weight matrix W in R^(m x n) as a flat vector of m*n independent scalars ignores its matrix structure: gradient matrices G_t tend to be dominated by a few massive singular values, starving the remaining singular directions. Muon (MomentUm Orthogonalized by Newton-Schulz) computes the momentum matrix M_t and then applies 5 fast matrix-multiply polynomial iterations (Newton-Schulz) to snap M_t onto the nearest semi-orthogonal matrix U V^T (where all singular values equal 1!). This guarantees every singular direction of the layer updates at uniform speed.',
        ],
        keyTakeaways: [
          'AdamW stores two FP32 buffers per parameter (1st moment m_t and 2nd moment v_t): a 7B model takes 14GB for BF16 weights + 14GB for gradients + 56GB just for FP32 AdamW states.',
          'Decoupled Weight Decay (AdamW) shrinks weights directly by (1 - eta * lambda) outside the adaptive 1/sqrt(v_t) preconditioner.',
          'Bias correction 1 / (1 - beta^t) prevents massive step-size explosions during the first few hundred steps when m_0 = v_0 = 0.',
          'Muon orthogonalizes 2D momentum matrices via Newton-Schulz iterations (replacing M = U Sigma V^T with U V^T) while keeping AdamW for 1D embeddings and norms.',
        ],
        mathFormulas: [
          {
            id: 'adamw-update-rule',
            title: 'AdamW Decoupled Adaptive Moment Update Rule',
            latexLike: 'm_t = β_1 m_{t-1} + (1-β_1)g_t,   v_t = β_2 v_{t-1} + (1-β_2)g_t^2,   θ_t = (1 - ηλ)θ_{t-1} - η m̂_t / (√v̂_t + ε)',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  θ_t =  (1 - ηλ) θ_{t-1}        -   η * [ m̂_t / (sqrt(v̂_t) + ε) ]    │',
              '│         Decoupled Weight Decay      Adaptive Signal-to-Noise Step    │',
              '│         (Uniform shrinkage)         (Unitless: scales ~ +-eta)       │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'The ratio m̂_t / √v̂_t acts as a per-parameter Signal-to-Noise Ratio: if the gradient consistently points the same way, the ratio is near ±1; if it oscillates wildly across a ravine, m̂_t cancels out while √v̂_t stays large, automatically braking the step.',
            variables: [
              { symbol: 'm̂_t', name: 'Bias-corrected 1st moment', role: 'm_t / (1 - β_1^t), smoothed gradient velocity (β_1 ≈ 0.9)' },
              { symbol: 'v̂_t', name: 'Bias-corrected 2nd moment', role: 'v_t / (1 - β_2^t), uncentered gradient variance (β_2 ≈ 0.95 or 0.999)' },
              { symbol: 'λ', name: 'Decoupled weight decay coefficient', role: 'Directly pulls weights toward 0 independent of v_t' },
            ],
          },
          {
            id: 'muon-newton-schulz',
            title: 'Muon Matrix Orthogonalization via Newton-Schulz Iteration',
            latexLike: 'X_0 = M_t / ||M_t||_F,   X_{k+1} = a X_k + b (X_k X_k^T) X_k + c (X_k X_k^T)^2 X_k   ⟶   U V^T',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Momentum M_t = U * diag(σ_1 >> σ_2 >> σ_r) * V^T                    │',
              '│       │                                                              │',
              '│       ▼  [5x GPU BF16 Matrix-Multiply Newton-Schulz Steps]           │',
              '│  Ortho(M_t)   = U * diag(1.0,  1.0,  1.0)   * V^T  (Equal rank step) │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Instead of calling a slow CPU/GPU SVD kernel, a 5-step odd polynomial in X_k pushes all singular values σ_i in (0, 1] onto 1.0 using pure TensorCore GEMMs.',
            variables: [
              { symbol: 'M_t', name: '2D layer momentum matrix', role: 'Accumulated gradient momentum for linear/attention weights' },
              { symbol: 'a, b, c', name: 'Quintic polynomial coefficients', role: 'Tuned constants (3.4445, -4.7750, 2.0315) maximizing slope near 0' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Reference AdamW & Muon Newton-Schulz Orthogonalizer in PyTorch',
            language: 'python',
            description: 'Implements exact decoupled AdamW alongside Muon’s 5-step BF16 Newton-Schulz matrix orthogonalization.',
            code: `import torch

def zeropower_via_newtonschulz5(G: torch.Tensor, steps: int = 5) -> torch.Tensor:
    """Muon's 5-step quintic Newton-Schulz iteration: maps G = U S V^T -> U V^T."""
    a, b, c = (3.4445, -4.7750, 2.0315)
    X = G.bfloat16()
    if G.size(0) > G.size(1):
        X = X.T
    X = X / (X.norm() + 1e-7)
    for _ in range(steps):
        A = X @ X.T
        B = b * A + c * (A @ A)
        X = a * X + B @ X
    if G.size(0) > G.size(1):
        X = X.T
    return X.type_as(G)

def adamw_step(param: torch.Tensor, grad: torch.Tensor, m: torch.Tensor, v: torch.Tensor, step: int, lr=1e-3, beta1=0.9, beta2=0.95, wd=0.1, eps=1e-8):
    # 1. Decoupled weight decay
    param.mul_(1.0 - lr * wd)
    # 2. Update 1st and 2nd moments
    m.lerp_(grad, 1.0 - beta1)
    v.mul_(beta2).addcmul_(grad, grad, value=1.0 - beta2)
    # 3. Bias correction
    m_hat = m / (1.0 - beta1 ** step)
    v_hat = v / (1.0 - beta2 ** step)
    param.addcdiv_(m_hat, v_hat.sqrt().add_(eps), value=-lr)

G = torch.randn(128, 64)
ortho_G = zeropower_via_newtonschulz5(G)
_, S_after, _ = torch.linalg.svd(ortho_G)
print("Singular values after Newton-Schulz (target ~1.0):", S_after[:5].round(decimals=2))`,
          },
        ],
        pitfalls: [
          'Applying weight decay to 1D RMSNorm/LayerNorm gain vectors and biases degrades performance; always exclude 1D tensors and token embeddings from weight decay.',
          'Using default beta_2 = 0.999 during LLM pre-training with large batch sizes causes v_t to react too slowly to sudden loss spikes; frontier LLMs use beta_2 = 0.95.',
          'Applying Muon directly to the token embedding or LM head matrix (which acts as a lookup table rather than a dense basis transformation) hurts convergence; always keep AdamW on embeddings/heads.',
        ],
      },
    ],
  },
  {
    id: '03_sequence_arch',
    number: '03',
    slug: 'sequence-arch',
    filePath: '~/wtfis-ai/03_sequence_arch/index.md',
    title: 'Sequence Architectures: Attention, RoPE, MoE & State-Space Models',
    shortTitle: 'Sequence Arch',
    subtitle: 'How QKV content-addressable lookup works, why RoPE rotates complex planes, and how MoE & Mamba-2 scale.',
    layerCategory: 'DEEP_LEARNING',
    defaultSceneId: 'attention-rope',
    estimatedHours: 42,
    prerequisites: ['00_foundations', '02_deep_learning'],
    coreTools: ['PyTorch SDPA', 'FlashAttention', 'Megatron-Core', 'Triton'],
    mentalModelSummary:
      'Transformers replace sequential recurrence with parallel content-addressable dictionary routing (Attention), encode relative token distance via complex-plane phase rotations (RoPE), and break memory/compute walls via KV-cache compression (GQA/MLA), sparse expert routing (MoE), and linear state-space duality (Mamba-2).',
    asciiArchitectureDiagram: [
      '┌────────────────────────────────────────────────────────────────────────────┐',
      '│            FRONTIER SEQUENCE BLOCK: ROPE + GQA/MLA + SPARSE MOE            │',
      '├────────────────────────────────────────────────────────────────────────────┤',
      '│                                                                            │',
      '│  x_l ──▸ [RMSNorm] ──▸ [Q, K (+RoPE), V / Latent c_KV] ──▸ [FlashAttn]     │',
      '│   │                                                            │           │',
      '│   └─────────────────────────────────────────────────────────▸ (+)          │',
      '│                                                                │           │',
      '│   ┌────────────────────────────────────────────────────────────┘           │',
      '│   ├──▸ [RMSNorm] ──▸ [Top-K Router] ──▸ [Active SwiGLU Experts] ──┐        │',
      '│   └──────────────────────────────────────────────────────────────▸(+)▸x_l+1│',
      '└────────────────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    subTopics: [
      {
        id: 'wtf-is-attention',
        libraries: [{
          name: "PyTorch scaled dot product attention",
          url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html",
          purpose: "Apply an attention mask and compare the outputs for a short token sequence.",
        }],
        title: 'WTF is Attention & KV-Cache Compression (MHA, GQA, MLA)?',
        commandSlug: 'wtf-is-attention',
        wtfQuestion: 'How do tokens dynamically look up information from earlier in a sentence, and why does the KV-Cache bottleneck every LLM server?',
        plainEnglish:
          'Imagine every word in a sentence is standing in a room holding three cards: a Query card ("What I am looking for"), a Key card ("What I contain"), and a Value card ("The actual payload I will hand over if we match"). When the word "it" in "The animal didn’t cross the street because it was tired" wants to know what "it" refers to, its Query card broadcasts a search vector across all previous words’ Key cards. The dot product Q . K scores how strongly each pair matches; Softmax turns those scores into percentages that add to 100%; and the token absorbs a weighted blend of everyone’s Value cards. During live chat generation, to avoid recomputing Keys and Values for past tokens on every single word, we save them in GPU memory (the KV-Cache). For long contexts, that KV-Cache grows so massive that moving it from GPU RAM to the compute cores becomes the #1 speed bottleneck—which is why modern models share Keys/Values across heads (GQA) or compress them into a tiny latent vector (DeepSeek MLA).',
        whyItMatters:
          'Autoregressive decoding is memory-bandwidth bound, not compute bound. Understanding MHA vs GQA vs MLA lets you calculate exact GPU VRAM budgets and understand why DeepSeek-V3 cuts KV-Cache memory by 93%.',
        realWorldSystems: [
          'Llama-3 / Qwen-2.5 Grouped-Query Attention (GQA-8)',
          'DeepSeek-V2 / V3 / R1 Multi-Head Latent Attention (MLA)',
          'vLLM / SGLang RadixAttention Prefix KV-Cache Sharing',
        ],
        summary:
          'Scaled Dot-Product Attention performs differentiable key-value retrieval with 1/sqrt(d_k) variance stabilization, while GQA and Multi-Head Latent Attention (MLA) compress the KV-Cache to break the GPU memory bandwidth bottleneck.',
        deepDiveParagraphs: [
          'Why do we divide Q K^T by sqrt(d_k) before the softmax? Suppose the components of q and k are independent random variables with mean 0 and variance 1. Their dot product q . k = sum_{i=1}^{d_k} q_i k_i has mean 0 and variance d_k (standard deviation sqrt(d_k)). For a head dimension d_k = 128, standard deviation is ~11.3, meaning some logits reach +30 or -30! Pushing numbers that large into Softmax causes it to saturate into a hard one-hot vector where one token gets probability 0.999999 and all others get 0, killing all softmax gradients. Dividing by sqrt(d_k) restores unit variance regardless of head size.',
          'During autoregressive generation of token T, we only have a single query vector q_T, so we must read all T previous Key and Value vectors from GPU High-Bandwidth Memory (HBM) just to generate ONE token. In classic Multi-Head Attention (MHA) with n_h = 64 heads and head dim d_h = 128 in BF16 (2 bytes), every layer stores 2 * 2 * 64 * 128 = 32 KB per token. Across 80 layers and a 128K context window, a single user request consumes 335 GB of KV-Cache! Grouped-Query Attention (GQA) fixes this by letting G = 8 query heads share a single Key and Value head, immediately shrinking the KV-Cache by 8x with virtually zero loss in accuracy.',
          'DeepSeek’s Multi-Head Latent Attention (MLA) goes even further by applying SVD/LoRA intuition directly to the KV-Cache. Instead of caching separate K and V heads, MLA projects the token hidden state h_t down into a single joint low-rank latent vector c_t^KV = W_DKV h_t of dimension d_c = 512. Only c_t^KV is stored in the KV-Cache! Even better, during inference, the up-projection matrix W_UK can be algebraically absorbed directly into the query matrix W_Q (since q_t^T (W_UK c_t^KV) = (W_UK^T q_t)^T c_t^KV), so the full uncompressed K and V tensors never even need to be materialized in HBM.',
        ],
        keyTakeaways: [
          'Scaling by 1 / sqrt(d_k) keeps dot-product variance at 1.0, preventing Softmax saturation and vanishing attention gradients.',
          'Causal masking adds -infinity to upper-triangular positions (j > i) BEFORE Softmax so exp(-inf) = 0 and tokens cannot peek into the future.',
          'GQA shares 1 Key-Value head across G Query heads (e.g. 64 Q heads : 8 KV heads = 8x smaller KV-Cache).',
          'DeepSeek MLA caches a single compressed latent vector c_t^KV (dim 512) and absorbs the up-projection matrices into W_Q and W_O during inference.',
        ],
        mathFormulas: [
          {
            id: 'scaled-dot-product-attention',
            title: 'Causal Scaled Dot-Product Attention & KV-Cache Footprint',
            latexLike: 'Attn(Q, K, V) = softmax( (Q K^T) / √d_k + M ) V,   Bytes_KV = 2 · b · L · n_kv · d_h · S',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  MHA (64 Q : 64 KV)     GQA (64 Q : 8 KV)      MLA (Latent c_KV)     │',
              '│  [Q1 Q2 Q3 Q4 ...]      [Q1 Q2 Q3 Q4]          [Q1 Q2 Q3 Q4 ...]     │',
              '│   │  │  │  │             └──┬──┬──┘             └──┬──┬──┬──┘        │',
              '│  [K1 K2 K3 K4 ...]         [K1 / V1]           [W_UK / W_UV]         │',
              '│  100% KV Memory          12.5% KV Memory           ▲                 │',
              '│                                                [Cached c_KV (512d)]  │',
              '│                                                 ~6% KV Memory!       │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'GQA deduplicates redundant KV heads across groups, while MLA stores a tiny compressed bottleneck vector c_KV and reconstructs all heads on the fly.',
            variables: [
              { symbol: 'Q, K, V', name: 'Query, Key, Value matrices', role: 'Projections of shape (Seq, d_k) per attention head' },
              { symbol: 'M', name: 'Causal mask matrix', role: '0 for j <= i, -∞ for future tokens j > i' },
              { symbol: 'n_kv', name: 'Number of Key-Value heads', role: 'Equals n_q in MHA, 1 in MQA, and n_q / G in GQA' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Grouped-Query Attention (GQA) with Explicit KV-Cache in PyTorch',
            language: 'python',
            description: 'Implements causal GQA with incremental KV caching and head broadcasting without memory copies.',
            code: `import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class GroupedQueryAttention(nn.Module):
    def __init__(self, d_model: int = 512, n_q_heads: int = 8, n_kv_heads: int = 2):
        super().__init__()
        self.n_q = n_q_heads
        self.n_kv = n_kv_heads
        self.group_size = n_q_heads // n_kv_heads
        self.d_head = d_model // n_q_heads
        
        self.q_proj  = nn.Linear(d_model, n_q_heads * self.d_head, bias=False)
        self.kv_proj = nn.Linear(d_model, 2 * n_kv_heads * self.d_head, bias=False)
        self.o_proj  = nn.Linear(d_model, d_model, bias=False)

    def forward(self, x: torch.Tensor):
        B, S, D = x.shape
        q = self.q_proj(x).view(B, S, self.n_q, self.d_head).transpose(1, 2)
        kv = self.kv_proj(x).view(B, S, 2, self.n_kv, self.d_head)
        k, v = kv[:, :, 0].transpose(1, 2), kv[:, :, 1].transpose(1, 2)

        # Broadcast KV heads across query groups: (B, n_kv, S, d_h) -> (B, n_q, S, d_h)
        k = k.repeat_interleave(self.group_size, dim=1)
        v = v.repeat_interleave(self.group_size, dim=1)

        scores = (q @ k.transpose(-2, -1)) / math.sqrt(self.d_head)
        causal_mask = torch.triu(torch.full((S, S), float("-inf"), device=x.device), diagonal=1)
        probs = F.softmax(scores + causal_mask, dim=-1)
        out = (probs @ v).transpose(1, 2).contiguous().view(B, S, D)
        return self.o_proj(out)

gqa = GroupedQueryAttention()
print("GQA Output shape:", gqa(torch.randn(2, 16, 512)).shape)`,
          },
        ],
        pitfalls: [
          'Applying causal masking by multiplying probabilities by 0 AFTER Softmax leaks future token magnitudes through the softmax denominator; always add -inf to scores BEFORE Softmax.',
          'Attention Sink phenomenon (Xiao et al., 2023): because Softmax probabilities must sum to 1.0 even when a head wants to attend to nothing, transformers dump unused attention mass onto token 0 (the BOS token). Evicting token 0 in sliding-window caches destroys perplexity.',
          'Using torch.repeat() instead of stride-aware broadcasting for GQA KV heads allocates unnecessary GPU memory.',
        ],
      },
      {
        id: 'wtf-is-transformer-rope',
        libraries: [{
          name: "Transformers RoPE utilities",
          url: "https://huggingface.co/docs/transformers/internal/rope_utils",
          purpose: "Inspect how rotary embeddings are configured for transformer models.",
        }],
        title: 'WTF is a Transformer & Rotary Position Embeddings (RoPE)?',
        commandSlug: 'wtf-is-transformer-rope',
        wtfQuestion: 'Since Attention processes all tokens in parallel like an unordered bag of words, how does a Transformer know word order and relative distance?',
        plainEnglish:
          'By itself, Self-Attention is completely blind to word order: "The dog bit the man" and "The man bit the dog" produce the exact same attention scores if you don’t inject position markers! Early Transformers simply added a position vector to each word at layer 0, which washed out in deep layers and broke whenever a prompt was longer than training length. Rotary Position Embeddings (RoPE, Su et al. 2021) solved this with pure geometry: instead of adding a number, RoPE pairs up every two coordinates of a Query or Key vector into a 2D clock face and rotates the hand by an angle proportional to the token’s position index m (so token 1 rotates by 1*theta, token 5 rotates by 5*theta). When Query at position m takes a dot product with Key at position n, only the DIFFERENCE between their clock angles (m - n)*theta survives! The first coordinate pairs spin fast like a second hand (capturing exact local grammar), while the last coordinate pairs spin slowly like a century hand (capturing long-range document structure).',
        whyItMatters:
          'RoPE is the universal positional encoding in Llama, Qwen, DeepSeek, Mistral, and Gemma. Understanding its frequency spectrum explains how context windows are extended from 8K to 128K+ via YaRN and NTK-aware scaling.',
        realWorldSystems: [
          'Llama-3 128K Context RoPE Scaling (theta_base = 500,000)',
          'YaRN / LongRoPE Context Window Extension',
          'Multimodal 2D/3D M-RoPE in Qwen2-VL Vision-Language Models',
        ],
        summary:
          'RoPE encodes absolute token position by rotating 2D coordinate pairs in Query and Key space at exponentially spaced frequencies, making the resulting dot product a pure function of relative distance (m - n).',
        deepDiveParagraphs: [
          'Why is rotating better than adding? Suppose we treat each consecutive pair of dimensions (x_{2i}, x_{2i+1}) in a Query vector q_m at position m as a complex number q_m * e^{i m theta}. If we rotate the Key vector k_n at position n by the same rule k_n * e^{i n theta}, then their Hermitian inner product is Re[ (q_m e^{i m theta}) (k_n e^{-i n theta}) ] = Re[ q_m k_n^* e^{i (m - n) theta} ]. Notice that the absolute positions m and n disappear completely—the attention score depends strictly on the relative distance (m - n)! And unlike older relative position biases (like T5 or ALiBi) that require modifying the n x n attention matrix, RoPE is applied directly to Q and K before attention in O(n) time, making it 100% compatible with FlashAttention and linear state-space caches.',
          'Each 2D pair i in {0, 1, ..., d/2 - 1} rotates at its own angular frequency theta_i = B^{-2i/d}, where the base wavelength parameter B is classically 10,000 (or 500,000 in Llama-3). For i = 0, theta_0 = 1 radian per token (a full 2*pi rotation every ~6 tokens, giving razor-sharp local token order). For i = d/2 - 1, theta_{d/2-1} approx 1/B radians per token (rotating slowly across tens of thousands of tokens).',
          'What happens when you feed a 32K prompt into a model trained only on 4K tokens? The slow-spinning low-frequency hands rotate into angles they have NEVER seen during training, causing attention logits to explode and the model to output gibberish. Naive Position Interpolation (dividing m by the scale factor s = 8) crushes local high-frequency resolution. Modern context extension methods like NTK-Aware Scaling and YaRN leave the fast-spinning high-frequency dimensions untouched (since they have already completed thousands of full 360-degree revolutions during 4K training) and only interpolate or stretch the slow low-frequency dimensions.',
        ],
        keyTakeaways: [
          'Without positional encoding, a Transformer without a causal mask is equivariant to token permutation.',
          'RoPE rotates 2D subspace pairs by angle m * theta_i so that (R_m q)^T (R_n k) = q^T R_{n-m} k: relative distance emerges automatically from absolute rotations.',
          'RoPE is applied ONLY to Queries and Keys (never to Values), at every single attention layer.',
          'Extending context windows (YaRN / NTK-RoPE) works by scaling down slow low-frequency wavelengths while preserving fast high-frequency local wavelengths.',
        ],
        mathFormulas: [
          {
            id: 'rope-rotation-identity',
            title: 'Rotary Position Embedding (RoPE) Relative Distance Identity',
            latexLike: '(R_m q)^T (R_n k) = q^T R_m^T R_n k = q^T R_{n-m} k,   θ_i = B^{-2i / d}',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  2D Pair i=0 (High Freq: Local)    2D Pair i=d/2-1 (Low Freq: Global)│',
              '│         ▲ y                               ▲ y                        │',
              '│      q_m ╲   ╱ k_n                        │  ╱ q_m                   │',
              '│           ╲ ╱ Δ=(m-n)θ_0                  │ ╱  ╱ k_n                 │',
              '│       ─────┼─────▸ x                ──────┼───┴──▸ x                 │',
              '│  Spins fast (1 rad/tok)            Spins slow (1/500,000 rad/tok)    │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'Rotating two vectors in 2D by m*θ and n*θ changes the angle between them by exactly (m - n)*θ. Pairing dimensions into d/2 clocks of varying speeds gives a multi-scale ruler.',
            variables: [
              { symbol: 'R_m', name: 'Block-diagonal 2D rotation matrix', role: 'Orthogonal rotation by angle m * θ_i for each 2D coordinate pair' },
              { symbol: 'B', name: 'RoPE base wavelength constant', role: '10,000 in Llama-1/2; 500,000 in Llama-3 for 128K context' },
              { symbol: 'm - n', name: 'Relative token offset', role: 'Exact token distance preserved in the Q-K dot product' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Exact Complex-Plane RoPE & Proof of Relative Distance Invariance',
            language: 'python',
            description: 'Implements RoPE via complex numbers and proves that dot products at positions (10, 15) and (110, 115) are identical.',
            code: `import torch

def apply_rope(x: torch.Tensor, positions: torch.Tensor, base: float = 10000.0) -> torch.Tensor:
    """Applies Rotary Position Embeddings to x of shape (B, S, d)."""
    d = x.shape[-1]
    freqs = 1.0 / (base ** (torch.arange(0, d, 2, device=x.device).float() / d))
    angles = torch.outer(positions.float(), freqs)  # (S, d/2)
    cos, sin = torch.cos(angles), torch.sin(angles)
    
    x_even, x_odd = x[..., 0::2], x[..., 1::2]
    out = torch.empty_like(x)
    out[..., 0::2] = x_even * cos - x_odd * sin
    out[..., 1::2] = x_even * sin + x_odd * cos
    return out

# Verify relative distance invariance: (m=10, n=15) vs (m=110, n=115)
q = torch.randn(1, 1, 64)
k = torch.randn(1, 1, 64)
score_a = (apply_rope(q, torch.tensor([10])) * apply_rope(k, torch.tensor([15]))).sum()
score_b = (apply_rope(q, torch.tensor([110])) * apply_rope(k, torch.tensor([115]))).sum()
print(f"Score at (10, 15): {score_a.item():.6f} | Score at (110, 115): {score_b.item():.6f}")`,
          },
        ],
        pitfalls: [
          'Different frameworks interleave RoPE dimensions differently: HuggingFace Llama splits the vector into first-half and second-half [x[:d/2], x[d/2:]], whereas original Meta Llama interleaves adjacent pairs [x[0::2], x[1::2]]. Mixing weights between the two without permuting W_Q and W_K scrambles the model.',
          'Applying RoPE before caching Keys vs after caching Keys: you must cache K AFTER applying RoPE (except in DeepSeek MLA, which splits K into a small decoupled RoPE key k_R and a compressed non-RoPE latent c_KV).',
          'Computing m * theta_i in BF16 at position m = 100,000 loses integer precision because BF16 only has 7 mantissa bits (cannot distinguish position 65536 from 65537!); always compute RoPE angles in FP32.',
        ],
      },
      {
        id: 'wtf-is-moe-ssm',
        libraries: [{
          name: "Mamba",
          url: "https://github.com/state-spaces/mamba",
          purpose: "Read the selective state space implementation and follow its sequence update.",
        }],
        title: 'WTF is Mixture-of-Experts (MoE) & State-Space Models (Mamba-2)?',
        commandSlug: 'wtf-is-moe-ssm',
        wtfQuestion: 'How does DeepSeek-V3 have 671 Billion parameters while only running 37 Billion per token—and how does Mamba process million-token sequences in linear O(N) time?',
        plainEnglish:
          'In a standard dense model, every single token—even a trivial word like "the"—activates 100% of the network’s billions of MLP weights. Mixture-of-Experts (MoE) replaces the single giant MLP block with a hallway of specialized mini-MLPs (say, 256 experts) and a lightweight traffic cop (the Router) at the door. For each token, the Router scores all experts and sends the token to only the top k (say, 8) best-matched experts. You get the vast knowledge storage of a 671B model while paying the compute cost of a 37B model! Meanwhile, State-Space Models like Mamba-2 tackle the other Transformer bottleneck—quadratic O(N^2) attention over long sequences—by compressing the entire past history into a fixed-size recurrent state H_t that selectively remembers or forgets based on the current token, running in strictly linear O(N) time.',
        whyItMatters:
          'Frontier AI architectures have converged on Sparse MoE (DeepSeek-V3, Qwen3, Mixtral, GPT-4) and Hybrid Attention-Mamba stacks (Jamba, Nemotron-H, Qwen3-Next) to decouple model knowledge capacity from per-token FLOPs and KV-cache growth.',
        realWorldSystems: [
          'DeepSeek-V3 (671B Total / 37B Active, Fine-Grained + Shared Experts)',
          'Mixtral 8x7B / 8x22B & Qwen-MoE Sparse Top-K Routing',
          'Mamba-2 Structured State Space Duality (SSD) & Hybrid Jamba Models',
        ],
        summary:
          'Mixture-of-Experts decouples parameter capacity from FLOPs via sparse Top-K token routing, while Selective State-Space Models (Mamba-2) replace quadratic KV caches with input-dependent linear recurrences solvable via parallel hardware scans.',
        deepDiveParagraphs: [
          'Why did early MoE models collapse during training? If Expert #3 happens to start slightly better than the others, the router sends it more tokens; receiving more tokens gives Expert #3 more gradient updates, making it even better until 100% of tokens route to Expert #3 and the other 255 experts die (Routing Collapse)! Classical MoEs fixed this with an auxiliary load-balancing loss that penalized uneven routing, but high auxiliary weights degraded language modeling quality. DeepSeek-V3 solved this with two innovations: (1) Fine-Grained + Shared Experts (1 always-active shared expert captures common syntax while 256 fine-grained routed experts specialize cleanly), and (2) Auxiliary-Loss-Free Load Balancing, which adds a dynamically adjusted bias term b_i to each expert’s routing score during the Top-K selection step without polluting the backpropagation gradients.',
          'While MoE solves MLP FLOPs, attention still scales quadratically O(N^2) with sequence length N. Classical RNNs ran in O(N) time with O(1) memory, but they could not be parallelized across tokens during training because h_t depended non-linearly on h_{t-1}: h_t = tanh(W h_{t-1} + B x_t). State-Space Models (SSMs) drop the non-linearity inside the recurrence: H_t = A_t H_{t-1} + B_t x_t, y_t = C_t H_t. Because linear recurrence is associative, a sequence of 64,000 tokens can be trained in parallel on GPUs in O(log N) parallel depth using an Associative Prefix Scan, yet executed step-by-step in O(1) memory at inference!',
          'Mamba’s breakthrough (Gu & Dao, 2023/2024) was making the transition matrices (A_t, B_t, C_t, Delta_t) functions of the current input token x_t ("Selectivity"). When Mamba sees a crucial entity name, it expands B_t and sets A_t near 1 to lock it into the state H_t; when it sees filler words ("um", boilerplate HTML), it drives A_t toward 0 to flush the state and free capacity. Mamba-2 further proved State-Space Duality (SSD): a selective SSM with scalar decay a_t is mathematically equivalent to causal linear attention multiplied by a semiseparable decay mask L_ij = a_i * a_{i-1} ... a_{j+1}, allowing Mamba-2 to run on TensorCores at FlashAttention speeds.',
        ],
        keyTakeaways: [
          'MoE cuts active FLOPs by routing each token to only K out of E experts (e.g., 8 of 256), while still requiring all E experts to fit in aggregate GPU memory.',
          'At batch size = 1, MoE does not reduce memory bandwidth proportionally to active FLOPs because several experts may still be activated across tokens in a micro-batch.',
          'Mamba-2’s selective state H_t = a_t H_{t-1} + B_t x_t achieves O(N) training FLOPs and O(1) constant inference state memory.',
          'Hybrid architectures (like interleaving 1 Full Attention layer every 7 Mamba layers) combine Mamba’s O(1) state compression with Attention’s exact needle-in-a-haystack copying ability.',
        ],
        mathFormulas: [
          {
            id: 'moe-routing-formula',
            title: 'DeepSeek-Style Sparse MoE Top-K Routing with Shared Expert',
            latexLike: 'y = x + E_shared(x) + ∑_{i ∈ TopK(s + b, K)} g_i E_i(x),   s_i = σ(x · e_i)',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Token x ──┬──▸ [Shared Expert E_0] ───────────────────────▸ (+) ▸ y │',
              '│            │                                                  ▲      │',
              '│            └──▸ [Router s = x·e + b] ──▸ Top-K Gate g_i ──▸ [E_i]    │',
              '│                  (Bias b updated by load, no aux loss grad)          │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'The Shared Expert handles universal grammar/formatting on every token, freeing the K routed experts to act as pure domain specialists balanced by a non-gradient bias b_i.',
            variables: [
              { symbol: 'E_shared', name: 'Always-active shared expert', role: 'Captures common token patterns so routed experts do not duplicate work' },
              { symbol: 's_i', name: 'Token-to-expert affinity score', role: 'Dot product between token x and expert centroid e_i' },
              { symbol: 'b_i', name: 'Dynamic load-balancing bias', role: 'Decremented if expert i is overloaded, incremented if underloaded' },
            ],
          },
          {
            id: 'mamba2-ssd-recurrence',
            title: 'Mamba-2 State Space Duality (Recurrent vs Matrix Form)',
            latexLike: 'H_t = a_t H_{t-1} + b_t x_t^T,   y_t = H_t c_t   ⟺   Y = (L ⊙ (C B^T)) X',
            asciiBreakdown: [
              '┌──────────────────────────────────────────────────────────────────────┐',
              '│  Inference Mode (O(1) State):   H_t = a_t * H_{t-1} + b_t * x_t^T    │',
              '│                                        │                             │',
              '│  Training Mode (TensorCore):    Y   = (L_decay ⊙ (C @ B^T)) @ X      │',
              '└──────────────────────────────────────────────────────────────────────┘',
            ].join('\n'),
            intuition:
              'During generation, Mamba-2 updates a fixed-size matrix state H_t in O(1) memory; during training, the exact same math unrolls into chunked matrix multiplications on GPU TensorCores.',
            variables: [
              { symbol: 'a_t', name: 'Input-dependent selective decay', role: 'Scalar retention gate in (0, 1) controlling memory horizon' },
              { symbol: 'H_t', name: 'Recurrent state matrix', role: 'Fixed-size compressed memory independent of sequence length N' },
              { symbol: 'L', name: '1-semiseparable causal decay mask', role: 'Lower-triangular matrix L_ij = prod_{k=j+1}^i a_k' },
            ],
          },
        ],
        codeExamples: [
          {
            title: 'Auxiliary-Loss-Free Sparse MoE Layer & Mamba-2 SSD Dual in PyTorch',
            language: 'python',
            description: 'Implements Top-K MoE with dynamic bias load balancing alongside Mamba-2’s recurrent/dual equivalence.',
            code: `import torch
import torch.nn as nn

class AuxFreeMoELayer(nn.Module):
    def __init__(self, d_model: int = 128, n_experts: int = 8, top_k: int = 2):
        super().__init__()
        self.top_k = top_k
        self.router = nn.Linear(d_model, n_experts, bias=False)
        self.register_buffer("expert_bias", torch.zeros(n_experts))
        self.experts = nn.ModuleList([nn.Sequential(nn.Linear(d_model, d_model), nn.SiLU(), nn.Linear(d_model, d_model)) for _ in range(n_experts)])

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        scores = torch.sigmoid(self.router(x))  # (B, N_exp)
        # Select top-k using biased scores, but weight outputs using clean unbiased scores
        _, top_idx = torch.topk(scores + self.expert_bias, k=self.top_k, dim=-1)
        gates = torch.gather(scores, -1, top_idx)
        gates = gates / (gates.sum(dim=-1, keepdim=True) + 1e-6)
        
        out = torch.zeros_like(x)
        for k in range(self.top_k):
            idx_k = top_idx[:, k]
            for e_id in range(len(self.experts)):
                mask = (idx_k == e_id)
                if mask.any():
                    out[mask] += gates[mask, k : k + 1] * self.experts[e_id](x[mask])
        return out

moe = AuxFreeMoELayer()
print("MoE output shape:", moe(torch.randn(16, 128)).shape)`,
          },
        ],
        pitfalls: [
          'Token Dropping under fixed expert capacity buffers: in distributed Expert Parallelism, if more tokens route to GPU 3 than its buffer size, excess tokens are silently dropped (passed only through the residual connection).',
          'Pure SSMs (without any attention layers) cannot perform arbitrary exact copying over long distances ("the phonebook lookup bottleneck") because a fixed-size state H_t has finite bit capacity.',
          'Fine-tuning MoE models with high learning rates causes router instability; freezing the router or using smaller router learning rates stabilizes fine-tuning.',
        ],
      },
    ],
  },
];

export const modulesPart1 = MODULES_PART_1;
export default MODULES_PART_1;
