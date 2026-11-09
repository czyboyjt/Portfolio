import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

// ------------------------------------------------------------------------------------------------
// PillButton: a rounded pill with a small icon and a label that rolls up to a second word on hover.
// ------------------------------------------------------------------------------------------------
export const PillButton: React.FC<{
  label: string;
  hoverLabel?: string; // the word it rolls up to on hover
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  onClick?: () => void;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  // When set, the pill can morph between three stages: 'gone' (no width at all), 'circle' (a small plain circle with just
  // the icon) and 'full' (the whole pill). Width, padding and border animate between them, and the label fades in at 'full'.
  // Leave it out for an ordinary pill.
  stage?: 'gone' | 'circle' | 'full';
}> = ({ label, hoverLabel, icon, size = 'md', onClick, ariaLabel, ariaExpanded, stage }) => {
  const iconRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  // The full width of the pill, worked out from its own parts. The morph animates to this number: asking the animation to
  // go to 'auto' would measure the pill while its padding is still the small circle's, and come up 14px short, which then
  // snapped at the end of the morph.
  const [full, setFull] = useState<number | null>(null);
  const padL = size === 'sm' ? 12 : 16;
  const padR = size === 'sm' ? 16 : 20;
  const gap = size === 'sm' ? 8 : 10;
  useLayoutEffect(() => {
    if (stage === undefined) return;
    const iw = iconRef.current?.offsetWidth ?? 0;
    const lw = labelRef.current?.offsetWidth ?? 0;
    setFull(Math.ceil(padL + iw + (icon ? gap : 0) + lw + padR + 2)); // 2 for the border
  }, [stage === undefined, label, hoverLabel, icon, padL, padR, gap]);
  return (
  <motion.button
    type="button"
    initial={false}
    animate={
      stage === undefined
        ? undefined
        : stage === 'gone'
          ? { width: 0, paddingLeft: 0, paddingRight: 0, borderWidth: 0, opacity: 0, transition: { duration: 0.5, ease: [0.45, 0, 0.2, 1], opacity: { duration: 0.32, delay: 0.14, ease: [0.4, 0, 0.6, 1] } } }
          : stage === 'circle'
            ? { width: 42, paddingLeft: 11, paddingRight: 11, borderWidth: 1, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
            : { width: full ?? 'auto', paddingLeft: padL, paddingRight: padR, borderWidth: 1, opacity: 1, transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] } }
    }
    style={stage !== undefined && stage !== 'full' ? { pointerEvents: 'none' } : undefined}
    onClick={onClick}
    aria-label={ariaLabel}
    aria-expanded={ariaExpanded}
    className={`group inline-flex items-center rounded-full border border-white/20 bg-[#0b0b0d]/85 backdrop-blur-md tracking-wide text-cream shadow-pill transition-[transform,background-color,border-color,box-shadow] duration-(--dur-hover) ease-arrive hover:-translate-y-0.5 hover:bg-[#16161a]/95 hover:border-white/55 hover:shadow-[0_16px_40px_rgba(0,0,0,0.55)] cursor-pointer ${
      size === 'sm' ? 'gap-2 pl-3 pr-4 py-1.5 text-[12px]' : 'gap-2.5 pl-4 pr-5 py-2.5 text-[13px]'
    }`}
  >
    {icon && (
      <span ref={iconRef} aria-hidden="true" className="block shrink-0 text-[1.15rem] leading-none transition-transform duration-(--dur-hover) ease-arrive group-hover:scale-110">
        {icon}
      </span>
    )}
    <motion.span
      ref={labelRef}
      className="block shrink-0 overflow-hidden"
      initial={false}
      animate={stage === undefined ? undefined : { opacity: stage === 'full' ? 1 : 0 }}
      transition={{ duration: stage === 'gone' ? 0.15 : 0.5, ease: stage === 'gone' ? 'linear' : [0.22, 1, 0.36, 1], delay: stage === 'full' ? 0.3 : 0 }}
    >
    {hoverLabel ? (
      <span className="relative block h-[1.2em] overflow-hidden whitespace-nowrap leading-[1.2em]">
        {/* an unseen copy of the longer word holds the pill's width, so the word it rolls to is never squeezed or wrapped */}
        <span aria-hidden="true" className="invisible block h-0 overflow-hidden">{hoverLabel.length > label.length ? hoverLabel : label}</span>
        <span className="block transition-transform duration-(--dur-hover) ease-arrive group-hover:-translate-y-full">{label}</span>
        <span aria-hidden="true" className="absolute left-0 top-full block transition-transform duration-(--dur-hover) ease-arrive group-hover:-translate-y-full">
          {hoverLabel}
        </span>
      </span>
    ) : (
      <span className="block whitespace-nowrap leading-[1.2em]">{label}</span>
    )}
    </motion.span>
  </motion.button>
  );
};

