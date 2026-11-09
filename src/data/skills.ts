// What each project shows about each skill. This is placeholder content for the "Ask" section, written from the
// projects' own text and artifacts. Every entry should be checked against what was actually done, and the `owned`
// tag in particular is the honest line between "I did this" and "the team did".

export type Owned = 'I led' | 'I owned' | 'I contributed' | 'Team';

export interface SkillDef {
  id: string;
  label: string;
  line: string; // one line on what the skill means here
}

export interface Evidence {
  skill: string;
  project: string; // a project id
  owned: Owned;
  text: string; // what was done, in first person where it is true
  artifact?: { src: string; label: string }; // a real picture from the project that shows it
}

export const SKILLS: SkillDef[] = [
  { id: 'research', label: 'Research', line: 'Interviews, audits and testing, turned into direction.' },
  { id: 'strategy', label: 'Strategy', line: 'Framing the problem and deciding what to build first.' },
  { id: 'design', label: 'Design', line: 'Structure, flows and interfaces that make a complex thing clear.' },
  { id: 'prototyping', label: 'Prototyping', line: 'Getting an idea in front of people before it is built.' },
  { id: 'building', label: 'Building', line: 'Shipping the real thing, front to back.' },
  { id: 'collaboration', label: 'Leading and collaborating', line: 'Running the process and working with the people in it.' },
];

export const EVIDENCE: Evidence[] = [
  // ------------------------------------------------------------------ research
  { skill: 'research', project: 'talos', owned: 'I owned', text: 'Researched how calisthenics athletes learn skills through interviews, a competitive analysis and field studies, before designing the skill tree.', artifact: { src: '/images/talos/TalComp.webp', label: 'Competitive analysis' } },
  { skill: 'research', project: 'marketeq-digital', owned: 'Team', text: 'Audited how leading SaaS products organise content, and found that the best ones treat tags as navigation.', artifact: { src: '/images/marketeq/MComp1.webp', label: 'Competitive analysis' } },
  { skill: 'research', project: 'integrate', owned: 'I contributed', text: 'Ran user interviews, stakeholder workshops, a comparative audit and journey mapping to shape the information architecture.', artifact: { src: '/images/integrate/IPersona1.webp', label: 'Persona' } },
  { skill: 'research', project: 'seerlight', owned: 'I owned', text: 'Ran 15 user interviews, remote usability tests and card sorting with students, which showed they wanted guided, playful structure.', artifact: { src: '/images/seerlight/SPersona1.webp', label: 'Persona' } },
  { skill: 'research', project: 'gmc-interface', owned: 'Team', text: 'Built personas and scenarios around first-time EV truck owners to find four gaps in how drivers manage energy.', artifact: { src: '/images/gmc/Gscenario.webp', label: 'Scenario' } },

  // ------------------------------------------------------------------ strategy
  { skill: 'strategy', project: 'talos', owned: 'I owned', text: 'Wrote the product requirements and used Kano analysis to rank features by user value and complexity, which set the scope of the first version.', artifact: { src: '/images/talos/TalPlan.webp', label: 'Feature prioritisation' } },
  { skill: 'strategy', project: 'marketeq-digital', owned: 'Team', text: 'Used the Kano method to pick the tag features that would give users the most value.', artifact: { src: '/images/marketeq/MCow.webp', label: 'Kano chart' } },
  { skill: 'strategy', project: 'integrate', owned: 'Team', text: 'Paired Gantt-based dependency planning with Jira sprint tracking, mapping every required screen to a sprint.', artifact: { src: '/images/integrate/IRoadmap.webp', label: 'Roadmap' } },
  { skill: 'strategy', project: 'vocalii', owned: 'I owned', text: 'Scoped the product into ten Phase 1 features across three phases, so the first build never needs rebuilding later.', artifact: { src: '/images/vocalii/rituals.jpg', label: 'The daily rituals' } },

  // ------------------------------------------------------------------ design
  { skill: 'design', project: 'seerlight', owned: 'I owned', text: 'Built the information architecture that turned a complex admissions process into clear, step-by-step pathways.', artifact: { src: '/images/seerlight/infoarchSeer.webp', label: 'Information architecture' } },
  { skill: 'design', project: 'marketeq-digital', owned: 'Team', text: 'Designed the flows for how clients tag, group and search their content.', artifact: { src: '/images/marketeq/MFlow.webp', label: 'User flow' } },
  { skill: 'design', project: 'integrate', owned: 'I contributed', text: 'Helped build a component library from scratch on top of the core design system, so 20 new screens stayed consistent.', artifact: { src: '/images/integrate/IDesignOp.webp', label: 'Design ops' } },
  { skill: 'design', project: 'gmc-interface', owned: 'Team', text: 'Designed an activity-aware interface that adapts power use and layout to what the driver is doing.', artifact: { src: '/images/gmc/GMR1.webp', label: 'Research to concept' } },

  // ------------------------------------------------------------------ prototyping
  { skill: 'prototyping', project: 'marketeq-digital', owned: 'Team', text: 'Turned the flows into wireframes and interactive prototypes quickly, on an existing component library, and tested them early.', artifact: { src: '/images/marketeq/Mwire.webp', label: 'Wireframes' } },
  { skill: 'prototyping', project: 'seerlight', owned: 'I owned', text: 'Used low-fidelity wireframes to test structure and flow, then revised the concept after usability testing.', artifact: { src: '/images/seerlight/WireframSeer.webp', label: 'Wireframes' } },
  { skill: 'prototyping', project: 'talos', owned: 'I owned', text: 'Designed the interface in Figma, then built it into a working mobile prototype to test the experience directly.', artifact: { src: '/images/talos/TalDD.webp', label: 'Figma to working app' } },

  // ------------------------------------------------------------------ building
  { skill: 'building', project: 'talos', owned: 'I owned', text: 'Built the backend in Supabase and SQL, connected AI APIs for the coach, and developed the app with AI-assisted tools.', artifact: { src: '/images/talos/TalBack.webp', label: 'Backend architecture' } },
  { skill: 'building', project: 'vocalii', owned: 'I owned', text: 'Designed and built a working app, not a prototype, in React and TypeScript with Supabase behind it.', artifact: { src: '/images/vocalii/report.jpg', label: 'The voice analyzer' } },
  { skill: 'building', project: 'muskegon-polish-festival', owned: 'I contributed', text: 'Developed the interactive mobile and tablet experience as one of five on the team, and acted as product owner.', artifact: { src: '/images/muskegon/booth.jpg', label: 'At the festival' } },

  // ------------------------------------------------------------------ collaboration
  { skill: 'collaboration', project: 'integrate', owned: 'I owned', text: 'Designed and owned the design sprint framework: a weekly cadence, rotating roles and screens allocated each sprint.', artifact: { src: '/images/integrate/ICycle.webp', label: 'Sprint cycle' } },
  { skill: 'collaboration', project: 'muskegon-polish-festival', owned: 'Team', text: 'Ran a collaborative Agile process with rotating leadership, regular syncs and sprint retrospectives.', artifact: { src: '/images/muskegon/MuskR2.webp', label: 'How we worked' } },
  { skill: 'collaboration', project: 'seerlight', owned: 'I owned', text: 'Worked with an engineer throughout, and learned when to hold firm on a design decision with stakeholders.', artifact: { src: '/images/seerlight/SRevision.webp', label: 'Revisions' } },
  { skill: 'collaboration', project: 'marketeq-digital', owned: 'I contributed', text: 'Took on sprint ownership and defended design decisions with senior designers, engineers and stakeholders.' },
];
