import React from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { soundFx } from '../utils/audio';
import { MouseMotion } from '../types';
import { useIntroLifted } from '../utils/introState';

// Faint technical hairlines laid over the painting. Every so often a short streak of light
// travels along one of them. Pure transform animation, so it is cheap on phones.
export interface StreakLine {
  axis: 'h' | 'v';
  pos: string; // position across the hero
  delay: number; // seconds before the first streak
  duration: number; // seconds a streak takes to cross
  pause: number; // seconds of rest between streaks
  reverse?: boolean;
}

// The paintings the landing hero cycles through, in order. Add more here (put the files in /public/assets) and they
// crossfade one into the next; with a single entry nothing cycles.
const HERO_IMAGES: { src: string; alt: string }[] = [
  { src: '/assets/hero.webp', alt: 'A painted classical hall open to a sunlit cloudscape, with a man working at a laptop' },
];
// How long each painting stays, and how long the crossfade between two takes
const HERO_HOLD_MS = 8000;
const HERO_FADE_S = 2;

export const STREAK_LINES: StreakLine[] = [
  { axis: 'h', pos: '19%', delay: 1.5, duration: 2.6, pause: 6.5 },
  { axis: 'h', pos: '77%', delay: 5.0, duration: 2.8, pause: 7.0 },
  { axis: 'v', pos: '20%', delay: 3.2, duration: 2.6, pause: 7.5, reverse: true },
  { axis: 'v', pos: '88%', delay: 7.0, duration: 3.2, pause: 8.0 },
];

const HairlineStreak: React.FC<{ line: StreakLine; animate: boolean }> = ({ line, animate }) => {
  const horizontal = line.axis === 'h';
  const fade = horizontal
    ? 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)'
    : 'linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)';

  // Streak head is the brighter end, so it reads as moving in its direction of travel
  const head = horizontal
    ? line.reverse ? 'to left' : 'to right'
    : line.reverse ? 'to top' : 'to bottom';
  const gradient = `linear-gradient(${head}, transparent, rgba(255,255,255,0.55) 65%, rgba(255,255,255,0.95))`;

  const from = line.reverse ? '625%' : '-100%';
  const to = line.reverse ? '-100%' : '625%';
  const travel = horizontal ? { x: [from, to] } : { y: [from, to] };

  return (
    <div
      aria-hidden="true"
      className={`absolute overflow-hidden ${
        horizontal ? 'left-0 right-0 h-3 -mt-1.5' : 'top-0 bottom-0 w-3 -ml-1.5'
      }`}
      style={{
        ...(horizontal ? { top: line.pos } : { left: line.pos }),
        maskImage: fade,
        WebkitMaskImage: fade,
      }}
    >
      {/* the line itself */}
      <div
        className={`absolute bg-white/[0.3] ${
          horizontal ? 'left-0 right-0 top-1/2 h-px' : 'top-0 bottom-0 left-1/2 w-px'
        }`}
        // Faint dark edge keeps the line readable over the bright parts of the painting
        style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.45))' }}
      />
      {/* the streak */}
      {animate && (
        <motion.div
          className={`absolute ${horizontal ? 'left-0 top-1/2 h-px w-[16%]' : 'top-0 left-1/2 w-px h-[16%]'}`}
          style={{ background: gradient, filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.55))' }}
          initial={horizontal ? { x: from } : { y: from }}
          animate={travel}
          transition={{
            duration: line.duration,
            delay: line.delay,
            repeat: Infinity,
            repeatDelay: line.pause,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      )}
    </div>
  );
};

interface HieiHeroProps {
  onViewWork: () => void;
  onOpenDesignSystem?: (frame: DOMRect) => void;
  mouse: MouseMotion;
}

// The name. On a device with a pointer, hovering it turns the whole name into its skeleton: outlined letters with
// the type's guide lines (ascender, cap height, x-height, baseline and descender), like a type specimen or a
// work in progress. Everywhere else the name is solid.
export const NAME_CLASS =
  'font-editorial-serif font-medium tracking-[-0.02em] leading-[0.86] pb-[0.1em] text-[clamp(2.6rem,14.5vw,4rem)] max-sm:whitespace-nowrap sm:text-[6rem] md:text-[8rem] lg:text-[9.5rem] xl:text-[11rem] select-none';
