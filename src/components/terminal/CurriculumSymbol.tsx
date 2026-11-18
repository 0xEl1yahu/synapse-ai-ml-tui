import { BookOpen, GitFork, LockKeyhole, Network, ShieldCheck, ShieldAlert } from 'lucide-react';

// Brand artwork is served locally. Keep concept icons distinct from company marks.
const brands = [
  { match: /\bclaude\b/i, file: 'claude.svg' },
  { match: /\bopenai\b|\btiktoken\b/i, file: 'openai.svg', mono: true },
  { match: /\bopenclaw\b/i, file: 'openclaw.svg' },
  { match: /\bhermes\b/i, file: 'hermes.png' },
  { match: /\blanggraph\b/i, file: 'langgraph.svg', mono: true },
  { match: /\blangchain\b/i, file: 'langchain.svg', mono: true },
  { match: /\bpython\b/i, file: 'python.svg' },
  { match: /\bmcp\b|model context protocol/i, file: 'mcp.svg', mono: true },
];

const concepts = [
  { match: /agent skills?|skill\.md/i, Icon: BookOpen },
  { match: /agent harness/i, Icon: GitFork },
  { match: /graph engineering|neo4j/i, Icon: Network },
  { match: /prompt injection/i, Icon: ShieldAlert },
  { match: /jailbreak/i, Icon: ShieldCheck },
  { match: /protect my model|data security|data privacy/i, Icon: LockKeyhole },
];

export function CurriculumSymbol({ name }: { name: string }) {
  const brand = brands.find(({ match }) => match.test(name));
  const size = 'curriculum-symbol';
  if (brand) {
    const url = import.meta.env.BASE_URL + 'symbols/' + brand.file;
    if (brand.mono) {
      return <span aria-hidden="true" className={size} style={{
        backgroundColor: 'currentColor', mask: `url("${url}") center / contain no-repeat`,
      }} />;
    }
    return <img alt="" className={size} src={url} />;
  }
  const concept = concepts.find(({ match }) => match.test(name));
  return concept ? <concept.Icon aria-hidden="true" className={size} /> : null;
}

export function hasCurriculumSymbol(name: string) {
  return [...brands, ...concepts].some(({ match }) => match.test(name));
}
