import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion, useMotionValue, useSpring, useInView, MotionValue } from 'motion/react';
import { ArrowRight, ArrowUpRight, Maximize2 } from 'lucide-react';
import { Project } from '../types';
import { ProjectCardArtwork } from './ProjectCardArtwork';
import { StackIcons } from './StackIcons';
import { ProjectWorld } from './ProjectWorld';
import { soundFx } from '../utils/audio';
import { setStagePull, ZOOM_EASE, heroVideoRegistry, captureFrame } from '../utils/stagePull';
import { isSplitWidth, splitLayout, stackedHero } from '../utils/caseStudyLayout';
import { ZoomGhost, ZoomState } from './ZoomGhost';
import { ChapterMarker, CloseButton, Label } from './ui';

interface CaseStudyPageProps {
  project: Project | null;
  onClose: () => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
  nextProject?: Project | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const CHAPTERS = [
  { id: 'overview', label: 'Overview' },
  { id: 'approach', label: 'Approach' },
  { id: 'work', label: 'The work' },
  { id: 'outcome', label: 'Outcome' },
] as const;

// Neutral frame for gallery media until real images are supplied
const GalleryFrame: React.FC<{ url?: string; title: string; description: string; aspect?: string }> = ({
  url,
  title,
  description,
  aspect = 'aspect-[16/9]',
}) => (
  <figure>
    <RevealFrame from="bottom" className={aspect}>
      {url && /\.(mp4|webm)$/i.test(url) ? (
        <video src={url} autoPlay muted loop playsInline preload="metadata" aria-label={title} className="absolute inset-0 w-full h-full object-cover" />
      ) : url ? (
        <img src={url} alt={title} decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
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
      )}
    </RevealFrame>
    <figcaption className="mt-3 flex items-baseline justify-between gap-6 text-xs font-mono tracking-wider text-cream/50">
      <span className="text-cream/80">{title}</span>
      <span className="text-right">{description}</span>
    </figcaption>
  </figure>
);

// One voice for all the story text: light Satoshi, bright, a comfortable line length, and a soft shadow
// so it stays crisp over the background. `lead` is the slightly larger opening statement.
const BODY = 'font-normal text-body leading-[1.7] text-white/78 tracking-[0.005em] [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]';
const LEAD = 'font-normal text-[1.6rem] sm:text-[1.75rem] leading-[1.5] text-white tracking-[-0.005em] [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]';

// ---------------------------------------------------------------------------------------------
// Reading components for the story text
// ---------------------------------------------------------------------------------------------

// One word that brightens as the paragraph's scroll progress passes its place in the sentence
const Word: React.FC<{ word: string; index: number; total: number; progress: MotionValue<number>; picked: boolean; reduce: boolean }> = ({
  word,
  index,
  total,
  progress,
  picked,
  reduce,
}) => {
  const start = index / total;
  const opacity = useTransform(progress, [start, Math.min(1, start + 1.5 / total)], [picked ? 0.28 : 0.2, 1]);
  return (
    <motion.span
      style={reduce ? undefined : { opacity }}
      className={`inline-block mr-[0.28em] ${picked ? 'font-editorial-serif italic font-semibold text-white text-[1.2em]' : ''}`}
    >
      {word}
    </motion.span>
  );
};

// A paragraph whose words light up one after another as it scrolls toward the middle of the screen,
// with one phrase picked out in serif italic so the eye lands on it first.
const ScrollText: React.FC<{
  text: string;
  highlight?: string;
  className: string;
  container: React.RefObject<HTMLElement | null>;
  reduce: boolean;
}> = ({ text, highlight, className, container, reduce }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ['start 0.88', 'end 0.5'] });

  const words = useMemo(() => {
    const cut = highlight ? text.indexOf(highlight) : -1;
    const tokens: { w: string; picked: boolean }[] = [];
    const push = (s: string, picked: boolean) => s.split(/\s+/).filter(Boolean).forEach((w) => tokens.push({ w, picked }));
    if (cut >= 0 && highlight) {
      // punctuation right after the phrase stays attached to it, so there is no gap before a full stop
      const after = text.slice(cut + highlight.length);
      const stuck = after.match(/^[^\s]+/)?.[0] ?? '';
      push(text.slice(0, cut), false);
      push(highlight + stuck, true);
      push(after.slice(stuck.length), false);
    } else push(text, false);
    return tokens;
  }, [text, highlight]);

  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((t, i) => (
        <Word key={i} word={t.w} index={i} total={words.length} progress={scrollYProgress} picked={t.picked} reduce={reduce} />
      ))}
    </p>
  );
};

// A soft pull toward the pointer, like the close button's: while the pointer is within reach of the
// element it drifts a few pixels toward it, then eases back. Motion values only, no re-render.
const useMagnet = (ref: React.RefObject<HTMLElement | null>, reduce: boolean, max = 7) => {
  const x = useSpring(useMotionValue(0), { stiffness: 110, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 110, damping: 18 });
  useEffect(() => {
    if (reduce) return;
    const reach = 560;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      if (d > reach || r.bottom < 0 || r.top > window.innerHeight) {
        x.set(0);
        y.set(0);
        return;
      }
      const k = 1 - d / reach;
      x.set(Math.max(-max, Math.min(max, dx * 0.03)) * k * 1.6);
      y.set(Math.max(-max, Math.min(max, dy * 0.03)) * k * 1.6);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [ref, reduce, max, x, y]);
  return { x, y };
};

// A big headline: it rises into view out of a clip (so each line seems to come up from beneath a
// hairline), floats a little against the scroll, and drifts toward the pointer.
const FloatHeadline: React.FC<{
  children: React.ReactNode;
  className: string;
  container: React.RefObject<HTMLElement | null>;
  reduce: boolean;
}> = ({ children, className, container, reduce }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ['start end', 'end start'] });
  const floatY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [18, -18]);
  const magnet = useMagnet(ref, reduce);
  // watched on the visible wrapper, not on the headline itself, which starts hidden below its clip
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  return (
    <motion.div ref={ref} style={{ y: floatY }}>
      <motion.div style={{ x: magnet.x, y: magnet.y }}>
        <div className="overflow-hidden pt-[0.12em] pb-[0.22em] -mt-[0.12em] -mb-[0.22em]">
          <motion.h2
            initial={reduce ? false : { y: '108%' }}
            animate={{ y: inView || reduce ? 0 : '108%' }}
            transition={{ duration: 1.15, ease: EASE }}
            className={className}
          >
            {children}
          </motion.h2>
        </div>
      </motion.div>
    </motion.div>
  );
};

// What the reveal frames need from the page: its scroller, and whether motion is reduced
const RevealCtx = React.createContext<{ container: React.RefObject<HTMLElement | null>; reduce: boolean } | null>(null);

type RevealFrom = 'left' | 'right' | 'bottom' | 'center' | 'focus';
const CLOSED: Record<RevealFrom, string> = {
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  bottom: 'inset(100% 0% 0% 0%)',
  center: 'inset(0% 50% 0% 50%)',
  focus: 'inset(0% 0% 0% 0%)', // no wipe: this one fades up out of a blur instead
};

