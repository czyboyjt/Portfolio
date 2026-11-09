import React from 'react';
import { motion, AnimatePresence, useTransform, useReducedMotion, useMotionValue, useSpring, MotionValue } from 'motion/react';
import { Project, MouseMotion } from '../types';
import { ProjectCardArtwork } from './ProjectCardArtwork';
import { soundFx } from '../utils/audio';
import { ZoomGhost, ZoomState } from './ZoomGhost';
import { setStagePull, useStagePull, ZOOM_EASE, onZoomOpenRequest, heroVideoRegistry, captureFrame } from '../utils/stagePull';
import { LinkLabel, TextLink } from './ui';
import { Slot, CardFrame, resolveLayout, pickLayout } from './stageLayouts';

interface ActiveProjectStageProps {
  project: Project | null;
  mouse: MouseMotion;
  onOpenCaseStudy: (project: Project) => void;
  onMouseEnterStage?: () => void;
  onMouseLeaveStage?: () => void;
  // Position of the active project in the list; used to roll titles up or down with the direction
  order?: number;
}

// Entrances use only transform and opacity, so the browser can run them on the GPU.
const EASE = [0.22, 1, 0.36, 1] as const;

// The link's underline: a faint hairline with the thin light pulse from the home page's "View
// selected work" button travelling along it, left to right. It only runs while the link is hovered.
// How the stage images are graded to sit in the dark scene. Tune these together.
// - EDGE_DARKEN: how much the edges and bottom are darkened
// - COOL_TINT: the slight cool cast laid over the picture
// - DIM: overall brightness of the picture (1 = untouched)
const EDGE_DARKEN = 0.4;
const COOL_TINT = 0.12;
const DIM = 0.82;
// - glass frame: blur radius, white tint, and the brightness of the lit edge
const GLASS_BLUR = 14;
const GLASS_TINT = 0.05;
const EDGE_LIGHT = 0.5;

