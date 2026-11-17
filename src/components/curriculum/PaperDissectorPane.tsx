import React, { useState } from 'react';
import { CanonicalPaper, WebGLSceneId } from '../../types';
import { CANONICAL_PAPERS } from '../../data/papers';

export interface PaperDissectorPaneProps {
  papers?: CanonicalPaper[];
  onOpenModule: (moduleId: string) => void;
  onLaunch3DScene: (sceneId: WebGLSceneId) => void;
}

export const PaperDissectorPane: React.FC<PaperDissectorPaneProps> = ({
  papers = CANONICAL_PAPERS,
  onOpenModule,
  onLaunch3DScene,
}) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string>(papers[0]?.id || '');
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activePaper = papers.find((p) => p.id === selectedPaperId) || papers[0];
  const activeStep = activePaper.equationSteps[activeStepIdx] || activePaper.equationSteps[0];

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activePaper.minimalCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 font-mono text-xs">
      {/* Header Banner */}
      <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[var(--accent-primary)] font-bold">
            ┌─ [WTFIS.AI // CANONICAL_PAPER_DISSECTOR ("WTF IS THIS PAPER?")]
          </div>
          <h1 className="text-lg md:text-2xl font-bold font-display text-[var(--text-primary)] mt-1">
            LANDMARK AI/ML PAPERS DECODED EQUATION-BY-EQUATION
          </h1>
          <p className="text-xs font-sans text-[var(--text-secondary)] mt-1">
            No academic gatekeeping: inspect what broke before each paper existed, step through the annotated tensor shapes, and run the 25-line PyTorch reproduction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={activePaper.url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 border border-[var(--accent-param)] text-[var(--accent-param)] hover:bg-[var(--accent-param)]/15 font-semibold"
          >
            [OPEN_ORIGINAL_ARXIV_PDF ↗]
          </a>
          <button
            type="button"
            onClick={() => onLaunch3DScene(activePaper.coupledSceneId)}
            className="px-3 py-1.5 border border-[var(--accent-primary)] bg-[var(--accent-primary)] text-black font-bold cursor-pointer"
          >
            [LAUNCH_COUPLED_3D_LAB: {activePaper.coupledSceneId.toUpperCase()} ❯]
          </button>
        </div>
      </div>

      {/* Paper Selector Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {papers.map((paper) => {
          const isSelected = paper.id === activePaper.id;
          return (
            <button
              key={paper.id}
              type="button"
              onClick={() => {
                setSelectedPaperId(paper.id);
                setActiveStepIdx(0);
              }}
              className={`p-3 border text-left transition-colors cursor-pointer ${
                isSelected
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15'
                  : 'border-[var(--border-grid)] bg-[var(--bg-pane)] hover:border-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[var(--accent-param)] font-bold">
                  [{paper.year} // {paper.shortSlug.toUpperCase()}]
                </span>
                <span className="text-[var(--accent-primary)]">
                  {isSelected ? 'MOUNTED ◆' : 'MOUNT ❯'}
                </span>
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-1 line-clamp-1">
                {paper.title}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">
                {paper.authors}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Paper 3-Column Dissector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Historical Diff & Annotated Tensor Flow */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-[var(--accent-primary)] font-bold border-b border-[var(--border-grid)] pb-1.5">
              <span>01 // HISTORICAL_DIFF_&_INVENTION</span>
              <span>{activePaper.venueOrArxiv}</span>
            </div>

            <div>
              <div className="text-[10px] text-[var(--accent-danger)] font-bold">
                [!WHAT_BROKE_BEFORE_THIS_PAPER]:
              </div>
              <p className="text-xs font-sans text-[var(--text-secondary)] mt-1 leading-relaxed">
                {activePaper.whatBrokeBefore}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border-grid)]">
              <div className="text-[10px] text-[var(--accent-primary)] font-bold">
                [✓ WTF_THIS_PAPER_ACTUALLY_INVENTED]:
              </div>
              <p className="text-xs font-sans text-[var(--text-primary)] mt-1 leading-relaxed">
                {activePaper.wtfInvention}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border-grid)]">
              <div className="text-[10px] text-[var(--accent-warn)] font-bold mb-1">
                PRODUCTION_IMPACT:
              </div>
              <ul className="space-y-1 text-[11px] font-sans text-[var(--text-secondary)]">
                {activePaper.productionImpact.map((imp) => (
                  <li key={imp} className="flex items-start gap-1.5">
                    <span className="text-[var(--accent-primary)] font-mono">▸</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onOpenModule(activePaper.moduleId)}
              className="w-full py-1.5 border border-[var(--border-grid)] bg-[var(--bg-canvas)] hover:border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold cursor-pointer"
            >
              [JUMP_TO_FULL_CURRICULUM_MODULE ({activePaper.moduleId}) ❯]
            </button>
          </div>

          <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-3">
            <div className="text-[11px] text-[var(--accent-param)] font-bold mb-2">
              02 // ANNOTATED_TENSOR_SHAPE_PIPELINE:
            </div>
            <pre className="p-2.5 bg-[var(--bg-canvas)] border border-[var(--border-grid)] text-[10px] text-[var(--accent-primary)] overflow-x-auto leading-snug">
              {activePaper.tensorFlowAscii}
            </pre>
          </div>
        </div>

        {/* Right Column: Equation Step-Through + Minimal 25-Line PyTorch Reproduction */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-[var(--accent-primary)] font-bold border-b border-[var(--border-grid)] pb-1.5">
              <span>03 // CORE_EQUATION_&_TENSOR_STEP_THROUGH</span>
              <span>[STEP {activeStepIdx + 1} OF {activePaper.equationSteps.length}]</span>
            </div>

            <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--accent-primary)]/50 text-sm font-bold text-[var(--text-primary)] overflow-x-auto">
              {activePaper.coreEquation}
            </div>

            {/* Step Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {activePaper.equationSteps.map((step, idx) => (
                <button
                  key={step.stepTitle}
                  type="button"
                  onClick={() => setActiveStepIdx(idx)}
                  className={`px-2.5 py-1 border text-[11px] cursor-pointer ${
                    activeStepIdx === idx
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold'
                      : 'border-[var(--border-grid)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                  }`}
                >
                  {step.stepTitle}
                </button>
              ))}
            </div>

            {activeStep && (
              <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-grid)] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--accent-primary)]">
                    {activeStep.expression}
                  </span>
                  <span className="px-2 py-0.5 border border-[var(--accent-param)] text-[10px] text-[var(--accent-param)]">
                    SHAPES: {activeStep.tensorShapes}
                  </span>
                </div>
                <p className="text-xs font-sans text-[var(--text-primary)] leading-relaxed">
                  {activeStep.plainMeaning}
                </p>
              </div>
            )}
          </div>

          {/* Minimal PyTorch Implementation */}
          <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)]">
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-grid)]">
              <span className="text-[var(--accent-primary)] font-bold">
                04 // MINIMAL_PYTORCH_PAPER_REPRODUCTION (~25 LINES)
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2 py-0.5 border border-[var(--border-grid)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                [{copied ? 'COPIED ✓' : 'COPY_PYTORCH'}]
              </button>
            </div>
            <pre className="p-3 bg-[var(--bg-canvas)] text-[11px] text-[var(--text-primary)] overflow-x-auto leading-relaxed">
              {activePaper.minimalCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDissectorPane;