// guide lines, as a fraction of one line of the name's height (the line box is 0.86em tall)
export const GUIDES: { at: number; label: string }[] = [
  { at: 0.06, label: 'asc' },
  { at: 0.17, label: 'cap' },
  { at: 0.47, label: 'x' },
  { at: 0.7, label: 'base' },
  { at: 0.9, label: 'desc' },
];

const NameTitle: React.FC<{ enabled: boolean; onOpen?: (frame: DOMRect) => void }> = ({ enabled, onOpen }) => {
  const box = React.useRef<HTMLDivElement>(null);
  const [hot, setHot] = React.useState(false);
  // after the page is opened from the name, it stays solid until the pointer actually moves again (the pointer is
  // still sitting on the name when the page closes, and that alone should not turn it back into the skeleton)
  const holdAt = React.useRef<{ x: number; y: number } | null>(null);

  const lines = (
    <>
      <span className="block max-sm:inline">Jonte</span>{' '}
      <span className="block max-sm:inline">Taffe</span>
    </>
  );

  return (
    <div
      ref={box}
      className="relative"
      // the cursor frames the name like any other thing you can click, with its own word
      data-cursor={enabled ? 'name' : undefined}
      data-cursor-label="design system"
      role={enabled ? 'button' : undefined}
      tabIndex={enabled ? 0 : undefined}
      aria-label={enabled ? 'Open the design system' : undefined}
      onClick={enabled && onOpen ? (e) => {
        holdAt.current = { x: e.clientX, y: e.clientY };
        setHot(false); // back to solid, so it is not left in outline when the page closes over it
        const r = box.current?.getBoundingClientRect();
        // the frame the cursor's reticle draws around the name (8px of room on every side)
        if (r) onOpen(new DOMRect(r.left - 8, r.top - 8, r.width + 16, r.height + 16));
      } : undefined}
      onKeyDown={enabled && onOpen ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          holdAt.current = null;
          const r = box.current?.getBoundingClientRect();
          if (r) onOpen(new DOMRect(r.left - 8, r.top - 8, r.width + 16, r.height + 16));
        }
      } : undefined}
      onMouseEnter={enabled ? () => !holdAt.current && setHot(true) : undefined}
      onMouseLeave={enabled ? () => setHot(false) : undefined}
      onMouseMove={enabled ? (e) => {
        const h = holdAt.current;
        if (h && Math.hypot(e.clientX - h.x, e.clientY - h.y) > 6) {
          holdAt.current = null;
          setHot(true);
        }
      } : undefined}
    >
      {/* the solid name; it fades out on hover so the skeleton shows in its place */}
      <h1
        className={`${NAME_CLASS} text-cream/90`}
        // Neutral drop shadow only; 90% opacity lets the painting show through faintly
        style={{
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.55))',
          opacity: enabled && hot ? 0.08 : 1,
          transition: 'opacity 0.5s ease',
        }}
      >
        {lines}
      </h1>

      {enabled && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none transition-opacity duration-(--dur-hover)"
          style={{ opacity: hot ? 1 : 0 }}
        >
          {/* the outlined letters */}
          <div className={`${NAME_CLASS} text-transparent`} style={{ WebkitTextStroke: '1px rgba(244,243,240,0.95)' }}>
            {lines}
          </div>
          {/* the guide lines, repeated for each line of the name (sized in em, so they follow the type) */}
          <div className={`${NAME_CLASS} absolute inset-0 text-transparent`}>
            {[0, 1].map((row) => (
              <div key={row} className="absolute left-[-4%] right-[-4%] max-sm:hidden" style={{ top: `${row * 0.86}em`, height: '0.86em' }}>
                {GUIDES.map((g) => (
                  <span key={g.label} className="absolute left-0 right-0 block h-px bg-cream/35" style={{ top: `${g.at * 100}%` }}>
                    <span className="absolute right-0 bottom-[3px] font-mono text-[10px] tracking-[0.2em] uppercase leading-none text-cream/60">{g.label}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const HieiHero: React.FC<HieiHeroProps> = ({
  onViewWork,
  onOpenDesignSystem,
  mouse,
}) => {
  const reduceMotion = useReducedMotion();
  // the painting waits dark, soft and a little large while the welcome holds the screen, then comes into focus
  const lifted = useIntroLifted();

  // On a phone the wide painting is cropped to a tall slice, so the slice moves. It opens on the man at the laptop
  // (PAN_START, as a % of the painting's width), then drifts slowly across to the left side and back. A finger can drag
  // it, and on phones that report tilt (no permission needed) leaning the phone nudges it too. The drift picks up again
  // a moment after the finger lifts.
  const PAN_START = 80;
  const PAN_FAR = 22;
  const isPhone = React.useMemo(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches, []);
  const panBase = useMotionValue(PAN_START);
  const tiltRaw = useMotionValue(0);
  const tilt = useSpring(tiltRaw, { stiffness: 60, damping: 20 });
  const panPos = useTransform([panBase, tilt], ([b, t]: number[]) => `${Math.max(0, Math.min(100, b + t))}% 50%`);
  const driftRef = React.useRef<{ stop: () => void } | null>(null);
  const goRef = React.useRef<() => void>(() => {});
  const resumeTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    if (!isPhone || reduceMotion || !lifted) return;
    let stopped = false;
    const go = () => {
      if (stopped) return;
      const from = panBase.get();
      const to = from > 51 ? PAN_FAR : PAN_START;
      driftRef.current = animate(panBase, to, {
        duration: Math.max(4, Math.abs(to - from) / 3.2),
        ease: [0.45, 0, 0.55, 1],
        onComplete: go,
      });
    };
    goRef.current = go;
    const first = window.setTimeout(go, 1800);
    return () => {
      stopped = true;
      window.clearTimeout(first);
      window.clearTimeout(resumeTimer.current);
      driftRef.current?.stop();
    };
  }, [isPhone, reduceMotion, lifted, panBase]);
  React.useEffect(() => {
    // iPhones ask permission before sharing tilt, so only phones that share it freely get the lean
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent;
    if (!isPhone || reduceMotion || !DOE || typeof DOE.requestPermission === 'function') return;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      tiltRaw.set(Math.max(-25, Math.min(25, e.gamma)) * 0.35);
    };
    window.addEventListener('deviceorientation', onTilt);
    return () => window.removeEventListener('deviceorientation', onTilt);
  }, [isPhone, reduceMotion, tiltRaw]);
  const touch = React.useRef<{ x: number; y: number; pan: number; axis: '' | 'x' | 'y' } | null>(null);
  const onPanStart = (e: React.TouchEvent) => {
    if (!isPhone) return;
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, pan: panBase.get(), axis: '' };
  };
  const onPanMove = (e: React.TouchEvent) => {
    const t = touch.current;
    if (!t) return;
    const dx = e.touches[0].clientX - t.x;
    const dy = e.touches[0].clientY - t.y;
    if (!t.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) t.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (t.axis !== 'x') return;
    driftRef.current?.stop();
    window.clearTimeout(resumeTimer.current);
    const h = sectionRef.current?.offsetHeight ?? window.innerHeight;
    const range = Math.max(1, h * (16 / 9) - window.innerWidth);
    panBase.set(Math.max(0, Math.min(100, t.pan - (dx / range) * 100)));
  };
  const onPanEnd = () => {
    const t = touch.current;
    touch.current = null;
    if (t?.axis === 'x' && !reduceMotion) resumeTimer.current = window.setTimeout(() => goRef.current(), 2500);
  };

  // Cycle through the paintings. It pauses while the tab is hidden and does not run for people who prefer
  // reduced motion.
  const [heroIndex, setHeroIndex] = React.useState(0);
  React.useEffect(() => {
    if (reduceMotion || HERO_IMAGES.length < 2) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, HERO_HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);
  const canHover = React.useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    []
  );

  // Scroll as camera movement: as the hero scrolls away the painting pushes in and darkens,
  // while the text eases up and fades
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 1.22]);
  const textY = useTransform(scrollYProgress, [0, 0.6], [0, -70]);

  // The two fades are written straight to the elements: scroll-linked opacity MotionValues
  // did not update in testing, while transforms did.
  const textBlockRef = React.useRef<HTMLDivElement>(null);
  const dimRef = React.useRef<HTMLDivElement>(null);
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (reduceMotion) return;
    if (textBlockRef.current) {
      textBlockRef.current.style.opacity = String(Math.max(0, 1 - p / 0.5));
    }
    if (dimRef.current) {
      dimRef.current.style.opacity = String(Math.min(p / 0.9, 1) * 0.8);
    }
  });

  // Cursor light: a soft warm light follows the mouse over the painting (desktop only)
  const lightX = useSpring(useMotionValue(0), { stiffness: 90, damping: 20, mass: 0.6 });
  const lightY = useSpring(useMotionValue(0), { stiffness: 90, damping: 20, mass: 0.6 });
  const lightOpacity = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });

  const handleLightMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    lightX.set(e.clientX - rect.left);
    lightY.set(e.clientY - rect.top);
    lightOpacity.set(1);
  };

  // Magnetic pull: the button drifts toward the cursor when it comes near, then springs back
  const ctaRef = React.useRef<HTMLButtonElement>(null);
  const pullX = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const pullY = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  React.useEffect(() => {
    // Mouse only: skip on touch screens and for people who prefer reduced motion
    if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const REACH = 100; // px from the button's edge at which the pull starts
    const MAX_PULL = 4; // px the button can travel (kept slight on purpose)
    const clamp = (v: number) => Math.max(-MAX_PULL, Math.min(MAX_PULL, v));

    const onMove = (e: MouseEvent) => {
      const el = ctaRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Use the resting centre (undo the current pull) so the pull doesn't feed back on itself
      const dx = e.clientX - (r.left + r.width / 2 - pullX.get());
      const dy = e.clientY - (r.top + r.height / 2 - pullY.get());
      const edgeDist = Math.hypot(
        Math.max(Math.abs(dx) - r.width / 2, 0),
        Math.max(Math.abs(dy) - r.height / 2, 0)
      );
      if (edgeDist < REACH) {
        pullX.set(clamp(dx * 0.06));
        pullY.set(clamp(dy * 0.08));
      } else {
        pullX.set(0);
        pullY.set(0);
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduceMotion, pullX, pullY]);

  // Parallax calculation from normalized mouse position
  // Image travels up to ~25px sideways and ~16px vertically (the scaled image has ample bleed).
  // Driven straight from the mouse motion values, so mouse movement doesn't re-render React.
  const parallaxSpring = { damping: 30, stiffness: 120 };
  const parX = useSpring(useTransform(mouse.x, [0, 1], [-25, 25]), parallaxSpring);
  const parY = useSpring(useTransform(mouse.y, [0, 1], [-16, 16]), parallaxSpring);
  const lineX = useTransform(parX, (v) => v * 1.3);
  const lineY = useTransform(parY, (v) => v * 1.3);

  return (
    <section
      ref={sectionRef}
      onMouseMove={canHover && !reduceMotion ? handleLightMove : undefined}
      onMouseLeave={canHover && !reduceMotion ? () => lightOpacity.set(0) : undefined}
      onTouchStart={onPanStart}
      onTouchMove={onPanMove}
      onTouchEnd={onPanEnd}
      onTouchCancel={onPanEnd}
      style={isPhone ? { touchAction: 'pan-y' } : undefined}
      className="relative w-full h-screen min-h-[640px] max-h-[1080px] overflow-hidden select-none bg-[#0a0908] flex flex-col justify-end"
    >
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Layer 1: mouse parallax */}
        <motion.div
          style={{ x: parX, y: parY }}
          className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)]"
        >
          {/* Layer 2: scroll push-in */}
          <motion.div
            style={reduceMotion ? undefined : { scale: scrollScale }}
            className="w-full h-full will-change-transform"
          >
            {/* Layer 3: slow camera drift, a long zoom and pan that reverses back and forth */}
            <motion.div
              initial={{ scale: 1.06, x: 0, y: 0 }}
              animate={reduceMotion ? undefined : { scale: 1.14, x: -18, y: -10 }}
              transition={{ duration: 40, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              className="w-full h-full will-change-transform"
            >
              <motion.div
                className="relative w-full h-full will-change-[filter,transform]"
                initial={false}
                animate={
                  lifted
                    ? { scale: 1, opacity: 1, filter: 'blur(0px) brightness(1)' }
                    : { scale: 1.12, opacity: 1, filter: 'blur(12px) brightness(0.45)' }
                }
                transition={{ duration: lifted ? 1.9 : 0, ease: [0.22, 1, 0.36, 1] }}
              >
                {HERO_IMAGES.map((img, i) => (
                  <motion.img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    aria-hidden={i !== heroIndex}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      objectPosition: isPhone ? panPos : '50% 50%',
                      opacity: i === heroIndex ? 1 : 0,
                      transition: `opacity ${HERO_FADE_S}s ease-in-out`,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom scrim for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-base via-base/55 to-transparent pointer-events-none" />

        {/* Extra shade behind the description and button, over the busiest part of the painting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_82%_92%,rgba(8,8,10,0.72),transparent_70%)] pointer-events-none" />

        {/* Hairlines with passing streaks. Moves a touch more than the painting, so it sits in front of it */}
        <motion.div
          aria-hidden="true"
          style={{ x: lineX, y: lineY }}
          className="absolute -inset-12 pointer-events-none"
        >
          {STREAK_LINES.map((line) => (
            <HairlineStreak key={`${line.axis}-${line.pos}`} line={line} animate={!reduceMotion} />
          ))}
        </motion.div>

        {/* Cursor light (desktop only) */}
        {canHover && !reduceMotion && (
          <motion.div
            aria-hidden="true"
            style={{ x: lightX, y: lightY, opacity: lightOpacity }}
            className="absolute top-0 left-0 -ml-[340px] -mt-[340px] w-[680px] h-[680px] rounded-full mix-blend-soft-light bg-[radial-gradient(circle,rgba(255,238,210,0.2)_0%,rgba(255,238,210,0.08)_35%,transparent_68%)] pointer-events-none"
          />
        )}

        {/* Darkens as you scroll away */}
        {!reduceMotion && (
          <div ref={dimRef} className="absolute inset-0 bg-base opacity-0 pointer-events-none" />
        )}
      </div>

      {/* Name, description and CTA */}
      <motion.div
        ref={textBlockRef}
        style={reduceMotion ? undefined : { y: textY }}
        className="relative z-20 w-full px-6 sm:px-10 lg:px-14 pb-8 sm:pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-2 sm:gap-8 lg:gap-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-baseline"
        >
          <NameTitle enabled={canHover && !reduceMotion} onOpen={onOpenDesignSystem} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md lg:max-w-[28rem] space-y-6 lg:mb-4"
        >
          <p className="font-editorial-serif font-medium text-[1.4rem] sm:text-2xl lg:text-[1.7rem] text-cream leading-[1.25] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Product builder creating experiences people remember.
          </p>

          <motion.button
            ref={ctaRef}
            style={{ x: pullX, y: pullY }}
            onClick={() => {
              soundFx.playOpen();
              onViewWork();
            }}
            className="group inline-flex items-center gap-4 text-cream/85 hover:text-cream transition-colors duration-300 font-['Satoshi',sans-serif] font-medium text-sm sm:text-[15px] tracking-wide cursor-pointer [text-shadow:0_2px_10px_rgba(0,0,0,0.7)]"
          >
            <span>View selected work</span>

            {/* Scroll cue: a light pulse travelling down a thin line, on a slow loop */}
            <span
              aria-hidden="true"
              className="relative block h-7 w-px overflow-hidden bg-cream/25 transition-colors duration-300 group-hover:bg-cream/50"
            >
              <motion.span
                className="absolute left-0 top-0 block h-3 w-px bg-gradient-to-b from-transparent via-cream to-transparent"
                initial={{ y: reduceMotion ? 9 : -12 }}
                animate={reduceMotion ? { y: 9 } : { y: [-12, 28] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 2, repeat: Infinity, ease: [0.45, 0, 0.25, 1], repeatDelay: 0.4 }
                }
              />
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};
