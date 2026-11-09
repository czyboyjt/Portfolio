import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import { Project, MouseMotion } from '../types';
import { ProjectList, ROW_HEIGHT } from './ProjectList';
import { MobileProjects } from './MobileProjects';
import { ActiveProjectStage } from './ActiveProjectStage';
import { ArchBackdrop } from './ArchBackdrop';
import { useStagePull, requestZoomOpen } from '../utils/stagePull';

export interface ShowcaseHandle {
  goTo: (index: number) => void;
  step: (delta: number) => void;
  isPinnedInView: () => boolean;
}

interface ProjectsShowcaseProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  projects: Project[];
  hoveredProject: Project | null;
  mouse: MouseMotion;
  onHoverProject: (project: Project) => void;
  onLeaveProject: () => void;
  onSelectProject: (project: Project) => void;
  onMouseEnterStage: () => void;
  onActiveChange?: (project: Project | null) => void;
}

// How much page scroll it takes to move from one project to the next
const SCROLL_PER_PROJECT_VH = 30;
// Scroll spent holding on the first project once the section pins, before the list starts to move
const START_DWELL_VH = 30;

const useIsDesktop = () => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return matches;
};

// The stage sits between a band at the top (for the role) and one at the bottom
const STAGE_TOP_BAND = 96;
const STAGE_BOTTOM_BAND = 28;

// Scales the stage to the window: down on short ones so it is never cut off, up on big screens
const useStageScale = () => {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      // Grows past 1 on big screens (limited by height and width), shrinks on short ones
      const byHeight = (window.innerHeight - STAGE_TOP_BAND - STAGE_BOTTOM_BAND) / 740;
      const byWidth = window.innerWidth / 1440;
      setScale(Math.min(1.4, Math.max(0.5, Math.min(byHeight, byWidth > 1 ? byWidth : 1))));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return scale;
};

const SectionLabel: React.FC = () => (
  <span className="text-caption sm:text-xs font-mono font-medium tracking-[0.2em] text-cream/50 uppercase">
    Selected work
  </span>
);

// The scrolling list. Its window runs from LIST_TOP to LIST_BOTTOM (% of the screen height), and
// the active row sits at LIST_FOCUS: high on the screen, just under the "Selected work" label, so
// the list starts near the top. Rows fade out as they scroll up into the label.
const LIST_TOP_PCT = 14;
const LIST_BOTTOM_PCT = 10;
const LIST_FOCUS_PCT = 22;
const LIST_FOCUS_IN_WINDOW_PCT = ((LIST_FOCUS_PCT - LIST_TOP_PCT) / (100 - LIST_TOP_PCT - LIST_BOTTOM_PCT)) * 100;

const fade = 'linear-gradient(to bottom, transparent, #000 8%, #000 80%, transparent)';



const EASE = [0.22, 1, 0.36, 1] as const;

// Corner detail for the active project, in a fixed place however the stage is arranged: the role,
// top-right. It fades in after the images and changes with the project.
// (The stage layouts keep the title clear of the top-right corner; see stageLayouts.ts.)
const cornerMotion = (delay: number) =>
  ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, transition: { duration: 0.12 } },
    transition: { duration: 0.6, ease: EASE, delay },
  }) as const;

