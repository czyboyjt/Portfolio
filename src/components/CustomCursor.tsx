import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

// The cursor is a viewfinder: four small corner brackets around the pointer. Over something you can click they
// open out and frame it exactly (like a camera finding focus), and let go when you move off. Over something
// very large they only grow, so they never wrap half the screen. Pressing closes them in a little.

const REST = 24; // size of the frame at rest
const GROW = 38; // size over a large clickable thing
const PAD = 8; // breathing room around a framed element
const MAX_FRAME_W = 560;
const MAX_FRAME_H = 360;
const INTERACTIVE = 'button, a, [data-cursor], [role="button"]';

// The word shown with the frame: what a click on this thing will do. An element can set its own with
// data-cursor-label; otherwise it is worked out from what the element is. Nothing is shown when unsure.
const labelFor = (el: HTMLElement): string => {
  const own = el.getAttribute('data-cursor-label');
  if (own !== null) return own;
  const aria = el.getAttribute('aria-label') ?? '';
  const href = el.getAttribute('href') ?? '';
  const text = (el.textContent ?? '').trim();
  if (/^enlarge/i.test(aria)) return 'zoom';
  if (/say hi|contact card/i.test(aria)) return ''; // the pill already says it
  if (/^next project/i.test(aria)) return 'next';
  if (/^open .* case study/i.test(aria)) return 'open';
  if (/^copy/i.test(aria) || /^copy$/i.test(text)) return 'copy';
  if (/close/i.test(aria) || /^close$/i.test(text)) return 'close';
  if (href.startsWith('mailto:')) return ''; // an email link needs no word
  if (/^https?:/i.test(href)) return 'visit';
  if (el.closest('nav[aria-label="Selected work"]')) return 'view';
  if (el.hasAttribute('data-stage-hero') || el.closest('[data-stage-hero]')) return 'open';
  if (/view case study/i.test(text)) return 'open';
  if (/view selected work/i.test(text)) return 'explore';
  if (/back to top/i.test(text)) return 'up';
  return '';
};

export const CustomCursor: React.FC = () => {
  const reduce = !!useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [framing, setFraming] = useState(false);
  const [label, setLabel] = useState('');
  const [above, setAbove] = useState(false);
  const hovered = useRef<HTMLElement | null>(null);
  const pointer = useRef({ x: -100, y: -100 });

  // the pointer itself (no lag) and the frame's centre and size (on springs)
  const px = useMotionValue(-100);
  const py = useMotionValue(-100);
  const cfg = reduce ? { stiffness: 1200, damping: 120 } : { stiffness: 380, damping: 30, mass: 0.6 };
  const fx = useSpring(useMotionValue(-100), cfg);
  const fy = useSpring(useMotionValue(-100), cfg);
  const fw = useSpring(useMotionValue(REST), { ...cfg, stiffness: 320, damping: 28 });
  const fh = useSpring(useMotionValue(REST), { ...cfg, stiffness: 320, damping: 28 });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    // where the frame should be, given the pointer and whatever it is over
    const aim = () => {
      const { x, y } = pointer.current;
      const el = hovered.current;
      setLabel(el && el.isConnected ? labelFor(el) : '');
      // the label goes under the frame unless that would run off the bottom of the screen
      const bottom = el && el.isConnected ? Math.min(el.getBoundingClientRect().bottom + PAD, y + 400) : y + GROW / 2;
      setAbove(bottom > window.innerHeight - 34);
      if (el && el.isConnected) {
        const r = el.getBoundingClientRect();
        const big = r.width > MAX_FRAME_W || r.height > MAX_FRAME_H;
        if (!big && r.width > 0 && r.height > 0) {
          fx.set(r.left + r.width / 2);
          fy.set(r.top + r.height / 2);
          fw.set(r.width + PAD * 2);
          fh.set(r.height + PAD * 2);
          setFraming(true);
          return;
        }
        fx.set(x);
        fy.set(y);
        fw.set(GROW);
        fh.set(GROW);
        setFraming(false);
        return;
      }
      fx.set(x);
      fy.set(y);
      fw.set(REST);
      fh.set(REST);
      setFraming(false);
    };

    const onMove = (e: MouseEvent) => {
      setIsVisible(true);
      pointer.current = { x: e.clientX, y: e.clientY };
      px.set(e.clientX);
      py.set(e.clientY);
      hovered.current = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE) as HTMLElement | null;
      aim();
    };
    // a framed thing can move under a still pointer (scrolling, animating), so keep the frame on it
    const onScroll = () => hovered.current && aim();
    // things also slide in and out under a still pointer (the stage cards, panels opening), so look again now
    // and then, not only when the mouse moves
    const recheck = window.setInterval(() => {
      const { x, y } = pointer.current;
      if (x < 0 || y < 0) return;
      const el = document.elementFromPoint(x, y)?.closest?.(INTERACTIVE) as HTMLElement | null;
      if (el !== hovered.current) {
        hovered.current = el;
        aim();
      } else if (el) aim();
    }, 140);
    const onLeave = () => {
      setIsVisible(false);
      hovered.current = null;
    };
    const onEnter = () => setIsVisible(true);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    return () => {
      window.clearInterval(recheck);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, [px, py, fx, fy, fw, fh]);

  if (isTouchDevice || !isVisible) return null;

  const arm = 9; // length of each bracket arm
  const line = '1.5px solid rgba(244,243,240,0.95)';
  const corner = (pos: React.CSSProperties, border: React.CSSProperties) => (
    <span aria-hidden="true" className="absolute block" style={{ width: arm, height: arm, ...pos, ...border }} />
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">
      {/* the frame */}
      <motion.div
        style={{ x: fx, y: fy, width: fw, height: fh, translateX: '-50%', translateY: '-50%', filter: 'drop-shadow(0 0 1.5px rgba(0,0,0,0.75))' }}
        className="absolute left-0 top-0"
      >
        <motion.div
          animate={{ scale: pressed ? 0.88 : 1 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-full"
        >
          {corner({ top: 0, left: 0 }, { borderTop: line, borderLeft: line })}
          {corner({ top: 0, right: 0 }, { borderTop: line, borderRight: line })}
          {corner({ bottom: 0, left: 0 }, { borderBottom: line, borderLeft: line })}
          {corner({ bottom: 0, right: 0 }, { borderBottom: line, borderRight: line })}
        </motion.div>

        {/* what a click will do, in italic serif, just outside the frame */}
        <AnimatePresence mode="wait">
          {label && (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: above ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute whitespace-nowrap font-editorial-serif italic ${
                framing ? 'right-0' : 'left-1/2 -translate-x-1/2'
              } font-medium text-[1.05rem] leading-none text-cream [text-shadow:0_1px_10px_rgba(0,0,0,0.9)] ${
                above ? 'bottom-full mb-2.5' : 'top-full mt-2.5'
              }`}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* the exact point, a tiny dot that tracks the mouse with no lag; it dims while a thing is framed */}
      <motion.div
        style={{ x: px, y: py, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: framing ? 0.35 : 1, scale: pressed ? 1.6 : 1 }}
        transition={{ duration: 0.18 }}
        className="absolute left-0 top-0 w-[3px] h-[3px] rounded-full bg-cream shadow-[0_0_4px_rgba(0,0,0,0.7)]"
      />
    </div>
  );
};
