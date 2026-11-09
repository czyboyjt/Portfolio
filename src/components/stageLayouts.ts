// Hand-built arrangements for the project stage. Each places the three images and the title
// block on a fixed design canvas. A random one (and its mirror image) is picked every time a
// project becomes active. Curated rather than fully random, so images never collide with the
// title or leave the canvas.

export type Slot = 'left' | 'topRight' | 'bottomRight';

interface Point {
  x: number;
  y: number;
}

interface Preset {
  left: Point;
  topRight: Point;
  bottomRight: Point;
  text: Point;
}

// Design units (px at the reference size). Everything is converted to percentages, so the
// arrangement scales with the stage.
export const CANVAS = { w: 1130, h: 700 };
export const CARD_SIZE: Record<Slot, { w: number; h: number }> = {
  left: { w: 330, h: 440 }, // portrait
  topRight: { w: 700, h: 418 }, // the hero image: large landscape
  bottomRight: { w: 240, h: 240 }, // square
};
// Title block at its tallest: a two-line title plus three detail lines
export const TEXT_SIZE = { w: 400, h: 360 };

// The project's role is always shown in the top-right corner, so no layout may put the title block
// there (this holds for the mirrored variants too, since the role never moves). Enforced by the
// layout check; keep it in mind when adding a preset. The title block always sits in the bottom
// half and never covers the landscape hero; it may overlap a smaller image (it sits on a soft dark
// scrim), and images may overlap each other slightly.
export const TEXT_KEEP_OUT = { x: 780, y: 0, w: 350, h: 150 };

export const PRESETS: Preset[] = [
  { left: {x:90,y:100}, topRight: {x:400,y:240}, bottomRight: {x:470,y:20}, text: {x:30,y:320} },
  { left: {x:790,y:140}, topRight: {x:10,y:270}, bottomRight: {x:370,y:50}, text: {x:720,y:330} },
  { left: {x:0,y:160}, topRight: {x:420,y:280}, bottomRight: {x:320,y:60}, text: {x:20,y:340} },
  { left: {x:740,y:90}, topRight: {x:10,y:220}, bottomRight: {x:540,y:10}, text: {x:710,y:340} },
  { left: {x:20,y:120}, topRight: {x:430,y:270}, bottomRight: {x:570,y:50}, text: {x:60,y:320} },
  { left: {x:670,y:170}, topRight: {x:0,y:260}, bottomRight: {x:440,y:40}, text: {x:680,y:340} },
];

// Every preset, plus its left-right mirror
export const LAYOUT_COUNT = PRESETS.length * 2;

export interface CardFrame {
  left: string;
  top: string;
  width: string;
  aspect: number;
  fromRight: boolean; // slide in from the right edge when the card sits on the right half
}

export interface ResolvedLayout {
  cards: Record<Slot, CardFrame>;
  text: { left: string; top: string };
}

const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(2)}%`;

export const resolveLayout = (index: number): ResolvedLayout => {
  const preset = PRESETS[(index >> 1) % PRESETS.length];
  const mirrored = (index & 1) === 1;
  const flipX = (x: number, w: number) => (mirrored ? CANVAS.w - x - w : x);

  const card = (slot: Slot): CardFrame => {
    const { w, h } = CARD_SIZE[slot];
    const x = flipX(preset[slot].x, w);
    return {
      left: pct(x, CANVAS.w),
      top: pct(preset[slot].y, CANVAS.h),
      width: pct(w, CANVAS.w),
      aspect: w / h,
      fromRight: x + w / 2 > CANVAS.w / 2,
    };
  };

  return {
    cards: { left: card('left'), topRight: card('topRight'), bottomRight: card('bottomRight') },
    text: {
      left: pct(flipX(preset.text.x, TEXT_SIZE.w), CANVAS.w),
      top: pct(preset.text.y, CANVAS.h),
    },
  };
};

// A random layout that is a different arrangement from the previous one
export const pickLayout = (previous: number | null): number => {
  let next = Math.floor(Math.random() * LAYOUT_COUNT);
  if (previous !== null) {
    while (next >> 1 === previous >> 1) next = Math.floor(Math.random() * LAYOUT_COUNT);
  }
  return next;
};
