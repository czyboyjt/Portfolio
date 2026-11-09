import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { PillButton, TextLink } from './ui';
import { AskPill } from './AskPill';
import { AskHandoff } from '../types';

// Where people can reach me. Change them here and everything on the site follows.
export const CONTACT = {
  email: 'jtaffe@umich.edu',
  links: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/jontetaffe/' }],
};

const EASE = [0.22, 1, 0.36, 1] as const;

// Copies the email, and says so for a couple of seconds
const useCopy = () => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(CONTACT.email).catch(() => {});
    soundFx.playTick();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
};

// ---------------------------------------------------------------------------------------------
// The foot of the page: one slim line. A short phrase on one side, and on the other just icons for email and
// LinkedIn, the year, and a way back to the top.
// ---------------------------------------------------------------------------------------------
// The way back to the top: a hairline arrow. At rest a streak of light climbs its shaft; on hover the shaft
// stretches as if reaching for the top; it leans a few pixels towards the pointer when near; and a click
// launches it: it stretches into a streak and shoots off as the page glides up.
const BackToTop: React.FC = () => {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [hot, setHot] = useState(false);
  const [launching, setLaunching] = useState(false);

  // lean towards the pointer while it is near
  const mx = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 });
  const my = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 });
  useEffect(() => {
    if (reduce) return;
    const reach = 170;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      if (d > reach) {
        mx.set(0);
        my.set(0);
        return;
      }
      const k = 1 - d / reach;
      mx.set(Math.max(-7, Math.min(7, dx * 0.35)) * k);
      my.set(Math.max(-7, Math.min(7, dy * 0.35)) * k);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduce, mx, my]);

  // glide to the top: slow at the start and the end, longer for a longer page
  const glideTop = () => {
    const from = window.scrollY;
    const dur = Math.min(1900, Math.max(900, from * 0.22));
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, from * (1 - (-(Math.cos(Math.PI * k) - 1) / 2)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const go = () => {
    if (launching) return;
    soundFx.playTick();
    if (reduce) {
      window.scrollTo({ top: 0 });
      return;
    }
    setLaunching(true);
    glideTop();
    window.setTimeout(() => setLaunching(false), 900);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: mx, y: my }}
      onClick={go}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      aria-label="Back to top"
      title="Back to top"
      className="relative inline-flex h-11 w-9 items-end justify-center text-white outline-none cursor-pointer"
    >
      {/* the arrow launches upward and fades, then returns */}
      <motion.span
        className="relative block h-9 w-7"
        animate={launching ? { y: -46, scaleY: 1.7, opacity: 0 } : { y: 0, scaleY: 1, opacity: 1 }}
        transition={launching ? { duration: 0.5, ease: [0.5, 0, 0.9, 0.4] } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: '50% 0%' }}
      >
        <svg viewBox="0 0 28 36" className="absolute inset-0 h-full w-full overflow-visible" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7,11 14,4 21,11" />
          <motion.line x1="14" y1="4" x2="14" initial={{ y2: 24 }} animate={{ y2: hot ? 34 : 24 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} />
        </svg>
        {/* a short streak of light climbing the shaft, now and then */}
        {!reduce && (
          <motion.span
            aria-hidden="true"
            className="absolute left-1/2 block h-3 w-px -translate-x-1/2 bg-gradient-to-t from-transparent via-white to-transparent"
            style={{ bottom: 2 }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [0, -20], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.6, ease: [0.45, 0, 0.25, 1], times: [0, 0.35, 1] }}
          />
        )}
      </motion.span>
    </motion.button>
  );
};

export const ContactSection: React.FC = () => (
  <section
    id="contact"
    className="relative w-full border-t border-white/[0.06] px-6 sm:px-10 lg:px-14 py-6 flex items-center justify-between gap-6"
  >
    <span className="font-editorial-serif italic font-medium text-[1.15rem] text-cream/65">Let’s build something.</span>

    <div className="flex items-center gap-x-6 sm:gap-x-8">
      <TextLink href={`mailto:${CONTACT.email}`}>Email</TextLink>
      {CONTACT.links.map((l) => (
        <TextLink key={l.url} href={l.url} external>
          {l.label}
        </TextLink>
      ))}
      <span className="hidden md:inline text-[10px] tracking-[0.22em] uppercase text-cream/40">© {new Date().getFullYear()} Jonte Taffe</span>
      <BackToTop />
    </div>
  </section>
);