// A picture frame with an entrance. As it scrolls into view the picture is uncovered by a wipe (from
// one side, from below, or opening from the middle), or pulled into focus out of a blur. The picture itself starts zoomed in and settles back, drifts against the
// scroll while it is on screen, and the whole frame leans toward the pointer like the headlines do.
const RevealFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  from?: RevealFrom;
  delay?: number;
  duration?: number; // length of the wipe, in seconds
  ease?: [number, number, number, number];
  zoom?: number; // how far in the picture starts before it settles
}> = ({
  children,
  className = '',
  from = 'bottom',
  delay = 0,
  duration = 1.5,
  ease = [0.76, 0, 0.24, 1],
  zoom = 1.3,
}) => {
  const ctx = React.useContext(RevealCtx);
  const reduce = ctx?.reduce ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -14% 0px' });
  const { scrollYProgress } = useScroll({ target: ref, container: ctx?.container, offset: ['start end', 'end start'] });
  const driftY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-1.5%', '1.5%']);
  const magnet = useMagnet(ref, reduce, 1.5);
  const open = inView || reduce;

  return (
    <motion.div ref={ref} style={{ x: magnet.x, y: magnet.y }} whileHover={reduce ? undefined : { scale: 1.004 }} transition={{ duration: 0.6, ease: EASE }} className={`relative w-full ${className}`}>
      <motion.div
        initial={reduce ? false : from === 'focus' ? { opacity: 0, filter: 'blur(18px)' } : { clipPath: CLOSED[from] }}
        animate={
          from === 'focus'
            ? { opacity: open ? 1 : 0, filter: open ? 'blur(0px)' : 'blur(18px)' }
            : { clipPath: open ? 'inset(0% 0% 0% 0%)' : CLOSED[from] }
        }
        transition={{ duration, ease, delay }}
        className="absolute inset-0 overflow-hidden bg-[#0d0d0f] ring-1 ring-inset ring-white/10"
      >
        <motion.div style={{ y: driftY }} className="absolute -inset-y-[6%] inset-x-0">
          <motion.div
            initial={reduce ? false : { scale: zoom }}
            animate={{ scale: open ? 1 : zoom }}
            transition={{ duration: duration + 0.6, ease: EASE, delay }}
            className="relative w-full h-full"
          >
            {children}
          </motion.div>
        </motion.div>
      </motion.div>

    </motion.div>
  );
};

// The facts at the foot of the left panel: client, role, year and stack, under a hairline.
const FactsBlock: React.FC<{ project: Project; reduce: boolean }> = ({ project, reduce }) => (
  <motion.div
    initial={reduce ? false : { opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.9, ease: EASE, delay: 1.2 }}
    className="relative z-10"
  >
    <span aria-hidden="true" className="block h-px bg-white/12" />
    <dl className="grid grid-cols-2 gap-x-6 gap-y-7 pt-8 [@media(max-height:760px)]:pt-5 [@media(max-height:660px)]:pt-4">
      {[
        ['Client', project.client],
        ['Role', project.role ?? '—'],
      ].map(([k, v]) => (
        <div key={k}>
          <dt className="text-[10px] font-mono tracking-[0.25em] uppercase text-cream/60">{k}</dt>
          <dd className="mt-2 font-editorial-serif font-semibold text-[1.3rem] leading-snug text-white">{v}</dd>
        </div>
      ))}
    </dl>
  </motion.div>
);

// A chapter in two columns: its name on the left, its headline and text on the right, divided by a
// thin line that draws down as the chapter arrives. Hovering the chapter lengthens the marker line,
// sends a pulse along it and brightens the divider. On narrow screens the two columns stack.
const Chapter: React.FC<{ id?: string; name: string; children: React.ReactNode; className?: string; reduce?: boolean }> = ({
  id,
  name,
  children,
  className = '',
  reduce = false,
}) => {
  const [hot, setHot] = useState(false);
  return (
    <section id={id} className={className} onMouseEnter={() => setHot(true)} onMouseLeave={() => setHot(false)}>
      <div className="grid md:grid-cols-[9rem_1fr] gap-x-10 gap-y-6">
        <div className="flex items-start md:pt-3">
          <ChapterMarker n={name} hot={hot} reduce={reduce} />
        </div>
        <div className="relative md:pl-10 max-w-[44rem]">
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
            style={{ originY: 0 }}
            className={`hidden md:block absolute left-0 top-0 bottom-0 w-px transition-colors duration-(--dur-hover) ${hot ? 'bg-white/40' : 'bg-white/15'}`}
          />
          {children}
        </div>
      </div>
    </section>
  );
};

// The big confident line that opens a chapter
const HEADLINE = 'font-editorial-serif font-semibold text-[clamp(2.3rem,3.6vw,3.3rem)] leading-[1.08] tracking-[-0.015em] text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]';

// A single oversized statement between chapters. Its hairlines draw across, the line rises into view,
// and it floats and drifts like the headlines.
const Statement: React.FC<{
  text: string;
  note?: string;
  fadeUp: (d?: number) => object;
  container: React.RefObject<HTMLElement | null>;
  reduce: boolean;
}> = ({ text, note, fadeUp, container, reduce }) => {
  const rule = (extra = '') => (
    <motion.span
      aria-hidden="true"
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.3, ease: EASE }}
      style={{ originX: 0 }}
      className={`absolute left-0 right-0 h-px bg-white/20 ${extra}`}
    />
  );
  return (
    <section aria-label="Key finding" className="py-6">
      <div className="relative py-16 sm:py-24">
        {rule('top-0')}
        <FloatHeadline
          container={container}
          reduce={reduce}
          className="font-editorial-serif italic font-semibold text-[clamp(2.4rem,4.6vw,4.2rem)] leading-[1.05] tracking-[-0.02em] text-white max-w-[40rem] [text-shadow:0_4px_28px_rgba(0,0,0,0.6)]"
        >
          {text}
        </FloatHeadline>
        {note && (
          <motion.p {...fadeUp(0.25)} className="mt-6 max-w-[34rem] text-[0.95rem] font-normal leading-relaxed text-white/70">
            {note}
          </motion.p>
        )}
        {rule('bottom-0')}
      </div>
    </section>
  );
};

