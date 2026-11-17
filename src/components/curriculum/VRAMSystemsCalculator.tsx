import React, { useMemo, useState } from 'react';

type ModelPreset = {
  label: string;
  paramsB: number;
  layers: number;
  qHeads: number;
  kvHeadsGQA: number;
  headDim: number;
  dModel: number;
};

const MODEL_PRESETS: ModelPreset[] = [
  { label: '7B / 8B Dense (Llama-3-8B)', paramsB: 8, layers: 32, qHeads: 32, kvHeadsGQA: 8, headDim: 128, dModel: 4096 },
  { label: '32B Dense (Qwen-2.5-32B)', paramsB: 32, layers: 64, qHeads: 40, kvHeadsGQA: 8, headDim: 128, dModel: 5120 },
  { label: '70B Dense (Llama-3-70B)', paramsB: 70, layers: 80, qHeads: 64, kvHeadsGQA: 8, headDim: 128, dModel: 8192 },
  { label: '671B MoE (DeepSeek-V3 37B Active)', paramsB: 671, layers: 61, qHeads: 128, kvHeadsGQA: 8, headDim: 128, dModel: 7168 },
];

export const VRAMSystemsCalculator: React.FC = () => {
  const [presetIdx, setPresetIdx] = useState<number>(0);
  const [mode, setMode] = useState<'INFERENCE' | 'QLORA_R16' | 'FULL_ADAMW' | 'GRPO_RL' | 'PPO_RL'>('INFERENCE');
  const [precision, setPrecision] = useState<'INT4_AWQ' | 'FP8' | 'BF16'>('BF16');
  const [attnType, setAttnType] = useState<'MHA' | 'GQA' | 'MLA'>('GQA');
  const [seqLen, setSeqLen] = useState<number>(16384);
  const [numGpus, setNumGpus] = useState<number>(1);
  const [gpuVramGB, setGpuVramGB] = useState<number>(80); // A100/H100 80GB default

  const model = MODEL_PRESETS[presetIdx];

  const stats = useMemo(() => {
    const bytesPerWeight =
      precision === 'INT4_AWQ' ? 0.55 : precision === 'FP8' ? 1.0 : 2.0;

    let weightsGB = model.paramsB * bytesPerWeight;
    let gradsGB = 0;
    let optimizerGB = 0;

    if (mode === 'FULL_ADAMW') {
      weightsGB = model.paramsB * 2.0; // BF16 weights
      gradsGB = model.paramsB * 2.0;   // BF16 grads
      optimizerGB = model.paramsB * 12.0; // FP32 master (4B) + m_t (4B) + v_t (4B)
    } else if (mode === 'QLORA_R16') {
      weightsGB = model.paramsB * 0.55; // 4-bit NF4 base
      const trainableFrac = 0.012;
      gradsGB = model.paramsB * trainableFrac * 2.0;
      optimizerGB = model.paramsB * trainableFrac * 12.0;
    } else if (mode === 'GRPO_RL') {
      // Policy + Frozen Ref (or LoRA ref), NO Critic model!
      weightsGB = model.paramsB * 2.0 * 1.5;
      gradsGB = model.paramsB * 2.0;
      optimizerGB = model.paramsB * 12.0;
    } else if (mode === 'PPO_RL') {
      // Policy + Critic + Ref + Reward (4 models in memory!)
      weightsGB = model.paramsB * 2.0 * 3.5;
      gradsGB = model.paramsB * 2.0 * 2.0;
      optimizerGB = model.paramsB * 12.0 * 2.0;
    }

    // KV Cache calculation
    let kvBytesPerTokenPerLayer = 0;
    if (attnType === 'MHA') {
      kvBytesPerTokenPerLayer = 2 * model.qHeads * model.headDim * 2; // FP16 KV
    } else if (attnType === 'GQA') {
      kvBytesPerTokenPerLayer = 2 * model.kvHeadsGQA * model.headDim * 2;
    } else {
      // DeepSeek MLA compressed latent c_t^KV (d_c = 512 + d_rope = 64)
      kvBytesPerTokenPerLayer = (512 + 64) * 2;
    }

    const kvCacheGB = (kvBytesPerTokenPerLayer * model.layers * seqLen) / 1e9;
    const totalClusterGB = weightsGB + gradsGB + optimizerGB + kvCacheGB;
    const perGpuGB = totalClusterGB / numGpus;
    const fitsInVram = perGpuGB <= gpuVramGB;

    return {
      weightsGB,
      gradsGB,
      optimizerGB,
      kvCacheGB,
      totalClusterGB,
      perGpuGB,
      fitsInVram,
    };
  }, [model, mode, precision, attnType, seqLen, numGpus, gpuVramGB]);

  return (
    <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4 font-mono text-xs my-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-grid)] pb-2">
        <span className="text-[var(--accent-primary)] font-bold">
          ┌─ [INTERACTIVE_GPU_VRAM_&_5D_SHARDING_CALCULATOR]
        </span>
        <span
          className={`px-2 py-0.5 font-bold border ${
            stats.fitsInVram
              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
              : 'border-[var(--accent-danger)] bg-[var(--accent-danger)]/20 text-[var(--accent-danger)]'
          }`}
        >
          {stats.fitsInVram
            ? `[✓ FITS IN VRAM: ${stats.perGpuGB.toFixed(1)} GB / ${gpuVramGB} GB PER GPU]`
            : `[!CUDA_OOM: NEEDS ${stats.perGpuGB.toFixed(1)} GB > ${gpuVramGB} GB PER GPU]`}
        </span>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <div className="text-[10px] text-[var(--text-secondary)]">01 // MODEL_SCALE:</div>
          <div className="flex flex-col gap-1">
            {MODEL_PRESETS.map((m, idx) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setPresetIdx(idx)}
                className={`px-2 py-1 border text-left text-[11px] cursor-pointer ${
                  presetIdx === idx
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold'
                    : 'border-[var(--border-grid)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] text-[var(--text-secondary)]">
            02 // WORKLOAD_MODE (16Ψ RULE):
          </div>
          <div className="flex flex-wrap gap-1">
            {(['INFERENCE', 'QLORA_R16', 'FULL_ADAMW', 'GRPO_RL', 'PPO_RL'] as const).map(
              (m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-2 py-1 border text-[10px] cursor-pointer ${
                    mode === m
                      ? 'border-[var(--accent-param)] bg-[var(--accent-param)]/15 text-[var(--accent-param)] font-bold'
                      : 'border-[var(--border-grid)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                  }`}
                >
                  [{m}]
                </button>
              )
            )}
          </div>

          <div className="text-[10px] text-[var(--text-secondary)] pt-1">
            03 // KV_CACHE_ARCHITECTURE &amp; WEIGHT_BITS:
          </div>
          <div className="flex flex-wrap gap-1">
            {(['MHA', 'GQA', 'MLA'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAttnType(a)}
                className={`px-2 py-0.5 border text-[10px] cursor-pointer ${
                  attnType === a
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold'
                    : 'border-[var(--border-grid)] text-[var(--text-secondary)]'
                }`}
              >
                [KV:{a}]
              </button>
            ))}
            {(['INT4_AWQ', 'FP8', 'BF16'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrecision(p)}
                className={`px-2 py-0.5 border text-[10px] cursor-pointer ${
                  precision === p
                    ? 'border-[var(--accent-warn)] text-[var(--accent-warn)] font-bold'
                    : 'border-[var(--border-grid)] text-[var(--text-secondary)]'
                }`}
              >
                [{p}]
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[var(--text-secondary)]">CONTEXT_LEN:</span>
              <span className="text-[var(--accent-param)]">{seqLen.toLocaleString()} TOKENS</span>
            </div>
            <input
              type="range"
              min={2048}
              max={131072}
              step={2048}
              value={seqLen}
              onChange={(e) => setSeqLen(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--accent-param)]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[var(--text-secondary)]">FSDP / TP GPUs:</span>
              <span className="text-[var(--accent-primary)]">
                {numGpus}x GPU ({gpuVramGB}GB each)
              </span>
            </div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 4, 8, 16, 64].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumGpus(n)}
                  className={`px-2 py-0.5 border text-[10px] cursor-pointer ${
                    numGpus === n
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-black font-bold'
                      : 'border-[var(--border-grid)] text-[var(--text-secondary)]'
                  }`}
                >
                  {n}x
                </button>
              ))}
              {[24, 80, 192].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setGpuVramGB(v)}
                  className={`px-1.5 py-0.5 border text-[10px] cursor-pointer ${
                    gpuVramGB === v
                      ? 'border-[var(--accent-param)] text-[var(--accent-param)]'
                      : 'border-[var(--border-grid)] text-[var(--text-muted)]'
                  }`}
                >
                  {v}G
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Memory Breakdown Readout */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[var(--border-grid)] text-[11px]">
        <div className="p-2 bg-[var(--bg-canvas)] border border-[var(--border-grid)]">
          <div className="text-[10px] text-[var(--text-secondary)]">WEIGHTS_VRAM</div>
          <div className="text-sm font-bold text-[var(--accent-primary)]">
            {stats.weightsGB.toFixed(1)} GB
          </div>
        </div>
        <div className="p-2 bg-[var(--bg-canvas)] border border-[var(--border-grid)]">
          <div className="text-[10px] text-[var(--text-secondary)]">GRADIENTS</div>
          <div className="text-sm font-bold text-[var(--accent-warn)]">
            {stats.gradsGB.toFixed(1)} GB
          </div>
        </div>
        <div className="p-2 bg-[var(--bg-canvas)] border border-[var(--border-grid)]">
          <div className="text-[10px] text-[var(--text-secondary)]">ADAM_STATES (12Ψ)</div>
          <div className="text-sm font-bold text-[var(--accent-danger)]">
            {stats.optimizerGB.toFixed(1)} GB
          </div>
        </div>
        <div className="p-2 bg-[var(--bg-canvas)] border border-[var(--border-grid)]">
          <div className="text-[10px] text-[var(--text-secondary)]">
            KV_CACHE ({attnType})
          </div>
          <div className="text-sm font-bold text-[var(--accent-param)]">
            {stats.kvCacheGB.toFixed(2)} GB
          </div>
        </div>
        <div className="p-2 bg-[var(--bg-canvas)] border border-[var(--border-grid)]">
          <div className="text-[10px] text-[var(--text-secondary)]">PER_GPU_SHARD</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">
            {stats.perGpuGB.toFixed(1)} GB / GPU
          </div>
        </div>
      </div>
    </div>
  );
};

export default VRAMSystemsCalculator;
