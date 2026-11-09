import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { EASE } from './motion';

// Close button: drifts slightly toward the pointer, and on hover a hairline ring draws itself around
// the X while the X makes a half turn. Position it with `className` (it is absolute in the top-right by default).
export const CloseButton: React.FC<{
  onClick: () => void;
  reduce?: boolean;
  label?: string;
  className?: string;
}> = ({ onClick, reduce = false, label = 'Close', className = 'absolute top-6 right-6 sm:top-8 sm:right-10 z-[70]' }) => {
  const [hot, setHot] = useState(false);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const ref = useRef<HTMLButtonElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    x.set(Math.max(-7, Math.min(7, (e.clientX - (r.left + r.width / 2)) * 0.3)));
    y.set(Math.max(-7, Math.min(7, (e.clientY - (r.top + r.height / 2)) * 0.3)));
  };
  const onLeave = () => {
    setHot(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onClick={onClick}
      onMouseEnter={() => setHot(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-label={label}
      className={`${className} w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center cursor-pointer`}
    >
      {/* resting ring, and the brighter one that draws around it */}
      <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full -rotate-90" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="23" stroke="rgba(244,243,240,0.22)" strokeWidth="1" />
        <motion.circle
          cx="24"
          cy="24"
          r="23"
          stroke="#f4f3f0"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: hot ? 1 : 0 }}
          transition={{ duration: hot ? 0.6 : 0.3, ease: EASE }}
        />
      </svg>
      <motion.svg
        viewBox="0 0 16 16"
        className="w-4 h-4"
        fill="none"
        aria-hidden="true"
        animate={{ rotate: hot && !reduce ? 180 : 0, opacity: hot ? 1 : 0.75 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <path d="M3 3 L13 13 M13 3 L3 13" stroke="#f4f3f0" strokeWidth="1.25" strokeLinecap="round" />
      </motion.svg>
    </motion.button>
  );
};
