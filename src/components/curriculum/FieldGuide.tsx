import { GUIDE_LESSONS, type GuideLesson } from '../../data/fieldGuide';
import { LEARNING_RESOURCES } from '../../data/resources';

interface Props {
  lesson: GuideLesson;
  onChoose: (id: string) => void;
  onOpenHarness: () => void;
}

export function FieldGuide({ lesson, onChoose, onOpenHarness }: Props) {
  const position = GUIDE_LESSONS.indexOf(lesson);
  const next = GUIDE_LESSONS[position + 1];
  const groups = [...new Set(GUIDE_LESSONS.map(item => item.group))];
  return (
    <article className="mx-auto max-w-3xl px-5 py-8 md:px-10 space-y-7">
      <label className="block text-sm text-[var(--text-secondary)]">
        Field guide
        <select className="block mt-2 w-full border border-[var(--border-grid)] bg-[var(--bg-pane)] p-2 text-[var(--text-primary)]"
          value={lesson.id} onChange={event => onChoose(event.target.value)}>
          {groups.map(group => <optgroup key={group} label={group}>
            {GUIDE_LESSONS.filter(item => item.group === group).map(item =>
              <option key={item.id} value={item.id}>{item.title}</option>)}
          </optgroup>)}
        </select>
      </label>
      <header><h1 className="font-display text-3xl font-bold mb-3">{lesson.title}</h1>
        <p className="text-lg leading-relaxed">{lesson.introduction}</p>
      </header>
      {lesson.sections.map(([heading, body], i) => <section key={heading}>
        <h2 className="font-display text-xl mb-2">{heading}</h2>
        <p className="leading-relaxed text-[var(--text-secondary)]">{body}</p>
        {i === 0 && lesson.code && <pre className="my-3 p-4 overflow-x-auto bg-[var(--bg-pane)]"><code>{lesson.code}</code></pre>}
      </section>)}
      <section className="border-l-2 border-[var(--accent-primary)] pl-4">
        <h2 className="font-semibold">Check your understanding</h2>
        <p className="mt-2">{lesson.question}</p>
        <details className="mt-2"><summary className="cursor-pointer text-[var(--accent-primary)]">Show answer</summary><p className="mt-2">{lesson.answer}</p></details>
      </section>
      <section><h2 className="font-semibold">Read or watch next</h2>
        <ul className="mt-2 space-y-2">{lesson.resources.map(id => {
          const res = LEARNING_RESOURCES.find(item => item.id === id);
          return res && <li key={id}><a className="underline text-[var(--accent-param)]" href={res.url} target="_blank" rel="noreferrer">{res.title} · {res.authorOrOrg}</a></li>;
        })}</ul>
        {lesson.id === 'harness' && <button className="underline mt-3" onClick={onOpenHarness}>Explore the technical harness lesson and simulator</button>}
      </section>
      {next && <button className="border border-[var(--accent-primary)] p-3" onClick={() => onChoose(next.id)}>Next · {next.title}</button>}
    </article>
  );
}
