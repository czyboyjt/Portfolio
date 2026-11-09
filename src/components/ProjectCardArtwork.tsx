import React from 'react';
import { Project } from '../types';

interface ProjectCardArtworkProps {
  project: Project;
  slot: 'left' | 'topRight' | 'bottomRight';
  className?: string;
  isHovered?: boolean;
  hideLabel?: boolean; // omit the corner caption (full-screen uses)
}

const SLOT_NUMBER = { left: '01', topRight: '02', bottomRight: '03' } as const;

// Dark framed card. Shows the project's real image when one is provided; until then it renders
// a neutral placeholder frame (diagonals, corner label) so the layout reads without colour.
export const ProjectCardArtwork: React.FC<ProjectCardArtworkProps> = ({
  project,
  slot,
  className = '',
  isHovered = false,
  hideLabel = false,
}) => {
  const cardData = project.images[slot];

  if (cardData.url) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#0d0d0f] ${className}`}>
        <img
          src={cardData.url}
          alt={cardData.alt}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          style={{ filter: isHovered ? 'brightness(1.06)' : undefined }}
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/15 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#0d0d0f] ${className}`}>
      {/* soft top-left light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none" />

      {/* placeholder diagonals */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.07)" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.07)" vectorEffect="non-scaling-stroke" />
      </svg>

      {!hideLabel && (
        <span className="absolute left-4 bottom-4 text-[10px] font-mono tracking-[0.22em] uppercase text-white/45">
          {SLOT_NUMBER[slot]} / {project.displayTitle}
        </span>
      )}

      <div className="absolute inset-0 ring-1 ring-inset ring-white/15 pointer-events-none" />
    </div>
  );
};
