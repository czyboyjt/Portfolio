import React from 'react';
import { motion } from 'motion/react';
import type { TokenStatus } from '../../data/designTokens';
import { EASE } from './motion';

// A label above a block of reading. The default is the page's small tracked caps; `serif` is the more prominent
// one, the name in italic serif with no line, so it is not mistaken for a chapter marker.
export const Label: React.FC<{ children: React.ReactNode; variant?: 'caps' | 'serif' }> = ({ children, variant = 'caps' }) =>
  variant === 'serif' ? (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className="mb-7 font-editorial-serif font-semibold text-[1.3rem] leading-none text-white/85 select-none"
    >
      {children}
    </motion.div>
  ) : (
    <div className="mb-6 font-mono text-caption uppercase tracking-[0.28em] text-white/62">{children}</div>
  );

// A token's CSS variable name, or any short technical name
export const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block justify-self-start w-fit font-mono text-caption tracking-[0.06em] text-cream/80 border border-white/15 rounded-frame px-1.5 py-[3px] leading-none">
    {children}
  </span>
);

const STATUS_STYLE: Record<TokenStatus, string> = {
  Core: 'text-cream/80 border-white/25',
  'Per project': 'text-cream/70 border-white/20',
  'One-off': 'text-cream/55 border-white/15',
  Experiment: 'text-cream/55 border-dashed border-white/25',
};

// How settled a token or component is
export const Status: React.FC<{ s: TokenStatus }> = ({ s }) => (
  <span className={`inline-block align-middle ml-1 text-[9px] tracking-[0.18em] uppercase border rounded-frame px-1.5 py-[3px] leading-none ${STATUS_STYLE[s]}`}>{s}</span>
);
