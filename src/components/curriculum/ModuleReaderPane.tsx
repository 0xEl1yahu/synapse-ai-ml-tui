import { CurriculumSymbol } from '../terminal/CurriculumSymbol';
import React, { useState } from 'react';
import { SubTopic, TaxonomyModule, WebGLSceneId } from '../../types';
import { LEARNING_RESOURCES } from '../../data/resources';
import { InteractiveFormulaBlock } from './InteractiveFormulaBlock';
import { AgentHarnessSimulator } from './AgentHarnessSimulator';
import { VRAMSystemsCalculator } from './VRAMSystemsCalculator';
import { BrokenModelDiagnostic } from './BrokenModelDiagnostic';

export interface ModuleReaderPaneProps {
  module: TaxonomyModule;
  activeSubTopic: SubTopic;
  onSelectSubTopic: (subTopicId: string) => void;
  completedSubTopics: string[];
  onToggleComplete: (subTopicId: string) => void;
  renderWebGLSlot?: React.ReactNode;
  onOpenFullLab: (sceneId: WebGLSceneId) => void;
  onNavigateModule?: (moduleId: string, subTopicId: string) => void;
  allModules?: TaxonomyModule[];
}

type ReaderSectionFilter =
  | 'ALL_STAGES'
  | '01_PLAIN_ENGLISH'
  | '02_3D_LAB'
  | '03_ARCHITECTURE'
  | '04_MATH'
  | '05_CODE'
  | '06_BREAK_IT';

const STAGE_PILLS: { id: ReaderSectionFilter; label: string }[] = [
  { id: 'ALL_STAGES', label: '[ALL: FULL_LOOP]' },
  { id: '01_PLAIN_ENGLISH', label: '[01: WTF_PLAIN_ENGLISH]' },
  { id: '02_3D_LAB', label: '[02: 3D_LAB_&_SIM]' },
  { id: '03_ARCHITECTURE', label: '[03: ARCHITECTURE]' },
  { id: '04_MATH', label: '[04: MATH_DECODED]' },
  { id: '05_CODE', label: '[05: RUNNABLE_CODE]' },
  { id: '06_BREAK_IT', label: '[06: BREAK_IT!]' },
];