// A framed image that slides in from the side it sits on. The outer element carries the mouse
// parallax and the inner one the entrance, so the two never fight over the same transform.
// Desktop passes a `frame` (position/size from the chosen layout); mobile passes a className.
const StageCard: React.FC<{
  project: Project;
  slot: Slot;
  delay: number;
  reduce: boolean;
  frame?: CardFrame;
  className?: string;
  offset?: { x: MotionValue<number>; y: MotionValue<number> };
  cardRef?: React.Ref<HTMLDivElement>;
  onClick?: () => void;
  onHoverChange?: (hovered: boolean) => void;
  // While the case-study link is hovered: the hero steps forward, the others recede
  emphasis?: 'lead' | 'dim' | 'rest';
  isHero?: boolean;
  video?: string; // plays over the still inside the frame
  // True while a case study is open: the card flies out toward its own side and comes back after
  away?: boolean;
}> = ({ project, slot, delay, reduce, frame, className = '', offset, cardRef, onClick, onHoverChange, emphasis = 'rest', isHero, video, away = false }) => {
  const enter = { duration: 1.25, ease: EASE, delay: delay * 1.6 + 0.25 };
  const leave = { duration: 0.6, ease: ZOOM_EASE };
  const fade = away ? 0 : emphasis === 'dim' ? 0.5 : 1;

  // Layering note: the browser only blurs what is behind the glass if no ancestor has an opacity or
  // filter effect. So the outer card only scales, the mover only translates, and opacity and
  // brightness live on the picture and on the glass ring themselves.
  return (
    <motion.div
      ref={cardRef}
      data-stage-hero={isHero ? project.id : undefined}
      data-cursor={isHero ? 'open' : undefined}
      onClick={onClick}
      onMouseEnter={onHoverChange ? () => onHoverChange(true) : undefined}
      onMouseLeave={onHoverChange ? () => onHoverChange(false) : undefined}
      animate={{ scale: emphasis === 'lead' ? 1.09 : 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        ...(offset ? { x: offset.x, y: offset.y } : {}),
        ...(frame ? { left: frame.left, top: frame.top, width: frame.width, aspectRatio: frame.aspect } : {}),
      }}
      className={`${frame ? (isHero ? 'absolute z-[12]' : 'absolute z-10') : ''} ${className} select-none ${onClick ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
    >
      <motion.div
        initial={reduce ? false : { x: frame?.fromRight ? 80 : -80 }}
        animate={{ x: away ? (frame?.fromRight ? 220 : -220) : 0 }}
        transition={away ? leave : enter}
        className="relative w-full h-full"
      >
        {/* Glass frame: a thin frosted ring around the picture that blurs the backdrop, with a
            1px edge that is bright at the top-left and fades away toward the bottom-right */}
        <motion.div
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: fade }}
          transition={away ? leave : enter}
          className="absolute -inset-[9px] rounded-[7px] pointer-events-none"
          style={{
            backdropFilter: `blur(${GLASS_BLUR}px) saturate(1.15)`,
            WebkitBackdropFilter: `blur(${GLASS_BLUR}px) saturate(1.15)`,
            background: `rgba(255,255,255,${GLASS_TINT})`,
          }}
        >
          <span
            className="absolute inset-0 rounded-[7px]"
            style={{
              padding: 1,
              background: `linear-gradient(135deg, rgba(255,255,255,${EDGE_LIGHT}), rgba(255,255,255,0.05) 38%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.1))`,
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)',
            }}
          />
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{
            opacity: fade,
            filter: `brightness(${emphasis === 'lead' ? DIM * 1.12 : DIM}) saturate(0.92)`,
          }}
          transition={away ? leave : enter}
          className="relative w-full h-full rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        >
          <ProjectCardArtwork project={project} slot={slot} isHovered={emphasis === 'lead'} />
          {video && !reduce && (
            <video
              ref={(el) => {
                if (isHero) heroVideoRegistry.stage = el;
              }}
              src={video}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* tonal grade: darker toward the edges and bottom, with a slight cool tint, so every
              picture sits in the same dark scene */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(8,8,10,${EDGE_DARKEN}) 100%), linear-gradient(to top, rgba(8,8,10,0.3), transparent 45%), rgba(10,14,24,${COOL_TINT})`,
            }}
          />
        </motion.div>

        {/* Light that travels once around the hero's glass frame while it is hovered */}
        {isHero && !reduce && (
          <svg
            aria-hidden="true"
            className="absolute -inset-[9px] pointer-events-none overflow-visible"
            style={{ width: 'calc(100% + 18px)', height: 'calc(100% + 18px)' }}
          >
            <motion.rect
              x={0.5}
              y={0.5}
              rx={7}
              pathLength={1}
              fill="none"
              stroke="#f4f3f0"
              strokeWidth={1}
              strokeLinecap="round"
              strokeDasharray="0.07 0.93"
              style={{ width: 'calc(100% - 1px)', height: 'calc(100% - 1px)', filter: 'drop-shadow(0 0 3px rgba(244,243,240,0.35))' }}
              initial={{ opacity: 0, strokeDashoffset: 0 }}
              animate={
                emphasis === 'lead'
                  ? { opacity: 0.4, strokeDashoffset: [0, -1] }
                  : { opacity: 0, strokeDashoffset: 0 }
              }
              transition={
                emphasis === 'lead'
                  ? {
                      // one slow lap, then a long rest before the next
                      strokeDashoffset: { duration: 3, delay: 0.8, repeat: Infinity, repeatDelay: 5, ease: [0.4, 0, 0.6, 1] },
                      opacity: { duration: 0.6 },
                    }
                  : { duration: 0.3 }
              }
            />
          </svg>
        )}
      </motion.div>
    </motion.div>
  );
};

