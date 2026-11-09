import React from 'react';
import { motion, useMotionValue, useTransform, MotionValue } from 'motion/react';
import { Project } from '../types';
import { soundFx } from '../utils/audio';

// Fixed row height: the pinned showcase maps scroll distance onto whole rows
export const ROW_HEIGHT = 52;

interface ProjectListProps {
  projects: Project[];
  activeId: string | null;
  onHoverProject: (project: Project) => void;
  onLeaveProject: () => void;
  onSelectProject: (project: Project) => void;
  // Continuous position of the focus point, in rows (0 = first title). When given, the rows behave
  // like a rotating wheel: the one at the focus is full size, the rest tilt away, shrink, shift
  // left and fade with their distance from it. Omit for a plain static list.
  focusIndex?: MotionValue<number>;
}

// 'DESIGN STUDIO' -> 'Design Studio'
// Short words that stay in capitals (GMC, not Gmc)
const ACRONYMS = new Set(['GMC', 'AI', 'UI', 'UX', 'EV']);
// Names with their own capitalisation
const BRAND_NAMES: Record<string, string> = { SEERLIGHT: 'SeerLight' };
const formatTitle = (title: string) =>
  title
    .split(' ')
    .map((w) =>
      BRAND_NAMES[w.toUpperCase()] ?? (ACRONYMS.has(w.toUpperCase()) ? w.toUpperCase() : w.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()))
    )
    .join(' ');

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

interface RowProps {
  project: Project;
  index: number;
  isActive: boolean;
  focusIndex?: MotionValue<number>;
  onHoverProject: (project: Project) => void;
  onSelectProject: (project: Project) => void;
}

const Row: React.FC<RowProps> = ({ project, index, isActive, focusIndex, onHoverProject, onSelectProject }) => {
  const wheel = !!focusIndex;
  const idle = useMotionValue(0);

  // Signed distance of this row from the focus point, in rows (negative = above it). Everything
  // below derives from it using transform and opacity only, so scrolling never re-renders.
  const distance = useTransform(focusIndex ?? idle, (focus) => index - focus);
  const scale = useTransform(distance, (d) => (wheel ? 1 - 0.05 * Math.min(Math.abs(d), 3) : 1));
  const opacity = useTransform(distance, (d) => (wheel ? Math.max(0.42, 1 - 0.2 * Math.abs(d)) : 1));
  const x = useTransform(distance, (d) => (wheel ? -Math.min(d * d, 6) * 2 : 0));
  const rotateX = useTransform(distance, (d) => (wheel ? clamp(-d * 8, -36, 36) : 0));

  return (
    <button
      style={{ height: ROW_HEIGHT }}
      onMouseEnter={() => {
        if (!isActive) {
          soundFx.playTick();
        }
        onHoverProject(project);
      }}
      onFocus={() => onHoverProject(project)}
      onClick={() => {
        soundFx.playSelect();
        onSelectProject(project);
      }}
      className={`text-left group relative transition-transform duration-300 focus-visible:outline-none cursor-pointer block w-full ${
        isActive ? 'translate-x-1 sm:translate-x-2' : 'hover:translate-x-1'
      }`}
    >
      <motion.span
        style={{ scale, opacity, x, rotateX, transformPerspective: 500, transformOrigin: 'left center' }}
        className="flex items-center gap-3 h-full"
      >
        {/* thin line marking the active title */}
        <span
          className={`h-px transition-all duration-300 ${
            isActive ? 'w-4 sm:w-6 bg-cream/80' : 'w-0 bg-cream/40 group-hover:w-2'
          }`}
          aria-hidden="true"
        />

        <span
          className={`font-editorial-serif font-medium text-xl sm:text-2xl lg:text-[1.65rem] leading-tight transition-colors duration-(--dur-press) ${
            isActive
              ? 'text-cream'
              : `${wheel ? 'text-cream/70' : 'text-cream/45'} group-hover:text-cream/80`
          }`}
        >
          {formatTitle(project.title)}
        </span>

        {isActive && (
          <span className="text-[10px] font-mono text-cream/50 tracking-wider ml-1 hidden sm:inline-block">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </motion.span>
    </button>
  );
};

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  activeId,
  onHoverProject,
  onLeaveProject,
  onSelectProject,
  focusIndex,
}) => (
  <nav className="flex flex-col select-none" aria-label="Selected work" onMouseLeave={onLeaveProject}>
    {projects.map((project, index) => (
      <Row
        key={project.id}
        project={project}
        index={index}
        isActive={activeId === project.id}
        focusIndex={focusIndex}
        onHoverProject={onHoverProject}
        onSelectProject={onSelectProject}
      />
    ))}
  </nav>
);
