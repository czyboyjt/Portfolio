import React from 'react';
import { motion } from 'motion/react';
import { EASE } from './motion';

// Marks the start of a chapter: a short bright hairline that draws itself in as the chapter arrives,
// then the chapter's name in small serif italic. While the chapter is hovered the line grows longer and
// a light pulse travels along it (the same pulse as the "View case study" link).
export const ChapterMarker: React.FC<{ n: string; hot?: boolean; reduce?: boolean }> = ({ n, hot = false, reduce = false }) => (
  <div className="flex items-center gap-4 select-none">
    <motion.span
      aria-hidden="true"
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.9, ease: EASE }}
      style={{ originX: 0, width: hot ? 64 : 40 }}
      className="relative block h-px overflow-hidden bg-white/55 transition-[width] duration-(--dur-hover)"
    >
      <motion.span
        className="absolute top-0 left-0 block h-px w-6 bg-gradient-to-r from-transparent via-white to-transparent"
        initial={{ x: -24, opacity: 0 }}
        animate={hot && !reduce ? { x: [-24, 70], opacity: 1 } : { x: -24, opacity: 0 }}
        transition={
          hot && !reduce
            ? { x: { duration: 1.5, repeat: Infinity, repeatDelay: 1.2, ease: [0.45, 0, 0.25, 1] }, opacity: { duration: 0.2 } }
            : { duration: 0.2 }
        }
      />
    </motion.span>
    <motion.span
      initial={reduce ? false : { opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
      className="font-editorial-serif font-semibold text-[1.35rem] leading-none text-white/85"
    >
      {n}
    </motion.span>
  </div>
);
