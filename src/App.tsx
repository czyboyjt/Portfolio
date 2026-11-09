import React, { useState, useEffect, useCallback } from 'react';
import { PROJECTS } from './data/projects';
import { useMotionValue } from 'motion/react';
import { Project, MouseMotion, AskHandoff } from './types';
import { HieiHero } from './components/HieiHero';
import { ProjectsShowcase, ShowcaseHandle } from './components/ProjectsShowcase';
import { CaseStudyPage } from './components/CaseStudyPage';
import { ContactSection, ContactPill } from './components/Contact';
import { DesignSystemPage } from './components/DesignSystemPage';
import { Intro, shouldPlayIntro } from './components/Intro';
import { AskFilmScreen } from './components/AskFilmScreen';
import { CustomCursor } from './components/CustomCursor';
import { soundFx } from './utils/audio';
import { requestZoomOpen } from './utils/stagePull';

export default function App() {
  // the welcome animation, once per visit
  const [intro, setIntro] = useState(shouldPlayIntro);
  // The project under the pointer. It takes over from the scroll-driven project while hovering.
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  // The project the showcase is currently displaying (hovered, or chosen by scroll)
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<Project | null>(null);
  // the Ask film: the skill being shown, or null when it is closed
  const [ask, setAsk] = useState<{ skill: string; from?: AskHandoff } | null>(null);
  const askSkill = ask?.skill ?? null;
  // the design-system page, opened from the name on the landing page; holds the name's frame it opens out of
  const [designFrom, setDesignFrom] = useState<DOMRect | null>(null);

  // Section reference for smooth scrolling navigation, and the showcase's imperative controls
  const projectsRef = React.useRef<HTMLElement>(null);
  const showcaseRef = React.useRef<ShowcaseHandle>(null);

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mouse tracking for subtle ambient parallax & lighting
  // Held as motion values (not React state) so mouse movement never re-renders the page
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const mouse = React.useMemo<MouseMotion>(() => ({ x: mouseX, y: mouseY }), [mouseX, mouseY]);
  const leaveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to 0 .. 1 range
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Handlers for hover state with micro-grace period
  const handleHoverProject = (proj: Project) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setHoveredProject(proj);
  };

  const handleLeaveHover = () => {
    // The case study covers the stage: the pointer "leaving" it must not change the project underneath
    if (selectedCaseStudy) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredProject(null);
    }, 120);
  };

  const handleMouseEnterStage = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  // Arrow Up / Down step through the projects (by scrolling the pinned showcase), Enter opens one.
  // Only active while the pinned showcase is on screen, so the arrows scroll normally elsewhere.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedCaseStudy || askSkill) return;
      const showcase = showcaseRef.current;
      if (!showcase?.isPinnedInView()) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        soundFx.playTick();
        showcase.step(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        soundFx.playTick();
        showcase.step(-1);
      } else if (e.key === 'Enter' && activeProject) {
        e.preventDefault();
        soundFx.playSelect();
        requestZoomOpen(activeProject, () => setSelectedCaseStudy(activeProject));
      }
    },
    [activeProject, selectedCaseStudy, askSkill]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Previous / next inside the case-study modal
  const handleNextProject = () => {
    const currentId = selectedCaseStudy?.id || activeProject?.id || PROJECTS[0].id;
    const currentIndex = PROJECTS.findIndex((p) => p.id === currentId);
    setSelectedCaseStudy(PROJECTS[(currentIndex + 1) % PROJECTS.length]);
  };

  const handlePrevProject = () => {
    const currentId = selectedCaseStudy?.id || activeProject?.id || PROJECTS[0].id;
    const currentIndex = PROJECTS.findIndex((p) => p.id === currentId);
    setSelectedCaseStudy(PROJECTS[(currentIndex - 1 + PROJECTS.length) % PROJECTS.length]);
  };

  return (
    // overflow-x-clip (not hidden): hidden would turn this wrapper into a scroll container and stop
    // the pinned showcase from sticking to the viewport
    <div className="relative min-h-screen w-full bg-base text-neutral-100 flex flex-col justify-between overflow-x-clip">
      {/* Bespoke interactive cursor */}
      <CustomCursor />

      {/* The welcome animation, over everything until it lifts */}
      {intro && <Intro onDone={() => setIntro(false)} />}

      {/* Main Stage Content */}
      <main className="relative z-20 flex-1 flex flex-col">
        <div className="w-full flex flex-col">
          {/* Monumental Hiei Hero Section (Screenshot 3) */}
          <div id="hero">
            <HieiHero
              onViewWork={scrollToProjects}
              onOpenDesignSystem={(frame) => setDesignFrom(frame)}
              mouse={mouse}
            />
          </div>

          {/* Selected work: stage pinned on screen, scroll moves the list on the left */}
          <ProjectsShowcase
            ref={showcaseRef}
            sectionRef={projectsRef}
            projects={PROJECTS}
            hoveredProject={hoveredProject}
            mouse={mouse}
            onHoverProject={handleHoverProject}
            onLeaveProject={handleLeaveHover}
            onSelectProject={(proj) => setSelectedCaseStudy(proj)}
            onMouseEnterStage={handleMouseEnterStage}
            onActiveChange={setActiveProject}
          />


          {/* The closing section: how to reach me */}
          <ContactSection />
        </div>
      </main>

      {/* 5. Project Detail / Case Study Modal */}
      <CaseStudyPage
        project={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
        onNavigateNext={handleNextProject}
        onNavigatePrev={handlePrevProject}
        nextProject={
          selectedCaseStudy
            ? PROJECTS[(PROJECTS.findIndex((p) => p.id === selectedCaseStudy.id) + 1) % PROJECTS.length]
            : null
        }
      />

      {/* 6. A small "Say hello" pill that follows the page; hidden while a case study is open */}
      <ContactPill hidden={!!selectedCaseStudy || !!designFrom || !!askSkill} onAsk={(skill, from) => setAsk({ skill, from })} />

      {/* The Ask film, opened from the Ask pill */}
      {askSkill && (
        <AskFilmScreen
          skillId={askSkill}
          from={ask?.from}
          onClose={() => setAsk(null)}
          onOpenProject={(proj) => {
            setAsk(null);
            setSelectedCaseStudy(proj);
          }}
        />
      )}

      {/* 7. The design-system page */}
      {designFrom && <DesignSystemPage from={designFrom} onClose={() => setDesignFrom(null)} />}
    </div>
  );
}
