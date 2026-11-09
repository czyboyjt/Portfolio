import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PROJECTS } from '../data/projects';
import { EVIDENCE, SKILLS } from '../data/skills';
import { AskHandoff, Project } from '../types';
import { soundFx } from '../utils/audio';
import { AskFilm } from './AskFilm';
import { CloseButton, EASE, EASE_TRAVEL } from './ui';

// The film's own full screen, opened from the Ask pill. It sits over the page like a case study, with a close button at
// the top right; closing it (or Esc) goes back to the projects. People who prefer reduced motion get a plain list.
export const AskFilmScreen: React.FC<{ skillId: string; from?: AskHandoff; onClose: () => void; onOpenProject: (p: Project) => void }> = ({ skillId: first, from, onClose, onOpenProject }) => {
  const reduce = !!useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const [skillId, setSkillId] = useState(first);
  const [rewind, setRewind] = useState(0);
  const [closing, setClosing] = useState(false);
  // The film grows out of the Ask card: a copy of the card expands to fill the screen (and its words fade), and only then does
  // the film start (the painting lights up, the title draws itself). Without a card to grow from, or with reduced motion, it
  // starts at once.
  const grow = !!from && !reduce;
  const [started, setStarted] = useState(!grow);
  const [ghostGone, setGhostGone] = useState(!grow);
  useEffect(() => {
    if (!grow) return;
    // the film starts under the card while it is still growing (so the painting is already coming up when the card lets go),
    // and the card is only released once it has filled the screen
    const a = window.setTimeout(() => setStarted(true), 420);
    const b = window.setTimeout(() => setGhostGone(true), 760);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [grow]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    soundFx.playClose();
    window.setTimeout(onClose, reduce ? 120 : 420);
  };
  useEffect(() => {
    soundFx.playSwell();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = EVIDENCE.filter((e) => e.skill === skillId && e.artifact);
  const def = SKILLS.find((s) => s.id === skillId)!;

  return (
    <motion.div
      className="fixed inset-0 z-[88]"
      style={{ backgroundColor: started ? '#050506' : 'transparent' }}
      role="dialog"
      aria-modal="true"
      aria-label={`${def.label}: selected moments`}
      initial={{ opacity: grow ? 1 : 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: closing ? 0.4 : 0.6, ease: EASE }}
    >
      {/* the card, growing to fill the screen */}
      <AnimatePresence>
        {grow && from && !ghostGone && (
          <motion.div
            key="card-ghost"
            aria-hidden="true"
            className="pointer-events-none fixed z-[5] overflow-hidden border border-white/12 p-5"
            initial={{ left: from.rect.left, top: from.rect.top, width: from.rect.width, height: from.rect.height, borderRadius: 6, backgroundColor: '#0b0b0d' }}
            animate={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0, backgroundColor: '#050506', transition: { duration: 0.72, ease: EASE_TRAVEL } }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.15 } }}
          >
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.96, transition: { duration: 0.35, ease: 'easeIn' } }}
              style={{ transformOrigin: '0% 0%', width: from.rect.width - 40 }}
              dangerouslySetInnerHTML={{ __html: from.html }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scroller} className="absolute inset-0 overflow-y-auto overscroll-contain">
        {!started ? null : reduce ? (
          <PlainList skillId={skillId} items={items} onSkill={setSkillId} onOpenProject={onOpenProject} />
        ) : (
          <AskFilm
            skillId={skillId}
            items={items}
            scroller={scroller}
            rewind={rewind}
            onSkill={(id) => {
              setSkillId(id);
              setRewind((r) => r + 1);
            }}
            onOpen={onOpenProject}
          />
        )}
      </div>

      <CloseButton onClick={close} reduce={reduce} label="Close" className="fixed top-6 right-6 sm:top-8 sm:right-10 z-[60]" />
    </motion.div>
  );
};

// the same evidence as a plain, still list
const PlainList: React.FC<{ skillId: string; items: typeof EVIDENCE; onSkill: (id: string) => void; onOpenProject: (p: Project) => void }> = ({ skillId, items, onSkill, onOpenProject }) => {
  const def = SKILLS.find((s) => s.id === skillId)!;
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <p className="mb-4 text-caption uppercase tracking-[0.3em] text-cream/55">Selected moments</p>
      <h2 className="font-editorial-serif italic font-medium text-[clamp(2.6rem,7vw,5rem)] leading-none text-cream">{def.label}</h2>
      <p className="mt-4 mb-12 text-cream/70">{def.line}</p>
      {items.map((e) => {
        const p = PROJECTS.find((x) => x.id === e.project)!;
        return (
          <div key={e.project + e.text} className="grid gap-6 border-t border-white/12 py-10 md:grid-cols-[18rem_1fr]">
            <img src={e.artifact!.src} alt={e.artifact!.label} className="w-full rounded-frame border border-white/15 bg-[#0b0b0d]" />
            <div>
              <button onClick={() => onOpenProject(p)} className="font-editorial-serif italic font-semibold text-[1.6rem] leading-none text-cream cursor-pointer">{p.displayTitle}</button>
              <p className="mt-3 text-[1.1rem] leading-[1.7] text-cream/85">{e.text}</p>
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2 border-t border-white/12 pt-8">
        {SKILLS.filter((s) => s.id !== skillId).map((s) => (
          <button key={s.id} onClick={() => onSkill(s.id)} className="rounded-full border border-white/25 px-4 py-2 font-editorial-serif italic text-[1.05rem] text-cream/80 cursor-pointer">{s.label}</button>
        ))}
      </div>
    </div>
  );
};
