import React, { useState } from 'react';

interface DiagnosticChallenge {
  id: string;
  title: string;
  symptomLog: string;
  buggyCode: string[];
  bugLineIndex: number;
  explanation: string;
  fixedLine: string;
}

const CHALLENGES: DiagnosticChallenge[] = [
  {
    id: 'lora-symmetric-zero',
    title: 'INCIDENT_01 // LoRA Adapter Loss Flatlines (Zero Gradient Saddle)',
    symptomLog:
      '[STEP 1..500] loss=4.1920 | grad_norm(lora_A)=0.0000 | grad_norm(lora_B)=0.0000',
    buggyCode: [
      'class BrokenLoRALinear(nn.Module):',
      '    def __init__(self, d_in=4096, d_out=4096, r=16):',
      '        super().__init__()',
      '        self.base = nn.Linear(d_in, d_out)',
      '        self.lora_A = nn.Parameter(torch.zeros(r, d_in))',
      '        self.lora_B = nn.Parameter(torch.zeros(d_out, r))',
      '    def forward(self, x):',
      '        return self.base(x) + (x @ self.lora_A.T @ self.lora_B.T)',
    ],
    bugLineIndex: 4,
    explanation:
      'By the chain rule, dL/dA = B^T (dL/dy) x^T and dL/dB = (dL/dy) (Ax)^T. If BOTH A and B are initialized to 0, then Ax = 0 and B^T = 0 at step 0, locking both gradients at exact 0 forever! A must be initialized with Gaussian/Kaiming noise while B = 0.',
    fixedLine: '        self.lora_A = nn.Parameter(torch.randn(r, d_in) / math.sqrt(d_in))',
  },
  {
    id: 'attention-missing-scale',
    title: 'INCIDENT_02 // Softmax Saturation & Vanishing Attention Gradients at d_k=128',
    symptomLog:
      '[STEP 120] attn_entropy=0.0001 bits | grad_norm(W_Q)=1.2e-9 (VANISHED!)',
    buggyCode: [
      'def causal_self_attention(Q, K, V, mask):',
      '    # Q, K, V shape: [B, n_heads, T, d_k=128]',
      '    scores = (Q @ K.transpose(-2, -1))',
      '    scores = scores.masked_fill(mask == 0, float("-inf"))',
      '    weights = torch.softmax(scores, dim=-1)',
      '    return weights @ V',
    ],
    bugLineIndex: 2,
    explanation:
      'Without dividing by sqrt(d_k) = sqrt(128) ≈ 11.31, the dot product Q @ K^T has variance 128, pushing logits to ±35. Softmax saturates into a hard one-hot vector where p*(1-p) ≈ 0, killing all gradients into Q and K!',
    fixedLine: '    scores = (Q @ K.transpose(-2, -1)) / math.sqrt(Q.size(-1))',
  },
  {
    id: 'data-leakage-scaler',
    title: 'INCIDENT_03 // Preprocessing Uses Held-Out Data',
    symptomLog:
      'The scaler reports seeing every row, including the rows reserved for validation.',
    buggyCode: [
      'def prepare_pipeline(X_raw, y):',
      '    X_train, X_val, y_train, y_val = train_test_split(X_raw, y, test_size=0.2)',
      '    scaler = StandardScaler().fit(X_raw)',
      '    model = LogisticRegression().fit(scaler.transform(X_train), y_train)',
      '    return model.score(scaler.transform(X_val), y_val)',
    ],
    bugLineIndex: 2,
    explanation:
      'Fitting the scaler on all rows includes the validation data in its mean and variance. Fit it on the training rows, then use those same statistics to transform both sets.',
    fixedLine: '    scaler = StandardScaler().fit(X_train)',
  },
];

export const BrokenModelDiagnostic: React.FC = () => {
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const challenge = CHALLENGES[challengeIdx];
  const isSolved = selectedLine === challenge.bugLineIndex;

  return (
    <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4 font-mono text-xs my-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-grid)] pb-2">
        <span className="text-[var(--accent-warn)] font-bold">
          ┌─ [INTERACTIVE_CRASH_DIAGNOSTIC // CLICK_THE_BUGGY_LINE_TO_FIX_THE_MODEL]
        </span>
        <div className="flex gap-1">
          {CHALLENGES.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setChallengeIdx(idx);
                setSelectedLine(null);
              }}
              className={`px-2 py-0.5 border text-[10px] cursor-pointer ${
                challengeIdx === idx
                  ? 'border-[var(--accent-warn)] bg-[var(--accent-warn)]/15 text-[var(--accent-warn)] font-bold'
                  : 'border-[var(--border-grid)] text-[var(--text-secondary)]'
              }`}
            >
              [CASE_0{idx + 1}]
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs font-bold text-[var(--text-primary)]">{challenge.title}</div>
      <div className="p-2 bg-[var(--bg-canvas)] border border-[var(--accent-danger)]/60 text-[11px] text-[var(--accent-danger)]">
        TELEMETRY_SYMPTOM: {challenge.symptomLog}
      </div>

      {/* Clickable Code Lines */}
      <div className="bg-[var(--bg-canvas)] border border-[var(--border-grid)] p-2 space-y-0.5">
        {challenge.buggyCode.map((line, idx) => {
          const isClicked = selectedLine === idx;
          const isCorrectLine = idx === challenge.bugLineIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedLine(idx)}
              className={`w-full text-left px-2 py-1 flex items-center gap-3 transition-colors cursor-pointer ${
                isClicked && isCorrectLine
                  ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold'
                  : isClicked && !isCorrectLine
                  ? 'bg-[var(--accent-danger)]/20 border border-[var(--accent-danger)] text-[var(--accent-danger)]'
                  : 'hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
              }`}
            >
              <span className="text-[var(--text-muted)] select-none w-5">0{idx + 1}</span>
              <span className="whitespace-pre overflow-x-auto">
                {isSolved && isCorrectLine ? challenge.fixedLine : line}
              </span>
            </button>
          );
        })}
      </div>

      {selectedLine !== null && (
        <div
          className={`p-3 border text-xs ${
            isSolved
              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
              : 'border-[var(--accent-danger)] bg-[var(--accent-danger)]/10 text-[var(--accent-danger)]'
          }`}
        >
          {isSolved ? (
            <div className="space-y-1">
              <div className="font-bold text-[var(--accent-primary)]">
                [✓ ROOT_CAUSE_PATCHED_SUCCESSFULLY]
              </div>
              <p className="font-sans leading-relaxed">{challenge.explanation}</p>
            </div>
          ) : (
            <div>
              [!NOT_THAT_LINE]: Line 0{selectedLine + 1} is valid. Inspect the mathematical flow and click the line causing the symptom above!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrokenModelDiagnostic;