// ------------------------------------------------------------------------------------------------
// LinkLabel: the look of a link, with no element of its own. A line sits under the text; while `active` it brightens
// and a short light travels along it on a loop, and the arrow nudges up and to the right. TextLink uses it for its own
// hover, and the project stage uses it directly, switching it on when the pointer is near the hero.
// ------------------------------------------------------------------------------------------------
export const LinkLabel: React.FC<{ children: React.ReactNode; active: boolean; arrow?: boolean; arrowSize?: string; reduce?: boolean }> = ({
  children,
  active,
  arrow = true,
  arrowSize = 'w-[1em] h-[1em]',
  reduce: reduceProp,
}) => {
  const systemReduce = !!useReducedMotion();
  const reduce = reduceProp ?? systemReduce;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative pb-1">
        {children}
        <span
          aria-hidden="true"
          className={`absolute left-0 right-0 bottom-0 block h-px overflow-hidden transition-colors duration-300 ${active ? 'bg-cream/45' : 'bg-cream/25'}`}
        >
          <motion.span
            className="absolute top-0 left-0 block h-px w-[30%] bg-gradient-to-r from-transparent via-cream to-transparent"
            initial={{ x: '-100%', opacity: 0 }}
            animate={active && !reduce ? { x: ['-100%', '340%'], opacity: 1 } : { x: '-100%', opacity: 0 }}
            transition={
              active && !reduce
                ? { x: { duration: 1.6, repeat: Infinity, ease: [0.45, 0, 0.25, 1], repeatDelay: 0.3 }, opacity: { duration: 0.2 } }
                : { duration: 0.2 }
            }
          />
        </span>
      </span>
      {arrow && (
        <ArrowUpRight
          aria-hidden="true"
          className={`${arrowSize} transition-transform duration-300 ${active ? 'translate-x-0.5 -translate-y-0.5' : ''}`}
          strokeWidth={1.5}
        />
      )}
    </span>
  );
};

// ------------------------------------------------------------------------------------------------
// TextLink: a link, or a button when it has no href.
//   serif: italic serif, for links in a sentence or a heading ("View case study"), with the travelling light
//   mono:  small tracked mono caps, the same light, for compact calls to action
//   caps:  small tracked caps with a hairline that draws under it, for the foot of the page
// ------------------------------------------------------------------------------------------------
export const TextLink: React.FC<{
  href?: string;
  external?: boolean;
  tone?: 'serif' | 'mono' | 'caps';
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}> = ({ href, external, tone = 'caps', onClick, children }) => {
  const [hot, setHot] = useState(false);
  const hover = { onMouseEnter: () => setHot(true), onMouseLeave: () => setHot(false), onFocus: () => setHot(true), onBlur: () => setHot(false) };
  const look =
    tone === 'serif'
      ? 'text-[1.4rem] font-editorial-serif italic font-medium text-cream'
      : tone === 'mono'
        ? 'text-xs font-mono uppercase tracking-wider text-cream'
        : 'group relative inline-block py-1 text-caption tracking-[0.22em] uppercase text-cream/75 transition-colors duration-300 hover:text-white';
  const inner =
    tone === 'caps' ? (
      <>
        {children}
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 bottom-0 h-px origin-left scale-x-0 bg-cream transition-transform duration-(--dur-hover) ease-arrive group-hover:scale-x-100"
        />
      </>
    ) : (
      <LinkLabel active={hot}>{children}</LinkLabel>
    );
  const cls = `inline-block cursor-pointer ${look}`;
  return href ? (
    <a href={href} onClick={onClick} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cls} {...hover}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls} {...hover}>
      {inner}
    </button>
  );
};
