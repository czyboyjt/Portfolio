import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  COLOR_TOKENS,
  DURATION_TOKENS,
  EASE_TOKENS,
  FONT_TOKENS,
  MOTIONS,
  SHAPE_TOKENS,
  SPACE_TOKENS,
  TYPE_SCALE,
  TokenStatus,
} from '../data/designTokens';
import { ZOOM_EASE } from '../utils/stagePull';
import { ChapterMarker, Chip as Tok, CloseButton, EASE, Label, PillButton, Status, TextLink } from './ui';
import { soundFx } from '../utils/audio';

const CREAM = '#f4f3f0';
const OPEN_S = 0.85;
const CLOSE_S = 0.8;

// Opens from the name on the landing page. The corner brackets of the cursor's reticle open out to the corners of
// the screen and the page appears inside them; the outlined name travels up to become the title; and the hairlines
// that separate the sections draw themselves across, like the guide lines of the skeleton.
interface Props {
  from: DOMRect; // the name's frame (what the reticle was around) when it was clicked
  onClose: () => void;
}

export const DesignSystemPage: React.FC<Props> = ({ from, onClose }) => {
  const reduce = !!useReducedMotion();
  const [closing, setClosing] = useState(false);
  const [vw, setVw] = useState(() => window.innerWidth);
  const [vh, setVh] = useState(() => window.innerHeight);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState<{ x: number; y: number; s: number } | null>(null);

  useEffect(() => {
    const on = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  // where the outlined name has to travel to, to sit as the page's title
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const fromFont = parseFloat(getComputedStyle(document.querySelector('h1') as Element).fontSize) || 176;
    const toFont = parseFloat(getComputedStyle(el).fontSize) || 96;
    setTravel({ x: r.left - (from.left + 8), y: r.top - (from.top + 8), s: toFont / fromFont });
  }, [from, vw]);

  const close = () => {
    if (closing) return;
    soundFx.playClose();
    setClosing(true);
    window.setTimeout(onClose, reduce ? 200 : CLOSE_S * 1000 + 60);
  };
  useEffect(() => {
    soundFx.playOpen();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inset = (r: { left: number; top: number; right: number; bottom: number }) =>
    `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round 2px)`;
  const fromClip = inset({ left: from.left, top: from.top, right: from.right, bottom: from.bottom });
  const FRAME = 14; // gap between the page's frame and the screen edge

  const t = (d: number, delay = 0) => ({ duration: reduce ? 0.2 : d, ease: ZOOM_EASE, delay: reduce ? 0 : delay });

  return (
    <div className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label="Design system">
      {/* the page, opening out of the name's frame */}
      <motion.div
        ref={scrollRef}
        className="absolute inset-0 bg-base text-cream overflow-y-auto overscroll-contain"
        initial={{ clipPath: fromClip }}
        animate={{ clipPath: 'inset(0px 0px 0px 0px round 0px)', opacity: closing ? 0 : 1 }}
        transition={{ clipPath: t(OPEN_S), opacity: { duration: closing ? 0.5 : 0, delay: closing ? 0.12 : 0, ease: 'easeOut' } }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          transition={{ duration: closing ? 0.25 : 0.7, delay: closing ? 0 : reduce ? 0 : 0.55 }}
          className="px-6 sm:px-10 lg:px-16 pt-24 sm:pt-28 pb-28 max-w-[88rem] mx-auto"
        >
          {/* ------------------------------ header ------------------------------ */}
          <header className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <p className="mb-5 text-caption tracking-[0.3em] uppercase text-cream/60">Design system</p>
              <h2
                ref={titleRef}
                className="font-editorial-serif font-medium leading-[0.86] tracking-[-0.02em] text-[clamp(3.4rem,11vw,6.5rem)] text-cream"
                style={{ opacity: travel && !(closing && !reduce) ? undefined : 0 }}
              >
                <span className="block">Jonte</span>
                <span className="block">Taffe</span>
              </h2>
            </div>
            <p className="max-w-[22rem] text-[1.05rem] leading-[1.7] text-cream/75">
              The rules this site is built on: two typefaces, one cream on near-black, a colour for every project, and a few
              small motions that repeat. Everything below is the real thing, so hover and try it.
            </p>
          </header>

          {/* ------------------------------ index + sections ------------------------------ */}
          <div className="mt-16 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-14">
            <SideNav scroller={scrollRef} />
            <div className="min-w-0">
              <p className="mb-2 hidden lg:block text-[0.85rem] text-cream/55">
                Tokens are named after the CSS variables in the site’s Tailwind theme. Each carries a status:{' '}
                <Status s="Core" /> <Status s="Per project" /> <Status s="One-off" /> <Status s="Experiment" />
              </p>

              <Section id="ds-type" n="01" title="Type" first>
                <div className="grid gap-12 md:grid-cols-2">
                  <div>
                    <DrawText className="font-editorial-serif italic font-medium leading-none text-[clamp(5rem,14vw,9rem)]">Aa</DrawText>
                    <p className="mt-4 font-editorial-serif italic font-medium text-[1.5rem]">{FONT_TOKENS[0].value}</p>
                    <TokenLine t={FONT_TOKENS[0]} />
                    <p className="mt-6 font-editorial-serif italic font-semibold text-[2.2rem] leading-tight">A pocket coach that knows your next step.</p>
                  </div>
                  <div>
                    <DrawText className="font-normal leading-none text-[clamp(5rem,14vw,9rem)]" style={{ fontFamily: 'Satoshi, sans-serif' }} delay={0.15}>Aa</DrawText>
                    <p className="mt-4 text-[1.5rem] font-medium">{FONT_TOKENS[1].value}</p>
                    <TokenLine t={FONT_TOKENS[1]} />
                    <p className="mt-6 text-[1.1rem] leading-[1.7] text-cream/80 max-w-[28rem]">
                      Body copy is set a little light against the headings, so the eye lands on the serif first.
                    </p>
                  </div>
                </div>
                <div className="mt-12 border-t border-white/12">
                  {TYPE_SCALE.map((s) => (
                    <div key={s.name} className="grid items-baseline gap-2 sm:gap-8 py-5 border-b border-white/12 lg:grid-cols-[11rem_1fr_16rem]">
                      <Tok>{s.name}</Tok>
                      <span
                        className={s.family === 'serif' ? 'font-editorial-serif italic font-medium leading-none' : s.caps ? 'uppercase tracking-[0.28em] text-cream/60' : 'leading-[1.7] text-cream/80'}
                        style={{ fontSize: s.name === '--text-display' ? '3.4rem' : s.value }}
                      >
                        {s.name === '--text-display' ? 'Jonte Taffe' : s.sample}
                      </span>
                      <span className="text-[0.85rem] leading-snug text-cream/55">
                        {s.value} · {s.use} <Status s={s.status} />
                      </span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="ds-colour" n="02" title="Colour">
                <p className="max-w-[34rem] text-[1.05rem] leading-[1.7] text-cream/75">
                  One cream on near-black carries everything. Colour is only ever a project’s own accent, used in small details: a
                  marker, a number, a line.
                </p>
                <div className="mt-10 grid gap-x-4 gap-y-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {COLOR_TOKENS.map((c) => (
                    <Swatch key={c.name} token={c.name} hex={c.value} use={c.use} status={c.status} outline={c.name === '--color-base' || c.name === '--color-ink'} />
                  ))}
                </div>
              </Section>

              <Section id="ds-space" n="03" title="Space and layout">
                <div className="grid gap-12 md:grid-cols-2">
                  <div>
                    <p className="mb-5 text-caption tracking-[0.22em] uppercase text-cream/55">Spacing steps</p>
                    <div className="flex flex-col gap-4">
                      {SPACE_TOKENS.map((s) => (
                        <div key={s.name}>
                          <div className="flex items-center gap-4">
                            <span className="w-[5.5rem] font-mono text-caption text-cream/70">{s.name}</span>
                            <DrawBar width={parseInt(s.value) * 2} />
                            <span className="text-[12px] text-cream/55">{s.value}</span>
                          </div>
                          <p className="mt-1 ml-[6.5rem] text-[0.8rem] text-cream/50">{s.use}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[1rem] leading-[1.8] text-cream/75">
                    <p className="mb-3 text-caption tracking-[0.22em] uppercase text-cream/55">Case study layout</p>
                    A pinned panel on the left (a third of the screen, at most 520px) and a scrolling column on the right. The hero
                    sits in the column at 16:9. Below 1280px it stacks, with the hero at half the screen height.
                  </div>
                </div>
              </Section>

              <Section id="ds-shape" n="04" title="Shape and depth">
                <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {SHAPE_TOKENS.map((s) => {
                    const isRadius = s.name.startsWith('--radius');
                    return (
                      <div key={s.name}>
                        <div
                          className="h-20 w-full border border-white/15 bg-[#0e0e11]"
                          style={isRadius ? { borderRadius: s.value } : { boxShadow: s.value }}
                        />
                        <div className="mt-3"><Tok>{s.name}</Tok></div>
                        <p className="mt-1.5 text-[0.85rem] leading-snug text-cream/60">{s.value}</p>
                        <p className="mt-1 text-[0.85rem] leading-snug text-cream/55">{s.use} <Status s={s.status} /></p>
                      </div>
                    );
                  })}
                </div>
              </Section>

              <Section id="ds-components" n="05" title="Components">
                <ComponentsShowcase />
              </Section>

              <Section id="ds-interaction" n="06" title="Interaction">
                <div className="grid gap-12 md:grid-cols-2">
                  <Demo name="Reticle" note="Four corners frame what you can click, with a word for what it does." status="Core">
                    <div
                      data-cursor="demo"
                      data-cursor-label="view"
                      className="inline-flex h-24 w-56 items-center justify-center border border-white/15 text-[0.95rem] text-cream/75 cursor-pointer"
                    >
                      Hover me
                    </div>
                  </Demo>
                  <Demo name="Skeleton" note="The name turns to outline and guide lines on hover. Go back and try it." status="One-off">
                    <p className="font-editorial-serif font-medium text-[3rem] leading-none text-transparent" style={{ WebkitTextStroke: '1px rgba(244,243,240,0.95)' }}>
                      Jonte Taffe
                    </p>
                  </Demo>
                </div>
              </Section>

              <Section id="ds-motion" n="07" title="Motion and sound">
                <div className="grid gap-12 md:grid-cols-2">
                  <div>
                    <p className="mb-5 text-caption tracking-[0.22em] uppercase text-cream/55">Easing</p>
                    {EASE_TOKENS.map((e) => (
                      <div key={e.name} className="mb-5">
                        <Tok>{e.name}</Tok>
                        <p className="mt-1.5 font-mono text-[0.85rem] text-cream/65">{e.value}</p>
                        <p className="mt-1 text-[0.85rem] leading-snug text-cream/55">{e.use} <Status s={e.status} /></p>
                      </div>
                    ))}
                    <EasePlay />
                  </div>
                  <div>
                    <p className="mb-5 text-caption tracking-[0.22em] uppercase text-cream/55">Durations</p>
                    <div className="flex flex-col gap-5">
                      {DURATION_TOKENS.map((d) => (
                        <div key={d.name}>
                          <div className="flex items-center gap-4">
                            <span className="w-[6rem] font-mono text-caption text-cream/70">{d.name}</span>
                            <DrawBar width={(d.ms / 1100) * 220} />
                            <span className="text-[12px] text-cream/55">{d.value}</span>
                          </div>
                          <p className="mt-1 ml-[7rem] text-[0.8rem] text-cream/50">{d.use}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-14 mb-4 text-caption tracking-[0.22em] uppercase text-cream/55">Named motions</p>
                <div className="border-t border-white/12">
                  {MOTIONS.map((m) => (
                    <div key={m.name} className="grid items-baseline gap-1 sm:gap-8 py-4 border-b border-white/12 lg:grid-cols-[10rem_1fr_1fr_7rem]">
                      <Tok>{m.name}</Tok>
                      <span className="text-[0.9rem] leading-snug text-cream/80">{m.how}</span>
                      <span className="text-[0.85rem] leading-snug text-cream/55">{m.where}</span>
                      <span><Status s={m.status} /></span>
                    </div>
                  ))}
                </div>
                <div className="mt-10 max-w-[34rem] text-[1rem] leading-[1.8] text-cream/75">
                  <p className="mb-3 text-caption tracking-[0.22em] uppercase text-cream/55">Sound</p>
                  One sound: a low, warm chord that blooms and fades into a soft room. Louder when a project opens, quieter when it
                  closes. Hovering and tapping are silent. <Status s="Core" />
                </div>
              </Section>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* the outlined name, travelling up from where it was to sit as the title */}
      {travel && !reduce && (
        <motion.div
          aria-hidden="true"
          className="fixed pointer-events-none font-editorial-serif font-medium leading-[0.86] tracking-[-0.02em]"
          style={{
            left: from.left + 8,
            top: from.top + 8,
            transformOrigin: '0 0',
            fontSize: getComputedStyle(document.querySelector('h1') as Element).fontSize,
            zIndex: 2,
            WebkitTextStroke: '1px var(--st)',
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1, color: 'rgba(244,243,240,0)', ['--st' as string]: 'rgba(244,243,240,0.95)' }}
          animate={
            closing
              ? // coming back: the title travels down to where the name sits and fills in solid, like the name was
                { x: 0, y: 0, scale: 1, opacity: [1, 1, 0], color: 'rgba(244,243,240,0.9)', ['--st' as string]: 'rgba(244,243,240,0)' }
              : { x: travel.x, y: travel.y, scale: travel.s, opacity: [1, 1, 0], color: 'rgba(244,243,240,1)', ['--st' as string]: 'rgba(244,243,240,0)' }
          }
          transition={
            closing
              ? { duration: CLOSE_S, ease: ZOOM_EASE, opacity: { duration: CLOSE_S + 0.1, times: [0, 0.88, 1] }, color: { duration: CLOSE_S * 0.8 } }
              : { duration: OPEN_S, ease: ZOOM_EASE, opacity: { duration: OPEN_S + 0.25, times: [0, 0.8, 1] } }
          }
        >
          <span className="block">Jonte</span>
          <span className="block">Taffe</span>
        </motion.div>
      )}

      {/* the reticle's corners, opened out to the frame of the page */}
      <CornerFrame
        from={from}
        to={{ left: FRAME, top: FRAME, width: vw - FRAME * 2, height: vh - FRAME * 2 }}
        open={!closing}
        reduce={reduce}
      />

      {/* close */}
      <motion.div
        className="fixed top-6 right-6 sm:top-9 sm:right-10 z-[3]"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: 0.4, delay: closing ? 0 : 0.7 }}
      >
        <CloseButton onClick={close} reduce={reduce} label="Close design system" className="relative border border-white/25" />
      </motion.div>
    </div>
  );
};

// four corner brackets that start around the name and open out to the corners of the screen
const CornerFrame: React.FC<{
  from: DOMRect;
  to: { left: number; top: number; width: number; height: number };
  open: boolean;
  reduce: boolean;
}> = ({ from, to, open, reduce }) => {
  const arm = 16;
  const line = '1.5px solid rgba(244,243,240,0.9)';
  const corner = (pos: React.CSSProperties, border: React.CSSProperties) => (
    <span aria-hidden="true" className="absolute block" style={{ width: arm, height: arm, ...pos, ...border }} />
  );
  return (
    <motion.div
      aria-hidden="true"
      className="fixed pointer-events-none z-[2]"
      initial={{ left: from.left, top: from.top, width: from.width, height: from.height, opacity: 1 }}
      animate={
        open
          ? { left: to.left, top: to.top, width: to.width, height: to.height, opacity: 0.55 }
          : { left: from.left, top: from.top, width: from.width, height: from.height, opacity: 1 }
      }
      transition={{ duration: reduce ? 0.2 : open ? OPEN_S : CLOSE_S, ease: ZOOM_EASE }}
    >
      {corner({ top: 0, left: 0 }, { borderTop: line, borderLeft: line })}
      {corner({ top: 0, right: 0 }, { borderTop: line, borderRight: line })}
      {corner({ bottom: 0, left: 0 }, { borderBottom: line, borderLeft: line })}
      {corner({ bottom: 0, right: 0 }, { borderBottom: line, borderRight: line })}
    </motion.div>
  );
};

// A section: a hairline that draws across (like one of the guide lines), a number and a name, then the content
const Section: React.FC<{ id: string; n: string; title: string; first?: boolean; children: React.ReactNode }> = ({ id, n, title, first, children }) => (
  <section id={id} data-ds-section className={`${first ? 'mt-6' : 'mt-24 sm:mt-32'} scroll-mt-10`}>
    <motion.span
      aria-hidden="true"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-6% 0px' }}
      transition={{ duration: 1.1, ease: EASE }}
      style={{ originX: 0 }}
      className="block h-px w-full bg-white/25"
    />
    <div className="mt-6 mb-10 flex items-baseline gap-5">
      <span className="font-mono text-caption tracking-[0.2em] text-cream/55">{n}</span>
      <h3 className="font-editorial-serif italic font-medium text-[1.8rem] leading-none">{title}</h3>
    </div>
    {children}
  </section>
);

const TokenLine: React.FC<{ t: { name: string; use: string; status: TokenStatus } }> = ({ t }) => (
  <p className="mt-2 text-[0.9rem] leading-snug text-cream/65">
    <Tok>{t.name}</Tok> <span className="ml-1">{t.use}</span> <Status s={t.status} />
  </p>
);

// The index down the left: the sections in order, with the one on screen marked. Click one to go to it.
const SideNav: React.FC<{ scroller: React.RefObject<HTMLDivElement | null> }> = ({ scroller }) => {
  const items = [
    ['ds-type', 'Type'],
    ['ds-colour', 'Colour'],
    ['ds-space', 'Space and layout'],
    ['ds-shape', 'Shape and depth'],
    ['ds-components', 'Components'],
    ['ds-interaction', 'Interaction'],
    ['ds-motion', 'Motion and sound'],
  ];
  const [on, setOn] = useState('ds-type');
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setOn((e.target as HTMLElement).id)),
      { root, rootMargin: '-25% 0px -65% 0px' }
    );
    root.querySelectorAll('[data-ds-section]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [scroller]);
  const go = (id: string) => {
    const root = scroller.current;
    const el = root?.querySelector<HTMLElement>('#' + id);
    if (!root || !el) return;
    root.scrollTo({ top: el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 40, behavior: 'smooth' });
  };
  return (
    <nav aria-label="Design system sections" className="hidden lg:block sticky top-24 self-start">
      <ul className="flex flex-col gap-3.5">
        {items.map(([id, label]) => (
          <li key={id}>
            <button
              onClick={() => go(id)}
              className={`group flex items-center gap-3 text-left font-editorial-serif italic font-medium text-[1.05rem] leading-none transition-colors duration-300 cursor-pointer ${on === id ? 'text-cream' : 'text-cream/45 hover:text-cream/80'}`}
            >
              <span aria-hidden="true" className={`block h-px bg-cream transition-all duration-(--dur-hover) ease-arrive ${on === id ? 'w-6 opacity-100' : 'w-3 opacity-40'}`} />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// A small playground: pick a curve and play it, to see the difference between arriving and travelling
const EasePlay: React.FC = () => {
  const [which, setWhich] = useState(0);
  const [run, setRun] = useState(0);
  const curves: { label: string; ease: [number, number, number, number] | 'linear' }[] = [
    { label: '--ease-arrive', ease: [0.22, 1, 0.36, 1] },
    { label: '--ease-travel', ease: [0.65, 0, 0.35, 1] },
    { label: 'linear', ease: 'linear' },
  ];
  return (
    <div className="mt-8">
      <p className="mb-3 text-caption tracking-[0.22em] uppercase text-cream/55">Playground</p>
      <div className="flex flex-wrap gap-2">
        {curves.map((c, i) => (
          <button
            key={c.label}
            onClick={() => {
              setWhich(i);
              setRun((r) => r + 1);
            }}
            className={`font-mono text-caption tracking-[0.06em] border rounded-frame px-2 py-1.5 leading-none transition-colors cursor-pointer ${which === i ? 'border-white/60 text-cream' : 'border-white/15 text-cream/60 hover:border-white/40'}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="relative mt-5 h-6 max-w-[22rem]">
        <span aria-hidden="true" className="absolute left-0 right-0 top-1/2 block h-px bg-white/20" />
        <motion.span
          key={run}
          aria-hidden="true"
          className="absolute top-1/2 block h-3 w-3 -mt-1.5 rounded-full bg-cream"
          initial={{ left: '0%' }}
          animate={{ left: 'calc(100% - 12px)' }}
          transition={{ duration: 1.2, ease: curves[which].ease }}
        />
      </div>
      <button onClick={() => setRun((r) => r + 1)} className="mt-3 text-caption tracking-[0.2em] uppercase text-cream/60 hover:text-cream transition-colors cursor-pointer">
        Play again
      </button>
    </div>
  );
};

// A swatch drawn on: its outline traces round the edge, then the colour fills in
const Swatch: React.FC<{ token: string; hex: string; use: string; status: TokenStatus; outline?: boolean }> = ({ token, hex, use, status, outline }) => (
  <div>
    <div className="relative h-24 w-full">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-frame"
        style={{ background: hex, border: outline ? '1px solid rgba(255,255,255,0.2)' : undefined }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-8% 0px' }}
        transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
      />
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.rect
          x="0.5"
          y="0.5"
          width="99"
          height="99"
          fill="none"
          stroke="rgba(244,243,240,0.9)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 1 }}
          whileInView={{ pathLength: 1, opacity: [1, 1, 0] }}
          viewport={{ once: true, margin: '-8% 0px' }}
          transition={{ pathLength: { duration: 0.9, ease: EASE }, opacity: { duration: 1.5, times: [0, 0.6, 1] } }}
        />
      </svg>
    </div>
    <div className="mt-3"><Tok>{token}</Tok></div>
    <p className="mt-1.5 font-mono text-caption tracking-[0.12em] text-cream/60">{hex}</p>
    <p className="mt-1 text-[0.8rem] leading-snug text-cream/50">{use} <Status s={status} /></p>
  </div>
);

// Text drawn on: the outline of the letters is revealed left to right, then the letters fill in
const DrawText: React.FC<{ className?: string; style?: React.CSSProperties; delay?: number; children: React.ReactNode }> = ({
  className,
  style,
  delay = 0,
  children,
}) => (
  <motion.p
    className={className}
    style={{ ...style, WebkitTextStroke: '1px rgba(244,243,240,0.95)' }}
    initial={{ clipPath: 'inset(0 100% 0 0)', color: 'rgba(244,243,240,0)' }}
    whileInView={{ clipPath: 'inset(0 -4% 0 0)', color: 'rgba(244,243,240,1)' }}
    viewport={{ once: true, margin: '-8% 0px' }}
    transition={{ clipPath: { duration: 1, ease: EASE, delay }, color: { duration: 0.7, ease: EASE, delay: delay + 0.85 } }}
  >
    {children}
  </motion.p>
);

// A spacing bar drawn on: a thin outline stretches out to its length, then fills
const DrawBar: React.FC<{ width: number }> = ({ width }) => (
  <motion.span
    aria-hidden="true"
    className="block h-[10px] border border-cream/90"
    initial={{ width: 0, backgroundColor: 'rgba(244,243,240,0)' }}
    whileInView={{ width, backgroundColor: 'rgba(244,243,240,0.85)' }}
    viewport={{ once: true, margin: '-8% 0px' }}
    transition={{ width: { duration: 0.8, ease: EASE }, backgroundColor: { duration: 0.5, delay: 0.7 } }}
  />
);

// A segmented choice for the playground: one option is on at a time
const Seg: React.FC<{ label: string; options: string[]; value: string; onChange: (v: string) => void }> = ({ label, options, value, onChange }) => (
  <div className="flex items-center gap-3">
    <span className="w-14 text-caption uppercase tracking-[0.22em] text-cream/55">{label}</span>
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`font-mono text-caption tracking-[0.06em] border rounded-frame px-2 py-1.5 leading-none transition-colors cursor-pointer ${value === o ? 'border-white/60 text-cream' : 'border-white/15 text-cream/60 hover:border-white/40'}`}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
);

// One component on the page. The name and a single line on what it is for sit on the left; the live example, large,
// sits on the right. Only a component that is not settled gets a status tag.
const Spec: React.FC<{ name: string; file: string; status?: TokenStatus; use: string; children: React.ReactNode }> = ({ name, file, status, use, children }) => (
  <div className="grid gap-x-14 gap-y-6 py-12 border-t border-white/12 first:border-t-0 first:pt-2 lg:grid-cols-[15rem_minmax(0,1fr)]">
    <div>
      <h4 className="font-editorial-serif italic font-semibold text-[1.7rem] leading-none">
        {name} {status && status !== 'Core' && <Status s={status} />}
      </h4>
      <p className="mt-3 text-[0.95rem] leading-[1.6] text-cream/70">{use}</p>
      <p className="mt-3 font-mono text-[0.75rem] tracking-[0.04em] text-cream/40">{file}</p>
    </div>
    <div>{children}</div>
  </div>
);

// A small caption under an example
const Row: React.FC<{ note: string; children: React.ReactNode }> = ({ note, children }) => (
  <div>
    <div className="flex min-h-[4rem] items-center">{children}</div>
    <p className="mt-2 text-[0.8rem] text-cream/50">{note}</p>
  </div>
);

// The stage the live example sits on
const Stage: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex min-h-[8rem] items-center justify-center rounded-frame border border-white/10 bg-black/30 px-8 py-8 ${className}`}>{children}</div>
);

// Every shared component, as the site uses it. Hover and click them: they are the real ones.
const ComponentsShowcase: React.FC = () => {
  const [size, setSize] = useState('md');
  const [roll, setRoll] = useState('on');
  const [icon, setIcon] = useState('on');
  const [hotMarker, setHotMarker] = useState(false);
  return (
    <div>
      <p className="mb-6 max-w-[34rem] text-[1.05rem] leading-[1.7] text-cream/75">
        The pieces the site is built from. They are the real components, so hover and click them.
      </p>

      <Spec name="Pill button" file="ui/Button" use="A rounded pill with a small icon. The label rolls up to a second word on hover.">
        <Stage>
          <PillButton
            size={size as 'sm' | 'md'}
            icon={icon === 'on' ? '👋🏾' : undefined}
            label="Say hello"
            hoverLabel={roll === 'on' ? 'Hi' : undefined}
          />
        </Stage>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          <Seg label="Size" options={['sm', 'md']} value={size} onChange={setSize} />
          <Seg label="Roll" options={['on', 'off']} value={roll} onChange={setRoll} />
          <Seg label="Icon" options={['on', 'off']} value={icon} onChange={setIcon} />
        </div>
      </Spec>

      <Spec name="Text link" file="ui/Button" use="A link with a line that draws under it on hover. Serif in a sentence, small caps at the foot of the page.">
        <Stage className="justify-start gap-16">
          <Row note="Serif">
            <TextLink tone="serif" href="#design-system" onClick={(e) => e.preventDefault()}>View case study</TextLink>
          </Row>
          <Row note="Small caps">
            <TextLink tone="caps" href="#design-system" onClick={(e) => e.preventDefault()}>Email</TextLink>
          </Row>
        </Stage>
      </Spec>

      <Spec name="Close button" file="ui/CloseButton" use="Leans towards the pointer. On hover a ring draws round it and the X makes a half turn.">
        <Stage>
          <CloseButton label="Close example" onClick={() => {}} className="relative border border-white/25" />
        </Stage>
      </Spec>

      <Spec name="Labels" file="ui/Label" use="The small text above and beside content: a section label in two styles, and a tag for how settled something is.">
        <Stage className="flex-col items-start justify-center gap-8">
          <Row note="Caps"><Label variant="caps">What we found</Label></Row>
          <Row note="Serif"><Label variant="serif">How it came together</Label></Row>
          <Row note="Tags: Per project, One-off, Experiment (Core is the default and is not shown)">
            <span className="flex flex-wrap gap-y-2">
              <Status s="Per project" /> <Status s="One-off" /> <Status s="Experiment" />
            </span>
          </Row>
        </Stage>
      </Spec>

      <Spec name="Chapter marker" file="ui/ChapterMarker" use="Starts a chapter. A line draws in, then the name. On hover the line grows and a light travels along it.">
        <Stage className="justify-start">
          <div className="py-3 pr-12" onMouseEnter={() => setHotMarker(true)} onMouseLeave={() => setHotMarker(false)}>
            <ChapterMarker n="Overview" hot={hotMarker} />
          </div>
        </Stage>
      </Spec>
    </div>
  );
};

const Demo: React.FC<{ name: string; note: string; status?: TokenStatus; children: React.ReactNode }> = ({ name, note, status, children }) => (
  <div>
    <p className="mb-2 text-caption tracking-[0.22em] uppercase text-cream/55">
      {name} {status && <Status s={status} />}
    </p>
    <p className="mb-5 max-w-[24rem] text-[0.95rem] leading-[1.6] text-cream/70">{note}</p>
    {children}
  </div>
);
