import React, { useMemo } from 'react';
import { motion, MotionValue, useMotionTemplate, useSpring, useTransform } from 'motion/react';

// The atmosphere behind a project's case-study page (Talos). Three things, all behind the content:
//  1. A skill-tree constellation, almost invisible at rest. A soft cursor light uncovers it, and the
//     main branch lights up to the chapter you are reading.
//  2. Depth layers (hairline rings, a giant ghost mark) that move at different speeds as you scroll.
//  3. A small figure on a bar that does a slow pull-up as you scroll.

interface ProjectWorldProps {
  scrollY: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  glow: string; // the project's glow colour
  chapterIndex: number; // which chapter is being read (0-based)
  mark?: string; // image of the project's mark, shown as a giant ghost
}

// ---------------------------------------------------------------- constellation graph
const W = 1600;
const ROWS = 24;
const ROW_H = 150;
const H = ROWS * ROW_H;

// A small seeded random number generator, so the tree is the same every time
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

interface Node {
  x: number;
  y: number;
}

const buildTree = () => {
  const rand = rng(7);
  const rows: Node[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const count = r === 0 ? 2 : 3 + Math.floor(rand() * 4);
    const row: Node[] = [];
    for (let j = 0; j < count; j++) {
      row.push({
        x: ((j + 0.5) / count) * W + (rand() - 0.5) * 120,
        y: r * ROW_H + 60 + (rand() - 0.5) * 50,
      });
    }
    rows.push(row);
  }

  const edges: [Node, Node][] = [];
  for (let r = 1; r < ROWS; r++) {
    for (const n of rows[r]) {
      const sorted = [...rows[r - 1]].sort((a, b) => Math.abs(a.x - n.x) - Math.abs(b.x - n.x));
      edges.push([sorted[0], n]);
      if (sorted[1] && rand() < 0.3) edges.push([sorted[1], n]);
    }
  }

  // The main branch: one node per row, weaving gently across the tree
  const trunk: Node[] = [];
  for (let r = 0; r < ROWS; r++) {
    const target = W * (0.5 + 0.22 * Math.sin(r * 0.55));
    const best = [...rows[r]].sort((a, b) => Math.abs(a.x - target) - Math.abs(b.x - target))[0];
    trunk.push(best);
    if (r > 0) edges.push([trunk[r - 1], best]);
  }
  return { rows, edges, trunk };
};

const TREE = buildTree();

const Tree: React.FC<{ line: number; node: number }> = ({ line, node }) => (
  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" fill="none" aria-hidden="true">
    {TREE.edges.map(([a, b], i) => (
      <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={`rgba(244,243,240,${line})`} strokeWidth={1.2} />
    ))}
    {TREE.rows.flat().map((n, i) => (
      <circle key={i} cx={n.x} cy={n.y} r={4} fill={`rgba(244,243,240,${node})`} />
    ))}
  </svg>
);

// The main branch, drawn in the glow colour up to the chapter being read. Four stretches, one per
// chapter; each draws itself when its chapter is reached.
const LIT_ROWS = [0, 5, 10, 15, 20];

