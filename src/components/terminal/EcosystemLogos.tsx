import React from 'react';

/**
 * CustomWTFLogoEmblem:
 * Geometric isometric tensor cube + terminal prompt glyph (`>_`)
 */
export const WTFBrandLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="WTFIS.AI Tensor Terminal Emblem"
  >
    {/* Outer Isometric Hexagonal Tensor Frame */}
    <path
      d="M14 2L25 8.2V19.8L14 26L3 19.8V8.2L14 2Z"
      stroke="currentColor"
      strokeWidth="1.75"
      fill="rgba(16, 185, 129, 0.1)"
    />
    {/* Internal Tensor Wireframe Axes */}
    <path
      d="M14 2V14M14 14L25 8.2M14 14L3 8.2"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeOpacity="0.45"
    />
    {/* High-Contrast Terminal Prompt Chevron & Cursor (`>_`) */}
    <path
      d="M8.5 13L12.5 16L8.5 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <rect x="14.2" y="17.5" width="5.2" height="2" fill="currentColor" />
  </svg>
);

export interface EcosystemLogoMeta {
  name: string;
  svgUrl?: string;
  category: 'RUNTIME' | 'MODEL_LAB' | 'HARDWARE' | 'VECTOR_DB' | 'FRAMEWORK';
}

/**
 * Verified SVG routes retrieved via `npx @21st-dev/cli logo <query> --json` (svgl.app CDN)
 * paired with inline SVG fallbacks for PyTorch, NumPy, HuggingFace, vLLM, and MCP.
 */
const TWENTYFIRST_LOGOS: Record<string, { dark: string; light: string }> = {
  python: {
    dark: 'https://svgl.app/library/python.svg',
    light: 'https://svgl.app/library/python.svg',
  },
  openai: {
    dark: 'https://svgl.app/library/openai_dark.svg',
    light: 'https://svgl.app/library/openai.svg',
  },
  tiktoken: {
    dark: 'https://svgl.app/library/openai_dark.svg',
    light: 'https://svgl.app/library/openai.svg',
  },
  anthropic: {
    dark: 'https://svgl.app/library/anthropic_white.svg',
    light: 'https://svgl.app/library/anthropic_black.svg',
  },
  claude: {
    dark: 'https://svgl.app/library/claude-ai-icon.svg',
    light: 'https://svgl.app/library/claude-ai-icon.svg',
  },
  deepseek: {
    dark: 'https://svgl.app/library/deepseek.svg',
    light: 'https://svgl.app/library/deepseek.svg',
  },
  mistral: {
    dark: 'https://svgl.app/library/mistral-ai_logo.svg',
    light: 'https://svgl.app/library/mistral-ai_logo.svg',
  },
  gemini: {
    dark: 'https://svgl.app/library/gemini.svg',
    light: 'https://svgl.app/library/gemini.svg',
  },
  nvidia: {
    dark: 'https://svgl.app/library/nvidia-icon-dark.svg',
    light: 'https://svgl.app/library/nvidia-icon-light.svg',
  },
  triton: {
    dark: 'https://svgl.app/library/nvidia-icon-dark.svg',
    light: 'https://svgl.app/library/nvidia-icon-light.svg',
  },
  flashattention: {
    dark: 'https://svgl.app/library/nvidia-icon-dark.svg',
    light: 'https://svgl.app/library/nvidia-icon-light.svg',
  },
  docker: {
    dark: 'https://svgl.app/library/docker.svg',
    light: 'https://svgl.app/library/docker.svg',
  },
  qdrant: {
    dark: 'https://svgl.app/library/qdrant-icon-dark.svg',
    light: 'https://svgl.app/library/qdrant-icon-light.svg',
  },
  pgvector: {
    dark: 'https://svgl.app/library/postgresql.svg',
    light: 'https://svgl.app/library/postgresql.svg',
  },
  postgresql: {
    dark: 'https://svgl.app/library/postgresql.svg',
    light: 'https://svgl.app/library/postgresql.svg',
  },
  tensorflow: {
    dark: 'https://svgl.app/library/tensorflow-icon-dark.svg',
    light: 'https://svgl.app/library/tensorflow-icon-light.svg',
  },
  meta: {
    dark: 'https://svgl.app/library/meta.svg',
    light: 'https://svgl.app/library/meta.svg',
  },
};

