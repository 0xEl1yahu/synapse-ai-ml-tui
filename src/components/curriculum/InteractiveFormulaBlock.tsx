import React, { useState } from 'react';
import { MathFormula } from '../../types';

export interface InteractiveFormulaBlockProps {
  formula: MathFormula;
}

export const InteractiveFormulaBlock: React.FC<InteractiveFormulaBlockProps> = ({ formula }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(
    formula.variables[0]?.symbol || null
  );
  const [probeA, setProbeA] = useState<number>(64);
  const [probeB, setProbeB] = useState<number>(0.1);

  const activeVar = formula.variables.find((v) => v.symbol === selectedSymbol) || formula.variables[0];

  return (
    <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)] font-mono my-3">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-elevated)] border-b border-[var(--border-grid)] text-xs">
        <span className="text-[var(--accent-primary)] font-semibold">
          ┌─ [EQUATION // {formula.title.toUpperCase()}]
        </span>
        <span className="text-[10px] text-[var(--text-secondary)]">
          [CLICK_VARIABLE_TO_DECODE]
        </span>
      </div>

      {/* Symbolic Equation Display */}
      <div className="p-3 bg-[var(--bg-canvas)] border-b border-[var(--border-grid)]">
        <div className="text-sm md:text-base text-[var(--text-primary)] font-semibold tracking-wide overflow-x-auto py-1">
          {formula.latexLike}
        </div>
        {formula.asciiBreakdown && (
          <pre className="mt-2 text-[11px] leading-snug text-[var(--accent-param)] overflow-x-auto">
            {formula.asciiBreakdown}
          </pre>
        )}
      </div>

      {/* Plain-English Geometric Intuition */}
      <div className="px-3 py-2 border-b border-[var(--border-grid)] text-xs">
        <span className="text-[var(--accent-warn)] font-semibold mr-2">[GEOMETRIC_INTUITION]:</span>
        <span className="text-[var(--text-primary)] font-sans">{formula.intuition}</span>
      </div>

      {/* Interactive Variable Decoder Pills */}
      <div className="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        <div className="md:col-span-5 flex flex-wrap gap-1.5">
          {formula.variables.map((v) => {
            const isSelected = v.symbol === (activeVar?.symbol ?? '');
            return (
              <button
                key={v.symbol}
                type="button"
                onClick={() => setSelectedSymbol(v.symbol)}
                className={`px-2 py-1 text-xs border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold'
                    : 'border-[var(--border-grid)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="mr-1.5">{v.symbol}</span>
                <span className="text-[10px] opacity-80">({v.name})</span>
              </button>
            );
          })}
        </div>

        {activeVar && (
          <div className="md:col-span-7 p-2.5 bg-[var(--bg-canvas)] border border-[var(--border-grid)] text-xs">
            <div className="flex items-center justify-between text-[var(--accent-primary)] font-bold mb-1">
              <span>SYMBOL: {activeVar.symbol} — {activeVar.name}</span>
              <span className="text-[10px] text-[var(--accent-param)]">[ACTIVE_PROBE]</span>
            </div>
            <p className="text-[var(--text-secondary)] font-sans leading-relaxed">
              {activeVar.role}
            </p>
            <div className="mt-2 pt-2 border-t border-[var(--border-grid)] flex flex-wrap items-center gap-4 text-[11px]">
              <label className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span>DIM/SCALE (d):</span>
                <input
                  type="range"
                  min={8}
                  max={512}
                  step={8}
                  value={probeA}
                  onChange={(e) => setProbeA(parseInt(e.target.value, 10))}
                  className="w-20 accent-[var(--accent-primary)]"
                />
                <span className="text-[var(--text-primary)]">{probeA}</span>
              </label>
              <label className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span>COEFF (α/η):</span>
                <input
                  type="range"
                  min={0.01}
                  max={2.0}
                  step={0.01}
                  value={probeB}
                  onChange={(e) => setProbeB(parseFloat(e.target.value))}
                  className="w-20 accent-[var(--accent-param)]"
                />
                <span className="text-[var(--text-primary)]">{probeB.toFixed(2)}</span>
              </label>
              <span className="text-[var(--accent-primary)]">
                1/√d = {(1 / Math.sqrt(probeA)).toFixed(4)} | α/√d = {(probeB / Math.sqrt(probeA)).toFixed(4)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveFormulaBlock;
