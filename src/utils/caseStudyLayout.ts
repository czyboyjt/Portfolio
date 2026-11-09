// The case-study page splits into a pinned left panel and a scrolling right column on wide screens.
// The zoom image lands exactly on the video's place in that column, so the sizes are shared here.
export const SPLIT_MIN = 1280;

export const isSplitWidth = (vw: number) => vw >= SPLIT_MIN;

// Below the split width the page stacks, and the hero is a shorter picture across the screen (not the whole
// screen), starting below the top bar so the fade behind the close button does not cut into it. The zoom lands
// on this rectangle.
export const stackedHero = (vw: number, vh: number) => ({ left: 0, top: 88, width: vw, height: Math.round(vh * 0.5) });

export const splitLayout = (vw: number) => {
  const left = Math.round(Math.min(520, Math.max(360, vw * 0.34))); // width of the pinned panel
  const padL = 24; // gap between the panel and the column's content
  const padR = 40;
  const top = 96; // where the hero starts, below the label and close button
  const width = vw - left - padL - padR;
  const height = Math.round((width * 9) / 16);
  return { left, padL, padR, top, hero: { left: left + padL, top, width, height } };
};