export const ModuleReaderPane: React.FC<ModuleReaderPaneProps> = ({
  module,
  activeSubTopic,
  onSelectSubTopic,
  completedSubTopics,
  onToggleComplete,
  renderWebGLSlot,
  onOpenFullLab,
  onNavigateModule,
  allModules = [],
}) => {
  const [showEmbedded3D, setShowEmbedded3D] = useState<boolean>(true);
  const [stageFilter, setStageFilter] = useState<ReaderSectionFilter>('01_PLAIN_ENGLISH');
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [copyFailedIdx, setCopyFailedIdx] = useState<number | null>(null);

  const isCompleted = completedSubTopics.includes(activeSubTopic.id);

  // Compute Previous / Next SubTopic across all 8 modules for sequential flow
  const flatTopics = allModules.flatMap((m) =>
    m.subTopics.map((st) => ({ moduleId: m.id, moduleNum: m.number, subTopic: st }))
  );
  const currentFlatIdx = flatTopics.findIndex(
    (item) => item.moduleId === module.id && item.subTopic.id === activeSubTopic.id
  );
  const prevItem = currentFlatIdx > 0 ? flatTopics[currentFlatIdx - 1] : null;
  const nextItem =
    currentFlatIdx >= 0 && currentFlatIdx < flatTopics.length - 1
      ? flatTopics[currentFlatIdx + 1]
      : null;

  const handleCopyCode = async (code: string, idx: number) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(code);
      setCopyFailedIdx(null);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx((current) => current === idx ? null : current), 1800);
    } catch {
      setCopiedCodeIdx(null);
      setCopyFailedIdx(idx);
      setTimeout(() => setCopyFailedIdx((current) => current === idx ? null : current), 2500);
    }
  };

  const availableStages = STAGE_PILLS.filter(({ id }) => {
    if (id === '02_3D_LAB') return activeSubTopic.hasLab !== false;
    if (id === '04_MATH') return activeSubTopic.mathFormulas.length > 0;
    if (id === '05_CODE') return activeSubTopic.codeExamples.length > 0;
    return true;
  });
  const showSection = (target: ReaderSectionFilter) =>
    availableStages.some(stage => stage.id === target) &&
    (stageFilter === 'ALL_STAGES' || stageFilter === target);
  const readings = LEARNING_RESOURCES.filter(resource => activeSubTopic.readingIds?.includes(resource.id));
  const check = activeSubTopic.knowledgeCheck;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Slim Sticky Action Bar (Never crowds reading viewport) */}
      <div className="sticky top-0 z-30 bg-[var(--bg-pane)] border-b border-[var(--border-grid)] px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[var(--accent-primary)] text-black font-bold">
              LAYER_{module.number} // {module.layerCategory}
            </span>
            <span className="text-[var(--text-secondary)] hidden sm:inline">
              {module.filePath}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTopic.hasLab !== false && <>
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
            </>}
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
      </div>

      {/* Scrollable SubTopic & Stage Switcher Toolbar */}
      <div className="bg-[var(--bg-pane)]/60 border-b border-[var(--border-grid)] px-4 md:px-6 py-3 space-y-2.5">
        <div className="flex flex-wrap gap-1.5 font-mono">
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
                <span><CurriculumSymbol name={st.title} />{st.title}</span>
              </button>
            );
          })}
        </div>

        {/* Guided 6-Stage Learning Loop Filter Bar */}
        <div className="flex items-center gap-1 pt-2 border-t border-[var(--border-grid)] overflow-x-auto font-mono text-[10px]">
          <span className="text-[var(--text-muted)] mr-1 shrink-0">LESSON_SECTION:</span>
          {availableStages.map((pill) => {
            const active = stageFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setStageFilter(pill.id)}
                className={`px-1.5 py-0.5 border shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'border-[var(--accent-param)] bg-[var(--accent-param)]/15 text-[var(--accent-param)] font-bold'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="p-5 md:p-8 max-w-5xl space-y-7">
        {/* Title & WTF Question Banner */}
        <div className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4">
          <div className="font-mono text-xs text-[var(--accent-primary)] mb-1">
            $ wtf {activeSubTopic.commandSlug.replace(/^wtf-is-/, '')}
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-[var(--text-primary)]">
            <CurriculumSymbol name={activeSubTopic.title} />{activeSubTopic.title}
          </h1>
          <div className="mt-2 text-sm text-[var(--accent-warn)] font-mono">
            ❯ QUESTION: &quot;{activeSubTopic.wtfQuestion}&quot;
          </div>
        </div>

        {/* 01 // PLAIN ENGLISH EXPLANATION (ZERO GATEKEEPING) */}
        {showSection('01_PLAIN_ENGLISH') && (
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
            <section className="mt-4 border-t border-[var(--border-grid)] pt-3">
              <h2 className="font-mono text-xs font-semibold text-[var(--accent-param)]">Tools and libraries</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {activeSubTopic.libraries.map(library => (
                  <li key={library.url}>
                    <a className="font-semibold underline underline-offset-2" href={library.url} target="_blank" rel="noreferrer">
                      <CurriculumSymbol name={library.name} />{library.name}
                    </a>
                    <p className="mt-0.5 text-[var(--text-secondary)]">{library.purpose}</p>
                  </li>
                ))}
              </ul>
            </section>
            {readings.length > 0 && (
              <div className="mt-4 border-t border-[var(--border-grid)] pt-3">
                <div className="font-mono text-xs text-[var(--accent-param)]">READ_OR_WATCH_NEXT:</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {readings.map(resource => <li key={resource.id}>
                    <a className="underline" href={resource.url} target="_blank" rel="noreferrer">
                      {resource.title} · {resource.authorOrOrg}
                    </a>
                  </li>)}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* 02 // INTERACTIVE 3D WEBGL & AGENT HARNESS SANDBOX */}
        {showSection('02_3D_LAB') && (
          <>
            {showEmbedded3D && renderWebGLSlot && (
              <section className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs text-[var(--accent-param)]">
                  <span>
                    02 // INTERACTIVE_3D_SYSTEMS_SANDBOX (LEARN_IT ▸ INTERACT ▸ BREAK_IT)
                  </span>
                  <span>[SCENE: {module.defaultSceneId.toUpperCase()}]</span>
                </div>
                {renderWebGLSlot}
              </section>
            )}

            {(module.id === '06_ai_systems_ops' ||
              module.id === '09_prod_sdk_orchestration_deploy' ||
              activeSubTopic.id.includes('agent') ||
              activeSubTopic.id.includes('attention')) && <AgentHarnessSimulator />}

            {(module.id === '03_sequence_arch' ||
              module.id === '04_generative_ai' ||
              module.id === '05_post_training_rl' ||
              module.id === '06_ai_systems_ops' ||
              module.id === '09_prod_sdk_orchestration_deploy') && <VRAMSystemsCalculator />}
          </>
        )}

        {/* 03 // TECHNICAL & ARCHITECTURAL DEEP DIVE */}
        {showSection('03_ARCHITECTURE') && (
          <section className="border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4 space-y-4">
            <div className="font-mono text-xs text-[var(--accent-primary)] font-bold pb-1.5 border-b border-[var(--border-grid)]">
              03 // FIRST-PRINCIPLES_&_FRONTIER_ARCHITECTURE_DEEP_DIVE
            </div>

            <pre className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-grid)] font-mono text-[11px] text-[var(--accent-primary)] overflow-x-auto leading-snug">
              {activeSubTopic.architectureDiagram ?? module.asciiArchitectureDiagram}
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
        )}

        {/* 04 // THE MATHEMATICS (DECODED) */}
        {showSection('04_MATH') && (
          <section className="space-y-3">
            <div className="font-mono text-xs text-[var(--accent-primary)] font-bold">
              04 // THE_MATHEMATICS_DECODED (INTERACTIVE_SYMBOL_PROBES)
            </div>
            {activeSubTopic.mathFormulas.map((formula) => (
              <InteractiveFormulaBlock key={formula.id} formula={formula} />
            ))}
          </section>
        )}

        {/* 05 // RUNNABLE CODE BLUEPRINTS */}
        {showSection('05_CODE') && (
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
                    <span className="text-[var(--text-primary)] font-semibold">
                      {ex.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(ex.code, idx)}
                      className="px-2 py-0.5 border border-[var(--border-grid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11px] cursor-pointer"
                    >
                      [{copiedCodeIdx === idx ? 'COPIED ✓' : copyFailedIdx === idx ? 'COPY_UNAVAILABLE' : 'COPY_CODE'}]
                    </button>
                  </div>
                </div>
                <div className="px-3 py-1.5 text-xs text-[var(--text-secondary)] font-sans border-b border-[var(--border-grid)]">
                  {ex.description}
                </div>
                <pre className="p-3 bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] overflow-x-auto leading-relaxed">
                  {ex.code}
                </pre>
              </div>
            ))}
          </section>
        )}

        {/* 06 // BREAK IT: FAILURE MODES, OVERFITTING & SILENT BUGS */}
        {showSection('06_BREAK_IT') && (
          <section className="space-y-3">
            <div className="border border-[var(--accent-danger)]/70 bg-[var(--bg-pane)] p-4 font-mono">
              <div className="flex items-center justify-between text-xs text-[var(--accent-danger)] font-bold pb-2 mb-2 border-b border-[var(--border-grid)]">
                <span>06 // BREAK_IT: PRODUCTION_FAILURE_MODES_&_SILENT_BUGS</span>
                <span>[!DIAGNOSTIC_CHECKLIST]</span>
              </div>
              <ul className="space-y-2 text-xs font-sans text-[var(--text-primary)]">
                {activeSubTopic.pitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-[var(--accent-danger)] font-bold">
                      [!BUG_0{idx + 1}]
                    </span>
                    <span className="leading-relaxed">{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

            {check && (
              <dl aria-label="Knowledge check" className="knowledge-check border border-[var(--border-grid)] bg-[var(--bg-pane)] p-4 text-sm leading-relaxed">
                <dt className="font-semibold">
                  <span className="font-mono" aria-label="Question">Q:</span>
                  <span>{check.question}</span>
                </dt>
                <dd>
                  <span className="font-mono font-semibold" aria-label="Answer">A:</span>
                  <span>{check.answer}</span>
                </dd>
              </dl>
            )}
            {activeSubTopic.hasLab !== false && <BrokenModelDiagnostic />}
          </section>
        )}

        {/* Bottom Sequential Navigation Footer (Prev / Next Topic Across All 24 Modules) */}
        <footer className="pt-4 border-t border-[var(--border-grid)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
          {prevItem && onNavigateModule ? (
            <button
              type="button"
              onClick={() => onNavigateModule(prevItem.moduleId, prevItem.subTopic.id)}
              className="p-3 border border-[var(--border-grid)] bg-[var(--bg-pane)] hover:border-[var(--accent-primary)] text-left flex-1 cursor-pointer"
            >
              <div className="text-[10px] text-[var(--text-secondary)]">
                ◂ PREV_CONCEPT (MOD_{prevItem.moduleNum})
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5 truncate">
                {prevItem.subTopic.title}
              </div>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {nextItem && onNavigateModule ? (
            <button
              type="button"
              onClick={() => onNavigateModule(nextItem.moduleId, nextItem.subTopic.id)}
              className="p-3 border border-[var(--accent-primary)] bg-[var(--bg-pane)] hover:bg-[var(--accent-primary)]/10 text-right flex-1 cursor-pointer"
            >
              <div className="text-[10px] text-[var(--accent-primary)]">
                NEXT_CONCEPT (MOD_{nextItem.moduleNum}) ▸
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5 truncate">
                {nextItem.subTopic.title}
              </div>
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </footer>
      </div>
    </div>
  );
};

export default ModuleReaderPane;
