import React, { useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GUIDES, NAME_CLASS, STREAK_LINES } from './HieiHero';
import { setIntroLifted } from '../utils/introState';
import { EASE, EASE_TRAVEL } from './ui';

// The welcome. On black, the name draws itself as an outline with its guide lines (the same skeleton you see when you
// hover it), four corner brackets close in to frame it, the letters fill in solid, and the screen lifts to show the
// painting. It lands exactly where the real name sits, so there is no jump. It plays every time the page loads, any key
// or click skips it, and it is left out for people who prefer reduced motion.
//
//   0.0s  outline draws, guide lines run across
//   0.5s  brackets close in
//   1.2s  letters fill, guides fade
//   1.5s  the screen lifts
//   2.3s  done
export const shouldPlayIntro = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true; // it plays on every load and refresh
};

type Phase = 'draw' | 'lock' | 'fill' | 'lift';

export const Intro: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [phase, setPhase] = useState<Phase>('draw');
  const skipped = React.useRef(false);
  const [spot, setSpot] = useState<{ left: number; top: number; width: number; fs: number } | null>(null);

  // Find where the real name sits, so the intro's copy lands exactly on it. The name can still move a little while the
  // page loads (the fonts arrive and the text re-wraps), so measure again when the fonts are ready and as the
  // intro goes on, and settle on the last place it was.
  const measure = React.useCallback(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return false;
    const r = h1.getBoundingClientRect();
    // the real name is still rising into place (it starts 30px low), so take its own movement off to find where it
    // will come to rest
    let dx = 0;
    let dy = 0;
    for (let el: Element | null = h1; el && el !== document.body; el = el.parentElement) {
      const tf = getComputedStyle(el).transform;
      if (tf && tf !== 'none') {
        const m = new DOMMatrixReadOnly(tf);
        dx += m.m41;
        dy += m.m42;
      }
    }
    const next = { left: r.left - dx, top: r.top - dy, width: r.width, fs: parseFloat(getComputedStyle(h1).fontSize) || 160 };
    // keep the same object when nothing has really moved, so nothing downstream restarts
    setSpot((prev) =>
      prev && Math.abs(prev.left - next.left) < 0.5 && Math.abs(prev.top - next.top) < 0.5 && Math.abs(prev.width - next.width) < 0.5 && prev.fs === next.fs ? prev : next
    );
    return true;
  }, []);

  useLayoutEffect(() => {
    if (!measure()) onDone();
    document.fonts?.ready.then(measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (phase === 'lock' || phase === 'fill') measure();
  }, [phase, measure]);

  // the painting waits (dark and soft) until the screen lifts
  useEffect(() => {
    setIntroLifted(false);
    return () => setIntroLifted(true);
  }, []);
  useEffect(() => {
    if (phase === 'lift') setIntroLifted(true);
  }, [phase]);

  // Hold the page still while it plays. The scroll is blocked, not hidden: turning overflow off removes the scrollbar and
  // turning it back on shifts the whole layout sideways by its width, which showed up as a jitter at the end.
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    const keys = (e: KeyboardEvent) => {
      if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('wheel', stop, { passive: false });
    window.addEventListener('touchmove', stop, { passive: false });
    window.addEventListener('keydown', keys);
    return () => {
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', keys);
    };
  }, []);

  // the timeline starts once, as soon as the name has been found
  const ready = !!spot;
  useEffect(() => {
    if (!ready) return;
    const go = (p: Phase) => () => !skipped.current && setPhase(p);
    const ids = [
      window.setTimeout(go('lock'), 500),
      window.setTimeout(go('fill'), 1200),
      window.setTimeout(go('lift'), 1500),
      window.setTimeout(onDone, 2400),
    ];
    return () => ids.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // any key or click skips ahead to the lift
  useEffect(() => {
    const skip = () => {
      skipped.current = true;
      setPhase('lift');
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);
  useEffect(() => {
    if (phase !== 'lift') return;
    // if it was skipped, finish soon after the lift begins
    const id = window.setTimeout(onDone, 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!spot) return <div className="fixed inset-0 z-[100] bg-base" />;

  const filled = phase === 'fill' || phase === 'lift';
  const lifting = phase === 'lift';
  const rows = window.innerWidth < 640 ? 1 : 2;
  const lineH = spot.fs * 0.86;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // the frame the brackets close onto (8px of room round the name), and where they start
  const target = { left: spot.left - 8, top: spot.top - 8, width: spot.width + 16, height: lineH * rows + spot.fs * 0.1 + 16 };
  const start = { left: vw * 0.08, top: vh * 0.1, width: vw * 0.84, height: vh * 0.8 };
  const closed = phase !== 'draw';

  const arm = 16;
  const line = '1.5px solid rgba(244,243,240,0.9)';
  const corner = (pos: React.CSSProperties, border: React.CSSProperties) => (
    <span aria-hidden="true" className="absolute block" style={{ width: arm, height: arm, ...pos, ...border }} />
  );

  return (
    <div data-intro className="fixed inset-0 z-[100]" aria-hidden="true">
      {/* the black screen, lifting at the end to show the painting */}
      <motion.div
        className="absolute inset-0 bg-base"
        initial={{ opacity: 1 }}
        animate={{ opacity: lifting ? 0 : 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* a warm light comes in from the right, like sun through a doorway, ahead of the painting */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 62% 55% at 84% 36%, rgba(255,190,115,0.2), rgba(255,170,90,0.07) 45%, transparent 72%)' }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: lifting ? 0 : 1, scale: lifting ? 1.08 : 1 }}
        transition={{ duration: lifting ? 0.8 : 1.3, delay: lifting ? 0 : 0.25, ease: EASE }}
      />

      {/* the grid draws itself across the black (the same hairlines the hero carries), each with a light travelling
          along it; they hand over to the hero's own lines as the screen lifts */}
      <motion.div animate={{ opacity: lifting ? 0 : 1 }} transition={{ duration: 0.6 }} className="absolute inset-0">
        {STREAK_LINES.map((l, i) => {
          const h = l.axis === 'h';
          const draw = { duration: 1.1, delay: 0.15 + i * 0.12, ease: EASE };
          return (
            <React.Fragment key={`${l.axis}-${l.pos}`}>
              <motion.span
                className="absolute block bg-cream/16"
                style={h ? { left: 0, right: 0, top: l.pos, height: 1, originX: l.reverse ? 1 : 0 } : { top: 0, bottom: 0, left: l.pos, width: 1, originY: l.reverse ? 1 : 0 }}
                initial={h ? { scaleX: 0 } : { scaleY: 0 }}
                animate={h ? { scaleX: 1 } : { scaleY: 1 }}
                transition={draw}
              />
              <motion.span
                className="absolute block"
                style={
                  h
                    ? { top: l.pos, left: 0, width: 120, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.8), transparent)' }
                    : { left: l.pos, top: 0, height: 120, width: 1, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.8), transparent)' }
                }
                initial={h ? { x: l.reverse ? vw : -120, opacity: 0 } : { y: l.reverse ? vh : -120, opacity: 0 }}
                animate={
                  h
                    ? { x: l.reverse ? -120 : vw, opacity: [0, 1, 1, 0] }
                    : { y: l.reverse ? -120 : vh, opacity: [0, 1, 1, 0] }
                }
                transition={{ duration: 1.5, delay: 0.5 + i * 0.12, ease: [0.45, 0, 0.25, 1], opacity: { duration: 1.5, delay: 0.5 + i * 0.12, times: [0, 0.15, 0.85, 1] } }}
              />
            </React.Fragment>
          );
        })}
      </motion.div>

      {/* the guide lines run across, then fade once the letters fill */}
      <motion.div animate={{ opacity: filled ? 0 : 1 }} transition={{ duration: 0.35 }} className="absolute inset-0">
        {Array.from({ length: rows }).flatMap((_, row) =>
          GUIDES.map((g, i) => (
            <motion.span
              key={`${row}-${g.label}`}
              className="absolute block h-px origin-left bg-cream/35"
              style={{ left: spot.left - 28, width: spot.width + 56, top: spot.top + lineH * (row + g.at) }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.05 + i * 0.05, ease: EASE }}
            />
          ))
        )}
      </motion.div>

      {/* the name: outline first, then solid */}
      <motion.div
        className={`${NAME_CLASS} absolute`}
        style={{ left: spot.left, top: spot.top, fontSize: spot.fs, WebkitTextStroke: '1px var(--st)', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.55))' }}
        initial={{ clipPath: 'inset(-5% 100% -5% -5%)', color: 'rgba(244,243,240,0)', ['--st' as string]: 'rgba(244,243,240,0.95)' }}
        animate={{
          clipPath: 'inset(-5% -5% -5% -5%)',
          color: filled ? 'rgba(244,243,240,0.9)' : 'rgba(244,243,240,0)',
          ['--st' as string]: filled ? 'rgba(244,243,240,0)' : 'rgba(244,243,240,0.95)',
        }}
        transition={{
          clipPath: { duration: 0.85, ease: EASE },
          color: { duration: 0.4 },
        }}
      >
        <span className="block max-sm:inline">Jonte</span>{' '}
        <span className="block max-sm:inline">Taffe</span>
      </motion.div>

      {/* the corner brackets close in on the name */}
      <motion.div
        className="absolute"
        initial={{ ...start, opacity: 0 }}
        animate={closed ? { ...target, opacity: lifting ? 0 : 1 } : { ...start, opacity: 0.6 }}
        transition={{ duration: lifting ? 0.35 : 0.7, ease: EASE_TRAVEL, opacity: { duration: lifting ? 0.35 : 0.4 } }}
      >
        {corner({ top: 0, left: 0 }, { borderTop: line, borderLeft: line })}
        {corner({ top: 0, right: 0 }, { borderTop: line, borderRight: line })}
        {corner({ bottom: 0, left: 0 }, { borderBottom: line, borderLeft: line })}
        {corner({ bottom: 0, right: 0 }, { borderBottom: line, borderRight: line })}
      </motion.div>
    </div>
  );
};