const RoleTag: React.FC<{ project: Project | null }> = ({ project }) => {
  // Fades up and out while a case study is open, and back in when it closes
  const pulled = useStagePull();
  return (
  <AnimatePresence mode="wait">
    {project?.role && (
      <motion.div
        key={project.id}
        {...cornerMotion(0.35)}
        animate={pulled ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
        transition={pulled ? { duration: 0.45, ease: EASE } : { duration: 1.1, ease: EASE, delay: 0.7 }}
        className="absolute top-[4%] right-[4%] z-30 max-w-[320px] text-right pointer-events-none"
      >
        <span className="block text-[10px] font-mono tracking-[0.25em] uppercase text-cream/45">Role</span>
        <span className="block mt-1.5 font-editorial-serif font-medium text-[1.4rem] leading-tight text-cream">
          {project.role}
        </span>
      </motion.div>
    )}
  </AnimatePresence>
  );
};

// Projects section. On desktop the stage is pinned in the middle of the screen and page scroll
// only moves the list on the left; the project at the list's centre line is the active one.
// Hovering a title still takes over. Below the lg breakpoint it stays a simple stacked layout.
export const ProjectsShowcase = forwardRef<ShowcaseHandle, ProjectsShowcaseProps>(
  (
    {
      sectionRef,
      projects,
      hoveredProject,
      mouse,
      onHoverProject,
      onLeaveProject,
      onSelectProject,
      onMouseEnterStage,
      onActiveChange,
    },
    ref
  ) => {
    const isDesktop = useIsDesktop();
    const stageScale = useStageScale();
    const n = projects.length;

    const [scrollIndex, setScrollIndex] = useState(0);
    const lastScrollAt = useRef(0);

    const { scrollYProgress: rawProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    // The first stretch of scroll does nothing but hold the first project; the list moves after it
    const lead = START_DWELL_VH / (START_DWELL_VH + (n - 1) * SCROLL_PER_PROJECT_VH);
    const scrollYProgress = useTransform(rawProgress, [0, lead, 1], [0, 0, 1]);
    useMotionValueEvent(scrollYProgress, 'change', (v) => {
      lastScrollAt.current = Date.now();
      setScrollIndex(Math.round(Math.min(1, Math.max(0, v)) * (n - 1)));
    });
    const listY = useTransform(scrollYProgress, [0, 1], [0, -(n - 1) * ROW_HEIGHT]);
    // Where the focus point is, in rows (drives the wheel effect)
    const reduceMotion = !!useReducedMotion();
    const focusIndex = useTransform(scrollYProgress, [0, 1], [0, n - 1]);

    // The wheel is centred on whatever is on the stage. While hovering a title it glides to that
    // title (so the hovered row is the full-size, bright one); when the hover ends it glides back
    // to following the scroll.
    const hoverIndex = hoveredProject ? projects.findIndex((p) => p.id === hoveredProject.id) : -1;
    const hoverMix = useSpring(useMotionValue(0), { stiffness: 220, damping: 26 });
    const hoverPos = useSpring(useMotionValue(0), { stiffness: 220, damping: 26 });
    useEffect(() => {
      if (hoverIndex >= 0) {
        // Starting from rest: begin the glide from the current scroll position, not the last hover
        if (hoverMix.get() < 0.02) hoverPos.jump(focusIndex.get());
        hoverPos.set(hoverIndex);
        hoverMix.set(1);
      } else {
        hoverMix.set(0);
      }
    }, [hoverIndex, hoverPos, hoverMix, focusIndex]);
    const wheelFocus = useTransform(
      [focusIndex, hoverPos, hoverMix],
      ([scrolled, hovered, mix]: number[]) => scrolled + (hovered - scrolled) * mix
    );

    const [mobileActive, setMobileActive] = useState<Project | null>(null);
    const activeProject = isDesktop ? hoveredProject ?? projects[scrollIndex] : mobileActive;

    useEffect(() => {
      onActiveChange?.(activeProject);
    }, [activeProject, onActiveChange]);

    // Rows sliding under a still cursor fire hover events; ignore those while scrolling
    const handleHover = (project: Project) => {
      if (isDesktop && Date.now() - lastScrollAt.current < 250) return;
      onHoverProject(project);
    };

    useImperativeHandle(
      ref,
      () => {
        const goTo = (index: number) => {
          const el = sectionRef.current;
          if (!el || !isDesktop) return;
          const top = el.getBoundingClientRect().top + window.scrollY;
          const travel = el.offsetHeight - window.innerHeight;
          const clamped = Math.max(0, Math.min(n - 1, index));
          onLeaveProject();
          window.scrollTo({ top: top + (lead + (clamped / (n - 1)) * (1 - lead)) * travel, behavior: 'smooth' });
        };
        return {
          goTo,
          step: (delta) => {
            const current = activeProject ? projects.findIndex((p) => p.id === activeProject.id) : 0;
            goTo(current + delta);
          },
          isPinnedInView: () => {
            if (!isDesktop) return false;
            const r = sectionRef.current?.getBoundingClientRect();
            return !!r && r.top <= window.innerHeight * 0.3 && r.bottom >= window.innerHeight * 0.7;
          },
        };
      },
      [sectionRef, isDesktop, n, projects, activeProject, onLeaveProject]
    );

    return (
      <section
        ref={sectionRef}
        id="recent-works"
        style={isDesktop ? { height: `calc(100vh + ${START_DWELL_VH + (n - 1) * SCROLL_PER_PROJECT_VH}vh)` } : undefined}
        className="relative w-full border-t border-white/[0.05]"
      >
        <div className={`relative w-full ${isDesktop ? 'sticky top-0 h-screen overflow-hidden' : 'overflow-x-clip'}`}>
          {isDesktop ? (
            <ArchBackdrop project={activeProject} />
          ) : (
            /* on a phone the backdrop stays on screen while the deck scrolls, and follows the active card */
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="sticky top-0 h-screen overflow-hidden">
                <ArchBackdrop project={activeProject} />
                <AnimatePresence>
                  {activeProject && (
                    <motion.div
                      key={activeProject.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="absolute inset-0"
                      style={{ background: `radial-gradient(ellipse 90% 55% at 50% 38%, ${activeProject.world?.glow ?? activeProject.accentColor}2e, transparent 70%)` }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {isDesktop ? (
            <div className="absolute inset-0 z-20">
              {/* The stage never moves: pinned to the middle of the viewport */}
              <div
                className="absolute inset-x-0 flex items-center justify-center"
                style={{ top: STAGE_TOP_BAND, bottom: STAGE_BOTTOM_BAND }}
              >
                <div style={{ transform: `scale(${stageScale})` }} className="w-full">
                  <ActiveProjectStage
                    project={activeProject}
                    mouse={mouse}
                    onOpenCaseStudy={onSelectProject}
                    onMouseEnterStage={onMouseEnterStage}
                    onMouseLeaveStage={onLeaveProject}
                    order={activeProject ? projects.findIndex((p) => p.id === activeProject.id) : -1}
                  />
                </div>
              </div>

              <RoleTag project={activeProject} />

              {/* Fixed label and hint around the moving list */}
              <div className="pull-left absolute left-14 top-[10%] z-30">
                <SectionLabel />
              </div>
              <div className="pull-left absolute left-14 bottom-[6%] w-[280px] xl:w-[320px] pt-4 border-t border-white/10 text-caption font-mono text-neutral-400 z-30">
                <p className="flex items-center gap-1.5">
                  <span>Scroll to browse</span>
                  <span className="mx-1">·</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 text-[10px]">↵</kbd>
                  <span>view</span>
                </p>
              </div>

              {/* The list: the only thing scroll moves. Rows fade out toward the top and bottom */}
              <div
                className="pull-left absolute left-14 w-[280px] xl:w-[320px] z-30"
                style={{ top: `${LIST_TOP_PCT}%`, bottom: `${LIST_BOTTOM_PCT}%`, maskImage: fade, WebkitMaskImage: fade }}
              >
                <motion.div
                  style={{ y: listY, top: `calc(${LIST_FOCUS_IN_WINDOW_PCT}% - ${ROW_HEIGHT / 2}px)` }}
                  className="absolute left-0 right-0"
                >
                  <ProjectList
                    projects={projects}
                    activeId={activeProject?.id ?? null}
                    onHoverProject={handleHover}
                    onLeaveProject={onLeaveProject}
                    onSelectProject={(proj) => requestZoomOpen(proj, () => onSelectProject(proj))}
                    focusIndex={reduceMotion ? undefined : wheelFocus}
                  />
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="relative z-20 px-6 sm:px-10 py-16">
              <div className="mb-10">
                <SectionLabel />
              </div>
              <MobileProjects projects={projects} onOpenCaseStudy={onSelectProject} onActiveChange={setMobileActive} />
            </div>
          )}
        </div>
      </section>
    );
  }
);

ProjectsShowcase.displayName = 'ProjectsShowcase';