const LitBranch: React.FC<{ glow: string; chapterIndex: number }> = ({ glow, chapterIndex }) => (
  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" fill="none" aria-hidden="true">
    {LIT_ROWS.slice(0, -1).map((start, seg) => {
      const nodes = TREE.trunk.slice(start, LIT_ROWS[seg + 1] + 1);
      const d = nodes.map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x} ${n.y}`).join(' ');
      const on = chapterIndex >= seg;
      return (
        <g key={seg}>
          <motion.path
            d={d}
            stroke={glow}
            strokeWidth={1.4}
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: on ? 1 : 0, opacity: on ? 0.09 : 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {nodes.map((n, i) => (
            <motion.circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={5.5}
              fill={glow}
              initial={false}
              animate={{ opacity: on ? 0.13 : 0 }}
              transition={{ duration: 0.8, delay: on ? 0.2 + i * 0.12 : 0 }}
            />
          ))}
        </g>
      );
    })}
  </svg>
);

// ---------------------------------------------------------------- the figure
const Figure: React.FC<{ scrollY: MotionValue<number>; glow: string }> = ({ scrollY, glow }) => {
  // How far the body is lifted toward the bar: 0 (hanging) to 16 (chin over the bar), a slow cycle
  const lift = useTransform(scrollY, (v) => 8 + 8 * Math.sin(v / 170 - Math.PI / 2));
  const arms = useTransform(lift, (l) => {
    const sy = 34 - l; // shoulder height
    return `M-14 0 Q ${-15 - l * 0.55} ${sy / 2} -10 ${sy} M14 0 Q ${15 + l * 0.55} ${sy / 2} 10 ${sy}`;
  });
  const torso = useTransform(lift, (l) => `M0 ${34 - l} L0 ${78 - l}`);
  const legs = useTransform(lift, (l) => `M0 ${78 - l} L-6 ${110 - l} M0 ${78 - l} L6 ${110 - l}`);
  const headY = useTransform(lift, (l) => 22 - l);

  return (
    <svg viewBox="-40 -12 80 138" className="w-[64px] h-auto" fill="none" aria-hidden="true">
      <path d="M-28 0 H28" stroke="rgba(244,243,240,0.32)" strokeWidth={2} strokeLinecap="round" />
      <motion.path d={arms} stroke="rgba(244,243,240,0.3)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <motion.path d={torso} stroke="rgba(244,243,240,0.3)" strokeWidth={3.2} strokeLinecap="round" />
      <motion.path d={legs} stroke="rgba(244,243,240,0.26)" strokeWidth={1.8} strokeLinecap="round" />
      <motion.circle cx={0} cy={headY} r={6.5} fill={glow} fillOpacity={0.4} />
    </svg>
  );
};

// ---------------------------------------------------------------- the layer
export const ProjectWorld: React.FC<ProjectWorldProps> = ({ scrollY, mouseX, mouseY, glow, chapterIndex, mark }) => {
  // Parallax: every layer moves a different amount with the scroll, which is what gives the depth
  const farY = useTransform(scrollY, (v) => v * -0.05);
  const markY = useTransform(scrollY, (v) => v * -0.11);
  const treeY = useTransform(scrollY, (v) => v * -0.2);

  // The cursor light, softly following the pointer
  const mx = useSpring(mouseX, { stiffness: 140, damping: 22 });
  const my = useSpring(mouseY, { stiffness: 140, damping: 22 });
  const revealMask = useMotionTemplate`radial-gradient(circle 260px at ${mx}px ${my}px, #000 0%, rgba(0,0,0,0.5) 45%, transparent 100%)`;
  const glowLeft = useTransform(mx, (v) => v - 260);
  const glowTop = useTransform(my, (v) => v - 260);

  const rings = useMemo(
    () => (
      <svg viewBox="0 0 1600 1600" className="w-[120vh] h-auto" fill="none" aria-hidden="true">
        <circle cx="800" cy="800" r="520" stroke="rgba(244,243,240,0.05)" />
        <circle cx="800" cy="800" r="680" stroke="rgba(244,243,240,0.035)" strokeDasharray="3 9" />
        <circle cx="800" cy="800" r="790" stroke="rgba(244,243,240,0.03)" />
      </svg>
    ),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* far: hairline rings */}
      <motion.div style={{ y: farY }} className="absolute -left-[45vh] top-[4vh]">
        {rings}
      </motion.div>

      {/* mid: a giant ghost of the project's mark */}
      {mark && (
        <motion.img
          src={mark}
          alt=""
          style={{ y: markY }}
          className="absolute -right-[22vh] top-[14vh] h-[105vh] w-auto max-w-none opacity-[0.028] mix-blend-screen"
        />
      )}

      {/* near: the skill tree. A faint always-on copy, a brighter copy uncovered by the cursor light,
          and the lit main branch for the chapters reached so far */}
      <motion.div style={{ y: treeY }} className="absolute inset-x-0 top-0">
        <Tree line={0.018} node={0.03} />
      </motion.div>
      <motion.div className="absolute inset-0" style={{ WebkitMaskImage: revealMask, maskImage: revealMask }}>
        <motion.div style={{ y: treeY }} className="absolute inset-x-0 top-0">
          <Tree line={0.12} node={0.2} />
        </motion.div>
      </motion.div>
      <motion.div style={{ y: treeY }} className="absolute inset-x-0 top-0">
        <LitBranch glow={glow} chapterIndex={chapterIndex} />
      </motion.div>

      {/* the cursor light itself, very soft */}
      <motion.div
        style={{
          left: glowLeft,
          top: glowTop,
          background: `radial-gradient(circle, ${glow}08, transparent 65%)`,
        }}
        className="absolute w-[520px] h-[520px]"
      />

      {/* the figure, on the right edge */}
      <div className="hidden xl:block absolute right-10 bottom-[14%]">
        <Figure scrollY={scrollY} glow={glow} />
      </div>
    </div>
  );
};
