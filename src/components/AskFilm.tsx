import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionValue, animate, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { PROJECTS } from '../data/projects';
import { Evidence, SKILLS } from '../data/skills';
import { Project } from '../types';
import { EASE, EASE_TRAVEL } from './ui';

// The film. Picking a skill dims the room and the evidence plays as a short film you control with the scroll wheel.
// The artifacts hang in depth and the camera glides through them, but it stops on each one so it is sharp and its
// subtitle can be read, then glides on to the next. It opens on a title card and ends on a list of the projects it featured.
//
// The room: the landing painting, very dark and soft, behind everything, and a scrubber along the bottom with a tick for
// every scene. A scene is first an empty outlined frame that draws itself as the camera nears; on arrival the reticle's
// corners close in and the picture pulls into focus.

const projectOf = (id: string) => PROJECTS.find((p) => p.id === id)!;
const accentOf = (p: Project) => p.world?.glow ?? p.accentColor;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (m: number) => m * m * (3 - 2 * m);
const SCROLL_PER_STEP_VH = 90; // how much scrolling one scene takes

// How the scenes are arranged. 'ring' hangs them on a ring in the middle of the painted room: scrolling turns the ring so the
// current one faces you. Each picture is built from layers at different depths, so they slide against each other as it
// turns (a little diorama). 'flythrough' is the
// earlier version, where the camera flew forward through pictures hung in a line. Change it here to compare the two.
const FILM_MODE: 'ring' | 'flythrough' = 'ring';
interface Ring {
  step: number; // degrees between neighbouring scenes
  radius: number; // px
}
const RING_WIDE: Ring = { step: 44, radius: 1050 };
const RING_NARROW: Ring = { step: 62, radius: 560 };

interface Props {
  skillId: string;
  items: Evidence[]; // the evidence for this skill, in the order it plays
  onSkill: (id: string) => void; // "watch another"
  onOpen: (p: Project) => void;
  scroller: React.RefObject<HTMLDivElement | null>; // the full-screen layer the film scrolls inside
  rewind: number; // changes when the film should start again from the top
}

