import { useSyncExternalStore } from 'react';

// Whether the welcome animation has lifted its black screen. While it is still holding the screen, the painting
// waits in a soft, dark, slightly enlarged state; the moment the screen lifts it comes into focus. With no intro
// (reduced motion) it starts out lifted, so the painting is simply there.
let lifted = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : true;
const listeners = new Set<() => void>();

export const setIntroLifted = (v: boolean) => {
  if (v === lifted) return;
  lifted = v;
  listeners.forEach((l) => l());
};

export const useIntroLifted = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => lifted,
    () => true
  );
