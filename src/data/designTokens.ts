// The site's design tokens, as the design-system page shows them. The names match the variables defined in
// index.css (@theme and :root); the page reads the values from here so the two stay in step.

export type TokenStatus = 'Core' | 'Per project' | 'One-off' | 'Experiment';

export interface Token {
  name: string; // the CSS variable
  value: string;
  use: string; // where it is used
  status: TokenStatus;
}

export const COLOR_TOKENS: Token[] = [
  { name: '--color-cream', value: '#F4F3F0', use: 'All text and lines on dark. The one foreground.', status: 'Core' },
  { name: '--color-base', value: '#08080A', use: 'Page background.', status: 'Core' },
  { name: '--color-ink', value: '#050505', use: 'Case-study world base, behind pictures.', status: 'Core' },
  { name: '--color-accent-talos', value: '#05DF72', use: 'Talos: chapter markers, step numbers, pulse line.', status: 'Per project' },
  { name: '--color-accent-gmc', value: '#E0327F', use: 'GMC: chapter markers, step numbers, pulse line.', status: 'Per project' },
  { name: '--color-accent-marketeq', value: '#D6DAE0', use: 'Marketeq: a silver, not a hue.', status: 'Per project' },
  { name: '--color-accent-vocalii', value: '#21E8FF', use: 'Vocalii: chapter markers, step numbers.', status: 'Per project' },
  { name: '--color-accent-integrate', value: '#9D9DF2', use: 'Integrate: chapter markers, step numbers.', status: 'Per project' },
  { name: '--color-accent-seerlight', value: '#5E90FB', use: 'SeerLight: chapter markers, step numbers.', status: 'Per project' },
  { name: '--color-accent-muskegon', value: '#E5383B', use: 'Muskegon: chapter markers, step numbers.', status: 'Per project' },
];

export const FONT_TOKENS: Token[] = [
  { name: '--font-serif', value: 'Cormorant Garamond', use: 'Names, headlines, quotes, section labels.', status: 'Core' },
  { name: '--font-sans', value: 'Satoshi', use: 'Reading text, labels, interface.', status: 'Core' },
];

export const TYPE_SCALE: (Token & { sample: string; family: 'serif' | 'sans'; caps?: boolean })[] = [
  { name: '--text-display', value: '11rem', use: 'The name on the landing page.', status: 'One-off', sample: 'Jonte Taffe', family: 'serif' },
  { name: '--text-headline', value: '2.6rem', use: 'Chapter headlines in a case study.', status: 'Core', sample: 'The quick brown fox', family: 'serif' },
  { name: '--text-label', value: '1.3rem', use: 'Section and chapter labels.', status: 'Core', sample: 'The quick brown fox', family: 'serif' },
  { name: '--text-body', value: '1.2rem', use: 'Reading text, at 78% cream.', status: 'Core', sample: 'The quick brown fox', family: 'sans' },
  { name: '--text-caption', value: '11px', use: 'Small tracked caps: tags, captions, stats.', status: 'Core', sample: 'The quick brown fox', family: 'sans', caps: true },
];

export const SPACE_TOKENS: Token[] = [
  { name: '--space-1', value: '8px', use: 'Frame padding, tight gaps.', status: 'Core' },
  { name: '--space-2', value: '16px', use: 'Card internals, grid gaps.', status: 'Core' },
  { name: '--space-3', value: '24px', use: 'Page gutter on phones.', status: 'Core' },
  { name: '--space-4', value: '40px', use: 'Page gutter on tablets.', status: 'Core' },
  { name: '--space-5', value: '56px', use: 'Page gutter on desktop.', status: 'Core' },
  { name: '--space-6', value: '96px', use: 'Between major sections.', status: 'Core' },
];

export const SHAPE_TOKENS: Token[] = [
  { name: '--radius-frame', value: '2px', use: 'Pictures, cards, swatches. Almost square, on purpose.', status: 'Core' },
  { name: '--radius-pill', value: '9999px', use: 'The Hi pill and the close button.', status: 'Core' },
  { name: '--shadow-card', value: '0 20px 50px rgba(0,0,0,.6)', use: 'The hero picture in a case study.', status: 'Core' },
  { name: '--shadow-pill', value: '0 10px 30px rgba(0,0,0,.5)', use: 'The floating Hi pill.', status: 'Core' },
  { name: '--shadow-sheet', value: '0 24px 60px rgba(0,0,0,.65)', use: 'The contact card and stage cards.', status: 'Core' },
];

export const EASE_TOKENS: Token[] = [
  { name: '--ease-arrive', value: 'cubic-bezier(0.22, 1, 0.36, 1)', use: 'Things that arrive: reveals, hovers, the line drawing.', status: 'Core' },
  { name: '--ease-travel', value: 'cubic-bezier(0.65, 0, 0.35, 1)', use: 'Things that travel: the zoom into a project, this page opening.', status: 'Core' },
];

export const DURATION_TOKENS: (Token & { ms: number })[] = [
  { name: '--dur-press', value: '200ms', ms: 200, use: 'Presses and small colour changes.', status: 'Core' },
  { name: '--dur-hover', value: '500ms', ms: 500, use: 'Hover lifts, the rolling label, the underline.', status: 'Core' },
  { name: '--dur-travel', value: '850ms', ms: 850, use: 'Zoom to a project, opening this page.', status: 'Core' },
  { name: '--dur-reveal', value: '1100ms', ms: 1100, use: 'Pictures focusing in, section hairlines drawing.', status: 'Core' },
];

export const MOTIONS: { name: string; how: string; where: string; status: TokenStatus }[] = [
  { name: 'focus-in', how: 'Blur and fade to sharp, with a slight scale', where: 'Case-study pictures and the next-project preview', status: 'Core' },
  { name: 'line-draw', how: 'A hairline scales out from the left', where: 'Chapter markers, section rules, links on hover', status: 'Core' },
  { name: 'zoom-to-project', how: 'A picture grows from its card to the page', where: 'Opening a project, on the stage and the phone feed', status: 'Core' },
  { name: 'reticle', how: 'Four corners spring to frame the hovered thing', where: 'The cursor, everywhere there is a pointer', status: 'Core' },
  { name: 'magnetic-lean', how: 'An element leans a few pixels towards the pointer', where: 'Headlines, the back-to-top arrow', status: 'Core' },
  { name: 'roll-label', how: 'A label rolls up to a second word', where: 'The Say hello pill', status: 'Core' },
  { name: 'draw-on', how: 'An outline traces, then the fill arrives', where: 'This page: swatches, specimens, bars', status: 'Experiment' },
  { name: 'skeleton', how: 'Solid letters become an outline with guide lines', where: 'The name on the landing page', status: 'One-off' },
];
