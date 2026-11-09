import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';

interface ArchBackdropProps {
  project?: Project | null;
  mousePosition?: { x: number; y: number };
}

// Backdrop for the projects section: near-black, a classical vault outline and a few hairlines that
// echo the hero. A project with a backdrop image gets it faded in behind all of that.
export const ArchBackdrop: React.FC<ArchBackdropProps> = ({ project }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-base" />

      {/* The active project's own picture, darkened and softened, crossfading as the project changes.
          Projects without one keep the plain dark background. */}
      <AnimatePresence>
        {project?.backdropImage && (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeOut' } }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${project.backdropImage})`,
              filter: 'blur(3px) brightness(0.42) saturate(0.85)',
            }}
          />
        )}
      </AnimatePresence>

      {/* a wash of the project's colour over its picture, when the project asks for one */}
      <AnimatePresence>
        {project?.backdropImage && project.world?.tint ? (
          <motion.div
            key={`tint-${project.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: project.world.tint }}
            exit={{ opacity: 0, transition: { duration: 0.9 } }}
            transition={{ duration: 1.1 }}
            className="absolute inset-0"
            style={{ background: project.world.glow, mixBlendMode: 'color' }}
          />
        ) : null}
      </AnimatePresence>

      {/* faint cool-white light from above */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="vault-line" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* classical vault, drawn in hairline */}
        <path
          d="M 60,860 C 60,320 300,60 720,60 C 1140,60 1380,320 1380,860"
          stroke="url(#vault-line)"
          strokeWidth="1"
        />
        <path
          d="M 160,860 C 160,390 380,140 720,140 C 1060,140 1280,390 1280,860"
          stroke="url(#vault-line)"
          strokeWidth="1"
          strokeDasharray="3 7"
          strokeOpacity="0.6"
        />

        {/* hairline grid, matching the hero */}
        <line x1="0" y1="260" x2="1440" y2="260" stroke="rgba(255,255,255,0.06)" />
        <line x1="0" y1="780" x2="1440" y2="780" stroke="rgba(255,255,255,0.06)" />
        <line x1="380" y1="0" x2="380" y2="900" stroke="rgba(255,255,255,0.05)" />
        <line x1="1160" y1="0" x2="1160" y2="900" stroke="rgba(255,255,255,0.05)" />
      </svg>

      {/* vignette, for legibility of the list and titles */}
      <div className="absolute inset-0 bg-radial-[at_50%_45%] from-transparent via-base/60 to-[#050507]/95" />

      {/* soft blend from the hero above */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-base to-transparent" />
    </div>
  );
};
