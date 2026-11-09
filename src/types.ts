import type { MotionValue } from 'motion/react';

// Normalised (0..1) mouse position as motion values: components derive their parallax from these
// directly, so moving the mouse never re-renders React.
export interface MouseMotion {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export interface ProjectCardImages {
  left: {
    url?: string;
    alt: string;
    caption: string;
    gradient: string;
    aspectRatio: string;
  };
  topRight: {
    url?: string;
    alt: string;
    caption: string;
    gradient: string;
    aspectRatio: string;
  };
  bottomRight: {
    url?: string;
    alt: string;
    caption: string;
    gradient: string;
    aspectRatio: string;
  };
}

export interface Project {
  id: string;
  title: string;
  displayTitle: string; // E.g. "Metamorph"
  slug: string;
  year: string;
  discipline: string;
  client: string;
  role?: string; // your role on the project, shown top-right of the stage
  stack?: string[]; // tools used, shown bottom-left as logos (text chip when no logo is known)
  location: string;
  accentColor: string; // e.g. '#EAB308' (golden amber as in screenshot)
  tagline: string;
  description: string;
  overview: string;
  deliverables: string[];
  tools: string[];
  cardTheme?: 'blue-brand' | 'shop-light' | 'dark-fund' | 'metamorph-3d' | 'default';
  cardSubtitle?: string;
  images: ProjectCardImages;
  heroImage?: string;
  backdropImage?: string; // fades in behind the projects section while this project is active
  // The look of this project's case-study page: a base colour (not pure black) and a glow colour used
  // for the faint haze and the lit parts of the skill-tree line
  // style 'library': the Talos landing page's Library look (ruins-in-fog backdrop, Outfit/Inter type)
  world?: { base: string; glow: string; style?: 'library'; backdrop?: string; plain?: boolean; soften?: { blur: number; dim: number }; tint?: number };
  // Written-for-reading copy for the case-study page: a short headline and body per chapter, with an
  // optional phrase to pick out, plus one big statement between chapters
  story?: {
    overview: { headline: string; body: string; highlight?: string };
    approach: { headline: string; body: string; highlight?: string };
    work: { headline: string; body: string; highlight?: string };
    statement?: { text: string; note?: string };
    // the research findings, shown under the Approach chapter
    insights?: string[];
    // research pictures (personas, audits, scenarios), shown under the findings
    research?: { url: string; title: string }[];
    // what I did, step by step, shown under The work
    process?: { title: string; text: string; image?: string; wide?: boolean }[];
    // the Outcome chapter: an optional summary line, the numbers, and a reflection
    outcome?: { summary?: string; stats?: { value: string; label: string; note: string }[]; reflection: string; next?: string };
  };
  heroVideo?: string; // plays in the case-study header, fading in over the still once the zoom has landed
  galleryImages: {
    url?: string;
    title: string;
    description: string;
    gradient: string;
    square?: boolean; // shown in a row of three beneath the wide images (phone screens, icons)
  }[];
}

// What the Ask card hands to the film when a skill is picked, so the film can grow out of the card: where the card was, and
// a copy of what was in it.
export interface AskHandoff {
  rect: { left: number; top: number; width: number; height: number };
  html: string;
}
