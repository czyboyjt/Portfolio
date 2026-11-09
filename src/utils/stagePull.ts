import { useSyncExternalStore } from 'react';

// While a case study is opening, open or closing, the stage behind it "pulls back" (scales down,
// blurs, dims) and the other pieces (the two smaller images, the title, the list) fly out, so the
// hero image feels like it is travelling through them. On close they fly back in. This flag drives
// all of it: CSS rules in index.css and the stage's own animations react to it.
let pulled = false;
const listeners = new Set<() => void>();

export const setStagePull = (on: boolean) => {
  if (typeof document === 'undefined' || on === pulled) return;
  pulled = on;
  if (on) document.documentElement.dataset.stagePull = '1';
  else delete document.documentElement.dataset.stagePull;
  listeners.forEach((l) => l());
};

export const useStagePull = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => pulled,
    () => false
  );

// Shared by the open and close images: a smooth in-out ease (gentle start, gentle landing)
export const ZOOM_EASE = [0.65, 0, 0.35, 1] as const;

// Opening a case study from somewhere other than the hero image (the list, the Enter key) should
// play the same zoom. The stage listens for this event and, if it is showing that project, claims
// it and runs the zoom; otherwise the caller's fallback opens the case study directly.
const OPEN_EVENT = 'open-case-study-zoom';

export const requestZoomOpen = <T extends { id: string }>(project: T, fallback: () => void) => {
  let claimed = false;
  window.dispatchEvent(
    new CustomEvent(OPEN_EVENT, { detail: { project, claim: () => { claimed = true; } } })
  );
  if (!claimed) fallback();
};

export const onZoomOpenRequest = <T extends { id: string }>(
  handler: (project: T) => boolean // return true if handled
) => {
  const listener = (e: Event) => {
    const { project, claim } = (e as CustomEvent).detail as { project: T; claim: () => void };
    if (handler(project)) claim();
  };
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
};

// The hero video plays on the stage card, in the zoom image and in the case-study header. These
// hand each one's playback position to the next, so it keeps playing instead of restarting.
// The current picture of a playing video, as a small image. The zoom shows it underneath the video
// while that loads and seeks, so the still poster never flashes in between.
export const captureFrame = (video: HTMLVideoElement | null | undefined): string | null => {
  try {
    if (!video || video.readyState < 2 || !video.videoWidth) return null;
    const w = 960;
    const h = Math.round((video.videoHeight / video.videoWidth) * w);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d')?.drawImage(video, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.82);
  } catch {
    return null;
  }
};

export const heroVideoRegistry: {
  frame: string | null; // the last captured picture of the stage video, used by the page that opens
  stage: HTMLVideoElement | null;
  ghost: HTMLVideoElement | null;
  closeGhost: HTMLVideoElement | null;
} = { frame: null, stage: null, ghost: null, closeGhost: null };
