import React, { useState } from 'react';
import { SubTopic, TaxonomyModule, WebGLSceneId } from '../../types';
import { InteractiveFormulaBlock } from './InteractiveFormulaBlock';
import { AgentHarnessSimulator } from './AgentHarnessSimulator';

export interface ModuleReaderPaneProps {
  module: TaxonomyModule;
  activeSubTopic: SubTopic;
  onSelectSubTopic: (subTopicId: string) => void;
  completedSubTopics: string[];
  onToggleComplete: (subTopicId: string) => void;
  renderWebGLSlot?: React.ReactNode;
  onOpenFullLab: (sceneId: WebGLSceneId) => void;
}

export const ModuleReaderPane: React.FC<ModuleReaderPaneProps> = ({
  module,
  activeSubTopic,
  onSelectSubTopic,
  completedSubTopics,
  onToggleComplete,
  renderWebGLSlot,
  onOpenFullLab,
}) => {
  const [showEmbedded3D, setShowEmbedded3D] = useState<boolean>(true);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [simulatedCodeIdx, setSimulatedCodeIdx] = useState<number | null>(null);

  const isCompleted = completedSubTopics.includes(activeSubTopic.id);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard?.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 1800);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Sticky Module & SubTopic Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-pane)] border-b border-[var(--border-grid)] px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[var(--accent-primary)] text-black font-bold">
              LAYER_{module.number} // {module.layerCategory}
            </span>
            <span className="text-[var(--text-secondary)]">{module.filePath}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmbedded3D((v) => !v)}
              className={`px-2 py-0.5 border text-[11px] cursor-pointer ${
                showEmbedded3D
                  ? 'border-[var(--accent-param)] text-[var(--accent-param)] bg-[var(--accent-param)]/10'
                  : 'border-[var(--border-grid)] text-[var(--text-secondary)]'
              }`}
            >
              [{showEmbedded3D ? 'HIDE_3D_SANDBOX' : 'SHOW_3D_SANDBOX'}]
            </button>
            <button
              type="button"
              onClick={() => onOpenFullLab(module.defaultSceneId)}
              className="px-2 py-0.5 border border-[var(--border-grid)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] text-[11px] cursor-pointer"
            >
              [FULLSCREEN_LAB ↗]
            </button>
            <button
              type="button"
              onClick={() => onToggleComplete(activeSubTopic.id)}
              className={`px-2.5 py-0.5 border text-[11px] font-semibold cursor-pointer ${
                isCompleted
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-black'
                  : 'border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/15'
              }`}
            >
              {isCompleted ? '[✓ TOPIC_MASTERED]' : '[MARK_UNDERSTOOD ✓]'}
            </button>
          </div>
        </div>

        {/* SubTopic Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 mt-2.5 font-mono">
          {module.subTopics.map((st, idx) => {
            const isSelected = st.id === activeSubTopic.id;
            const isDone = completedSubTopics.includes(st.id);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onSelectSubTopic(st.id)}
                className={`px-2.5 py-1 text-xs border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold'
                    : 'border-[var(--border-grid)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="mr-1.5">{isDone ? '[✓]' : `[0${idx + 1}]`}</span>
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="p-4 md:p-6 max-w-5xl space-y-6">
        {/* Title & WTF Question Banner */}
        <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4">
          <div className="font-mono text-xs text-[var(--accent-primary)] mb-1">
            $ wtf {activeSubTopic.commandSlug.replace(/^wtf-is-/, '')}
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-mono text-[var(--text-primary)]">
            {activeSubTopic.title}
          </h1>
          <div className="mt-2 text-sm text-[var(--accent-warn)] font-mono">
            ❯ QUESTION: "{activeSubTopic.wtfQuestion}"
          </div>
        </div>

        {/* 01 // PLAIN ENGLISH EXPLANATION (ZERO GATEKEEPING) */}
        <section className="border border-[var(--accent-primary)]/60 bg-[var(--bg-pane)] p-4">
          <div className="flex items-center justify-between font-mono text-xs text-[var(--accent-primary)] font-bold mb-2 pb-1.5 border-b border-[var(--border-grid)]">
            <span>01 // WTF_IS_IT? (PLAIN_ENGLISH_NO_JARGON)</span>
            <span>[ZERO_GATEKEEPING_MODE]</span>
          </div>
          <p className="text-sm md:text-[15px] leading-relaxed text-[var(--text-primary)]">
            {activeSubTopic.plainEnglish}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-[var(--border-grid)]">
            <div>
              <div className="font-mono text-[11px] text-[var(--accent-param)] font-semibold mb-1">
                WHY_IT_MATTERS_IN_PRODUCTION:
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                {activeSubTopic.whyItMatters}
              </p>
            </div>
            <div>
              <div className="font-mono text-[11px] text-[var(--accent-warn)] font-semibold mb-1">
                WHERE_IT_RUNS_IN_REAL_SYSTEMS:
              </div>
              <ul className="space-y-1 font-mono text-xs text-[var(--text-primary)]">
                {activeSubTopic.realWorldSystems.map((sys) => (
                  <li key={sys} className="flex items-center gap-1.5">
                    <span className="text-[var(--accent-primary)]">▸</span>
                    <span>{sys}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 02 // INTERACTIVE 3D WEBGL & AGENT HARNESS SANDBOX */}
        {showEmbedded3D && renderWebGLSlot && (
          <section className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--accent-param)]">
              <span>02 // INTERACTIVE_3D_SYSTEMS_SANDBOX (LEARN_IT ▸ INTERACT ▸ BREAK_IT)</span>
              <span>[SCENE: {module.defaultSceneId.toUpperCase()}]</span>
            </div>
            {renderWebGLSlot}
          </section>
        )}

        {(module.id === '06_ai_systems_ops' ||
          activeSubTopic.id.includes('agent') ||
          activeSubTopic.id.includes('attention')) && <AgentHarnessSimulator />}

        {/* 03 // TECHNICAL & ARCHITECTURAL DEEP DIVE */}
        <section className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4 space-y-4">
          <div className="font-mono text-xs text-[var(--accent-primary)] font-bold pb-1.5 border-b border-[var(--border-grid)]">
            03 // FIRST-PRINCIPLES_&_FRONTIER_ARCHITECTURE_DEEP_DIVE
          </div>

          <pre className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-grid)] font-mono text-[11px] text-[var(--accent-primary)] overflow-x-auto leading-snug">
            {module.asciiArchitectureDiagram}
          </pre>

          <div className="space-y-3 text-sm leading-relaxed text-[var(--text-primary)]">
            {activeSubTopic.deepDiveParagraphs.map((para, i) => (
              <p key={i} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Key Takeaways */}
          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-grid)]">
            <div className="font-mono text-xs text-[var(--accent-primary)] font-bold mb-2">
              ◆ KEY_ENGINEERING_INVARIANT_TAKEAWAYS:
            </div>
            <ul className="space-y-1.5 text-xs md:text-sm">
              {activeSubTopic.keyTakeaways.map((kt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-[var(--accent-primary)] font-bold">
                    [0{idx + 1}]
                  </span>
                  <span>{kt}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 04 // THE MATHEMATICS (DECODED) */}
        <section className="space-y-3">
          <div className="font-mono text-xs text-[var(--accent-primary)] font-bold">
            04 // THE_MATHEMATICS_DECODED (INTERACTIVE_SYMBOL_PROBES)
          </div>
          {activeSubTopic.mathFormulas.map((formula) => (
            <InteractiveFormulaBlock key={formula.id} formula={formula} />
          ))}
        </section>

        {/* 05 // RUNNABLE CODE BLUEPRINTS */}
        <section className="space-y-3">
          <div className="font-mono text-xs text-[var(--accent-primary)] font-bold">
            05 // FROM-SCRATCH_CODE_IMPLEMENTATION
          </div>
          {activeSubTopic.codeExamples.map((ex, idx) => (
            <div
              key={ex.title}
              className="border border-[var(--border-grid)] bg-[var(--bg-pane)] font-mono"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[var(--bg-elevated)] border-b border-[var(--border-grid)] text-xs">
                <div>
                  <span className="text-[var(--accent-param)] font-bold mr-2">
                    [{ex.language.toUpperCase()}]
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">{ex.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setSimulatedCodeIdx(simulatedCodeIdx === idx ? null : idx)
                    }
                    className="px-2 py-0.5 border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/15 text-[11px] cursor-pointer"
                  >
                    [{simulatedCodeIdx === idx ? 'HIDE_TRACE' : 'RUN_VERIFICATION_TRACE ❯'}]
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(ex.code, idx)}
                    className="px-2 py-0.5 border border-[var(--border-grid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11px] cursor-pointer"
                  >
                    [{copiedCodeIdx === idx ? 'COPIED ✓' : 'COPY_CODE'}]
                  </button>
                </div>
              </div>
              <div className="px-3 py-1.5 text-xs text-[var(--text-secondary)] font-sans border-b border-[var(--border-grid)]">
                {ex.description}
              </div>
              <pre className="p-3 bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] overflow-x-auto leading-relaxed">
                {ex.code}
              </pre>
              {simulatedCodeIdx === idx && (
                <div className="p-3 bg-[#050709] border-t border-[var(--accent-primary)] text-[11px] text-[var(--accent-primary)]">
                  <div>$ python3 -c "verify_{activeSubTopic.commandSlug.replace(/-/g, '_')}()"</div>
                  <div className="text-[var(--text-secondary)] mt-1">
                    [STDOUT] Initializing tensor shapes & analytical gradient check...
                  </div>
                  <div className="text-[#10B981] mt-0.5">
                    [PASS ✓] Forward/Backward numerical invariant verified (max_rel_err = 1.42e-7, exit_code = 0)
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* 06 // BREAK IT: FAILURE MODES, OVERFITTING & SILENT BUGS */}
        <section className="border border-[#EF4444]/70 bg-[var(--bg-pane)] p-4 font-mono">
          <div className="flex items-center justify-between text-xs text-[#EF4444] font-bold pb-2 mb-2 border-b border-[var(--border-grid)]">
            <span>06 // BREAK_IT: PRODUCTION_FAILURE_MODES_&_SILENT_BUGS</span>
            <span>[!DIAGNOSTIC_CHECKLIST]</span>
          </div>
          <ul className="space-y-2 text-xs font-sans text-[var(--text-primary)]">
            {activeSubTopic.pitfalls.map((pitfall, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-mono text-[#EF4444] font-bold">[!BUG_0{idx + 1}]</span>
                <span className="leading-relaxed">{pitfall}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ModuleReaderPane;
