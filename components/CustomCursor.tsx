
import React, { useEffect, useState, useRef } from 'react';
import { View } from '../types';

interface CustomCursorProps {
  currentView?: View;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ currentView }) => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  // Coordinate tracking
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  
  const [hoverType, setHoverType] = useState<'none' | 'ui' | 'project'>('none');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Detect interaction type
      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor="project"]')) {
        setHoverType('project');
      } else if (target.closest('button, a, .cursor-pointer, [class*="cursor-"], input, [role="button"]')) {
        setHoverType('ui');
      } else {
        setHoverType('none');
      }
    };

    const animate = () => {
      // 1. Update Dot (Instant Sync)
      // Note: CSS transition on transform is removed to ensure this is truly instant.
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      // 2. Update Ring (Smooth Lerp)
      const lerpFactor = 0.15;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      requestAnimationFrame(animate);
    };

    const rafId = requestAnimationFrame(animate);

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  const getRingClasses = () => {
    const base = "fixed top-0 left-0 border rounded-full pointer-events-none will-change-transform backdrop-blur-[2px] flex items-center justify-center transition-[width,height,background-color,border-color,box-shadow,opacity] duration-500 cubic-bezier(0.23, 1, 0.32, 1)";
    
    switch (hoverType) {
      case 'project':
        return `${base} w-24 h-24 -ml-12 -mt-12 bg-orange-500/15 border-orange-400/60 shadow-[0_0_40px_rgba(249,115,22,0.3)]`;
      case 'ui':
        return `${base} w-14 h-14 -ml-7 -mt-7 bg-white/10 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.15)]`;
      default:
        return `${base} w-8 h-8 -ml-4 -mt-4 bg-transparent border-white/20`;
    }
  };

  const getDotClasses = () => {
    // CRITICAL: Removed 'transform' from the transition list. 
    // This allows the dot to follow the mouse instantly without lag.
    const base = "fixed top-0 left-0 w-1.5 h-1.5 rounded-full -ml-0.75 -mt-0.75 pointer-events-none will-change-transform transition-[background-color,box-shadow,width,height] duration-300";
    
    switch (hoverType) {
      case 'project':
        return `${base} bg-orange-500 scale-150 shadow-[0_0_12px_rgba(249,115,22,1)]`;
      case 'ui':
        return `${base} bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.6)]`;
      default:
        return `${base} bg-white scale-100 shadow-none`;
    }
  };

  return (
    <div className={`fixed inset-0 pointer-events-none z-[10001] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} hidden md:block`}>
      {/* Fluid Ring */}
      <div 
        ref={ringRef}
        className={getRingClasses()}
      >
        <span className={`text-[9px] font-black tracking-[0.3em] text-orange-500 transition-all duration-500 ease-out ${hoverType === 'project' ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 translate-y-3 blur-[4px]'}`}>
          SELECT
        </span>
      </div>

      {/* Precision Dot */}
      <div 
        ref={dotRef}
        className={getDotClasses()}
      />
    </div>
  );
};

export default CustomCursor;