export const AskFilm: React.FC<Props> = ({ skillId, items, onSkill, onOpen, scroller, rewind }) => {
  const def = SKILLS.find((s) => s.id === skillId)!;
  const scenes = items; // scene i is items[i - 1]; 0 is the title card, last is the credits
  const steps = scenes.length + 2;
  const box = useRef<HTMLDivElement>(null);

  // The entrance: the room lights up (the painting comes up out of black, the letterbox bars close in), then the title draws
  // itself as an outline, the reticle's corners close round it and it fills. Any click or key press skips to the end of it.
  const [fast, setFast] = useState(false);
  useEffect(() => {
    const skip = () => setFast(true);
    const arm = window.setTimeout(() => {
      window.addEventListener('pointerdown', skip, { once: true });
      window.addEventListener('keydown', skip, { once: true });
    }, 150);
    const done = window.setTimeout(skip, 3600);
    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(done);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, []);
  const T = (seconds: number) => (fast ? 0 : seconds); // a time in the entrance, or none once it is skipped
  const { scrollYProgress } = useScroll({ target: box, container: scroller, offset: ['start start', 'end end'] });

  // The camera position, in scenes. It holds on each whole number for the first part of the way to the next, then
  // glides across the rest, so every scene sits still and sharp for a while.
  const u = useTransform(scrollYProgress, (v) => clamp(v, 0, 1) * (steps - 1));
  const cam = useTransform(u, (uu) => {
    const f = Math.floor(uu);
    const frac = uu - f;
    return Math.min(steps - 1, f + smooth(clamp((frac - 0.55) / 0.45, 0, 1)));
  });
  // the painting turns with the ring, a little slower, and leans in with the camera
  const paintX = useTransform(cam, (c) => (FILM_MODE === 'ring' ? -c * 70 : -c * 26));
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < 640);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const [active, setActive] = useState(0);
  useMotionValueEvent(cam, 'change', (v) => setActive(Math.round(v)));

  // start again from the top when asked (for "watch another")
  useEffect(() => {
    if (rewind > 0) scroller.current?.scrollTo({ top: 0 });
  }, [rewind, scroller]);

  // click a tick on the scrubber to cut straight to that scene
  const jumpTo = (i: number) => {
    const el = box.current;
    const sc = scroller.current;
    if (!el || !sc) return;
    const total = el.offsetHeight - sc.clientHeight;
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
    sc.scrollTo({ top: top + (i / (steps - 1)) * total, behavior: 'smooth' });
  };

  const current = active >= 1 && active <= scenes.length ? scenes[active - 1] : null;
  const glow = current ? accentOf(projectOf(current.project)) : '#f4f3f0';

  return (
    <div ref={box} className="relative w-full" style={{ height: `${(steps - 1) * SCROLL_PER_STEP_VH + 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#050506]">
        {/* the painting from the landing page, very dark and soft, drifting a little as the camera moves */}
        <motion.img
          aria-hidden="true"
          src="/assets/hero.png"
          alt=""
          className="absolute -inset-[6%] h-[112%] w-[112%] max-w-none object-cover will-change-transform"
          style={{ x: paintX }}
          key={fast ? 'paint-fast' : 'paint'}
          initial={{ filter: 'blur(30px) brightness(0.015) saturate(0.9)' }}
          animate={{ filter: 'blur(16px) brightness(0.2) saturate(0.9)', transition: { duration: T(2.2), ease: [0.22, 1, 0.36, 1], delay: T(0.15) } }}
        />

        {/* the light of the current scene, in the project's colour */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          animate={{ background: `radial-gradient(ellipse 60% 55% at 50% 48%, ${glow}${current ? '26' : '10'}, transparent 70%)` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* the artifacts, hung in depth */}
        <div className="absolute inset-0" style={{ perspective: '1100px', perspectiveOrigin: '50% 42%' }}>
          <motion.div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {scenes.map((s, i) => (
              <Artifact key={s.project + s.text} e={s} index={i + 1} cam={cam} layer={scenes.length - i} focused={active === i + 1} ring={narrow ? RING_NARROW : RING_WIDE} narrow={narrow} />
            ))}
          </motion.div>
        </div>


        {/* title card */}
        <AnimatePresence>
          {active === 0 && (
            <motion.div
              key="title"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(8px)' }}
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center"
            >
              <motion.p
                key={fast ? 'l-fast' : 'l'}
                className="mb-6 text-caption uppercase tracking-[0.4em] text-cream/55"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: T(0.8), ease: EASE, delay: T(1.55) } }}
              >
                Selected moments
              </motion.p>

              {/* the title draws itself as an outline, the reticle's corners close round it, and it fills in */}
              <div className="relative inline-block px-4 py-2">
                <motion.div
                  key={fast ? 'bk-fast' : 'bk'}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  initial={{ scale: 1.55, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { duration: T(0.9), ease: EASE_TRAVEL, delay: T(0.85) } }}
                >
                  <span className="absolute left-0 top-0 block h-4 w-4 border-l-[1.5px] border-t-[1.5px] border-cream/90" />
                  <span className="absolute right-0 top-0 block h-4 w-4 border-r-[1.5px] border-t-[1.5px] border-cream/90" />
                  <span className="absolute bottom-0 left-0 block h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-cream/90" />
                  <span className="absolute bottom-0 right-0 block h-4 w-4 border-b-[1.5px] border-r-[1.5px] border-cream/90" />
                </motion.div>
                <motion.h3
                  key={fast ? 'h-fast' : 'h'}
                  className="font-editorial-serif italic font-medium text-[clamp(3.2rem,10vw,9rem)] leading-[0.95] tracking-[-0.02em]"
                  style={{ WebkitTextStroke: '1px var(--st)' }}
                  initial={{ clipPath: 'inset(-10% 100% -10% -6%)', color: 'rgba(244,243,240,0)', ['--st' as string]: 'rgba(244,243,240,0.95)' }}
                  animate={{
                    clipPath: 'inset(-10% -6% -10% -6%)',
                    color: 'rgba(244,243,240,1)',
                    ['--st' as string]: 'rgba(244,243,240,0)',
                    transition: {
                      clipPath: { duration: T(1), ease: EASE, delay: T(0.6) },
                      color: { duration: T(0.55), delay: T(1.5) },
                      '--st': { duration: T(0.55), delay: T(1.5) },
                    } as never,
                  }}
                >
                  {def.label}
                </motion.h3>
              </div>

              <motion.div
                key={fast ? 'x-fast' : 'x'}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: T(0.9), ease: EASE, delay: T(1.75) } }}
              >
                <p className="mt-6 max-w-[32rem] text-[1.1rem] leading-[1.6] text-cream/70">{def.line}</p>
                <p className="mt-3 text-[0.9rem] text-cream/50">{new Set(scenes.map((s) => s.project)).size} projects</p>
                <div className="mt-12 flex flex-col items-center gap-3 text-caption uppercase tracking-[0.3em] text-cream/55">
                  Scroll to play
                  <span className="relative block h-10 w-px overflow-hidden bg-cream/25">
                    <motion.span className="absolute left-0 top-0 block h-4 w-px bg-gradient-to-b from-transparent via-cream to-transparent" animate={{ y: [-16, 44] }} transition={{ duration: 1.8, repeat: Infinity, ease: [0.45, 0, 0.25, 1] }} />
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the subtitle for the scene on screen */}
        <div className="absolute inset-x-0 bottom-[calc(8vh+1.25rem)] z-20 flex justify-center px-6 pointer-events-none max-sm:bottom-[4.5rem]">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.project + current.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                className="max-w-[44rem] text-center"
              >
                <p className="font-editorial-serif italic font-semibold text-[1.35rem] leading-none" style={{ color: glow, textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>
                  {projectOf(current.project).displayTitle}
                </p>
                <p className="mt-3 text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.55] text-cream [text-shadow:0_2px_14px_rgba(0,0,0,0.95)]">{current.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* credits */}
        <AnimatePresence>
          {active === steps - 1 && (
            <motion.div
              key="credits"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
            >
              <p className="mb-8 text-caption uppercase tracking-[0.4em] text-cream/55">Featuring</p>
              <ul className="flex flex-col gap-3.5">
                {scenes.map((s, i) => {
                  const p = projectOf(s.project);
                  return (
                    <motion.li key={s.project + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.25 + i * 0.1 }}>
                      <button onClick={() => onOpen(p)} className="font-editorial-serif italic font-semibold text-[1.7rem] leading-none cursor-pointer" style={{ color: accentOf(p) }}>{p.displayTitle}</button>
                    </motion.li>
                  );
                })}
              </ul>
              <p className="mt-12 mb-4 text-caption uppercase tracking-[0.3em] text-cream/55">Watch another</p>
              <div className="flex max-w-[34rem] flex-wrap justify-center gap-2">
                {SKILLS.filter((s) => s.id !== skillId).map((s) => (
                  <button key={s.id} onClick={() => onSkill(s.id)} className="rounded-full border border-white/25 px-4 py-2 font-editorial-serif italic font-medium text-[1.05rem] leading-none text-cream/80 transition-colors hover:border-white/60 hover:text-cream cursor-pointer">{s.label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the room: grain and a vignette, the letterbox, and the little controls */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 48%, transparent 55%, rgba(0,0,0,0.65) 100%)' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none opacity-[0.07] mix-blend-overlay"
          style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }}
        />
        <motion.div key={fast ? 'bt-fast' : 'bt'} aria-hidden="true" className="absolute inset-x-0 top-0 z-40 h-[8vh] origin-top bg-black max-sm:h-10" initial={{ scaleY: 0 }} animate={{ scaleY: 1, transition: { duration: T(1), ease: EASE, delay: T(0.5) } }} />
        <motion.div key={fast ? 'bb-fast' : 'bb'} aria-hidden="true" className="absolute inset-x-0 bottom-0 z-40 h-[8vh] origin-bottom bg-black max-sm:h-10" initial={{ scaleY: 0 }} animate={{ scaleY: 1, transition: { duration: T(1), ease: EASE, delay: T(0.5) } }} />

        <div className="absolute inset-x-0 top-0 z-50 flex h-[8vh] items-center justify-between px-6 sm:px-10 lg:px-14 max-sm:h-10">
          <span className="text-caption uppercase tracking-[0.25em] text-cream/55">
            {active === 0 ? def.label : active === steps - 1 ? 'The end' : `Scene ${active} of ${scenes.length}`}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-50 flex h-[8vh] items-center px-6 sm:px-10 lg:px-14 max-sm:h-10">
          <span className="relative block h-px w-full bg-white/15">
            <motion.span aria-hidden="true" className="absolute inset-y-0 left-0 block w-full origin-left bg-cream/70" style={{ scaleX: scrollYProgress }} />
            {scenes.map((s, i) => (
              <button
                key={s.project + i}
                onClick={() => jumpTo(i + 1)}
                aria-label={`Go to scene ${i + 1}: ${projectOf(s.project).displayTitle}`}
                data-cursor="tick"
                data-cursor-label={projectOf(s.project).displayTitle}
                className="group absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${((i + 1) / (steps - 1)) * 100}%` }}
              >
                <span
                  className={`absolute left-1/2 top-1/2 block w-px -translate-x-1/2 -translate-y-1/2 bg-cream transition-[height,opacity] duration-300 ${
                    active === i + 1 ? 'h-4 opacity-100' : 'h-2.5 opacity-45 group-hover:h-4 group-hover:opacity-90'
                  }`}
                />
              </button>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
};

// One artifact, hanging in depth. Ahead of the camera it is a dim, soft picture in an outlined frame that draws itself as
// the camera nears. When the camera arrives the reticle's corners close in and the picture pulls into focus.
//
// It is built from layers at different depths (a shadow behind, the picture, the reticle's corners and the label in
// front), so when the ring turns they slide against each other: parallax, like a small paper theatre.
const Artifact: React.FC<{ e: Evidence; index: number; cam: MotionValue<number>; layer: number; focused: boolean; ring: Ring; narrow: boolean }> = ({ e, index, cam, layer, focused, ring, narrow }) => {
  const side = index % 2 ? 1 : -1;
  const d = (c: number) => index - c; // how far ahead of the camera this scene is
  const rad = (c: number) => ((d(c) * ring.step) * Math.PI) / 180;
  const ringMode = FILM_MODE === 'ring';

  // ring: each scene sits on a circle round the middle of the room and turns to face the camera
  const x = useTransform(cam, (c) => (ringMode ? Math.sin(rad(c)) * ring.radius : side * (d(c) >= 0 ? d(c) * 320 : d(c) * -240)));
  const y = useTransform(cam, (c) => (ringMode ? Math.min(2.2, Math.abs(d(c))) * 14 : d(c) * 26));
  const z = useTransform(cam, (c) => (ringMode ? (Math.cos(rad(c)) - 1) * ring.radius : d(c) >= 0 ? -d(c) * 560 : -d(c) * 760));
  const rotateY = useTransform(cam, (c) => (ringMode ? (-rad(c) * 180) / Math.PI : 0));
  const camOpacity = useTransform(cam, (c) => {
    const v = d(c);
    if (ringMode) {
      const a = Math.abs(v);
      return a <= 1 ? 1 - a * 0.42 : Math.max(0, 0.58 - (a - 1) * 0.5);
    }
    if (v >= 0) return v <= 1 ? 1 - v * 0.72 : Math.max(0, 0.28 - (v - 1) * 0.28);
    return Math.max(0, 1 + v * 2.4);
  });
  const camBlur = useTransform(cam, (c) => {
    const v = d(c);
    if (ringMode) return Math.min(8, Math.abs(v) * 4);
    return v >= 0 ? Math.min(9, v * 6) : Math.min(12, -v * 18);
  });
  const camBright = useTransform(cam, (c) => {
    const v = d(c);
    if (ringMode) return 1 - Math.min(0.6, Math.abs(v) * 0.3);
    return v >= 0 ? 1 - Math.min(0.55, v * 0.4) : 1;
  });
  // the outline draws as the camera comes near
  const drawn = useTransform(cam, (c) => clamp((ringMode ? 1.7 : 1) - Math.abs(d(c)), 0, 1));

  // how far into focus the picture is (0 to 1), eased when the camera arrives or leaves
  const focus = useMotionValue(focused ? 1 : 0);
  useEffect(() => {
    const a = animate(focus, focused ? 1 : 0, { duration: focused ? 1 : 0.5, ease: EASE });
    return () => a.stop();
  }, [focused, focus]);

  // The layers. They live in the same 3D space as the ring, so as it turns the ones nearer the camera slide further
  // than the ones behind, and a little sideways drift on top lets them lag and lead as you scroll.
  const imgOpacity = useTransform([camOpacity, focus], ([o, f]: number[]) => o * (ringMode ? 0.5 + 0.5 * f : f));
  const imgFilter = useTransform([camBlur, camBright, focus], ([bl, br, f]: number[]) => `blur(${bl + (1 - f) * 14}px) brightness(${br})`);
  const leafFilter = useTransform([camBlur, camBright], ([bl, br]: number[]) => `blur(${bl}px) brightness(${br})`);
  const shadowOpacity = useTransform(camOpacity, (o) => o * 0.8);
  const shadowDrift = useTransform(cam, (c) => (ringMode ? -d(c) * 22 : 0));
  const cornerDrift = useTransform(cam, (c) => (ringMode ? d(c) * 12 : 0));
  const labelDrift = useTransform(cam, (c) => (ringMode ? d(c) * 30 : 0));

  const corner = (pos: React.CSSProperties, border: React.CSSProperties) => (
    <span aria-hidden="true" className="absolute block" style={{ width: 16, height: 16, ...pos, ...border }} />
  );
  const line = '1.5px solid rgba(244,243,240,0.9)';
  const D = ringMode ? { shadow: -70, picture: 0, corners: 36, label: 78 } : { shadow: 0, picture: 0, corners: 0, label: 0 };

  return (
    <motion.figure
      style={{ x, y, z, rotateY, zIndex: layer, transformStyle: 'preserve-3d' }}
      className={`absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 will-change-transform ${narrow ? 'w-[82vw]' : 'w-[min(60vw,54rem)]'}`}
    >
      {/* in front: the picture's name sits above it, away from the project title in the subtitle below */}
      <motion.figcaption
        className="mb-3 text-center text-caption uppercase tracking-[0.25em] text-cream/55"
        style={{ z: D.label, x: labelDrift, opacity: camOpacity, filter: leafFilter }}
      >
        {e.artifact?.label}
      </motion.figcaption>

      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {/* behind: a soft shadow the picture floats in front of */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[3%] rounded-frame bg-black"
          style={{ z: D.shadow, x: shadowDrift, opacity: shadowOpacity, filter: 'blur(26px)' }}
        />

        {/* the skeleton of the frame: an outline that draws itself, always there under the picture */}
        <motion.svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: camOpacity, filter: leafFilter }}>
          <motion.rect x="0.3" y="0.3" width="99.4" height="99.4" fill="none" stroke="rgba(244,243,240,0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ pathLength: drawn }} />
        </motion.svg>

        {/* the picture itself: dim until the camera arrives, then it pulls into focus */}
        <motion.img
          src={e.artifact?.src}
          alt={e.artifact?.label ?? ''}
          style={{ z: D.picture, opacity: imgOpacity, filter: imgFilter }}
          className="block max-h-[42vh] w-full rounded-frame border border-white/15 bg-[#0b0b0d] object-contain max-sm:max-h-[34vh]"
        />

        {/* in front: the reticle's corners close in on the frame as it comes into focus */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[12px]"
          style={{ z: D.corners, x: cornerDrift, opacity: camOpacity, filter: leafFilter }}
        >
          <motion.div initial={false} animate={{ scale: focused ? 1 : 1.06, opacity: focused ? 1 : 0 }} transition={{ duration: 0.8, ease: EASE }} className="absolute inset-0">
            {corner({ top: 0, left: 0 }, { borderTop: line, borderLeft: line })}
            {corner({ top: 0, right: 0 }, { borderTop: line, borderRight: line })}
            {corner({ bottom: 0, left: 0 }, { borderBottom: line, borderLeft: line })}
            {corner({ bottom: 0, right: 0 }, { borderBottom: line, borderRight: line })}
          </motion.div>
        </motion.div>
      </div>
    </motion.figure>
  );
};