function resolveLogoKey(rawToolName: string): string | null {
  const lower = rawToolName.toLowerCase();
  if (lower.includes('python')) return 'python';
  if (lower.includes('tiktoken') || lower.includes('openai')) return 'openai';
  if (lower.includes('claude')) return 'claude';
  if (lower.includes('anthropic') || lower.includes('mcp')) return 'anthropic';
  if (lower.includes('deepseek')) return 'deepseek';
  if (lower.includes('qdrant')) return 'qdrant';
  if (lower.includes('pgvector') || lower.includes('postgres')) return 'postgresql';
  if (lower.includes('docker')) return 'docker';
  if (lower.includes('triton') || lower.includes('flashattention') || lower.includes('nvidia'))
    return 'nvidia';
  if (lower.includes('tensorflow')) return 'tensorflow';
  if (lower.includes('gemini')) return 'gemini';
  if (lower.includes('mistral')) return 'mistral';
  return null;
}

export const EcosystemToolBadge: React.FC<{
  name: string;
  isLightMode?: boolean;
}> = ({ name, isLightMode = false }) => {
  const key = resolveLogoKey(name);
  const logoEntry = key ? TWENTYFIRST_LOGOS[key] : null;
  const lower = name.toLowerCase();

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--bg-canvas)] border border-[var(--border-grid)] font-mono text-[11px] text-[var(--text-primary)]">
      {logoEntry ? (
        <img
          src={isLightMode ? logoEntry.light : logoEntry.dark}
          alt={name}
          className="w-3.5 h-3.5 object-contain shrink-0"
          loading="lazy"
        />
      ) : lower.includes('pytorch') || lower.includes('torch') ? (
        /* Custom PyTorch Flame/Tensor Glyph */
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none">
          <path
            d="M8 1.5L11.5 5C13.2 6.7 13.2 9.6 11.5 11.3C9.8 13 6.2 13 4.5 11.3C2.8 9.6 2.8 6.7 4.5 5L8 1.5Z"
            stroke="#EE4C2C"
            strokeWidth="1.5"
          />
          <circle cx="9.8" cy="5.2" r="1.1" fill="#EE4C2C" />
        </svg>
      ) : lower.includes('huggingface') || lower.includes('diffusers') || lower.includes('trl') ? (
        /* Custom HuggingFace / Open-Weights Tensor Glyph */
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none">
          <rect x="2" y="2" width="12" height="12" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="5.8" cy="6.5" r="1" fill="#F59E0B" />
          <circle cx="10.2" cy="6.5" r="1" fill="#F59E0B" />
          <path d="M5 10.2C6.2 11.5 9.8 11.5 11 10.2" stroke="#F59E0B" strokeWidth="1.4" />
        </svg>
      ) : lower.includes('numpy') || lower.includes('scipy') || lower.includes('einops') ? (
        /* Custom Matrix Cube Glyph */
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none">
          <path
            d="M8 1.5L14 5V11L8 14.5L2 11V5L8 1.5Z"
            stroke="#06B6D4"
            strokeWidth="1.4"
          />
          <path d="M8 8V14.5M8 8L14 5M8 8L2 5" stroke="#06B6D4" strokeWidth="1.1" />
        </svg>
      ) : (
        /* Default Sharp Terminal Chip */
        <span className="w-2 h-2 bg-[var(--accent-primary)] inline-block shrink-0" />
      )}
      <span>{name}</span>
    </span>
  );
};

export const EcosystemLogoStrip: React.FC<{ isLightMode?: boolean }> = ({
  isLightMode = false,
}) => {
  const featuredStack = [
    'Python',
    'PyTorch',
    'NumPy & einops',
    'HuggingFace TRL',
    'DeepSeek MLA/GRPO',
    'Anthropic SAE/MCP',
    'OpenAI tiktoken',
    'NVIDIA FlashAttention',
    'Qdrant HNSW',
    'pgvector',
    'Docker Sandbox',
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2">
      <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider mr-1">
        STACK_&_MODELS_DECODED:
      </span>
      {featuredStack.map((item) => (
        <EcosystemToolBadge key={item} name={item} isLightMode={isLightMode} />
      ))}
    </div>
  );
};

export default WTFBrandLogo;
