import React from 'react';
import { motion, MotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';
import { Project } from '../types';
import { ProjectCardArtwork } from './ProjectCardArtwork';
import { ZoomGhost, ZoomState } from './ZoomGhost';
import { soundFx } from '../utils/audio';
import { setStagePull } from '../utils/stagePull';

const EASE = [0.22, 1, 0.36, 1] as const;

// Where card `i` pins from the top of the screen: the stack sits around the middle of the screen, and each
// card pins 10px lower than the one before so their top edges peek out
const pinTop = (vh: number, i: number) => Math.max(72, Math.round(vh * 0.5 - 235)) + i * 10;

interface MobileProjectsProps {
  projects: Project[];
  onOpenCaseStudy: (project: Project) => void;
  // told which project's card is on top of the stack, so the section's backdrop can follow it
  onActiveChange?: (project: Project | null) => void;
}

// Phone layout for the projects section: a deck of large cards that stack as you scroll. Each card pins near
// the top, and the next one slides over it while the one beneath shrinks and dims. The card on top is the
// active one: it brightens and plays its video, and the section's background follows it. Tapping a card
// presses it in, then opens the case study with the same zoom the desktop uses.
export const MobileProjects: React.FC<MobileProjectsProps> = ({ projects, onOpenCaseStudy, onActiveChange }) => {
  const reduce = !!useReducedMotion();
  const [zoom, setZoom] = React.useState<ZoomState | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [vh, setVh] = React.useState(() => (typeof window === 'undefined' ? 800 : window.innerHeight));
  React.useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // How fast the page is scrolling, smoothed by a spring, becomes a small lean on every card: a quick flick
  // tips them a few degrees, and they settle back as the scrolling slows
  const { scrollY } = useScroll();
  const speed = useSpring(useVelocity(scrollY), { stiffness: 90, damping: 22, mass: 0.6 });
  const lean = useTransform(speed, [-3000, 0, 3000], reduce ? [0, 0, 0] : [3.5, 0, -3.5]);

  // Scrolling settles on one project at a time: once the finger lifts and the scroll has come to rest inside the
  // deck, the page eases to the nearest card. It does nothing above the first card or below the last, so the
  // deck can always be left, and it never moves the page while a finger is down.
  const deck = React.useRef<HTMLDivElement>(null);
  const zoomingRef = React.useRef(false);
  zoomingRef.current = !!zoom;
  React.useEffect(() => {
    if (reduce) return;
    let timer = 0;
    let touching = false;
    let raf = 0;
    let animating = false;
    const stop = () => {
      window.cancelAnimationFrame(raf);
      animating = false;
    };
    // our own slow ease (the browser's smooth scroll is too quick and sharp): longer for longer distances
    const glide = (to: number) => {
      stop();
      const from = window.scrollY;
      const dist = to - from;
      const dur = Math.min(1100, 480 + Math.abs(dist) * 0.9);
      const t0 = performance.now();
      animating = true;
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = -(Math.cos(Math.PI * k) - 1) / 2; // easeInOutSine
        window.scrollTo(0, from + dist * e);
        if (k < 1 && animating) raf = window.requestAnimationFrame(step);
        else animating = false;
      };
      raf = window.requestAnimationFrame(step);
    };
    const targets = () => {
      return [...(deck.current?.children ?? [])]
        .filter((el): el is HTMLElement => el instanceof HTMLElement)
        .map((el, i) => Math.round(el.getBoundingClientRect().top + window.scrollY - pinTop(window.innerHeight, i)));
    };
    const settle = () => {
      if (touching || zoomingRef.current) return;
      const ts = targets();
      if (!ts.length) return;
      const y = window.scrollY;
      if (y < ts[0] - 80 || y > ts[ts.length - 1] + 20) return;
      const nearest = ts.reduce((best, t) => (Math.abs(t - y) < Math.abs(best - y) ? t : best), ts[0]);
      if (Math.abs(nearest - y) > 3) glide(nearest);
    };
    const schedule = () => {
      if (animating) return; // that is our own glide moving the page
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 180);
    };
    const down = () => {
      touching = true;
      stop();
      window.clearTimeout(timer);
    };
    // a wheel or trackpad scroll interrupts a glide and then settles again when it stops
    const onWheel = () => {
      stop();
      schedule();
    };
    const up = () => {
      touching = false;
      schedule();
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('touchend', up, { passive: true });
    window.addEventListener('touchcancel', up, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      stop();
      window.clearTimeout(timer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('touchstart', down);
      window.removeEventListener('touchend', up);
      window.removeEventListener('touchcancel', up);
    };
  }, [reduce]);

  const setActive = React.useCallback(
    (id: string) => {
      setActiveId(id);
      onActiveChange?.(projects.find((p) => p.id === id) ?? null);
    },
    [projects, onActiveChange]
  );

  const open = (project: Project, image: HTMLElement | null) => {
    soundFx.playOpen();
    const rect = image?.getBoundingClientRect();
    if (!rect || reduce || zoom) {
      onOpenCaseStudy(project);
      return;
    }
    setZoom({ project, rect, time: 0, at: performance.now() });
    setStagePull(true);
    window.setTimeout(() => onOpenCaseStudy(project), 680);
    window.setTimeout(() => setZoom(null), 1400);
  };

  return (
    <div ref={deck} className="flex flex-col">
      {projects.map((project, i) => (
        <MobileCard
          key={project.id}
          project={project}
          index={i}
          reduce={reduce}
          lean={lean}
          vh={vh}
          active={activeId === project.id}
          onActive={setActive}
          onOpen={open}
        />
      ))}
      {zoom && <ZoomGhost zoom={zoom} />}
    </div>
  );
};

const MobileCard: React.FC<{
  project: Project;
  index: number;
  reduce: boolean;
  lean: MotionValue<number>;
  vh: number;
  active: boolean;
  onActive: (id: string) => void;
  onOpen: (project: Project, image: HTMLElement | null) => void;
}> = ({ project, index, reduce, lean, vh, active, onActive, onOpen }) => {
  const top = pinTop(vh, index);
  const outer = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLDivElement>(null);

  // This card is the active one while a thin band at the middle of the screen passes through its slot
  React.useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && onActive(project.id)),
      { rootMargin: '-46% 0px -50% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [project.id, onActive]);

  // arriving: the picture drifts inside its frame and the text rises a beat later
  const { scrollYProgress: arrive } = useScroll({ target: outer, offset: ['start end', `start ${top}px`] });
  const imgY = useTransform(arrive, [0, 1], reduce ? ['0%', '0%'] : ['7%', '-3%']);
  const textY = useTransform(arrive, [0.35, 1], reduce ? [0, 0] : [26, 0]);
  const textOpacity = useTransform(arrive, [0.35, 0.85], reduce ? [1, 1] : [0, 1]);
  // being covered: once pinned, the card falls back in depth, tilting away at the bottom, drifting up and a
  // little to one side (alternating, so the cards pile up loosely) and darkening while the next one slides over
  const { scrollYProgress: cover } = useScroll({ target: outer, offset: [`start ${top}px`, `end ${top}px`] });
  const cc = useTransform(cover, [0.3, 1], [0, 1]); // 0 while on top, 1 once fully covered
  const aa = useTransform(arrive, [0, 1], [1, 0]); // 1 just as the card starts to arrive, 0 once it has landed
  const side = index % 2 ? 1 : -1;
  const rotateX = useTransform([aa, cc], ([a, c]: number[]) => (reduce ? 0 : a * 8 - c * 13));
  const rotateZ = useTransform(cc, (c) => (reduce ? 0 : c * 2.4 * side));
  const x = useTransform(cc, (c) => (reduce ? 0 : c * 10 * side));
  const y = useTransform(cc, (c) => (reduce ? 0 : -c * 18));
  const scale = useTransform(cc, (c) => (reduce ? 1 : 1 - c * 0.09));
  const dim = useTransform(cc, (c) => (reduce ? 0 : c * 0.6));
  // landing: the picture settles from a closer crop and the corners tighten
  const imgScale = useTransform(aa, (a) => (reduce ? 1 : 1 + a * 0.22));
  const radius = useTransform(aa, (a) => `${6 + (reduce ? 0 : a * 16)}px`);

  return (
    <div
      ref={outer}
      style={{ height: 'calc(430px + 30vh)', perspective: '900px' }}
      className="relative"
    >
      <motion.article
        style={{ scale, x, y, rotateX, rotateZ, skewY: lean, borderRadius: radius, top: `${top}px`, transformOrigin: '50% 0%' }}
        className="sticky border border-white/[0.09] bg-[#0a0a0c] p-3 pb-6 shadow-[0_-18px_50px_rgba(0,0,0,0.65)]"
      >
        <button
          onClick={() => onOpen(project, imageRef.current)}
          aria-label={`Open ${project.title} case study`}
          className="group block w-full text-left outline-none [-webkit-tap-highlight-color:transparent]"
        >
          {/* the hero image; this is what the zoom grows from, and what it shrinks back into */}
          <motion.div
            whileTap={reduce ? undefined : { scale: 0.965 }}
            transition={{ duration: 0.25, ease: EASE }}
            ref={imageRef}
            data-stage-hero={project.id}
            className="relative w-full aspect-[4/3] overflow-hidden rounded-sm shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
          >
            <motion.div className="absolute -inset-y-[8%] inset-x-0" style={{ y: imgY, scale: imgScale }}>
              <ProjectCardArtwork project={project} slot="topRight" />
              {project.heroVideo && active && !reduce && (
                <video
                  src={project.heroVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </motion.div>
            {/* grading, lifting a little while this is the active card */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none transition-opacity duration-700"
              style={{
                opacity: active ? 0.55 : 1,
                background:
                  'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(8,8,10,0.4) 100%), linear-gradient(to top, rgba(8,8,10,0.3), transparent 45%), rgba(10,14,24,0.12)',
              }}
            />
            {/* a quick sheen while the card is pressed */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-(--dur-press) group-active:opacity-100"
              style={{ background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.16) 50%, transparent 70%)' }}
            />
          </motion.div>

          <motion.div style={{ y: textY, opacity: textOpacity }} className="px-1">
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <h3 className="font-editorial-serif font-medium text-[2.6rem] leading-[0.95] tracking-[-0.02em] text-cream">
                {project.displayTitle}
              </h3>
              <span className="text-[10px] tracking-[0.25em] text-cream/40">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <p className="mt-3 text-sm tracking-wide text-cream/70">{project.discipline}</p>
            {project.role && <p className="mt-1 font-editorial-serif text-lg text-cream/55">{project.role}</p>}
          </motion.div>
        </button>

        {/* dims as the next card covers this one */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: dim, borderRadius: 'inherit' }}
          className="absolute inset-0 bg-base pointer-events-none"
        />
      </motion.article>
    </div>
  );
};
