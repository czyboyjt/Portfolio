
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Project } from '../types';

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
              <img loading="lazy" decoding="async" src={project.designDetailImage1 || project.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="Design Detail 1" />
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
              <img loading="lazy" decoding="async" src={project.designDetailImage2 as string || project.overviewImageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" alt="Design Detail 2" />
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
           <img loading="lazy" decoding="async" src={project.designDetailImage3 || project.researchImage1 || project.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="Design Detail 3" />
        </div>
      </div>
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
  }, [project.id]);

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
            <img loading="lazy" decoding="async" src={project.imageUrl} alt={project.title} className="w-full h-full object-cover brightness-[0.95] scale-110" />
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
                  <img loading="lazy" decoding="async"
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
              <img loading="lazy" decoding="async" src={project.overviewImageUrl || project.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" alt="Problem Overview" />
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
                      <img loading="lazy" decoding="async" src={project.researchImage1} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000" alt="Research 1" />
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
                  <img loading="lazy" decoding="async" src={project.researchImage2} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000" alt="Research 2" />
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
                       <img loading="lazy" decoding="async" src={step.imageUrl} className="w-full h-full object-cover opacity-90 group-hover/img:opacity-100 transition-all duration-[1.5s] group-hover/img:scale-110" alt={step.title} />

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
          <img loading="lazy" decoding="async" src={nextProject.imageUrl} className="absolute inset-0 w-full h-full object-cover brightness-[0.5] transition-all duration-[2s] group-hover:scale-105" />
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

export default ProjectDetailView;
