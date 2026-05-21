import React, { useEffect, useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import GlassButton from './components/GlassButton';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import ProjectStack from './components/ProjectStack';
import SpotifyCard from './components/SpotifyCard';
import { PROJECTS, SIDE_PROJECTS } from './constants';
import { View, Project, ProjectFeature } from './types';
import { MousePointer2, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const CinematicBackground: React.FC<{ mousePos: { x: number, y: number }, isDetail: boolean }> = React.memo(({ mousePos, isDetail }) => {
  const stars = React.useMemo(() => [...Array(60)].map((_, i) => ({
    width: Math.random() * 2 + 'px',
    height: Math.random() * 2 + 'px',
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    delay: Math.random() * 5 + 's',
    duration: (Math.random() * 5 + 4) + 's'
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#080808]">
      <div 
        className="absolute inset-[-10%] opacity-30 transition-transform duration-[1200ms] ease-out will-change-transform"
        style={{ transform: `translate3d(${mousePos.x * -0.005}px, ${mousePos.y * -0.005}px, 0)` }}
      >
        {stars.map((star, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-slate-300 animate-pulse"
            style={{
              width: star.width,
              height: star.height,
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
              animationDuration: star.duration
            }}
          />
        ))}
      </div>

      <div 
        className="absolute w-[800px] h-[800px] bg-slate-400/[0.08] rounded-full blur-[150px] transition-transform duration-[1500ms] ease-out will-change-transform"
        style={{ transform: `translate3d(${mousePos.x - 400}px, ${mousePos.y - 400}px, 0)` }}
      ></div>

      {isDetail && (
        <div 
          className="absolute w-[400px] h-[400px] bg-orange-500/[0.15] orange-glow rounded-full transition-transform duration-[800ms] ease-out will-change-transform"
          style={{ transform: `translate3d(${mousePos.x - 200}px, ${mousePos.y - 200}px, 0)` }}
        ></div>
      )}

      <div className={`absolute top-[10%] right-[-5%] w-[600px] h-[600px] ${isDetail ? 'bg-orange-600/[0.1]' : 'bg-slate-400/[0.08]'} rounded-full blur-[200px] animate-drift pointer-events-none transition-colors duration-1000`}></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[700px] h-[700px] bg-slate-200/[0.05] rounded-full blur-[220px] animate-drift-slow pointer-events-none"></div>
    </div>
  );
});

const ScrollProgress: React.FC = () => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScroll(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[110] bg-white/[0.1]">
      <div 
        className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] transition-all duration-300 ease-out"
        style={{ width: `${scroll}%` }}
      />
    </div>
  );
};

const VisualLanguageGrid: React.FC<{ 
  project: Project; 
  onImageClick: (src: string) => void; 
  designDetail1Index: number;
  designDetail2Index: number;
  setDesignDetail2Index: React.Dispatch<React.SetStateAction<number>>;
}> = ({ project, onImageClick, designDetail1Index, designDetail2Index, setDesignDetail2Index }) => {
  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-1 glass-panel p-10 rounded-[2.5rem] border border-white/20 flex flex-col justify-between hover:border-orange-500/30 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 group shadow-2xl">
          <div>
            <span className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-8 block font-sans">Typography</span>
            <h3 className="text-3xl font-bold text-white mb-6 font-display">{project.designTypography || 'Satoshi'}</h3>
            <div className="text-7xl font-bold text-white/80 leading-none mb-10 group-hover:text-orange-500 transition-colors font-display">Aa</div>
          </div>
        </div>

        <div className="lg:col-span-1 glass-panel p-10 rounded-[2.5rem] border border-white/20 hover:border-orange-500/30 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 shadow-2xl">
          <span className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-8 block font-sans">Palette</span>
          <div className="flex flex-col gap-6">
            {[
              { name: 'Primary', color: project.designColorPrimary || '#0F172A', role: 'Core' },
              { name: 'Accent', color: project.designColorAccent || '#F97316', role: 'Action' },
              { name: 'Neutral', color: project.designColorNeutral || '#F8FAFC', role: 'Base' }
            ].map((swatch, i) => (
              <div key={i} className="flex items-center gap-6 group/item">
                <div className="w-14 h-14 rounded-2xl border border-white/20 shadow-xl transition-transform group-hover/item:scale-110" style={{ backgroundColor: swatch.color }}></div>
                <div className="flex flex-col leading-tight">
                   <span className="text-lg font-bold text-white font-display tracking-tight">{swatch.color}</span>
                   <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 font-sans">{swatch.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div 
          onClick={() => {
            const currentImg = Array.isArray(project.designDetailImage1) 
              ? project.designDetailImage1[designDetail1Index] 
              : (project.designDetailImage1 || project.imageUrl);
            onImageClick(currentImg);
          }}
          className="lg:col-span-1 aspect-square md:aspect-auto glass-panel rounded-[2.5rem] border border-white/20 overflow-hidden relative group shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-700 cursor-zoom-in"
        >
          <AnimatePresence mode="wait">
            {Array.isArray(project.designDetailImage1) ? (
              <motion.img 
                key={designDetail1Index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                src={project.designDetailImage1[designDetail1Index]} 
                className="absolute inset-0 w-full h-full object-cover" 
                alt={`Design Detail 1 - ${designDetail1Index + 1}`} 
              />
            ) : (
              <img src={project.designDetailImage1 || project.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="Design Detail 1" />
            )}
          </AnimatePresence>
          {Array.isArray(project.designDetailImage1) && project.designDetailImage1.length > 1 && (
            <div className="absolute bottom-6 left-6 z-10 flex gap-1.5">
              {project.designDetailImage1.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${i === designDetail1Index ? 'bg-orange-500 w-3' : 'bg-white/20'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div 
          onClick={() => {
            if (Array.isArray(project.designDetailImage2) && project.designDetailImage2.length > 1) {
              setDesignDetail2Index((prev) => (prev + 1) % (project.designDetailImage2 as string[]).length);
            } else {
              onImageClick(project.designDetailImage2 as string || project.overviewImageUrl || '');
            }
          }}
          className={`lg:col-span-2 aspect-[2/1] glass-panel rounded-[3rem] border border-white/20 overflow-hidden relative group shadow-2xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-700 ${Array.isArray(project.designDetailImage2) && project.designDetailImage2.length > 1 ? 'cursor-pointer' : 'cursor-zoom-in'}`}
        >
          <AnimatePresence mode="wait">
            {Array.isArray(project.designDetailImage2) ? (
              <motion.img 
                key={designDetail2Index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                src={project.designDetailImage2[designDetail2Index]} 
                className="absolute inset-0 w-full h-full object-cover" 
                alt={`Design Detail 2 - ${designDetail2Index + 1}`} 
              />
            ) : (
              <img src={project.designDetailImage2 as string || project.overviewImageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" alt="Design Detail 2" />
            )}
          </AnimatePresence>
          
          <div className="absolute top-8 left-8 z-10">
            <span className="glass px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.2em] border-white/20 backdrop-blur-xl">Design Decisions</span>
          </div>

          {Array.isArray(project.designDetailImage2) && project.designDetailImage2.length > 1 && (
            <>
              <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-10">
                <div className="glass w-10 h-10 rounded-full border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform relative">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                  {project.designDetailImage2.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${i === designDetail2Index ? 'bg-orange-500 w-3' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div 
          onClick={() => onImageClick(project.designDetailImage3 || project.researchImage1 || project.imageUrl)}
          className="lg:col-span-1 aspect-square glass-panel rounded-[3rem] border border-white/20 overflow-hidden relative group shadow-2xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-700 cursor-zoom-in"
        >
           <img src={project.designDetailImage3 || project.researchImage1 || project.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="Design Detail 3" />
        </div>
      </div>
    </div>
  );
};

const WorkView: React.FC<{ 
  projects: Project[]; 
  onProjectClick: (project: Project) => void;
  onSideProjectClick: (project: Project) => void;
}> = ({ projects, onProjectClick, onSideProjectClick }) => {
  return (
    <div className="relative">
      <section id="hero" className="pt-48 pb-0 px-6 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="reveal flex flex-col items-start text-left" data-delay="100">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 font-display text-white ">Jonte Taffe</h1>
            <p className="text-base md:text-lg text-white/60 max-w-xl leading-relaxed font-light mb-4">
              Product builder combining strategy, design and technology <span className="text-purple-400">🍁</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-white/30 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em]">
              <span className="opacity-70">Previously at</span>
              <div className="flex items-center gap-2.5">
                〽️
                <span className="hover:text-white transition-colors">Michigan</span>
                <div className="relative flex h-2 w-2 ml-1">
                  <span className="animate-status-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 animate-status-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="work" className="pt-12 pb-24 px-6 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="border-t border-white/10 mb-20 pt-12 reveal">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-3 block font-sans">Portfolio</span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-display text-white">Featured Projects</h2>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 md:gap-y-12">
            {projects.map((project, idx) => (
              <div key={project.id} className="reveal" data-delay={idx * 200}>
                <ProjectCard project={project} onClick={onProjectClick} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="side-projects" className="py-32 relative z-10 overflow-hidden border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 mb-24 reveal relative z-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div>
              <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-3 block font-sans">Personal Work</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-display text-white">Other Projects</h2>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
          <ProjectStack projects={SIDE_PROJECTS} onProjectClick={onSideProjectClick} />
        </div>
      </section>
    </div>
  );
};

const ProjectDetailView: React.FC<{ 
  project: Project; 
  projects: Project[];
  onBack: () => void; 
  onNext: () => void;
  onExpandImage: (src: string) => void;
}> = ({ project, projects, onBack, onNext, onExpandImage }) => {
  const { scrollY } = useScroll();
  const [activeSection, setActiveSection] = useState('hero');
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [researchSlideIndex, setResearchSlideIndex] = useState(0);
  const [researchImage1Index, setResearchImage1Index] = useState(0);
  const [designDetail1Index, setDesignDetail1Index] = useState(0);
  const [designDetail2Index, setDesignDetail2Index] = useState(0);

  useEffect(() => {
    if (Array.isArray(project.researchImage1) && project.researchImage1.length > 1) {
      const interval = setInterval(() => {
        setResearchImage1Index((prev) => (prev + 1) % (project.researchImage1 as string[]).length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [project.researchImage1]);

  useEffect(() => {
    if (Array.isArray(project.designDetailImage1) && project.designDetailImage1.length > 1) {
      const interval = setInterval(() => {
        setDesignDetail1Index((prev) => (prev + 1) % (project.designDetailImage1 as string[]).length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [project.designDetailImage1]);

  const sections = [
    { id: 'hero', label: 'Intro' },
    { id: 'overview', label: 'Overview' },
    { id: 'problem', label: 'Challenge' },
    { id: 'research', label: 'Research' },
    { id: 'solution', label: 'Solution' },
    { id: 'process', label: 'Process' },
    { id: 'design', label: 'System' },
    { id: 'impact', label: 'Impact' },
    { id: 'reflection', label: 'Reflection' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const buffer = 150;
      let currentSectionId = sections[0].id;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= buffer && rect.bottom > buffer) {
            currentSectionId = section.id;
          }
        }
      }
      setActiveSection(currentSectionId);
      setIsNavVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const nextProject = projects[(projects.findIndex(p => p.id === project.id) + 1) % projects.length];
  
  return (
    <div className="bg-transparent min-h-screen relative z-10">
      <ScrollProgress />
      <nav className={`fixed right-8 top-0 bottom-0 w-12 z-[100] hidden lg:flex flex-col items-center justify-center transition-all duration-700 ${isNavVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}`}>
        <div className="flex flex-col gap-4 items-center p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button key={section.id} onClick={() => scrollToSection(section.id)} className="group relative flex items-center justify-center">
                  <div className={`absolute right-12 px-4 py-1.5 glass-panel rounded-full border border-orange-500/40 whitespace-nowrap opacity-0 translate-x-4 scale-90 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 transition-all duration-500 shadow-2xl bg-black/90`}>
                    <span className="text-[10px] font-black tracking-widest uppercase text-orange-500 font-sans">{section.label}</span>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-orange-500 scale-[1.8] shadow-[0_0_10px_rgba(249,115,22,1)]' : 'bg-white/30 group-hover:bg-orange-500/60'}`} />
                </button>
              );
            })}
        </div>
      </nav>

      <section id="hero" className="relative h-[110vh] w-full flex flex-col justify-end items-center px-6 pb-32 overflow-hidden">
        <motion.div 
          style={{ y: useTransform(scrollY, [0, 1000], [0, 400]) }}
          className="absolute inset-0 -z-10"
        >
          {project.imageUrl?.endsWith('.mp4') ? (
            <video 
              src={project.imageUrl} 
              className="w-full h-full object-cover brightness-[0.95] scale-110" 
              autoPlay 
              loop 
              muted 
              playsInline
            />
          ) : (
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover brightness-[0.95] scale-110" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] opacity-40"></div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto w-full relative z-10 reveal-scale">
          <button onClick={onBack} className="mb-12 glass px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-3 hover:bg-orange-500/20 hover:border-orange-500/60 transition-all border-white/40 font-sans group backdrop-blur-xl shadow-xl reveal-left" style={{ transitionDelay: '200ms' }}>
            <ChevronLeft className="w-4 h-4 text-orange-500 transition-transform group-hover:-translate-x-1" />
            Case studies
          </button>
          <div className="flex flex-col gap-2 mb-6 reveal-left" style={{ transitionDelay: '400ms' }}>
            <span className="text-[11px] font-black tracking-[0.4em] uppercase text-orange-500 block font-sans">{project.year} • PROJECT ARCHIVE</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1] mb-0 font-sans text-white reveal-left" style={{ transitionDelay: '600ms' }}>{project.title}</h1>
        </div>
      </section>

      <section id="overview" className="relative py-40 px-6 border-b border-white/10 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Description */}
            <div className="lg:col-span-8 reveal-left">
              <div className="text-[11px] font-black tracking-[0.5em] uppercase text-orange-500 mb-8 font-sans flex items-center gap-4">
                <span className="shrink-0">01 / Project Overview</span>
                <div className="h-[1px] w-12 bg-orange-500/50"></div>
              </div>
              <p className="text-2xl md:text-3xl lg:text-4xl text-white leading-[1.2] font-bold tracking-tight font-display mb-8 transition-all">
                {project.description}
              </p>
              <p className="text-base md:text-lg text-white/70 font-light max-w-2xl mb-0 leading-relaxed italic border-l-2 border-orange-500/40 pl-6">
                {project.designOverviewSubtext}
              </p>
            </div>

            {/* Right: Metadata Grid */}
            <div className="lg:col-span-4 pt-12 lg:pt-0 reveal-right" style={{ transitionDelay: '300ms' }}>
              <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 flex flex-col gap-8 shadow-2xl">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-8">
                  {project.duration && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] font-sans">Duration</span>
                      <span className="text-sm font-medium text-white/90">{project.duration}</span>
                    </div>
                  )}
                  {project.role && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] font-sans">Role</span>
                      <span className="text-sm font-medium text-white/90">{project.role}</span>
                    </div>
                  )}
                  {project.team && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] font-sans">Team</span>
                      <span className="text-sm font-medium text-white/90">{project.team}</span>
                    </div>
                  )}
                  {project.tools && project.tools.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] font-sans">Tools</span>
                      <div className="flex flex-wrap gap-2">
                        {project.tools.map((tool, i) => (
                          <span key={i} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-white/60 font-medium">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {project.externalUrl && (
                  <div className="pt-4 border-t border-white/10">
                    <a 
                      href={project.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full glass py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase text-center text-white hover:bg-orange-500/20 hover:border-orange-500/40 transition-all flex items-center justify-center gap-3 group/btn"
                    >
                      View Full Case Study
                      <svg className="w-4 h-4 text-orange-500 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-40 reveal-scale" style={{ transitionDelay: '500ms' }} ref={parallaxRef}>
            <div 
              onClick={() => {
                const isVideo = project.designMainVideo || (project.designMainImage && project.designMainImage.endsWith('.mp4'));
                if (!isVideo) onExpandImage(project.designMainImage || project.imageUrl);
              }}
              className={`relative aspect-[16/9] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group ${(project.designMainVideo || (project.designMainImage && project.designMainImage.endsWith('.mp4'))) ? '' : 'cursor-zoom-in'}`}
            >
              <motion.div style={{ y }} className="absolute inset-x-0 -top-[10%] h-[120%] w-full">
                {(project.designMainVideo || (project.designMainImage && project.designMainImage.endsWith('.mp4'))) ? (
                  <video 
                    src={project.designMainVideo || project.designMainImage} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  />
                ) : (
                  <img 
                    src={project.designMainImage || project.imageUrl} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" 
                    alt="Project Showcase" 
                  />
                )}
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="py-40 md:py-60 px-6 relative border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="reveal-scale mb-20">
            <div className="text-[11px] font-black tracking-[0.4em] uppercase text-orange-500 mb-8 font-sans">02 / The Challenge</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white font-display">Defining the <span className="text-white/40 italic">Problem.</span></h2>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light mb-8 max-w-3xl">
              {project.challenge}
            </p>
            <div className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/20 bg-white/[0.02] reveal-scale max-w-2xl" style={{ transitionDelay: '200ms' }}>
              <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mb-3 block">Problem Statement</span>
              <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed tracking-tight">
                {project.problemStatement}
              </p>
            </div>
          </div>
          
          <div 
            onClick={() => onExpandImage(project.overviewImageUrl || project.imageUrl)}
            className="relative aspect-[16/9] md:aspect-[21/9] rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl group reveal-scale cursor-zoom-in" 
            style={{ transitionDelay: '400ms' }}
          >
            {(project.overviewImageUrl?.endsWith('.mp4') || (!project.overviewImageUrl && project.imageUrl?.endsWith('.mp4'))) ? (
              <video 
                src={project.overviewImageUrl || project.imageUrl} 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
                autoPlay 
                loop 
                muted 
                playsInline
              />
            ) : (
              <img src={project.overviewImageUrl || project.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" alt="Problem Overview" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            {project.quote && (
              <div className="absolute bottom-10 left-10 right-10">
                <p className="text-xs md:text-sm font-display font-medium text-white/60 italic leading-tight">"{project.quote}"</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="research" className="py-40 md:py-60 px-6 relative border-b border-white/10 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 reveal">
            <div className="max-w-xl">
              <div className="text-[11px] font-black tracking-[0.4em] uppercase text-orange-500 mb-8 font-sans">03 / Discovery & Research</div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white font-display">User Insights.</h2>
              <p className="text-base md:text-lg text-white/70 leading-relaxed font-light">
                {project.researchOverview}
              </p>
            </div>
            <div className="flex flex-col items-end reveal-right" style={{ transitionDelay: '200ms' }}>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Methods</span>
              <div className="text-white font-medium text-right max-w-[200px]">{project.methods}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[project.researchInsights, project.researchInsight2, project.researchInsight3].map((insight, i) => insight && (
              <div key={i} className="glass-panel p-10 rounded-[2.5rem] border border-white/20 hover:border-orange-500/30 transition-all duration-500 group shadow-2xl reveal-scale" style={{ transitionDelay: `${i * 200}ms` }}>
                <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-8 text-orange-500 font-bold font-display">0{i+1}</div>
                <p className="text-base text-white leading-relaxed font-medium tracking-tight">{insight}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-8">
            <div className={`grid grid-cols-1 ${project.researchImage2 ? 'md:grid-cols-2' : ''} gap-8`}>
              {project.researchImage1 && (
                <div 
                  onClick={() => {
                    const currentImg = Array.isArray(project.researchImage1) 
                      ? project.researchImage1[researchImage1Index] 
                      : project.researchImage1;
                    onExpandImage(currentImg!);
                  }}
                  className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/20 group reveal-left cursor-zoom-in relative"
                >
                  <AnimatePresence mode="wait">
                    {Array.isArray(project.researchImage1) ? (
                      <motion.img 
                        key={researchImage1Index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        src={project.researchImage1[researchImage1Index]} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        alt={`Research 1 - ${researchImage1Index + 1}`} 
                      />
                    ) : (
                      <img src={project.researchImage1} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000" alt="Research 1" />
                    )}
                  </AnimatePresence>
                  {project.researchImage1Label && (
                    <div className="absolute top-6 left-6 z-10">
                      <span className="glass px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.2em] border-white/20 backdrop-blur-xl">
                        {project.researchImage1Label}
                      </span>
                    </div>
                  )}
                  {Array.isArray(project.researchImage1) && project.researchImage1.length > 1 && (
                    <div className="absolute bottom-6 left-6 z-10 flex gap-1.5">
                      {project.researchImage1.map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 h-1 rounded-full transition-all duration-300 ${i === researchImage1Index ? 'bg-orange-500 w-3' : 'bg-white/20'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              {project.researchImage2 && (
                <div 
                  onClick={() => onExpandImage(project.researchImage2!)}
                  className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/20 group reveal-right cursor-zoom-in relative"
                  style={{ transitionDelay: '150ms' }}
                >
                  <img src={project.researchImage2} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000" alt="Research 2" />
                  {project.researchImage2Label && (
                    <div className="absolute top-6 left-6">
                      <span className="glass px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.2em] border-white/20 backdrop-blur-xl">
                        {project.researchImage2Label}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {(project.researchCarousel || project.researchImage3) && (
              <div 
                onClick={() => {
                  const slides = project.researchCarousel 
                    ? project.researchCarousel.map(s => s.url)
                    : [project.researchImage3, project.researchImage4].filter(Boolean) as string[];
                  setResearchSlideIndex((prev) => (prev + 1) % slides.length);
                }}
                className="aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-white/20 group reveal-scale cursor-pointer relative"
                style={{ transitionDelay: '300ms' }}
              >
                <AnimatePresence mode="wait">
                  {(() => {
                    const slides = project.researchCarousel || [
                      { url: project.researchImage3, label: project.researchImage3Label },
                      { url: project.researchImage4, label: project.researchImage4Label }
                    ].filter(s => s.url);
                    const currentSlide = slides[researchSlideIndex % slides.length];
                    return (
                      <>
                        <motion.img 
                          key={researchSlideIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          src={currentSlide.url} 
                          className="absolute inset-0 w-full h-full object-cover" 
                          alt={`Research Slide ${researchSlideIndex + 1}`} 
                        />
                        {currentSlide.label && (
                          <div className="absolute top-8 left-8">
                            <motion.span 
                              key={`label-${researchSlideIndex}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="glass px-5 py-2.5 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.2em] border-white/20 backdrop-blur-xl"
                            >
                              {currentSlide.label}
                            </motion.span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </AnimatePresence>
                
                {/* Click Indicator & Slide Counter */}
                <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
                  <div className="glass w-10 h-10 rounded-full border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform relative">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                    {(project.researchCarousel || [project.researchImage3, project.researchImage4].filter(Boolean)).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${i === (researchSlideIndex % (project.researchCarousel?.length || [project.researchImage3, project.researchImage4].filter(Boolean).length)) ? 'bg-orange-500 w-3' : 'bg-white/20'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="solution" className="py-40 md:py-60 px-6 relative border-b border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24 reveal-scale">
            <div className="text-[11px] font-black tracking-[0.4em] uppercase text-orange-500 mb-8 font-sans">04 / The Solution</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white font-display">Strategic <span className="text-white/40 italic">Intervention.</span></h2>
            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light max-w-2xl mx-auto">
              {project.solution}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {project.features?.map((feature, i) => (
              <div 
                key={i} 
                className="glass-panel p-10 rounded-[2.5rem] border border-white/10 hover:border-orange-500/30 transition-all duration-500 group reveal-scale shadow-2xl"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-8 group-hover:bg-orange-500 group-hover:text-black transition-all duration-500">
                  <span className="text-sm font-black font-display">0{i+1}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 font-display group-hover:text-orange-500 transition-colors">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="py-40 md:py-60 px-6 relative border-b border-white/10 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="mb-32 reveal text-center">
            <div className="text-[11px] font-black tracking-[0.4em] uppercase text-orange-500 mb-8 font-sans">05 / Execution Process</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white font-display">How it was <span className="text-white/40 italic">Built.</span></h2>
            <p className="text-base md:text-lg text-white/50 leading-relaxed font-light max-w-2xl mx-auto">
              {project.processDescription}
            </p>
          </div>

          <div className="relative">
            {/* Central Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-orange-500/50 via-white/10 to-transparent -translate-x-1/2 hidden md:block"></div>
            
            <div className="flex flex-col gap-48 md:gap-64">
              {project.processSteps?.map((step, i) => (
                <div key={i} className={`relative flex flex-col md:flex-row items-center gap-12 md:gap-24 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''} group`}>
                  {/* Step Connector Node */}
                  <div className="absolute left-4 md:left-1/2 top-0 -translate-x-1/2 w-10 h-10 rounded-full bg-[#080808] border border-white/20 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(0,0,0,1)] group-hover:border-orange-500 transition-all duration-700 hidden md:flex reveal-scale">
                     <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-orange-500 group-hover:scale-150 transition-all duration-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                  </div>

                  {/* Content Side */}
                  <div className={`w-full md:w-1/2 ${i % 2 === 1 ? 'md:text-right md:pl-16' : 'md:text-left md:pr-16'} ${i % 2 === 1 ? 'reveal-right' : 'reveal-left'}`}>
                     <div className={`flex flex-col ${i % 2 === 1 ? 'md:items-end' : 'md:items-start'}`}>
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 block font-sans">Phase 0{i+1}</span>
                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 font-display leading-none">{step.title}</h3>
                        <div className={`h-[2px] w-12 bg-orange-500/30 mb-8 ${i % 2 === 1 ? 'md:ml-auto' : ''}`}></div>
                        <p className="text-lg text-white/40 font-bold uppercase tracking-widest mb-8 font-sans">{step.subtitle}</p>
                        <p className="text-base md:text-lg text-white/70 leading-relaxed font-light tracking-tight max-w-md">
                          {step.ideationText}
                        </p>
                     </div>
                  </div>

                  {/* Image Side */}
                  <div className={`w-full md:w-1/2 reveal-scale`} style={{ transitionDelay: '200ms' }}>
                     <div 
                       onClick={() => onExpandImage(step.imageUrl)}
                       className="relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group/img cursor-zoom-in"
                     >
                       <img src={step.imageUrl} className="w-full h-full object-cover opacity-90 group-hover/img:opacity-100 transition-all duration-[1.5s] group-hover/img:scale-110" alt={step.title} />
                       
                       {/* Glass Border Effect */}
                       <div className="absolute inset-0 border-[12px] border-white/5 pointer-events-none"></div>
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="design" className="py-40 md:py-60 px-6 relative border-b border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="text-[11px] font-black tracking-[0.4em] uppercase text-orange-500 mb-8 font-sans reveal">06 / UI & Design System</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white font-display reveal" style={{ transitionDelay: '150ms' }}>Visual Language.</h2>
          <p className="text-base md:text-lg text-white leading-relaxed mb-12 font-light max-w-2xl text-center italic reveal" style={{ transitionDelay: '300ms' }}>
            {project.designRational || "Strategic scale and weight balancing to establish hierarchical clarity."}
          </p>
          <div className="reveal-scale" style={{ transitionDelay: '450ms' }}>
            <VisualLanguageGrid 
              project={project} 
              onImageClick={(src) => onExpandImage(src)} 
              designDetail1Index={designDetail1Index} 
              designDetail2Index={designDetail2Index}
              setDesignDetail2Index={setDesignDetail2Index}
            />
          </div>
        </div>
      </section>

      <section id="impact" className="py-40 md:py-60 px-6 relative overflow-hidden border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] font-black tracking-[0.4em] uppercase text-orange-500 mb-6 font-sans reveal">07 / Outcomes & Impact</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-display reveal" style={{ transitionDelay: '200ms' }}>Project Impact.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {project.impactStats?.map((stat, i) => (
              <div key={i} className="glass-panel p-10 rounded-[2.5rem] border border-white/30 hover:border-orange-500/50 transition-all duration-500 group shadow-2xl bg-white/[0.04] reveal-scale" style={{ transitionDelay: `${i * 200 + 400}ms` }}>
                <div className="text-5xl font-bold text-orange-500 mb-4 font-display group-hover:scale-110 transition-transform origin-left">{stat.value}</div>
                <div className="text-sm font-bold text-white uppercase tracking-widest mb-4 font-sans">{stat.label}</div>
                <p className="text-white/70 text-sm leading-relaxed font-light">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reflection" className="py-40 md:py-60 px-6 relative border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-[11px] font-black tracking-[0.4em] uppercase text-orange-500 mb-8 font-sans reveal">08 / Reflection & Next Steps</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-10 text-white font-display reveal" style={{ transitionDelay: '200ms' }}>Final Thoughts.</h2>
          
          <div className="flex flex-col gap-16">
            <div className="glass-panel p-10 md:p-12 rounded-[3rem] border border-white/20 bg-white/[0.02] reveal-scale" style={{ transitionDelay: '400ms' }}>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-6 block font-sans">Retrospective</span>
              <p className="text-lg md:text-xl text-white leading-relaxed font-light italic tracking-tight whitespace-pre-wrap">
                {project.reflection}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div className="reveal-left" style={{ transitionDelay: '600ms' }}>
                <h3 className="text-2xl font-bold text-white mb-6 font-display">Next Steps</h3>
                <p className="text-base text-white/70 leading-relaxed font-light tracking-tight">
                  {project.nextSteps}
                </p>
              </div>
              <div className="glass-panel p-8 rounded-[2rem] border border-white/20 flex flex-col items-center justify-center text-center reveal-right" style={{ transitionDelay: '800ms' }}>
                <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2 font-display">Ready for Scale</h4>
                <p className="text-sm text-white/40 font-sans uppercase tracking-widest">Production Grade Architecture</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section onClick={onNext} data-cursor="project" className="h-[80vh] relative flex items-center justify-center cursor-pointer group overflow-hidden border-t border-white/10 bg-[#080808]">
        {nextProject.imageUrl?.endsWith('.mp4') ? (
          <video 
            src={nextProject.imageUrl} 
            className="absolute inset-0 w-full h-full object-cover brightness-[0.5] transition-all duration-[2s] group-hover:scale-105"
            autoPlay 
            loop 
            muted 
            playsInline
          />
        ) : (
          <img src={nextProject.imageUrl} className="absolute inset-0 w-full h-full object-cover brightness-[0.5] transition-all duration-[2s] group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all duration-700"></div>
        <div className="relative z-10 text-center flex flex-col items-center px-6">
          <span className="text-[11px] font-black tracking-[0.5em] text-orange-500 uppercase mb-8 font-sans">Next Perspective</span>
          <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tight font-display transition-all duration-1000 group-hover:scale-105 leading-none">
            {nextProject.title}
          </h2>
          <div className="mt-12 w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center transition-all group-hover:border-orange-500/60 group-hover:bg-white/15 group-hover:scale-110 shadow-2xl backdrop-blur-xl">
             <svg className="w-8 h-8 text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
             </svg>
          </div>
        </div>
      </section>
    </div>
  );
};

const BentoCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  noPadding?: boolean;
  onClick?: () => void;
}> = ({ children, className = '', noPadding = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`glass-panel rounded-[2.5rem] border border-white/10 relative group reveal flex flex-col ${noPadding ? '' : 'p-8 md:p-10'} ${className} hover:border-white/20 transition-all duration-500 shadow-sm ${!className.includes('overflow-visible') ? 'overflow-hidden' : ''} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
  >
    {children}
  </div>
);

const OtherProjectModal: React.FC<{ 
  project: Project | null; 
  onClose: () => void;
  onExpandImage: (src: string) => void;
}> = ({ project, onClose, onExpandImage }) => {
  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] glass-panel border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-8 md:p-16">
              {/* Header Text */}
              <div className="mb-16">
                <span className="text-xs font-black tracking-[0.4em] text-orange-500 uppercase mb-4 block">
                  {project.category}
                </span>
                <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter font-display">
                  {project.title}
                </h2>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-20 pb-12 border-b border-white/5">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">Timeline</h4>
                  <p className="text-sm text-white/80 font-medium">{project.duration || '2024'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">Role</h4>
                  <p className="text-sm text-white/80 font-medium">{project.role || 'Product Designer'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">Org</h4>
                  <p className="text-sm text-white/80 font-medium">{project.org || 'Personal Project'}</p>
                </div>
              </div>

              {/* Content Sections */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                <div className="md:col-span-8 space-y-20">
                  {/* Overview Image (Main Banner) */}
                  {project.overviewImageUrl && (
                    <div 
                      onClick={() => onExpandImage(project.overviewImageUrl!)}
                      className="w-full aspect-[21/10] rounded-3xl overflow-hidden border border-white/10 shadow-2xl cursor-zoom-in group mb-8"
                    >
                      <img 
                        src={project.overviewImageUrl} 
                        alt="Project Overview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                  )}

                  {/* Project Overview */}
                  <section>
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">Overview</h3>
                    <p className="text-lg text-white/70 leading-relaxed font-light mb-8">
                      {project.description}
                    </p>
                    {project.designMainImage && (
                      <div 
                        onClick={() => {
                          if (!project.designMainImage?.endsWith('.mp4')) onExpandImage(project.designMainImage!);
                        }}
                        className={`aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group ${project.designMainImage.endsWith('.mp4') ? '' : 'cursor-zoom-in'}`}
                      >
                        {project.designMainImage.endsWith('.mp4') ? (
                          <video 
                            src={project.designMainImage} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                          />
                        ) : (
                          <img src={project.designMainImage} alt="Final Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        )}
                      </div>
                    )}
                  </section>

                  {/* Problem */}
                  <section>
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">The Problem</h3>
                    <p className="text-lg text-white/60 leading-relaxed font-light mb-8">
                      {project.problemStatement || "Identifying and addressing the core friction points in the user journey to create a more seamless experience."}
                    </p>
                    {project.researchImage1 && (
                      <div 
                        onClick={() => {
                          const src = Array.isArray(project.researchImage1) ? project.researchImage1[0] : project.researchImage1;
                          if (src) onExpandImage(src);
                        }}
                        className="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5 cursor-zoom-in group"
                      >
                        <img 
                          src={Array.isArray(project.researchImage1) ? project.researchImage1[0] : project.researchImage1} 
                          alt="Research Insight"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                  </section>

                  {/* Research */}
                  <section>
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">Research</h3>
                    <p className="text-lg text-white/60 leading-relaxed font-light mb-8">
                      {project.researchOverview || "Deep diving into user behaviors and market trends to inform evidence-based design decisions."}
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                      {project.researchImage2 ? (
                        <div 
                          onClick={() => onExpandImage(project.researchImage2!)}
                          className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5 cursor-zoom-in group"
                        >
                          <img src={project.researchImage2} alt="Research 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <span className="text-white/20 text-xs uppercase tracking-widest">Research Asset 01</span>
                        </div>
                      )}
                      {project.researchImage3 ? (
                        <div 
                          onClick={() => onExpandImage(project.researchImage3!)}
                          className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5 cursor-zoom-in group"
                        >
                          <img src={project.researchImage3} alt="Research 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <span className="text-white/20 text-xs uppercase tracking-widest">Research Asset 02</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Solution */}
                  <section>
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">The Solution</h3>
                    <p className="text-lg text-white/60 leading-relaxed font-light mb-8">
                      {project.solution || "A streamlined digital solution focused on user-centric design principles and intuitive interaction patterns."}
                    </p>
                    {project.solutionImage && (
                      <div 
                        onClick={() => onExpandImage(project.solutionImage!)}
                        className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-xl cursor-zoom-in group"
                      >
                        <img src={project.solutionImage} alt="Solution" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    )}
                  </section>

                  {/* Design Details */}
                  <section className="space-y-8">
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">Design Details</h3>
                    {project.designDetailImage1 && (
                      <div className="grid grid-cols-2 gap-8">
                        {Array.isArray(project.designDetailImage1) ? (
                          project.designDetailImage1.map((img, i) => (
                            <div 
                              key={i} 
                              onClick={() => onExpandImage(img)}
                              className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in group"
                            >
                              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                          ))
                        ) : (
                          <div 
                            onClick={() => onExpandImage(project.designDetailImage1 as string)}
                            className="col-span-2 aspect-video rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in group"
                          >
                            <img src={project.designDetailImage1 as string} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          </div>
                        )}
                      </div>
                    )}
                    {project.designDetailImage2 && (
                      <div className="grid grid-cols-2 gap-8">
                        {Array.isArray(project.designDetailImage2) ? (
                          project.designDetailImage2.map((img, i) => (
                            <div 
                              key={i} 
                              onClick={() => onExpandImage(img)}
                              className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in group"
                            >
                              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                          ))
                        ) : (
                          <div 
                            onClick={() => onExpandImage(project.designDetailImage2 as string)}
                            className="col-span-2 aspect-video rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in group"
                          >
                            <img src={project.designDetailImage2 as string} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          </div>
                        )}
                      </div>
                    )}
                    {project.designMainImage && project.designMainImage !== project.overviewImageUrl && (
                      <div className="hidden border-t border-white/5 pt-8">
                         {/* Placeholder to avoid breaking layout if needed elsewhere */}
                      </div>
                    )}
                  </section>

                  {/* Conclusion */}
                  <section>
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">Conclusion</h3>
                    <p className="text-lg text-white/60 leading-relaxed font-light">
                      {project.conclusion || "This project represents a significant milestone in my design journey, reinforcing the value of user-centered methodologies and iterative refinement. The final outcome not only meets the initial objectives but sets a strong foundation for future enhancements."}
                    </p>
                  </section>
                </div>

                <div className="md:col-span-4">
                  {/* Reflection / Sidebar */}
                  <div className="sticky top-0 space-y-12">
                    <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Reflection</h3>
                      <p className="text-sm text-white/50 leading-relaxed italic">
                        "{project.reflection || "This project challenged my understanding of user constraints and pushed me to find more elegant solutions for complex problems."}"
                      </p>
                    </section>

                    {project.tools && (
                      <section>
                        <h3 className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-4">Stack</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.tools.map(tool => (
                            <span key={tool} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    {project.externalUrl && (
                      <section className="pt-6 border-t border-white/5">
                        <a 
                          href={project.externalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full glass py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase text-center text-white hover:bg-orange-500/20 hover:border-orange-500/40 transition-all flex items-center justify-center gap-3 group/btn"
                        >
                          View Full Case Study
                          <ChevronRight className="w-4 h-4 text-orange-500 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm -z-10"
          onClick={onClose}
        />
      </motion.div>
    </AnimatePresence>
  );
};

const ImageModal: React.FC<{ src: string | null; onClose: () => void }> = ({ src, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {src && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-zoom-out"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-5xl max-h-[90vh] z-10 overflow-y-auto scrollbar-hide p-4 flex flex-col items-center"
          >
            {src.endsWith('.mp4') ? (
              <video 
                src={src} 
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl" 
                autoPlay 
                loop 
                controls
                playsInline
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img 
                src={src} 
                className="w-full h-auto object-contain rounded-xl shadow-2xl" 
                alt="Expanded view" 
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </motion.div>

          <div 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-10 right-10 w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer z-[10000] backdrop-blur-2xl group"
          >
            <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const timeline = [
    {
      year: '2023 — Present',
      role: 'Lead UX Strategist',
      company: 'JT Studio',
      description: 'Architecting digital experiences where user intuition meets industrial-grade technical scalability. Leading a team of 5 designers across 12+ high-impact projects.'
    },
    {
      year: '2021 — 2023',
      role: 'Senior Product Designer',
      company: 'TechFlow Systems',
      description: 'Defined the design language for a cloud-native SaaS platform, increasing user retention by 35% through streamlined onboarding flows.'
    },
    {
      year: '2019 — 2021',
      role: 'UI/UX Designer',
      company: 'CreativePulse',
      description: 'Crafted immersive interfaces for luxury brands and cultural institutions. Focused on high-fidelity prototyping and motion design.'
    },
    {
      year: '2017 — 2019',
      role: 'Junior Designer',
      company: 'PixelPerfect Agency',
      description: 'Started my journey by mastering the fundamentals of visual design, grid systems, and typography under world-class mentorship.'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] glass-panel bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-y-auto custom-scrollbar"
          >
            <div className="p-8 md:p-12 flex flex-col gap-12">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40 mb-2 block font-sans">Perspective</span>
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight font-display text-white">About</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/30 transition-all group"
                >
                  <svg className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-10">
                {/* Bio - Refined Editorial Layout */}
                <div className="max-w-2xl">
                  <div className="space-y-6">
                    <p className="text-lg md:text-xl text-white/90 leading-snug font-normal">
                      I have always been <span className="text-white underline decoration-white/20 underline-offset-4">fascinated by people</span>, how they think, what drives them, and the way technology shapes everyday experiences.
                    </p>
                    
                    <div className="h-[1px] w-12 bg-white/10"></div>

                    <div className="space-y-4 text-[15px] text-white/60 leading-relaxed font-light">
                      <p>
                        Today, I am driven by a love for building products that sit at the intersection of human behavior, emerging technology, and thoughtful design. Iam especially excited by the ways AI can help us create more intuitive, personalized, and meaningful experiences that genuinely improve peoples lives.
                      </p>
                      <p>
                       For me, product building is more than interfaces or features — it’s about understanding people deeply, experimenting with new technologies, and turning complex ideas into experiences that feel natural, human, and impactful. I’m endlessly curious about how research, psychology, and technology can come together to push experiences — and humanity — forward.
                      </p>
                      <p className="italic text-white/50">
                      Outside of building products, I am usually playing sports, exploring hidden food spots, making music, or having a gaming night.
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-[10px] font-black tracking-[0.2em] uppercase font-sans">
                        <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                        Working on something cool? Get in touch!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience & Freelance */}
                <div className="max-w-3xl space-y-16">
                  {/* Timeline - Streamlined Sequential Layout */}
                  <div>
                    <div className="flex items-center gap-4 mb-10">
                      <span className="text-[11px] font-black tracking-[0.4em] uppercase text-white/50 font-sans whitespace-nowrap">Experience</span>
                      <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>
                    
                    <div className="space-y-12 relative">
                      {/* Vertical Line */}
                      <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/10"></div>

                      {timeline.map((item, i) => (
                        <div key={i} className="relative pl-10 group/item">
                          {/* Dot */}
                          <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-white/60 bg-white/10 z-10 group-hover/item:scale-125 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.15)] backdrop-blur-md"></div>
                          
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-baseline gap-x-3">
                              <h3 className="text-lg font-bold text-white font-display group-hover/item:text-white/90 transition-colors">{item.role}</h3>
                              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-sans">{item.year}</span>
                            </div>
                            <span className="text-sm font-medium text-white/60">{item.company}</span>
                            <p className="text-sm text-white/70 leading-relaxed mt-2 max-w-xl">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Freelance Section */}
                  <div>
                    <div className="flex items-center gap-4 mb-10">
                      <span className="text-[11px] font-black tracking-[0.4em] uppercase text-white/50 font-sans whitespace-nowrap">Freelance Clients</span>
                      <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-12 gap-y-10">
                      {[
                        { name: 'Michigan', logo: '/images/MichiganLogo.png' },
                        { name: 'Aquent', logo: '/images/aquent_logo.jpeg' },
                        { name: 'GMC', logo: '/images/GMC-Logo.jpg' },
                      ].map((client, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 group/client">
                          <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover/client:bg-white/10 group-hover/client:border-white/20 transition-all duration-500 shadow-xl group-hover/client:-translate-y-1">
                            <img 
                              src={client.logo} 
                              alt={client.name} 
                              className="w-8 h-8 object-contain opacity-40 group-hover/client:opacity-100 transition-all duration-500" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white/20 group-hover/client:text-white/60 transition-colors">{client.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('work');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedOtherProject, setSelectedOtherProject] = useState<Project | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const GALLERY_IMAGES = [
    "/images/IMG_1706.png",
    "/images/IMG_0297.png",
    "/images/IMG_3793.png",
    "/images/IMG_3817.png",
    "/images/IMG_7684.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[class*="reveal"]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [currentView, isLoading]);

  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProject(project);
    setCurrentView('project-detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleBack = useCallback(() => {
    setCurrentView('work');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNextProject = useCallback(() => {
    if (!selectedProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === selectedProject.id);
    const nextProject = PROJECTS[(currentIndex + 1) % PROJECTS.length];
    setSelectedProject(nextProject);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProject]);

  const QUOTES = [
    { text: 'remember that you <span class="text-orange-500">must live</span>', author: 'Memento Vivere' },
    { text: 'A person who never made a mistake <span class="text-orange-500"> never tried anything new </span>', author: 'Albert Einstein' },
    { text: 'The best way to <span class="text-orange-500"> predict your future </span> is to create it', author: 'Abraham Lincoln' },
    { text: '<span class="text-orange-500">Be yourself</span>, everyone else is already taken', author: 'Oscar Wilde' }
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);

  const cycleQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  }, [QUOTES.length]);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />;
  }

  const STACK_TOOLS = [
    { name: 'Figma', icon: 'figma' },
    { name: 'PostgreSQL', icon: 'postgresql' },
    { name: 'JavaScript', icon: 'javascript' },
    { name: 'HTML5', icon: 'html5' },
    { name: 'React', icon: 'react' },
    { name: 'Jira', icon: 'jira' },
    { name: 'Claude', icon: 'claude' },

  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden custom-cursor-area">
      <CinematicBackground mousePos={mousePos} isDetail={currentView === 'project-detail'} />
      <Header currentView={currentView} onViewChange={(view) => {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
      <ImageModal src={expandedImage} onClose={() => setExpandedImage(null)} />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      <OtherProjectModal 
        project={selectedOtherProject} 
        onClose={() => setSelectedOtherProject(null)} 
        onExpandImage={setExpandedImage}
      />
      
      <CustomCursor currentView={currentView} />

      <main className="relative z-10">
        {currentView === 'work' && (
          <WorkView 
            projects={PROJECTS} 
            onProjectClick={handleProjectClick} 
            onSideProjectClick={(project) => setSelectedOtherProject(project)}
          />
        )}
        
        {currentView === 'case-studies' && (
          <div className="flex items-center justify-center min-h-[120vh] px-6">
            <div className="text-center reveal">
               <h2 className="text-lg md:text-xl font-display font-medium text-white/50 tracking-[0.2em] uppercase animate-pulse">
                In progress...
               </h2>
            </div>
          </div>
        )}

        {currentView === 'info' && (
          <div className="pt-40 pb-32 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="grid grid-cols-12 gap-5 md:gap-6">
              
              {/* Row 1: Intro Card */}
              <BentoCard className="col-span-12 md:col-span-5 flex flex-col justify-center h-[220px]">
                <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-3">
                  Hey, I'm Jonte -
                </h2>
                <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                  Thanks for stopping by!
                </p>
              </BentoCard>

              {/* Row 1: Gallery 1 */}
              <BentoCard noPadding className="col-span-6 md:col-span-2 h-[220px]">
                <img src="/src/assets/images/regenerated_image_1778557222201.jpg" className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000" />
              </BentoCard>

              {/* Row 1: Gallery 2 */}
              <BentoCard noPadding className="col-span-6 md:col-span-2 h-[220px]">
                <img src="/src/assets/images/regenerated_image_1778557476458.jpg" className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000" />
              </BentoCard>

              {/* Row 1: Socials Grid */}
              <div className="col-span-12 md:col-span-3 grid grid-cols-2 grid-rows-2 gap-2 md:gap-3 h-[220px]">
                {[
                  { label: 'Dribbble', url: 'https://dribbble.com/Jtaffe', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.522-1.604 4.1-4.39 4.392-7.574v.704zm-6.715.647c-.253.033-.49.076-.694.12 2.76 7.496 3.684 9.473 3.684 9.473-.3.17-.61.314-.925.44.03-.042-1.128-2.348-3.775-9.434-2.67.625-5.377.945-8.03.953.115.54.26 1.062.427 1.57 2.383-.025 4.88-.337 7.42-.924l.02.046l1.238 3.324c1.238 3.324 1.77 6.096 1.83 7.734-.03.003-.062.01-.094.01-.61.04-1.228.062-1.854.062-1.028 0-2.022-.132-2.968-.377.008-.052.484-2.227-1.11-6.495l-.013-.032c-2.48.915-5.312 1.472-8.42 1.63-.002-.136-.005-.27-.005-.407 0-4.04 2.182-7.56 5.434-9.48.068.163.784 1.79 1.928 3.868 3.03-1.096 5.86-1.144 6.04-1.144-.015-.054-.423-1.428-1.056-3.32-3.364 1.15-7.796.884-11.455-.747l-.022.064c1.47-3.13 4.67-5.286 8.384-5.286 2.053 0 3.945.674 5.474 1.81-.035.06-.948 1.662-1.743 3.83 2.915-1.048 5.485-.34 6.27-.076.012-.032.023-.063.033-.095.534 1.135.834 2.404.834 3.743 0 1.258-.262 2.454-.734 3.535l-.01-.03z"/></svg> },
                  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jontetaffe/', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
                  { label: 'Email', url: 'mailto:jtaffe@umich.edu', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, fullWidth: true }
                ].map((social, i) => (
                  <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className={`glass-panel border border-white/5 rounded-[1.5rem] flex flex-col items-center justify-center gap-1.5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group/social shadow-lg p-2 bg-white/[0.02] ${social.fullWidth ? 'col-span-2' : ''}`}>
                    <div className="text-white/80 group-hover/social:text-white group-hover/social:scale-105 transition-all duration-300">{social.icon}</div>
                    <span className="text-[8px] font-black tracking-[0.1em] uppercase text-white/50 group-hover/social:text-white/80 transition-colors">{social.label}</span>
                  </a>
                ))}
              </div>

              {/* Row 2: Portrait */}
              <BentoCard noPadding className="col-span-6 md:col-span-2 h-[280px]">
                <img src="https://cdn.midjourney.com/115b35c3-7cb2-46db-b226-6058e28a39cb/0_3.png" className="w-full h-full object-cover" />
              </BentoCard>

              {/* Row 2: About */}
              <BentoCard 
                className="col-span-6 md:col-span-4 h-[280px] flex flex-col justify-between"
                onClick={() => setIsAboutModalOpen(true)}
              >
                <div><span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/80 mb-4 block font-sans">About</span><p className="text-xl md:text-2xl font-display font-medium leading-tight text-white">Passionate about turning complex ideas into intuitive, human-centered products.</p></div>
                <div className="flex justify-end"><div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white/60 transition-colors"><svg className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div></div>
              </BentoCard>

              {/* Row 2: Gallery Laptop */}
              <BentoCard noPadding className="col-span-12 md:col-span-3 h-[280px]">
                <div className="w-full h-full relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={galleryIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      src={GALLERY_IMAGES[galleryIndex]} 
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000" 
                      alt="Gallery Work"
                    />
                  </AnimatePresence>
                  
                  {/* Subtle index indicators */}
                  <div className="absolute bottom-4 right-4 flex gap-1 z-10">
                    {GALLERY_IMAGES.map((_, i) => (
                      <div 
                        key={i}
                        className={`h-0.5 rounded-full transition-all duration-500 ${i === galleryIndex ? 'bg-orange-500 w-4' : 'bg-white/20 w-1'}`}
                      />
                    ))}
                  </div>
                </div>
              </BentoCard>

              {/* Row 2: Play */}
              <BentoCard className="col-span-12 md:col-span-3 h-[280px] flex flex-col justify-between bg-white/[0.02] opacity-60 pointer-events-none select-none border-white/5">
                <div><span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/40 mb-4 block font-sans">Play</span><p className="text-xl md:text-2xl font-display font-medium leading-tight text-white/60">In progress</p></div>
                <div className="flex justify-end opacity-0"><div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center"><svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div></div>
              </BentoCard>

              {/* Row 3: Spotify Now Playing */}
              <BentoCard noPadding className="col-span-12 md:col-span-5 h-[140px] flex flex-col justify-center bg-[#1DB954]/5 overflow-hidden group/spotify">
                <SpotifyCard />
                {/* Subtle green glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/5 to-transparent opacity-0 group-hover/spotify:opacity-100 transition-opacity duration-700"></div>
              </BentoCard>

              {/* Row 3: Quote Box - Refined with click icon in top right */}
              <BentoCard 
                noPadding 
                className="col-span-12 md:col-span-3 h-[140px] flex flex-col justify-between overflow-hidden group/quote relative bg-white/[0.04] cursor-pointer active:scale-[0.98] transition-all duration-300"
                onClick={cycleQuote}
              >
                <div className="flex justify-between items-center relative z-10 px-6 pt-5">
                  <span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/60 font-sans">Quote</span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover/quote:border-orange-500/50 transition-colors">
                    <MousePointer2 className="w-3.5 h-3.5 text-white/60 group-hover/quote:text-orange-500 transition-colors" />
                  </div>
                </div>
                
                <div className="relative z-10 px-6 py-1 h-[60px] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={quoteIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="text-base font-display font-medium leading-tight text-white/90 group-hover:text-white transition-colors duration-500"
                      dangerouslySetInnerHTML={{ __html: `"${QUOTES[quoteIndex].text}"` }}
                    />
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-end relative z-10 px-6 pb-5">
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={quoteIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-[9px] text-white/20 font-mono uppercase tracking-widest"
                    >
                      {QUOTES[quoteIndex].author}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover/quote:opacity-100 transition-opacity duration-700"></div>
              </BentoCard>

              {/* Row 3: Stack - Refined Layout */}
              <BentoCard noPadding className="col-span-12 md:col-span-4 h-[140px] flex flex-col overflow-hidden group/stack-card relative bg-white/[0.02]">
                {/* Header - Simplified */}
                <div className="px-6 pt-5 relative z-10">
                  <span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/40 font-sans">Stack I Use</span>
                </div>
                
                {/* Marquee Content - Icons moved higher and made colorful */}
                <div className="relative w-full flex-1 flex items-center pt-2 overflow-hidden group/marquee-container">
                  <div className="flex gap-10 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap will-change-transform items-center">
                    {[...STACK_TOOLS, ...STACK_TOOLS, ...STACK_TOOLS].map((tool, i) => (
                      <div key={i} className="group/tool relative flex items-center justify-center shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-orange-500/40 hover:scale-110 transition-all duration-500 cursor-pointer shadow-lg">
                          <img 
                            src={`https://cdn.simpleicons.org/${tool.icon}`} 
                            alt={tool.name} 
                            className="w-5 h-5 object-contain opacity-80 group-hover/tool:opacity-100 transition-opacity" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Edge Fades */}
                  <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#181818] to-transparent pointer-events-none z-10" />
                  <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#181818] to-transparent pointer-events-none z-10" />
                </div>

                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover/stack-card:opacity-100 transition-opacity duration-700"></div>
              </BentoCard>

            </div>
          </div>
        )}

        {currentView === 'project-detail' && selectedProject && (
          <ProjectDetailView 
            project={selectedProject} 
            projects={PROJECTS}
            onBack={handleBack}
            onNext={handleNextProject}
            onExpandImage={setExpandedImage}
          />
        )}
      </main>

      <footer id="contact" className="py-24 px-6 border-t border-white/5 text-center relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-sm mb-8 overflow-hidden">
            <img 
              src="/images/Czyboylogo3.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12 text-white/80 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase font-sans">
            <a href="https://www.linkedin.com/in/jontetaffe/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">LinkedIn</a>
            <a href="https://dribbble.com/Jtaffe" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Dribbble</a>
            <a href="mailto:jtaffe@umich.edu" className="hover:text-orange-500 transition-colors">Email</a>
          </div>
          <div className="h-[1px] w-12 bg-white/20 mb-8"></div>
          <p className="text-white/60 text-[10px] tracking-[0.4em] uppercase font-sans">© 2026 Jonte Taffe</p>
        </div>
      </footer>
    </div>
  );
};

export default App;