export const ActiveProjectStage: React.FC<ActiveProjectStageProps> = ({
  project,
  mouse,
  onOpenCaseStudy,
  onMouseEnterStage,
  onMouseLeaveStage,
  order = -1,
}) => {
  const reduce = !!useReducedMotion();
  const pulled = useStagePull();

  // Which way the title rolls: up when moving forward through the list, down when moving back
  const [dirState, setDirState] = React.useState({ order, dir: 1 });
  if (order >= 0 && order !== dirState.order) {
    setDirState({ order, dir: dirState.order >= 0 && order < dirState.order ? -1 : 1 });
  }
  const dir = dirState.dir;

  // Opening a case study from the stage: the landscape hero image grows from where it sits to fill
  // the screen, then the case study fades in beneath it and the grown image fades away.
  const heroRef = React.useRef<HTMLDivElement>(null);
  // True while the pointer is over the title block or the hero image (both open the case study)
  const [armed, setArmed] = React.useState(false);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);
  const linkRef = React.useRef<HTMLSpanElement>(null);
  // Measured when the pointer enters: a hairline from the link to the hero image, and which way
  // the title leans (toward the hero). Coordinates are in the canvas's own (unscaled) pixels.
  const [hoverGeo, setHoverGeo] = React.useState<{
    line: { x1: number; y1: number; x2: number; y2: number } | null;
    lean: { x: number; y: number };
  }>({ line: null, lean: { x: 0, y: 0 } });

  const arm = () => {
    setArmed(true);
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const link = linkRef.current;
    const title = titleRef.current;
    if (!canvas || !hero || !link || !title) return;
    const c = canvas.getBoundingClientRect();
    const s = c.width / canvas.offsetWidth || 1;
    const rel = (r: DOMRect) => ({ l: (r.left - c.left) / s, t: (r.top - c.top) / s, r: (r.right - c.left) / s, b: (r.bottom - c.top) / s });
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    // the hero is about to grow by 9% about its centre, so aim for its enlarged edge
    const H0 = rel(hero.getBoundingClientRect());
    const hw = ((H0.r - H0.l) * 1.09) / 2;
    const hh = ((H0.b - H0.t) * 1.09) / 2;
    const hcx = (H0.l + H0.r) / 2;
    const hcy = (H0.t + H0.b) / 2;
    const H = { l: hcx - hw, r: hcx + hw, t: hcy - hh, b: hcy + hh };
    const L = rel(link.getBoundingClientRect());
    const T = rel(title.getBoundingClientRect());
    const lc = { x: (L.l + L.r) / 2, y: (L.t + L.b) / 2 };
    // nearest point on the hero to the link, then the nearest point on the link to that
    const end0 = { x: clamp(lc.x, H.l, H.r), y: clamp(lc.y, H.t, H.b) };
    const start = { x: clamp(end0.x, L.l, L.r), y: clamp(end0.y, L.t, L.b) };
    const end = { x: clamp(start.x, H.l, H.r), y: clamp(start.y, H.t, H.b) };
    const len = Math.hypot(end.x - start.x, end.y - start.y);
    const tc = { x: (T.l + T.r) / 2, y: (T.t + T.b) / 2 };
    const hc = { x: (H.l + H.r) / 2, y: (H.t + H.b) / 2 };
    const d = Math.hypot(hc.x - tc.x, hc.y - tc.y);
    setHoverGeo({
      line: len > 28 ? { x1: start.x, y1: start.y, x2: end.x, y2: end.y } : null,
      lean: d > 40 ? { x: ((hc.x - tc.x) / d) * 10, y: ((hc.y - tc.y) / d) * 10 } : { x: 0, y: 0 },
    });
  };
  const disarm = () => setArmed(false);

  // Magnetic pull: the link drifts slightly toward the pointer while it is near it
  const pullX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const pullY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const handleTitleMove = (e: React.MouseEvent) => {
    const link = linkRef.current;
    if (!link || reduce) return;
    const r = link.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const near = Math.hypot(dx, dy) < 160;
    pullX.set(near ? Math.max(-6, Math.min(6, dx * 0.1)) : 0);
    pullY.set(near ? Math.max(-4, Math.min(4, dy * 0.1)) : 0);
  };
  const releasePull = () => {
    pullX.set(0);
    pullY.set(0);
  };

  // 3D tilt of the title block toward the pointer
  const tiltX = useSpring(useMotionValue(0), { stiffness: 160, damping: 20 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 160, damping: 20 });
  const handleTilt = (e: React.MouseEvent) => {
    const el = titleRef.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    tiltY.set(nx * 2.5);
    tiltX.set(-ny * 1.8);
  };
  const releaseTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };
  const [zoom, setZoom] = React.useState<ZoomState | null>(null);
  const openWithZoom = (target: Project) => {
    soundFx.playOpen();
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect || reduce || zoom) {
      onOpenCaseStudy(target);
      return;
    }
    const frame = captureFrame(heroVideoRegistry.stage);
    heroVideoRegistry.frame = frame;
    setZoom({ project: target, rect, time: heroVideoRegistry.stage?.currentTime ?? 0, at: performance.now(), frame });
    setStagePull(true);
    window.setTimeout(() => onOpenCaseStudy(target), 680);
    window.setTimeout(() => setZoom(null), 1400);
  };

  // The project list and the Enter key ask for the same zoom. The stage runs it when it is showing
  // that project with its hero on screen; otherwise the caller opens the case study directly.
  const openRef = React.useRef(openWithZoom);
  openRef.current = openWithZoom;
  const shownId = project?.id ?? null;
  React.useEffect(
    () =>
      onZoomOpenRequest<Project>((requested) => {
        if (requested.id !== shownId || !heroRef.current) return false;
        const r = heroRef.current.getBoundingClientRect();
        if (r.width < 40 || r.right < 0 || r.left > window.innerWidth) return false;
        openRef.current(requested);
        return true;
      }),
    [shownId]
  );

  // A fresh random arrangement every time a project becomes active (hover, scroll or key). Set
  // during render, so the new project's first frame already uses it; the outgoing project keeps
  // the arrangement it had while it fades out.
  const [picked, setPicked] = React.useState<{ id: string | null; layout: number }>(() => ({
    id: null,
    layout: pickLayout(null),
  }));
  const currentId = project?.id ?? null;
  if (currentId !== picked.id) {
    setPicked({ id: currentId, layout: currentId ? pickLayout(picked.layout) : picked.layout });
  }
  const layout = React.useMemo(() => resolveLayout(picked.layout), [picked.layout]);

  // Length of the longest word in the title, used to shrink long names (see the h1)
  const titleLongestWord = project
    ? Math.max(1, ...project.displayTitle.split(' ').map((w) => w.length))
    : 1;

  // Parallax offsets derived straight from the normalised mouse position (0 to 1), as motion
  // values, so moving the mouse never re-renders this component
  const useAround = (mv: MotionValue<number>, k: number) => useTransform(mv, (v) => (v - 0.5) * k);

  const leftCardParallax = { x: useAround(mouse.x, -18), y: useAround(mouse.y, -14) };
  const topRightCardParallax = { x: useAround(mouse.x, 22), y: useAround(mouse.y, 16) };
  const bottomRightCardParallax = { x: useAround(mouse.x, 14), y: useAround(mouse.y, 24) };
  const titleParallax = { x: useAround(mouse.x, 8), y: useAround(mouse.y, 6) };

  // Text simply fades in once the images are on their way
  const textFade = {
    initial: reduce ? false : { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, ease: EASE, delay: 0.3 },
  } as const;

  return (
    <div
      onMouseEnter={onMouseEnterStage}
      onMouseLeave={onMouseLeaveStage}
      className="stage-pullable relative w-full h-full min-h-[580px] lg:min-h-[700px] flex items-center justify-center select-none overflow-hidden"
    >
      {/* "wait": the outgoing project fades fully before the next one animates in */}
      <AnimatePresence mode="wait" custom={dir}>
        {project ? (
          <motion.div
            key={project.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.14, delay: 0.06 } }}
            transition={{ duration: 0.1 }}
            className="relative w-full h-full max-w-[1440px] mx-auto px-4 sm:px-8"
          >
            {/* ----------------------------- DESKTOP ----------------------------- */}
            <div className="hidden lg:block relative w-full h-[650px] xl:h-[720px]">
              {/* Canvas: the area right of the project list, in which the chosen layout is placed */}
              <div ref={canvasRef} className="absolute top-[2%] bottom-[2%] left-[21%] right-[1%] max-w-[1200px] mx-auto">
                <StageCard
                  project={project}
                  slot="left"
                  delay={0}
                  reduce={reduce}
                  frame={layout.cards.left}
                  emphasis={armed ? 'dim' : 'rest'}
                  away={pulled}
                  offset={leftCardParallax}
                />
                <StageCard
                  project={project}
                  slot="topRight"
                  delay={0.08}
                  reduce={reduce}
                  frame={layout.cards.topRight}
                  offset={topRightCardParallax}
                  cardRef={heroRef}
                  isHero
                  video={project.heroVideo}
                  onClick={() => openWithZoom(project)}
                  onHoverChange={(h) => (h ? arm() : disarm())}
                  emphasis={armed ? 'lead' : 'rest'}
                />
                <StageCard
                  project={project}
                  slot="bottomRight"
                  delay={0.16}
                  reduce={reduce}
                  frame={layout.cards.bottomRight}
                  emphasis={armed ? 'dim' : 'rest'}
                  away={pulled}
                  offset={bottomRightCardParallax}
                />

                {/* Hairline from the link to the hero image, drawn while hovering */}
                <svg aria-hidden="true" className="absolute inset-0 w-full h-full z-[15] pointer-events-none overflow-visible">
                  {hoverGeo.line && (
                    <motion.line
                      x1={hoverGeo.line.x1}
                      y1={hoverGeo.line.y1}
                      x2={hoverGeo.line.x2}
                      y2={hoverGeo.line.y2}
                      stroke="rgba(244,243,240,0.55)"
                      strokeWidth={1}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={armed ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  )}
                </svg>

                {/* Title, with its details stacked below so nothing runs over the card edges */}
                <motion.div
                  style={{ x: titleParallax.x, y: titleParallax.y, left: layout.text.left, top: layout.text.top }}
                  className="absolute z-20 pointer-events-auto cursor-pointer"
                  onClick={() => openWithZoom(project)}
                  onMouseEnter={arm}
                  onMouseMove={(e) => {
                    handleTitleMove(e);
                    handleTilt(e);
                  }}
                  onMouseLeave={() => {
                    disarm();
                    releasePull();
                    releaseTilt();
                  }}
                >
                  {/* leans a few pixels toward the hero image while hovered */}
                  <motion.div
                    ref={titleRef}
                    style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
                    animate={
                      pulled
                        ? { x: 0, y: 24, opacity: 0 }
                        : armed && !reduce
                          ? { x: hoverGeo.lean.x, y: hoverGeo.lean.y, opacity: 1 }
                          : { x: 0, y: 0, opacity: 1 }
                    }
                    transition={pulled ? { duration: 0.45, ease: ZOOM_EASE } : { duration: 1.1, ease: EASE, delay: armed ? 0 : 0.5 }}
                  >
                  <div className="relative">
                    {/* Soft dark scrim so the title stays readable when it sits over the hero image */}
                    <motion.div
                      {...textFade}
                      aria-hidden="true"
                      className="absolute -inset-x-10 -inset-y-8 -z-10 pointer-events-none"
                      style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))' }}
                    />
                    {/* Long names get a smaller size and wrap, so they stay clear of the cards */}
                    {/* The title rolls in from below (or above, going back) and out the other way, like a
                        slot-machine reel; the clip keeps it hidden outside its own line */}
                    <div className="overflow-hidden pt-[0.15em] pb-[0.35em] -mt-[0.15em] -mb-[0.35em]">
                      <motion.h1
                        custom={dir}
                        variants={{
                          enter: (d: number) => ({ y: reduce ? 0 : d > 0 ? '105%' : '-105%', opacity: reduce ? 0 : 1 }),
                          center: { y: 0, opacity: 1 },
                          leave: (d: number) => ({
                            y: reduce ? 0 : d > 0 ? '-105%' : '105%',
                            opacity: reduce ? 0 : 1,
                            transition: { duration: 0.22, ease: [0.5, 0, 0.75, 0], delay: 0 },
                          }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="leave"
                        transition={{ duration: 0.75, ease: EASE, delay: 0.12 }}
                        style={{ fontSize: `calc(${Math.min(1, 6.2 / titleLongestWord) * (project.displayTitle.includes(' ') ? 0.78 : 1)} * var(--title-size))` }}
                        className="[--title-size:6rem] xl:[--title-size:9.5rem] max-w-[380px] xl:max-w-[400px] font-editorial-serif font-medium leading-[0.95] tracking-[-0.02em] text-cream [text-shadow:0_6px_26px_rgba(0,0,0,0.65)]"
                      >
                        {project.displayTitle}
                      </motion.h1>
                    </div>

                    <motion.div {...textFade} className="mt-4 flex flex-col gap-2 text-base font-mono tracking-wider text-cream/80">
                      <span>{project.discipline}</span>
                      <span>{project.client}</span>
                      <motion.span
                        ref={linkRef}
                        // the cursor's reticle frames the link like any other thing you can click
                        data-cursor="open"
                        style={{ x: pullX, y: pullY }}
                        className="mt-3 inline-flex items-center gap-2 text-cream self-start"
                      >
                        <LinkLabel active={armed} reduce={reduce} arrowSize="w-5 h-5">View case study</LinkLabel>
                      </motion.span>
                    </motion.div>
                  </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* ------------------------- TABLET / MOBILE ------------------------- */}
            <div className="block lg:hidden w-full py-8">
              <motion.div {...textFade} className="text-center mb-6">
                <h1
                  onClick={() => {
                    soundFx.playOpen();
                    onOpenCaseStudy(project);
                  }}
                  className="font-editorial-serif text-5xl sm:text-7xl text-cream font-medium tracking-[-0.02em] cursor-pointer"
                >
                  {project.displayTitle}
                </h1>
                <p className="text-xs font-mono text-cream/55 mt-2">
                  {project.discipline} · {project.client}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 max-w-2xl mx-auto">
                <StageCard
                  project={project}
                  slot="left"
                  delay={0}
                  reduce={reduce}
                  className="relative sm:col-span-5 aspect-[3/4]"
                />
                <div className="sm:col-span-7 flex flex-col gap-4">
                  <StageCard
                    project={project}
                    slot="topRight"
                    delay={0.08}
                    reduce={reduce}
                    className="relative aspect-[16/10]"
                  />
                  <StageCard
                    project={project}
                    slot="bottomRight"
                    delay={0.16}
                    reduce={reduce}
                    className="relative aspect-[16/9] sm:aspect-[4/5]"
                  />
                </div>
              </div>

              <div className="mt-6 text-center">
                <TextLink
                  tone="mono"
                  onClick={() => {
                    soundFx.playOpen();
                    onOpenCaseStudy(project);
                  }}
                >
                  View case study
                </TextLink>
              </div>
            </div>
          </motion.div>
        ) : (
          /* IDLE STATE: before or between hover states */
          <motion.div
            key="idle-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.14 } }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative flex flex-col items-center justify-center text-center p-8 select-none"
          >
            {/* Focal reticle in hairlines */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border border-white/[0.1] animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-6 rounded-full border border-dashed border-white/[0.08] animate-[spin_40s_linear_infinite_reverse]" />
              <div className="absolute inset-16 rounded-full border border-white/[0.12]" />

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-white/25" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-3 bg-white/25" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-3 bg-white/25" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-3 bg-white/25" />

              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>

            <div className="space-y-3 max-w-md">
              <span className="text-caption font-mono tracking-[0.25em] text-cream/50 uppercase block">
                [ Hover to explore ]
              </span>
              <h2 className="font-editorial-serif text-3xl sm:text-4xl text-cream/80 font-medium">
                Select a work to reveal
              </h2>
              <p className="text-xs font-mono text-cream/40">
                Move over any title on the left
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {zoom && <ZoomGhost zoom={zoom} />}
    </div>
  );
};
