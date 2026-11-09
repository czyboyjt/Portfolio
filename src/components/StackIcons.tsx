import React from 'react';
import { ICON_PATHS } from '../data/stackIconPaths';

// Tool name (lower-cased, punctuation removed) -> logo in ICON_PATHS. A tool with no entry is
// shown as a text chip instead, so adding one to a project never breaks the row.
const ALIASES: Record<string, string> = {
  airtable: 'airtable',
  blender: 'blender',
  css: 'css',
  docker: 'docker',
  expo: 'expo',
  figma: 'figma',
  firebase: 'firebase',
  framer: 'framer',
  framermotion: 'framer',
  motion: 'framer',
  github: 'github',
  html: 'html5',
  html5: 'html5',
  javascript: 'javascript',
  jira: 'jira',
  linear: 'linear',
  miro: 'miro',
  nextjs: 'nextdotjs',
  nodejs: 'nodedotjs',
  notion: 'notion',
  postgresql: 'postgresql',
  python: 'python',
  react: 'react',
  sketch: 'sketch',
  storybook: 'storybook',
  stripe: 'stripe',
  supabase: 'supabase',
  swift: 'swift',
  swiftui: 'swift',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
  threejs: 'threedotjs',
  typescript: 'typescript',
  vercel: 'vercel',
  vite: 'vite',
  webflow: 'webflow',
  webgl: 'webgl',
};

const normalise = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

export const StackIcons: React.FC<{ stack: string[]; className?: string }> = ({ stack, className = '' }) => (
  <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`} aria-label={`Stack: ${stack.join(', ')}`}>
    {stack.map((name) => {
      const path = ICON_PATHS[ALIASES[normalise(name)]];
      return path ? (
        <svg
          key={name}
          viewBox="0 0 24 24"
          role="img"
          aria-label={name}
          className="w-[22px] h-[22px] fill-current text-cream/70 hover:text-cream transition-colors duration-(--dur-press)"
        >
          <title>{name}</title>
          <path d={path} />
        </svg>
      ) : (
        <span
          key={name}
          className="px-2.5 py-0.5 rounded-full border border-white/25 text-[10px] font-mono tracking-wide text-cream/65"
        >
          {name}
        </span>
      );
    })}
  </div>
);