// A process picture, shown bare on the page: dimmed a little so the white does not glare, waking up on hover.
// It comes in with a blur-in, and clicking it grows the picture to fill the screen so the detail can be read.
// Dense diagrams run wider than the text column.
const ProcessImage: React.FC<{ src: string; alt: string; wide?: boolean; stage?: boolean; tile?: { hot: boolean; onHot: (on: boolean) => void }; reduce: boolean }> = ({ src, alt, wide, stage, tile, reduce }) => {
  const img = useRef<HTMLImageElement>(null);
  const [from, setFrom] = useState<DOMRect | null>(null);
  const open = () => {
    if (img.current) setFrom(img.current.getBoundingClientRect());
  };

  // Esc closes the picture, and does not also close the page behind it
  useEffect(() => {
    if (!from) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        setFrom(null);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [from]);

  return (
    <>
      <motion.button
        type="button"
        onClick={open}
        aria-label={`Enlarge: ${alt}`}
        {...(stage || tile
          ? {}
          : {
              initial: reduce ? false : { opacity: 0, scale: 1.04, filter: 'blur(14px)' },
              whileInView: { opacity: 1, scale: 1, filter: 'blur(0px)' },
              viewport: { once: true, margin: '-8% 0px' },
              transition: { duration: 1.1, ease: EASE },
            })}
        onMouseEnter={tile ? () => tile.onHot(true) : undefined}
        onMouseLeave={tile ? () => tile.onHot(false) : undefined}
        onFocus={tile ? () => tile.onHot(true) : undefined}
        onBlur={tile ? () => tile.onHot(false) : undefined}
        className={`group relative block cursor-zoom-in outline-none ${stage || tile ? 'w-full' : `mt-6 w-full ${wide ? '' : 'max-w-[36rem]'}`}`}
      >
        <img
          ref={img}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={tile ? { filter: tile.hot ? 'none' : 'brightness(0.78) saturate(0.9)' } : undefined}
          className={`block ${tile ? 'w-full h-auto rounded-frame border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.55)]' : stage ? 'w-full h-auto max-h-[46vh] object-contain [filter:brightness(0.8)_saturate(0.9)_drop-shadow(0_20px_44px_rgba(0,0,0,0.6))] group-hover:[filter:drop-shadow(0_20px_44px_rgba(0,0,0,0.6))]' : 'w-full h-auto rounded-frame border border-white/15 shadow-[0_18px_50px_rgba(0,0,0,0.5)] [filter:brightness(0.74)_saturate(0.85)] group-hover:[filter:none]'} transition-[filter] duration-700 ease-arrive ${from ? 'opacity-0' : ''}`}
        />
        <Maximize2
          aria-hidden="true"
          className="absolute right-3 bottom-3 w-4 h-4 text-black/0 transition-colors duration-(--dur-hover) group-hover:text-black/55"
          strokeWidth={1.5}
        />
      </motion.button>
      {createPortal(
        <AnimatePresence>
          {from && (
            <motion.div
              key="lightbox"
              className="fixed inset-0 z-[90] cursor-zoom-out"
              onClick={() => setFrom(null)}
              initial={{ backgroundColor: 'rgba(5,5,5,0)' }}
              animate={{ backgroundColor: 'rgba(5,5,5,0.94)' }}
              exit={{ backgroundColor: 'rgba(5,5,5,0)' }}
              transition={{ duration: 0.6, ease: ZOOM_EASE }}
            >
              <motion.img
                src={src}
                alt={alt}
                className="fixed object-contain"
                initial={{ left: from.left, top: from.top, width: from.width, height: from.height }}
                animate={{ left: window.innerWidth * 0.04, top: window.innerHeight * 0.06, width: window.innerWidth * 0.92, height: window.innerHeight * 0.88 }}
                exit={{
                  left: img.current?.getBoundingClientRect().left ?? from.left,
                  top: img.current?.getBoundingClientRect().top ?? from.top,
                  width: from.width,
                  height: from.height,
                }}
                transition={{ duration: 0.7, ease: ZOOM_EASE }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

// A numbered list of short findings or steps: a hairline between rows, the number in the project's colour,
// each row easing in as it scrolls into view
const StepList: React.FC<{ items: { title: string; text: string; image?: string; wide?: boolean }[]; accent: string; reduce: boolean }> = ({ items, accent, reduce }) => (
  <ol className={`${items.some((i) => i.image) ? '' : 'max-w-[40rem]'} border-t border-white/12`}>
    {items.map((it, i) => (
      <motion.li
        key={it.title}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-6% 0px' }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
        className="grid grid-cols-[2.4rem_1fr] gap-x-2 py-6 border-b border-white/12"
      >
        <span className="pt-[0.35rem] font-mono text-caption tracking-[0.2em]" style={{ color: accent }}>
          {String(i + 1).padStart(2, '0')}
        </span>
        <div>
          <p className="font-editorial-serif font-semibold text-[1.45rem] leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">{it.title}</p>
          <p className="mt-2 max-w-[36rem] font-normal text-[1.05rem] leading-[1.65] text-white/78 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">{it.text}</p>
          {it.image && <ProcessImage src={it.image} alt={it.title} wide={it.wide} reduce={reduce} />}
        </div>
      </motion.li>
    ))}
  </ol>
);

// The process, as a pinned stage: the steps scroll on the left and one picture stays put on the right, swapping
// as each step reaches the middle of the screen. On narrow screens it falls back to a plain stacked list.
const ProcessStage: React.FC<{
  items: { title: string; text: string; image?: string; wide?: boolean }[];
  accent: string;
  reduce: boolean;
  container: React.RefObject<HTMLElement | null>;
}> = ({ items, accent, reduce, container }) => {
  const [active, setActive] = useState(0);
  const cur = items[active];
  return (
    <>
      <div className="min-[1280px]:hidden">
        <StepList items={items} accent={accent} reduce={reduce} />
      </div>
      <div className="hidden min-[1280px]:grid grid-cols-[20rem_minmax(0,1fr)] gap-x-10">
        <ol>
          {items.map((it, i) => (
            <StageStep key={it.title} i={i} item={it} accent={accent} on={i === active} container={container} onActive={setActive} />
          ))}
        </ol>
        <div className="relative">
          <div className="sticky top-[16vh] mx-auto flex h-[68vh] w-full max-w-[28rem] flex-col items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduce ? false : { opacity: 0, scale: 1.03, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985, filter: 'blur(8px)' }}
                transition={{ duration: 0.55, ease: EASE }}
                className="flex w-full flex-col items-center"
              >
                {cur?.image && <ProcessImage src={cur.image} alt={cur.title} stage reduce={reduce} />}
                <p className="mt-5 font-mono text-caption uppercase tracking-[0.22em] text-white/62">
                  <span style={{ color: accent }}>{String(active + 1).padStart(2, '0')}</span>
                  <span className="mx-2 text-white/30">/</span>
                  {cur?.title}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

const StageStep: React.FC<{
  i: number;
  item: { title: string; text: string };
  accent: string;
  on: boolean;
  container: React.RefObject<HTMLElement | null>;
  onActive: (i: number) => void;
}> = ({ i, item, accent, on, container, onActive }) => {
  const ref = useRef<HTMLLIElement>(null);
  const hit = useInView(ref, { root: container, margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (hit) onActive(i);
  }, [hit, i, onActive]);
  return (
    <li ref={ref} className="flex min-h-[44vh] flex-col justify-center border-b border-white/10 py-14 first:border-t">
      <span className="font-mono text-caption tracking-[0.2em] transition-opacity duration-(--dur-hover)" style={{ color: accent, opacity: on ? 1 : 0.45 }}>
        {String(i + 1).padStart(2, '0')}
      </span>
      <div className="transition-opacity duration-(--dur-hover)" style={{ opacity: on ? 1 : 0.4 }}>
        <p className="mt-4 font-editorial-serif font-semibold text-[1.7rem] leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">{item.title}</p>
        <div
          className="grid transition-[grid-template-rows,opacity] duration-[800ms] ease-arrive"
          style={{ gridTemplateRows: on ? '1fr' : '0fr', opacity: on ? 1 : 0 }}
        >
          <div className="min-h-0 overflow-hidden">
            <p className="pt-4 max-w-[19rem] font-normal text-[1.05rem] leading-[1.7] text-white/78 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">{item.text}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

// The process, as a collage: the pictures overlap in a loose, tilted pile and the steps run in a row beneath.
// Hovering a picture or its step lifts the picture to the front and straightens it. Narrow screens get the
// plain stacked list.
const COLLAGE: Record<number, { left: string; top: string; width: string; rot: number; z: number }[]> = {
  3: [
    { left: '0%', top: '14%', width: '46%', rot: -2.5, z: 1 },
    { left: '27%', top: '0%', width: '58%', rot: 1.2, z: 2 },
    { left: '58%', top: '34%', width: '42%', rot: 3, z: 3 },
  ],
  4: [
    { left: '0%', top: '3%', width: '42%', rot: -3, z: 1 },
    { left: '30%', top: '0%', width: '52%', rot: 1.4, z: 2 },
    { left: '4%', top: '47%', width: '44%', rot: 2.2, z: 3 },
    { left: '54%', top: '36%', width: '46%', rot: -2, z: 4 },
  ],
};

const ProcessCollage: React.FC<{
  items: { title: string; text: string; image?: string; wide?: boolean }[];
  accent: string;
  reduce: boolean;
}> = ({ items, accent, reduce }) => {
  const [hot, setHot] = useState<number | null>(null);
  const layout = COLLAGE[items.length] ?? COLLAGE[3];
  return (
    <>
      <div className="min-[1280px]:hidden">
        <StepList items={items} accent={accent} reduce={reduce} />
      </div>
      <div className="hidden min-[1280px]:block">
        <div className="relative w-full aspect-[16/11]">
          {items.map((it, i) => {
            const l = layout[i % layout.length];
            if (!it.image) return null;
            return (
              <motion.div
                key={it.title}
                className="absolute"
                style={{ left: l.left, top: l.top, width: l.width, zIndex: hot === i ? 30 : l.z }}
                initial={reduce ? false : { opacity: 0, y: 44, filter: 'blur(12px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 1.05, ease: EASE, delay: i * 0.14 }}
              >
                <motion.div animate={{ rotate: hot === i ? 0 : l.rot, scale: hot === i ? 1.04 : 1 }} transition={{ duration: 0.6, ease: EASE }}>
                  <ProcessImage src={it.image} alt={it.title} reduce={reduce} tile={{ hot: hot === i, onHot: (on) => setHot(on ? i : hot === i ? null : hot) }} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        <ol className="mt-14 grid gap-x-8" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((it, i) => (
            <li
              key={it.title}
              onMouseEnter={() => setHot(i)}
              onMouseLeave={() => setHot((h) => (h === i ? null : h))}
              className="border-t border-white/12 pt-5 transition-opacity duration-(--dur-hover)"
              style={{ opacity: hot === null || hot === i ? 1 : 0.45 }}
            >
              <span className="font-mono text-caption tracking-[0.2em]" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-3 font-editorial-serif font-semibold text-[1.4rem] leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">{it.title}</p>
              <p className="mt-2 font-normal text-[0.98rem] leading-[1.6] text-white/78 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">{it.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
};

// which layout the process section uses: 'collage' or 'stage'
const PROCESS_LAYOUT = 'stage' as 'collage' | 'stage';

// Findings are written "Short title. The rest of the sentence." so they split into a title and a line
const splitFinding = (s: string) => {
  const i = s.indexOf('. ');
  return i === -1 ? { title: s, text: '' } : { title: s.slice(0, i), text: s.slice(i + 2) };
};

// The ending of a case study: a preview of the next project. The picture is dimmed until you hover it,
// then it brightens and, if the project has a video, plays it. Clicking grows the picture into the next
// project's page. The highlight colour is the page you are on, not the project it leads to.
const NextProject: React.FC<{ next: Project; accent: string; reduce: boolean; onGo: (rect: DOMRect) => void }> = ({ next, accent, reduce, onGo }) => {
  const [hot, setHot] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Next project: ${next.displayTitle}`}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (frame.current) onGo(frame.current.getBoundingClientRect());
        }
      }}
      onClick={() => frame.current && onGo(frame.current.getBoundingClientRect())}
      className="group block cursor-pointer outline-none"
    >
      <div className="flex items-center gap-4 mb-8 select-none">
        <span aria-hidden="true" className={`block h-px transition-all duration-(--dur-hover) ${hot ? 'w-16' : 'w-10'}`} style={{ background: hot ? accent : 'rgba(255,255,255,0.55)' }} />
        <span className="font-editorial-serif font-semibold text-[1.35rem] leading-none text-white/85">Next project</span>
      </div>

      <div ref={frame}>
        <RevealFrame from="focus" duration={1.1} ease={[0.22, 1, 0.36, 1]} zoom={1.06} className="aspect-video">
          <ProjectCardArtwork project={next} slot="topRight" hideLabel />
          {next.heroVideo && hot && !reduce && (
            <video
              src={next.heroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* dimmed until hovered */}
          <div aria-hidden="true" className={`absolute inset-0 bg-ink transition-opacity duration-700 ${hot ? 'opacity-0' : 'opacity-45'}`} />
        </RevealFrame>
      </div>

      <div className="mt-8 flex items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="relative inline-block pb-3">
            <span className="block font-editorial-serif font-semibold text-[clamp(2.6rem,5.2vw,4.8rem)] leading-[0.95] tracking-[-0.02em] text-white/90 group-hover:text-white transition-colors duration-(--dur-hover) [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">
              {next.displayTitle}
            </span>
            {/* the underline draws across on hover, in this page's colour */}
            <span aria-hidden="true" className="absolute left-0 right-0 bottom-0 h-px bg-white/15" />
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 bottom-0 h-px origin-left transition-transform duration-700 ease-arrive"
              style={{ background: accent, transform: `scaleX(${hot ? 1 : 0})` }}
            />
          </div>
          <p className="mt-4 text-[0.95rem] font-normal tracking-wide text-white/66">{next.discipline}</p>
        </div>
        <ArrowRight
          className="shrink-0 w-10 h-10 text-white/60 transition-all duration-(--dur-hover) group-hover:translate-x-2 group-hover:text-white"
          strokeWidth={1}
        />
      </div>
    </div>
  );
};

const Page: React.FC<CaseStudyPageProps & { project: Project; onGoNext: (rect: DOMRect) => void }> = ({
  project,
  onClose,
  onNavigateNext,
  onNavigatePrev,
  nextProject,
  onGoNext,
}) => {
  const reduce = !!useReducedMotion();

  // Wide screens get a split layout: a pinned panel on the left, the story scrolling on the right
  const [vh, setVh] = useState(() => (typeof window === 'undefined' ? 900 : window.innerHeight));
  const [vw, setVw] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth));
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const split = isSplitWidth(vw);
  const L = splitLayout(vw);
  // In the split layout the column supplies the padding; otherwise each section does
  const pad = split ? '' : 'px-6 sm:px-10';
  const heroFrameRef = useRef<HTMLDivElement>(null);

  // Real images (a project with `url`s) get a purpose-built layout: the first wide image runs full
  // bleed after the overview, the other wide ones follow, and square ones sit in a row of three.
  // Placeholder projects keep the frame layout.
  const hasReal = project.galleryImages.some((g) => g.url);
  const wideImages = project.galleryImages.filter((g) => !g.square);
  const squareImages = project.galleryImages.filter((g) => g.square);
  const breakImage = hasReal ? wideImages[0] : undefined;
  const moreWide = hasReal ? wideImages.slice(1) : [];
  const scroller = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>('overview');

  // Closing reverses the opening: the page's hero image shrinks back into the one on the stage.
  // Only possible while the stage still shows this same project's hero; otherwise just fade out.
  const [closing, setClosing] = useState<DOMRect | null>(null);
  const [closeFrom, setCloseFrom] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [closeFrame, setCloseFrame] = useState<string | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  // Opened by the zoom: the video was already playing in the zoom image, so it takes over at once
  const fromZoom = useRef(typeof document !== 'undefined' && document.documentElement.dataset.stagePull === '1').current;
  const closingRef = useRef(false);
  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    soundFx.playClose();
    const hero = document.querySelector<HTMLElement>(`[data-stage-hero="${project.id}"]`);
    let rect = hero?.getBoundingClientRect();
    // The stage is still pulled back (scaled to 0.95 around its centre) when the close starts, but it
    // springs back to full size as the image lands, so aim for where the hero will be then
    const stage = document.querySelector<HTMLElement>('.stage-pullable');
    if (rect && stage && document.documentElement.dataset.stagePull === '1') {
      const s = stage.getBoundingClientRect();
      const cx = s.left + s.width / 2;
      const cy = s.top + s.height / 2;
      const k = 1 / 0.95;
      rect = new DOMRect(cx + (rect.left - cx) * k, cy + (rect.top - cy) * k, rect.width * k, rect.height * k);
    }
    if (!rect || reduce || rect.width < 40) {
      setStagePull(false);
      onClose();
      return;
    }
    // The closing image starts from the video's place in the column when it is on screen, otherwise
    // from the whole screen
    const fr = (split ? heroFrameRef.current : heroRef.current)?.getBoundingClientRect();
    setCloseFrom(
      fr && fr.bottom > 80 && fr.top < window.innerHeight - 80
        ? { left: fr.left, top: fr.top, width: fr.width, height: fr.height }
        : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
    );
    setCloseFrame(captureFrame(heroVideoRef.current));
    setClosing(rect);
    // the stage comes back into focus while the image is still on its way down
    window.setTimeout(() => setStagePull(false), 280);
    // hand the video's position to the stage card it is landing on, while the ghost still covers it
    window.setTimeout(() => {
      const s = heroVideoRegistry.stage;
      const g = heroVideoRegistry.closeGhost;
      if (s && g) s.currentTime = g.currentTime;
    }, 640);
    window.setTimeout(onClose, 830);
  };

  // Never leave the stage pulled back if the page goes away some other way
  useEffect(() => () => setStagePull(false), []);

  // Reading progress and the header's slow drift, both from the page's own scroll position
  const { scrollY, scrollYProgress } = useScroll({ container: scroller });

  // The left panel notices the pointer: while it is inside, a soft light follows it, the panel's edge
  // line brightens and the progress line firms up. Just enough to show which side you are on.
  const [panelHot, setPanelHot] = useState(false);
  const [lineHot, setLineHot] = useState(false);
  const panelMX = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const panelMY = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const spotLeft = useTransform(panelMX, (v) => v - 230);
  const spotTop = useTransform(panelMY, (v) => v - 230);

  const heroY = useTransform(scrollY, [0, 900], [0, reduce ? 0 : 160]);
  const heroDim = useTransform(scrollY, [0, 600], [0, 0.65]);
  // The chapter links stay hidden over the header image and fade in once the body text begins
  const navOpacity = useTransform(scrollY, (v) => {
    const h = typeof window === 'undefined' ? 900 : window.innerHeight;
    return Math.min(1, Math.max(0, (v - h * 0.55) / (h * 0.3)));
  });
  const navEvents = useTransform(navOpacity, (o) => (o > 0.1 ? 'auto' : 'none'));
  // The haze at the foot of the page drifts slowly sideways as you read
  const glowX = useTransform(scrollY, [0, 4500], ['-6%', '6%']);
  // the small corner name (stacked layout) fades in once the big title has scrolled away
  const labelOpacity = useTransform(scrollY, (v) => Math.min(1, Math.max(0, (v - window.innerHeight * 0.56) / (window.innerHeight * 0.25))));
  const libY = useTransform(scrollY, [0, 3500], ['4%', '-2%']);
  const glow = project.world?.glow;
  // pointer position, for the cursor light in the project's world
  const pointerX = useMotionValue(-600);
  const pointerY = useMotionValue(-600);
  const activeIndex = Math.max(0, CHAPTERS.findIndex((c) => c.id === active));


  // Which chapter is in view, for the index on the left
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best: string | null = null;
        let bestRatio = 0;
        seen.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        });
        if (best) setActive(best);
      },
      { root, rootMargin: '-30% 0px -40% 0px', threshold: [0, 0.2, 0.5, 1] }
    );
    CHAPTERS.forEach((c) => {
      const el = root.querySelector(`#${c.id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [project.id]);

  // Keys: Esc closes, arrows move between projects
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
      else if (e.key === 'ArrowRight') onNavigateNext();
      else if (e.key === 'ArrowLeft') onNavigatePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, onNavigateNext, onNavigatePrev, reduce, project.id]);

  // The page behind must not scroll while this one is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const goTo = (id: string) => {
    soundFx.playTick();
    // "Overview" is the first chapter, so it takes you back to the very top of the page
    if (id === 'overview') {
      scroller.current?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    scroller.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  // The hero picture (and the video that fades in over it), used by both layouts
  const heroMedia = (
    <motion.div
      className="absolute inset-0"
      initial={reduce ? false : { scale: 1.06 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1.8, ease: EASE, delay: 0.5 }}
    >
      {fromZoom && project.heroVideo && heroVideoRegistry.frame ? (
        <img src={heroVideoRegistry.frame} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <ProjectCardArtwork project={project} slot="topRight" hideLabel />
      )}
      {/* The picture above is what the zoom lands on; once that has settled the video fades in over it */}
      {project.heroVideo && !reduce && (
        <motion.video
          ref={heroVideoRef}
          src={project.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            // continue from where the zoom image's video is
            const g = heroVideoRegistry.ghost;
            if (g) e.currentTarget.currentTime = g.currentTime;
          }}
          onCanPlay={() => setVideoReady(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: videoReady ? 1 : 0 }}
          transition={fromZoom ? { duration: 0.3 } : { duration: 1, ease: EASE, delay: 0.9 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </motion.div>
  );

  // The chapter skill tree: a trunk with a node per chapter, lit up to the chapter being read
  // the chapter rows (and the line joining their dots) get shorter on short windows so the panel always fits
  const rowH = vh < 660 ? 28 : vh < 760 ? 32 : 36;
  const chapterTree = (
    <div className="relative" style={{ '--accent': glow ?? '#f4f3f0' } as React.CSSProperties}>
      <span aria-hidden="true" className="absolute left-[3px] w-px bg-cream/12" style={{ top: rowH / 2, height: (CHAPTERS.length - 1) * rowH }} />
      <motion.span
        aria-hidden="true"
        className="absolute left-[3px] w-px"
        style={{ top: rowH / 2, background: glow ?? '#f4f3f0', opacity: 0.7 }}
        initial={false}
        animate={{ height: activeIndex * rowH }}
        transition={{ duration: 0.7, ease: EASE }}
      />
      {CHAPTERS.map((c, i) => {
        const on = active === c.id;
        const reached = i <= activeIndex;
        return (
          <button key={c.id} onClick={() => goTo(c.id)} style={{ height: rowH }} className="group relative flex items-center gap-4 text-left cursor-pointer transition-transform duration-300 hover:translate-x-1">
            <span
              aria-hidden="true"
              className={`relative block w-[7px] h-[7px] rounded-full transition-all duration-(--dur-hover) ${
                reached ? '' : 'border border-white/30 group-hover:border-[var(--accent)]'
              }`}
              style={{
                background: reached ? glow ?? '#f4f3f0' : 'transparent',
                boxShadow: on && glow ? `0 0 10px ${glow}99` : undefined,
                opacity: reached ? (on ? 1 : 0.7) : 1,
              }}
            />
            <span
              className={`font-editorial-serif font-medium text-[1.15rem] leading-tight transition-all duration-300 ${
                (on ? 'text-cream/90' : 'text-cream/40') + ' group-hover:text-[var(--accent)]'
              }`}
            >
              {c.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  const fadeUp = (delay = 0) =>
    ({
      initial: reduce ? false : { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-10% 0px' },
      transition: { duration: 0.8, ease: EASE, delay },
    }) as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: closing ? 0.4 : 0.2 }}
      style={{ background: project.world?.base ?? '#08080a' }}
      onMouseMove={(e) => {
        pointerX.set(e.clientX);
        pointerY.set(e.clientY);
      }}
      className="fixed inset-0 z-50 text-cream"
    >
      {/* On small screens the label and close button sit over scrolling text, so a soft dark fade sits behind them */}
      <div
        aria-hidden="true"
        className="lg:hidden absolute inset-x-0 top-0 h-24 z-[65] pointer-events-none bg-gradient-to-b from-base via-base/92 via-55% to-transparent"
      />

      {/* Close, fixed over everything */}
      <CloseButton
        reduce={reduce}
        label="Close case study"
        onClick={() => {
          soundFx.playTick();
          requestClose();
        }}
      />

      {/* Small project label, top-left (stacked layout only; the split layout has a big title in its panel) */}
      {!split && (
        <motion.div
          style={{ opacity: labelOpacity }}
          className="absolute top-7 left-6 sm:top-9 sm:left-10 z-[70] pointer-events-none [text-shadow:0_1px_14px_rgba(0,0,0,0.6)]"
        >
          <span className="font-editorial-serif font-medium text-2xl text-cream">{project.displayTitle}</span>
        </motion.div>
      )}

      {/* Chapter index, floating on the left (only when the layout is not split) */}
      {!split && (
        <motion.nav
          aria-label="Chapters"
          style={{ opacity: navOpacity, pointerEvents: navEvents }}
          className="hidden xl:block absolute left-14 top-1/2 -translate-y-1/2 z-[60]"
        >
          {chapterTree}
        </motion.nav>
      )}

      {/* The pinned left panel of the split layout: the overview stuff, which stays put while the
          story scrolls on the right */}
      {split && (
        <aside
          style={{ width: L.left, background: `${project.world?.base ?? '#08080a'}${project.world?.backdrop ? (project.world.soften ? '82' : '8c') : 'd9'}` }}
          onMouseEnter={() => setPanelHot(true)}
          onMouseLeave={() => setPanelHot(false)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            panelMX.set(e.clientX - r.left);
            panelMY.set(e.clientY - r.top);
          }}
          className={`absolute left-0 top-0 bottom-0 z-[60] flex flex-col pl-14 pr-10 pb-12 [@media(max-height:760px)]:pb-8 [@media(max-height:660px)]:pb-6 border-r backdrop-blur-md overflow-hidden transition-colors duration-(--dur-hover) ${
            panelHot ? 'border-white/30' : 'border-white/[0.12]'
          }`}
        >
          {/* the soft light that follows the pointer while it is over this side */}
          {!reduce && (
            <motion.div
              aria-hidden="true"
              style={{ left: spotLeft, top: spotTop }}
              animate={{ opacity: panelHot ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              className="absolute w-[460px] h-[460px] rounded-full pointer-events-none z-0 bg-[radial-gradient(circle,rgba(255,255,255,0.075),transparent_65%)]"
            />
          )}

          {/* Reading progress, on the panel's own edge: a line that fills as you scroll the story. It takes the
              project's colour while it, or the chapter list, is hovered */}
          <motion.span
            aria-hidden="true"
            style={{
              scaleY: scrollYProgress,
              originY: 0,
              background: lineHot ? glow ?? '#ffffff' : undefined,
              boxShadow: lineHot && glow ? `0 0 10px ${glow}88` : undefined,
            }}
            className={`absolute right-[-1px] top-0 bottom-0 w-px transition-[background-color,box-shadow] duration-(--dur-hover) ${panelHot ? 'bg-white/90' : 'bg-white/55'}`}
          />
          <span
            aria-hidden="true"
            onMouseEnter={() => setLineHot(true)}
            onMouseLeave={() => setLineHot(false)}
            className="absolute right-0 top-0 bottom-0 w-4"
          />

          {/* The free height is shared out above and below the name block, a little more above, so the block sits
              lower than the top and never crowds the facts. Each space has a floor, so it always fits. */}
          <div aria-hidden="true" className="min-h-14 [@media(max-height:660px)]:min-h-10 grow-[1.4] basis-0" />

          {/* top: the name and what the project is */}
          <div className="relative z-10">
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.7 }}
              className="font-editorial-serif font-medium text-[clamp(4.5rem,7.2vw,7.5rem)] [@media(max-height:760px)]:text-[clamp(3.6rem,min(7.2vw,12vh),7.5rem)] leading-[0.88] tracking-[-0.03em] text-cream [text-shadow:0_6px_30px_rgba(0,0,0,0.5)]"
            >
              {project.displayTitle}
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
              className="mt-6 text-[1.35rem] [@media(max-height:760px)]:mt-4 [@media(max-height:760px)]:text-[1.2rem] [@media(max-height:660px)]:mt-3 [@media(max-height:660px)]:text-[1.05rem] leading-[1.55] text-white/95 max-w-[27rem] [text-shadow:0_2px_10px_rgba(0,0,0,0.85)]"
            >
              {project.tagline}
            </motion.p>

            {/* the chapters: click one to go there. The line lights up to the one being read */}
            <motion.nav
              aria-label="Chapters"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}
              onMouseEnter={() => setLineHot(true)}
              onMouseLeave={() => setLineHot(false)}
              className="mt-12 [@media(max-height:760px)]:mt-7 [@media(max-height:660px)]:mt-4"
            >
              {chapterTree}
            </motion.nav>
          </div>

          <div aria-hidden="true" className="min-h-4 grow basis-0" />

          {/* bottom: the facts, anchored to the foot of the panel */}
          <FactsBlock reduce={reduce} project={project} />
        </aside>
      )}

      {/* The page's atmosphere: a soft light from above and a vignette, plus (for projects with a
          world) a very faint haze of the project's glow colour rising from the bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,255,255,0.03), transparent 70%), radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      {project.world?.backdrop ? (
        /* The Library background from the Talos landing page: ruins in fog, dark at the left and at
           the top and bottom, rising slowly as you scroll. It replaces the skill-tree world. */
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div style={{ y: libY }} className="absolute -inset-[5%]">
            <img
              src={project.world.backdrop}
              alt=""
              className="w-full h-full object-cover object-center opacity-90"
              style={project.world.soften ? { filter: `blur(${project.world.soften.blur}px) brightness(${project.world.soften.dim})` } : undefined}
            />
            {/* a wash of the project's colour over the picture, when the project asks for one */}
            {project.world.tint ? (
              <div className="absolute inset-0" style={{ background: project.world.glow, mixBlendMode: 'color', opacity: project.world.tint }} />
            ) : null}
            <div className="absolute inset-0 bg-radial-[circle_at_60%_45%] from-transparent via-ink/30 to-ink/70 opacity-40" />
            <div className="absolute inset-0" style={{ background: project.world.soften ? `linear-gradient(to right, ${project.world.base}a3 0%, rgba(3,4,6,0.31) 30%, transparent 80%)` : `linear-gradient(to right, ${project.world.base}a6 0%, rgba(3,4,6,0.35) 30%, transparent 80%)` }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${project.world.base} 0%, transparent 38%, transparent 62%, ${project.world.base} 100%)` }} />
          </motion.div>
          <div className="absolute inset-0 bg-ink/15" />
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 60px 100px -40px rgba(0,0,0,0.6)' }} />
        </div>
      ) : (
        <>
          {glow && (
            <motion.div
              aria-hidden="true"
              style={{
                x: glowX,
                background: `radial-gradient(ellipse 70% 60% at 50% 100%, ${glow}1f, transparent 70%)`,
              }}
              className="absolute -inset-x-[12%] bottom-0 h-[75%] pointer-events-none"
            />
          )}
          {glow && !reduce && !project.world?.plain && (
            <ProjectWorld
              scrollY={scrollY}
              mouseX={pointerX}
              mouseY={pointerY}
              glow={glow}
              chapterIndex={activeIndex}
            />
          )}
        </>
      )}

      <div
        ref={scroller}
        style={split ? { left: L.left } : undefined}
        className={`absolute overflow-y-auto overflow-x-hidden ${split ? 'top-0 bottom-0 right-0' : 'inset-0'}`}
      >
        <div style={split ? { paddingLeft: L.padL, paddingRight: L.padR } : undefined}>
        {split ? (
          /* ------------------------- HERO, IN THE COLUMN ------------------------- */
          <div
            ref={heroFrameRef}
            style={{ marginTop: L.top, height: L.hero.height }}
            className="relative w-full overflow-hidden rounded-sm shadow-card"
          >
            {heroMedia}
          </div>
        ) : (
          /* ------------------------------ HEADER ------------------------------ */
          /* A clean full-screen image, identical to the one the click zoom ends on, so the zoom flows
             straight into the page. Nothing sits on it; the title comes right after. */
          <header
            ref={heroRef}
            style={{
              marginTop: stackedHero(vw, typeof window === 'undefined' ? 900 : window.innerHeight).top,
              height: stackedHero(vw, typeof window === 'undefined' ? 900 : window.innerHeight).height,
            }}
            className="relative w-full overflow-hidden"
          >
            <motion.div style={{ y: heroY }} className="absolute inset-0">
              {heroMedia}
            </motion.div>
            <motion.div style={{ opacity: heroDim }} className="absolute inset-0 bg-base pointer-events-none" />
          </header>
        )}

        {/* ------------------------------- BODY ------------------------------- */}
        <RevealCtx.Provider value={{ container: scroller, reduce }}>
        <main className="relative">
          {/* Tagline, first thing after the image (the title lives in the corner label) */}
          {!split && (
          <section className={`${pad} pt-20 sm:pt-32`}>
            <motion.h1
              {...fadeUp()}
              className="mb-7 font-editorial-serif font-medium text-[clamp(3.6rem,17vw,6rem)] leading-[0.9] tracking-[-0.03em] text-cream"
            >
              {project.displayTitle}
            </motion.h1>
            <motion.p {...fadeUp(0.1)} className="max-w-xl text-xl sm:text-2xl text-cream/80 leading-relaxed">
              {project.tagline}
            </motion.p>
          </section>
          )}

          {/* Facts strip */}
          {!split && (
          <section className={`${pad} pt-20 pb-8`}>
            <motion.dl
              {...fadeUp()}
              className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 border-t border-white/10 pt-8 max-w-5xl"
            >
              {[
                ['Client', project.client],
                ['Role', project.role ?? '—'],
                ['Year', project.year],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] font-mono tracking-[0.25em] uppercase text-cream/60">{k}</dt>
                  <dd className="mt-2 font-editorial-serif font-semibold text-2xl text-white">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="text-[10px] font-mono tracking-[0.25em] uppercase text-cream/60">Stack</dt>
                <dd className="mt-3">
                  {project.stack && project.stack.length > 0 ? (
                    <StackIcons stack={project.stack} />
                  ) : (
                    <span className="font-mono text-sm text-cream/70">{project.tools.join(' · ')}</span>
                  )}
                </dd>
              </div>
            </motion.dl>
          </section>
          )}

          {/* 01 Overview */}
          {(() => {
            const s = project.story?.overview;
            return (
              <Chapter reduce={reduce} id="overview" name="Overview" className={`${pad} py-24 sm:py-32 scroll-mt-0`}>
                {s ? (
                  <>
                    <FloatHeadline className={HEADLINE} container={scroller} reduce={reduce}>{s.headline}</FloatHeadline>
                    <div className="mt-8"><ScrollText text={s.body} highlight={s.highlight} className={BODY} container={scroller} reduce={reduce} /></div>
                  </>
                ) : (
                  <motion.p {...fadeUp(0.05)} className={LEAD}>{project.overview}</motion.p>
                )}
              </Chapter>
            );
          })()}

          {/* Full-bleed image break */}
          <RevealFrame from="focus" duration={1.1} ease={[0.22, 1, 0.36, 1]} zoom={1.08} className="aspect-[21/9] max-sm:!w-[calc(100%-3rem)] max-sm:mx-auto">
            {breakImage?.url ? (
              <img src={breakImage.url} alt={breakImage.title} decoding="async" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <ProjectCardArtwork project={project} slot="left" />
            )}
          </RevealFrame>

          {/* 02 Approach */}
          {(() => {
            const s = project.story?.approach;
            return (
              <Chapter reduce={reduce} id="approach" name="Approach" className={`${pad} py-24 sm:py-32`}>
                {s ? (
                  <>
                    <FloatHeadline className={HEADLINE} container={scroller} reduce={reduce}>{s.headline}</FloatHeadline>
                    <div className="mt-8"><ScrollText text={s.body} highlight={s.highlight} className={BODY} container={scroller} reduce={reduce} /></div>
                  </>
                ) : (
                  <motion.p {...fadeUp(0.05)} className={BODY}>{project.description}</motion.p>
                )}
                {project.story?.insights && (
                  <div className="mt-14">
                    <Label variant="serif">What we found</Label>
                    <StepList items={project.story.insights.map(splitFinding)} accent={glow ?? '#f4f3f0'} reduce={reduce} />
                  </div>
                )}
                {project.story?.research && (
                  <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-[44rem]">
                    {project.story.research.map((r, i) => (
                      <motion.figure
                        key={r.url}
                        initial={reduce ? false : { opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-6% 0px' }}
                        transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
                        className={project.story!.research!.length % 2 === 1 && i === 0 ? 'sm:col-span-2' : ''}
                      >
                        <img src={r.url} alt={r.title} loading="lazy" decoding="async" className="w-full h-auto rounded-frame border border-white/12 bg-white/[0.04]" />
                        <figcaption className="mt-3 font-mono text-caption uppercase tracking-[0.2em] text-white/62">{r.title}</figcaption>
                      </motion.figure>
                    ))}
                  </div>
                )}
              </Chapter>
            );
          })()}

          {project.story?.statement && (
            <div className={pad}>
              <Statement text={project.story.statement.text} note={project.story.statement.note} fadeUp={fadeUp} container={scroller} reduce={reduce} />
            </div>
          )}

          {/* 03 The work */}
          <section id="work" className={`${pad} py-24 sm:py-32`}>
            {project.story?.work ? (
              <Chapter reduce={reduce} name="The work" className="mb-16 sm:mb-24">
                <FloatHeadline className={HEADLINE} container={scroller} reduce={reduce}>{project.story.work.headline}</FloatHeadline>
                <div className="mt-8"><ScrollText text={project.story.work.body} highlight={project.story.work.highlight} className={BODY} container={scroller} reduce={reduce} /></div>
              </Chapter>
            ) : (
              <div className="mb-7"><ChapterMarker n="The work" /></div>
            )}
            {project.story?.process && (
              <div className="mb-16 sm:mb-24 min-[1280px]:pl-[5rem]">
                <Label variant="serif">How it came together</Label>
                {project.story.process.some((s) => s.image) ? (
                  PROCESS_LAYOUT === 'collage' ? (
                    <ProcessCollage items={project.story.process} accent={glow ?? '#f4f3f0'} reduce={reduce} />
                  ) : (
                    <ProcessStage items={project.story.process} accent={glow ?? '#f4f3f0'} reduce={reduce} container={scroller} />
                  )
                ) : (
                  <StepList items={project.story.process} accent={glow ?? '#f4f3f0'} reduce={reduce} />
                )}
              </div>
            )}
            {hasReal ? (
              <div className="flex flex-col gap-16 sm:gap-24 max-w-6xl">
                {breakImage && !project.story?.work && (
                  <motion.div {...fadeUp()} className="max-w-[36rem]">
                    <p className="font-editorial-serif font-semibold text-[1.5rem] leading-tight text-white mb-2 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">{breakImage.title}</p>
                    <p className={BODY}>{breakImage.description}</p>
                  </motion.div>
                )}
                {moreWide.map((g) => (
                  <motion.div key={g.title} {...fadeUp()}>
                    <GalleryFrame url={g.url} title={g.title} description={g.description} />
                  </motion.div>
                ))}
                {squareImages.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                    {squareImages.map((g, i) => (
                      <motion.div key={g.title} {...fadeUp(i * 0.08 + 0.5)}>
                        <figure>
                          <RevealFrame from="bottom" delay={i * 0.2} className="aspect-[4/5]">
                            <img src={g.url} alt={g.title} decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                          </RevealFrame>
                          <figcaption className="mt-4 [text-shadow:0_2px_10px_rgba(0,0,0,0.7)]">
                            <span className="block font-editorial-serif font-semibold text-body leading-tight text-white">{g.title}</span>
                            <span className="block mt-1.5 text-[0.95rem] font-normal leading-relaxed text-white/78">{g.description}</span>
                          </figcaption>
                        </figure>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
            <div className="flex flex-col gap-16 sm:gap-24 max-w-6xl">
              <motion.div {...fadeUp()}>
                <GalleryFrame title={project.images.topRight.alt} description={project.images.topRight.caption} />
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
                <motion.div {...fadeUp()} className="md:col-span-5">
                  <GalleryFrame
                    title={project.images.left.alt}
                    description={project.images.left.caption}
                    aspect="aspect-[3/4]"
                  />
                </motion.div>
                <motion.div {...fadeUp(0.08)} className="md:col-span-7">
                  <GalleryFrame
                    title={project.images.bottomRight.alt}
                    description={project.images.bottomRight.caption}
                    aspect="aspect-[4/3]"
                  />
                </motion.div>
              </div>
              {project.galleryImages.map((g) => (
                <motion.div key={g.title} {...fadeUp()}>
                  <GalleryFrame url={g.url} title={g.title} description={g.description} />
                </motion.div>
              ))}
            </div>
            )}
          </section>

          {/* 04 Outcome */}
          <section id="outcome" className={`${pad} py-24 sm:py-32 border-t border-white/10`}>
            <div className="mb-7"><ChapterMarker n="Outcome" /></div>
            {project.story?.outcome?.summary && (
              <motion.p {...fadeUp()} className={`${LEAD} max-w-[40rem] mb-14`}>{project.story.outcome.summary}</motion.p>
            )}
            {project.story?.outcome?.stats && (
              <div className="mb-16 max-w-[44rem] grid gap-x-10 gap-y-10 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] border-t border-white/12 pt-10">
                {project.story.outcome.stats.map((s, i) => (
                  <motion.div key={s.label} {...fadeUp(i * 0.08)}>
                    <p className="font-editorial-serif font-semibold text-[clamp(2.8rem,4.4vw,4rem)] leading-none tracking-[-0.02em] [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]" style={{ color: glow ?? '#f4f3f0' }}>
                      {s.value}
                    </p>
                    <p className="mt-3 font-mono text-caption uppercase tracking-[0.2em] text-white/80">{s.label}</p>
                    <p className="mt-2 font-normal text-[0.98rem] leading-[1.6] text-white/70 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">{s.note}</p>
                  </motion.div>
                ))}
              </div>
            )}
            {project.story?.outcome?.reflection && (
              <motion.div {...fadeUp()} className="max-w-[40rem] mb-16">
                <Label>Reflection</Label>
                <p className="font-editorial-serif font-semibold text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.35] text-white/95 [text-shadow:0_2px_16px_rgba(0,0,0,0.7)]">
                  {project.story.outcome.reflection}
                </p>
              </motion.div>
            )}
            {project.story?.outcome?.next && (
              <motion.div {...fadeUp()} className="max-w-[40rem] mb-16">
                <Label>What’s next</Label>
                <p className={BODY}>{project.story.outcome.next}</p>
              </motion.div>
            )}
            <div>
              <Label>Delivered</Label>
              <motion.ul {...fadeUp()} className="max-w-[36rem] border-t border-white/12" aria-label="Deliverables">
                {project.deliverables.map((d, i) => (
                  <motion.li
                    key={d}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-6% 0px' }}
                    transition={{ duration: 0.8, ease: EASE, delay: i * 0.09 }}
                    className="py-4 border-b border-white/12 font-normal text-body leading-snug text-white/78 [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]"
                  >
                    {d}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </section>

          {/* Next project */}
          <section className="border-t border-white/10">
            <div className={`${pad} py-20 sm:py-28`}>
              {nextProject ? (
                <NextProject next={nextProject} accent={glow ?? '#f4f3f0'} reduce={reduce} onGo={onGoNext} />
              ) : (
                <button
                  onClick={() => {
                    soundFx.playOpen();
                    onNavigateNext();
                  }}
                  className="group flex items-center gap-6 font-editorial-serif font-semibold text-[clamp(2.5rem,8vw,7rem)] leading-none text-cream/80 hover:text-cream transition-colors cursor-pointer"
                >
                  Next
                  <ArrowRight className="w-[0.6em] h-[0.6em] transition-transform duration-(--dur-hover) group-hover:translate-x-3" strokeWidth={1} />
                </button>
              )}
            </div>
            <div className={`${pad} pb-12 flex items-center justify-between text-caption font-mono tracking-wider text-cream/40`}>
              <span>← → to switch project · Esc to close</span>
              <button
                onClick={() => scroller.current?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
                className="inline-flex items-center gap-2 hover:text-cream transition-colors cursor-pointer"
              >
                Back to top <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </section>
        </main>
        </RevealCtx.Provider>
        </div>
      </div>

      {closing &&
        createPortal(
          <motion.div
            initial={{ left: closeFrom?.left ?? 0, top: closeFrom?.top ?? 0, width: closeFrom?.width ?? window.innerWidth, height: closeFrom?.height ?? window.innerHeight, opacity: 0 }}
            animate={{
              left: closing.left,
              top: closing.top,
              width: closing.width,
              height: closing.height,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              left: { duration: 0.8, ease: ZOOM_EASE },
              top: { duration: 0.8, ease: ZOOM_EASE },
              width: { duration: 0.8, ease: ZOOM_EASE },
              height: { duration: 0.8, ease: ZOOM_EASE },
              opacity: { duration: 0.84, times: [0, 0.1, 0.88, 1] },
            }}
            className="fixed z-[80] overflow-hidden pointer-events-none"
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.8, times: [0, 0.3, 1], ease: ZOOM_EASE }}
            >
              {/* underneath: the video's own picture at the moment of closing, so nothing else shows while
                  the video behind it loads and seeks */}
              {closeFrame ? (
                <img src={closeFrame} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                !(project.heroVideo && videoReady) && <ProjectCardArtwork project={project} slot="topRight" hideLabel />
              )}
              {project.heroVideo && videoReady && (
                <video
                  ref={(el) => {
                    heroVideoRegistry.closeGhost = el;
                  }}
                  src={project.heroVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={(e) => {
                    // carry on from where the page's video is, so the shrinking image keeps playing
                    const t0 = heroVideoRef.current?.currentTime;
                    if (t0 != null) e.currentTarget.currentTime = t0;
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </motion.div>
          </motion.div>,
          document.body
        )}
    </motion.div>
  );
};

export const CaseStudyPage: React.FC<CaseStudyPageProps> = (props) => {
  // The zoom to the next project lives out here, so it keeps running while the old page leaves and the
  // new one arrives
  const [zoom, setZoom] = useState<ZoomState | null>(null);
  const busy = useRef(false);

  const goNext = (rect: DOMRect) => {
    const next = props.nextProject;
    if (busy.current) return;
    soundFx.playOpen();
    if (!next || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      props.onNavigateNext();
      return;
    }
    busy.current = true;
    heroVideoRegistry.frame = null;
    setZoom({ project: next, rect, time: 0, at: performance.now(), frame: null });
    window.setTimeout(() => props.onNavigateNext(), 650);
    window.setTimeout(() => {
      setZoom(null);
      busy.current = false;
    }, 1500);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {props.project && <Page key={props.project.id} {...props} project={props.project} onGoNext={goNext} />}
      </AnimatePresence>
      {zoom && <ZoomGhost zoom={zoom} />}
    </>
  );
};