// ---------------------------------------------------------------------------------------------
// A small "Say hello" pill in the corner that opens a card with the same details, so I can be reached from
// anywhere on the page, the first screen included. It gets out of the way when the closing section is on screen
// or a case study is open.
// ---------------------------------------------------------------------------------------------
export const ContactPill: React.FC<{ hidden?: boolean; onAsk?: (skillId: string, from?: AskHandoff) => void }> = ({ hidden = false, onAsk }) => {
  const reduce = !!useReducedMotion();
  // on a phone the pill sits in the top-right corner and the card and nudge open downwards from it; on larger
  // screens it is bottom-right and they open upwards
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const on = () => setPhone(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const dir = phone ? -1 : 1; // which way things travel as they appear
  const origin = phone ? '100% 0%' : '100% 100%';
  const [open, setOpen] = useState(false);
  const [atContact, setAtContact] = useState(false);
  // the Ask pill is only for the projects screen
  const [onProjects, setOnProjects] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopy();
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    const el = document.getElementById('contact');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = document.getElementById('recent-works');
    if (!el) return;
    // on the projects screen while the section crosses the middle of the window
    const io = new IntersectionObserver(([e]) => setOnProjects(e.isIntersecting), { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const visible = !atContact && !hidden;

  // A one-time nudge: a few seconds after arriving, a small bubble asks if there is a project in mind, stays a
  // moment and goes. Once per visit, never while the card is open.
  useEffect(() => {
    if (!visible) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem('contact-nudged') === '1';
    } catch {
      /* storage can be blocked */
    }
    if (seen) return;
    const show = window.setTimeout(() => {
      setNudge(true);
      try {
        sessionStorage.setItem('contact-nudged', '1');
      } catch {
        /* ignore */
      }
    }, 3500);
    const hide = window.setTimeout(() => setNudge(false), 3500 + 5500);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [visible]);
  useEffect(() => {
    if (open) setNudge(false);
  }, [open]);

  // close on Esc, or a press outside, or when it hides
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);
  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pill"
          initial={reduce ? false : { opacity: 0, y: 16 * dir }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 * dir }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed top-4 right-4 z-[40] flex items-start sm:top-auto sm:bottom-6 sm:right-6 sm:items-end"
        >
          <div ref={wrap} className="relative">
          <AnimatePresence>
            {nudge && !open && (
              <motion.button
                key="nudge"
                onClick={() => {
                  setNudge(false);
                  setOpen(true);
                }}
                initial={reduce ? false : { opacity: 0, y: 8 * dir, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6 * dir, scale: 0.96 }}
                transition={{ duration: 0.55, ease: EASE }}
                style={{ transformOrigin: origin }}
                className={`absolute right-0 whitespace-nowrap ${phone ? 'top-full mt-3' : 'bottom-full mb-3'} rounded-2xl ${phone ? 'rounded-tr-sm' : 'rounded-br-sm'} bg-cream px-4 py-2.5 text-[13px] text-[#0b0b0d] shadow-[0_12px_34px_rgba(0,0,0,0.45)] cursor-pointer`}
              >
                Got a project in mind?
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {open && (
              <motion.div
                key="card"
                initial={reduce ? false : { opacity: 0, y: 10 * dir, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 * dir, scale: 0.97 }}
                transition={{ duration: 0.45, ease: EASE }}
                style={{ transformOrigin: origin }}
                className={`absolute right-0 w-[min(88vw,21rem)] rounded-md border border-white/12 bg-[#0b0b0d]/95 backdrop-blur-md p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] ${phone ? 'top-full mt-3' : 'bottom-full mb-3'}`}
              >
                <p className="font-editorial-serif font-medium text-[1.6rem] leading-tight text-cream">Nice to meet you.</p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="mt-4 block font-editorial-serif italic font-medium text-[1.25rem] text-cream underline decoration-white/25 underline-offset-[6px] hover:decoration-white/70 transition-colors break-all"
                >
                  {CONTACT.email}
                </a>
                <div className="mt-5 flex items-center justify-between gap-4 text-caption tracking-[0.2em] uppercase text-cream/65">
                  <button onClick={copy} className="inline-flex items-center gap-2 hover:text-cream transition-colors cursor-pointer">
                    {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  {CONTACT.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-cream transition-colors">
                      {l.label}
                      <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <PillButton
            onClick={() => {
              if (open) soundFx.playClose();
              else soundFx.playOpen();
              setOpen((o) => !o);
            }}
            ariaExpanded={open}
            ariaLabel={open ? 'Close contact card' : 'Say hi and get in touch'}
            icon="👋🏾"
            label={open ? 'Close' : 'Say hello'}
            hoverLabel={open ? 'Close' : 'Hi'}
          />
          </div>

          {/* the Ask pill, to the right of Say hello, only while the projects are on screen */}
          <AnimatePresence>
            {onAsk && onProjects && (
              // The pill animates itself (a small circle grows out of the corner, opens into the pill, and closes back the
              // same way), and Say hello is simply pushed along as its width changes. Nothing is clipped.
              <div key="ask" className="flex justify-end">
                <AskPill phone={phone} onPick={onAsk} />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
