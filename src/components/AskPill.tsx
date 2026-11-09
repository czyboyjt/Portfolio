import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, usePresence, useReducedMotion } from 'motion/react';
import { SKILLS } from '../data/skills';
import { AskHandoff } from '../types';
import { soundFx } from '../utils/audio';
import { EASE, PillButton } from './ui';

// The "Ask" pill, to the right of "Say hello". It opens a small chat-style card: a question and the skills as presets.
// Picking one shows it as your message, a short reply, and then opens the film for that skill in its own screen.
// Typing is not wired up yet, so the composer is a placeholder.
export const AskPill: React.FC<{ phone: boolean; onPick: (skillId: string, from?: AskHandoff) => void }> = ({ phone, onPick }) => {
  const reduce = !!useReducedMotion();
  const dir = phone ? -1 : 1;
  const origin = phone ? '100% 0%' : '100% 100%';
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  // The pill arrives as a small circle and morphs open into the full pill; as it leaves it closes back to a circle first
  const [present, safeToRemove] = usePresence();
  const [stage, setStage] = useState<'gone' | 'circle' | 'full'>(reduce ? 'full' : 'gone');
  useEffect(() => {
    if (reduce) {
      if (!present) safeToRemove?.();
      return;
    }
    const ids: number[] = [];
    if (present) {
      // a circle grows out of the corner, then opens into the pill
      ids.push(window.setTimeout(() => setStage('circle'), 30));
      ids.push(window.setTimeout(() => setStage('full'), 650));
    } else {
      // it leaves in one smooth, quick move (no stop at the circle), and is taken off the page once it has gone
      setStage('gone');
      ids.push(window.setTimeout(() => safeToRemove?.(), 540));
    }
    return () => ids.forEach(window.clearTimeout);
  }, [present]);

  const close = () => {
    setOpen(false);
    setPicked(null);
  };

  // close on Esc or a press outside
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // after a pick: your message, a short reply, then the film
  useEffect(() => {
    if (!picked) return;
    const id = window.setTimeout(() => {
      const skill = picked;
      // hand the card to the film: where it is, and a copy of what it shows, so the film can grow out of it
      const el = card.current;
      const r = el?.getBoundingClientRect();
      const from = el && r ? { rect: { left: r.left, top: r.top, width: r.width, height: r.height }, html: el.innerHTML } : undefined;
      close();
      onPick(skill, from);
    }, reduce ? 300 : 1500);
    return () => window.clearTimeout(id);
  }, [picked]);

  const label = SKILLS.find((s) => s.id === picked)?.label;

  return (
    <motion.div ref={wrap} className="relative w-max" initial={false} animate={{ paddingLeft: stage === 'gone' ? 0 : 10 }} transition={{ duration: 0.5, ease: EASE }}>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={card}
            key="ask-card"
            initial={reduce ? false : { opacity: 0, y: 10 * dir, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 * dir, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ transformOrigin: origin }}
            className={`absolute right-0 w-[min(88vw,23rem)] rounded-md border border-white/12 bg-[#0b0b0d]/95 backdrop-blur-md p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] ${phone ? 'top-full mt-3' : 'bottom-full mb-3'}`}
          >
            <p className="mb-4 text-caption uppercase tracking-[0.28em] text-cream/55">Ask</p>

            {/* the question */}
            <div className="max-w-[17rem] rounded-2xl rounded-bl-sm bg-white/[0.06] px-4 py-3 font-editorial-serif italic font-medium text-[1.25rem] leading-[1.3] text-cream">
              What would you like to see?
            </div>
            <p className="mt-2 ml-1 text-[0.8rem] text-cream/50">Pick one and I’ll show you the real work.</p>

            {!picked ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {SKILLS.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.05 }}
                    onClick={() => setPicked(s.id)}
                    className="rounded-full border border-white/20 px-3.5 py-2 font-editorial-serif italic font-medium text-[1.02rem] leading-none text-cream/80 transition-colors duration-(--dur-hover) hover:border-white/55 hover:text-cream cursor-pointer"
                  >
                    {s.label}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-3">
                {/* your message */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  style={{ transformOrigin: '100% 100%' }}
                  className="self-end rounded-2xl rounded-br-sm bg-cream px-4 py-2.5 text-[0.95rem] text-[#0b0b0d]"
                >
                  Show me {label?.toLowerCase()}
                </motion.div>
                {/* the reply */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.5 }}
                  className="flex items-center gap-2.5 self-start rounded-2xl rounded-bl-sm bg-white/[0.06] px-4 py-3 font-editorial-serif italic text-[1.05rem] text-cream/85"
                >
                  Pulling it together
                  <span className="flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="block h-1 w-1 rounded-full bg-cream/70" animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }} />
                    ))}
                  </span>
                </motion.div>
              </div>
            )}

            {/* typing comes later */}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/12 pt-4 text-[0.9rem] text-cream/35">
              <span>Ask anything…</span>
              <span className="text-caption uppercase tracking-[0.2em]">Soon</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PillButton
        onClick={() => {
          if (open) {
            soundFx.playClose();
            close();
          } else {
            soundFx.playOpen();
            setOpen(true);
          }
        }}
        stage={stage}
        ariaExpanded={open}
        ariaLabel={open ? 'Close ask' : 'Ask to see something specific'}
        icon="✦"
        label={open ? 'Close' : 'Ask'}
        hoverLabel={open ? 'Close' : 'Show me'}
      />
    </motion.div>
  );
};
