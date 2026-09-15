import React, { useEffect, useState, useCallback, useRef, Suspense, lazy } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetailView = lazy(() => import('./components/ProjectDetailView'));

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
          className="absolute w-[400px] h-[400px] bg-silver-500/[0.15] orange-glow rounded-full transition-transform duration-[800ms] ease-out will-change-transform"
          style={{ transform: `translate3d(${mousePos.x - 200}px, ${mousePos.y - 200}px, 0)` }}
        ></div>
      )}

      <div className={`absolute top-[10%] right-[-5%] w-[600px] h-[600px] ${isDetail ? 'bg-silver-600/[0.1]' : 'bg-slate-400/[0.08]'} rounded-full blur-[200px] animate-drift pointer-events-none transition-colors duration-1000`}></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[700px] h-[700px] bg-slate-200/[0.05] rounded-full blur-[220px] animate-drift-slow pointer-events-none"></div>
    </div>
  );
});


const WorkView: React.FC<{
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onSideProjectClick: (project: Project) => void;
}> = React.memo(({ projects, onProjectClick, onSideProjectClick }) => {
  return (
    <div className="relative">
      <section id="hero" className="pt-28 md:pt-48 pb-0 px-6 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="reveal flex flex-col items-start text-left mt-6 md:mt-0" data-delay="100">
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
          <div className="border-t border-white/10 mb-8 md:mb-20 pt-12 reveal">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
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
      <section id="side-projects" className="pt-32 pb-10 md:py-32 relative z-10 overflow-hidden border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 mb-8 md:mb-24 reveal relative z-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div>
              <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-3 block font-sans">Personal Work</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-display text-white">Other Projects</h2>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24 md:pb-20">
          <ProjectStack projects={SIDE_PROJECTS} onProjectClick={onSideProjectClick} />
        </div>
      </section>
    </div>
  );
});


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
            <div className="pt-20 p-8 md:p-16">
              {/* Header Text */}
              <div className="mb-16">
                <span className="text-[10px] md:text-xs font-black tracking-[0.4em] text-silver-500 uppercase mb-4 block">
                  {project.category}
                </span>
                <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter font-display">
                  {project.title}
                </h2>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-0 md:mb-20 pb-4 md:pb-12 border-b border-white/5">
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

              {/* Stack - Mobile only, sits right under Project Details */}
              {project.tools && (
                <section className="md:hidden mt-6 mb-16">
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

              {/* Content Sections */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16">
                <div className="md:col-span-8 space-y-0 md:space-y-20">
                  {/* Project Overview */}
                  <section className="mb-14 md:mb-0">
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">Overview</h3>
                    <p className="text-lg text-white/70 leading-relaxed font-light mb-0 md:mb-8">
                      {project.description}
                    </p>
                  </section>

                  {/* Overview Image (Main Banner) */}
                  {project.overviewImageUrl && (
                    <div 
                      onClick={() => onExpandImage(project.overviewImageUrl!)}
                      className="w-full aspect-video md:aspect-[21/10] rounded-3xl overflow-hidden border border-white/10 shadow-2xl cursor-zoom-in group mb-8"
                    >
                      <img loading="lazy" decoding="async" 
                        src={project.overviewImageUrl} 
                        alt="Project Overview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                  )}

                  {/* Problem */}
                  <section className="mb-14 md:mb-0 pt-10 md:pt-0 border-t md:border-t-0 border-white/10">
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
                        <img loading="lazy" decoding="async" 
                          src={Array.isArray(project.researchImage1) ? project.researchImage1[0] : project.researchImage1} 
                          alt="Research Insight"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                  </section>

                  {/* Research */}
                  <section className="mb-14 md:mb-0 pt-10 md:pt-0 border-t md:border-t-0 border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">Research</h3>
                    <p className="text-lg text-white/60 leading-relaxed font-light mb-8">
                      {project.researchOverview || "Deep diving into user behaviors and market trends to inform evidence-based design decisions."}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {project.researchImage2 ? (
                        <div
                          onClick={() => onExpandImage(project.researchImage2!)}
                          className="aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5 cursor-zoom-in group"
                        >
                          <img loading="lazy" decoding="async" src={project.researchImage2} alt="Research 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      ) : (
                        <div className="aspect-video md:aspect-[4/3] rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <span className="text-white/20 text-xs uppercase tracking-widest">Research Asset 01</span>
                        </div>
                      )}
                      {project.researchImage3 ? (
                        <div
                          onClick={() => onExpandImage(project.researchImage3!)}
                          className="aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5 cursor-zoom-in group"
                        >
                          <img loading="lazy" decoding="async" src={project.researchImage3} alt="Research 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      ) : (
                        <div className="aspect-video md:aspect-[4/3] rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <span className="text-white/20 text-xs uppercase tracking-widest">Research Asset 02</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Solution */}
                  <section className="mb-14 md:mb-0 pt-10 md:pt-0 border-t md:border-t-0 border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">The Solution</h3>
                    <p className="text-lg text-white/60 leading-relaxed font-light mb-8">
                      {project.solution || "A streamlined digital solution focused on user-centric design principles and intuitive interaction patterns."}
                    </p>
                    {project.solutionImage && (
                      <div 
                        onClick={() => onExpandImage(project.solutionImage!)}
                        className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-xl cursor-zoom-in group"
                      >
                        <img loading="lazy" decoding="async" src={project.solutionImage} alt="Solution" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    )}
                  </section>

                  {/* Design Details */}
                  <section className="space-y-8 mb-14 md:mb-0 pt-10 md:pt-0 border-t md:border-t-0 border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">Design Details</h3>
                    {project.designDetailImage1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Array.isArray(project.designDetailImage1) ? (
                          project.designDetailImage1.map((img, i) => (
                            <div
                              key={i}
                              onClick={() => onExpandImage(img)}
                              className="aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in group"
                            >
                              <img loading="lazy" decoding="async" src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                          ))
                        ) : (
                          <div
                            onClick={() => onExpandImage(project.designDetailImage1 as string)}
                            className="md:col-span-2 aspect-video rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in group"
                          >
                            <img loading="lazy" decoding="async" src={project.designDetailImage1 as string} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          </div>
                        )}
                      </div>
                    )}
                    {project.designDetailImage2 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Array.isArray(project.designDetailImage2) ? (
                          project.designDetailImage2.map((img, i) => (
                            <div
                              key={i}
                              onClick={() => onExpandImage(img)}
                              className="aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in group"
                            >
                              <img loading="lazy" decoding="async" src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                          ))
                        ) : (
                          <div
                            onClick={() => onExpandImage(project.designDetailImage2 as string)}
                            className="md:col-span-2 aspect-video rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in group"
                          >
                            <img loading="lazy" decoding="async" src={project.designDetailImage2 as string} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          </div>
                        )}
                      </div>
                    )}
                    {project.designMainImage && (
                      <div 
                        onClick={() => {
                          if (!project.designMainImage?.endsWith('.mp4')) onExpandImage(project.designMainImage!);
                        }}
                        className={`aspect-video w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl group ${project.designMainImage.endsWith('.mp4') ? '' : 'cursor-zoom-in'}`}
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
                          <img loading="lazy" decoding="async" src={project.designMainImage} alt="Final Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        )}
                      </div>
                    )}
                  </section>

                  {/* Conclusion */}
                  <section className="mb-0 pt-10 md:pt-0 border-t md:border-t-0 border-white/10">
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
                      <section className="hidden md:block">
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
                          <ChevronRight className="w-4 h-4 text-silver-500 transition-transform group-hover/btn:translate-x-1" />
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
              <img loading="lazy" decoding="async" 
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

                  {/* Freelance Section */}
                  <div>
                    <div className="flex items-center gap-4 mb-10">
                      <span className="text-[11px] font-black tracking-[0.4em] uppercase text-white/50 font-sans whitespace-nowrap">Freelance Clients</span>
                      <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-12 gap-y-10">
                      {[
                        { name: 'Michigan', logo: '/images/MichiganLogo.webp' },
                        { name: 'Aquent', logo: '/images/aquent_logo.webp' },
                        { name: 'GMC', logo: '/images/GMC-Logo.webp' },
                      ].map((client, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 group/client">
                          <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover/client:bg-white/10 group-hover/client:border-white/20 transition-all duration-500 shadow-xl group-hover/client:-translate-y-1">
                            <img loading="lazy" decoding="async" 
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
    "/images/IMG_1706.webp",
    "/images/IMG_0297.webp",
    "/images/IMG_3793.webp",
    "/images/IMG_3817.webp",
    "/images/IMG_7684.webp",
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

  const handleSideProjectClick = useCallback((project: Project) => {
    setSelectedOtherProject(project);
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
    { text: 'remember that you <span class="text-silver-500">must live</span>', author: 'Memento Vivere' },
    { text: 'A person who never made a mistake <span class="text-silver-500"> never tried anything new </span>', author: 'Albert Einstein' },
    { text: 'The best way to <span class="text-silver-500"> predict your future </span> is to create it', author: 'Abraham Lincoln' },
    { text: '<span class="text-silver-500">Be yourself</span>, everyone else is already taken', author: 'Oscar Wilde' }
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);

  const cycleQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  }, [QUOTES.length]);

  const handleLoadingComplete = useCallback(() => setIsLoading(false), []);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
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
    <div className="min-h-screen bg-[#080808] text-white selection:bg-silver-500/30 selection:text-silver-200 overflow-x-hidden custom-cursor-area">
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
            onSideProjectClick={handleSideProjectClick}
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
          <div className="pt-40 pb-10 md:pb-32 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="grid grid-cols-12 gap-5 md:gap-6">
              
              {/* Row 1: Intro Card */}
              <div className="order-1 md:order-none col-span-12 md:hidden flex flex-col justify-center mb-6">
                <h2 className="text-3xl font-display font-bold leading-tight mb-3 text-white">
                  Hey, I'm Jonte -
                </h2>
                <p className="text-base text-white/70 font-light leading-relaxed mb-6">
                  Thanks for stopping by!
                </p>
                <div className="h-px w-full bg-white/10"></div>
              </div>
              <BentoCard className="hidden md:flex md:col-span-5 flex-col justify-center h-[220px]">
                <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-3">
                  Hey, I'm Jonte -
                </h2>
                <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                  Thanks for stopping by!
                </p>
              </BentoCard>

              {/* Row 1: Gallery 1 */}
              <BentoCard noPadding className="order-2 md:order-none col-span-12 md:col-span-2 h-[220px]">
                <img loading="lazy" decoding="async" src="/images/regenerated_image_1778557222201.jpg" className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000" />
              </BentoCard>

              {/* Row 1: Gallery 2 */}
              <BentoCard noPadding className="order-6 md:order-none col-span-6 md:col-span-2 h-[280px] md:h-[220px]">
                <img loading="lazy" decoding="async" src="/images/regenerated_image_1778557476458.jpg" className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000" />
              </BentoCard>

              {/* Row 1: Socials Grid */}
              <div className="order-8 md:order-none col-span-12 md:col-span-3 grid grid-cols-2 grid-rows-2 gap-2 md:gap-3 h-[220px]">
                {[
                  { label: 'Dribbble', url: 'https://dribbble.com/Jtaffe', icon: <img src="https://cdn.simpleicons.org/dribbble/ffffff" alt="Dribbble" className="w-5 h-5 opacity-80 group-hover/social:opacity-100 transition-opacity" referrerPolicy="no-referrer" /> },
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
              <BentoCard noPadding className="order-5 md:order-none col-span-6 md:col-span-2 h-[280px]">
                <img loading="lazy" decoding="async" src="https://cdn.midjourney.com/115b35c3-7cb2-46db-b226-6058e28a39cb/0_3.png" className="w-full h-full object-cover" />
              </BentoCard>

              {/* Row 2: About */}
              <BentoCard
                className="order-3 md:order-none col-span-12 md:col-span-4 h-[200px] md:h-[280px] flex flex-col justify-between"
                onClick={() => setIsAboutModalOpen(true)}
              >
                <div><span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/80 mb-4 block font-sans">About</span><p className="text-base md:text-2xl font-display font-medium leading-tight text-white line-clamp-4 md:line-clamp-none">Passionate about turning complex ideas into intuitive, human-centered products.</p></div>
                <div className="flex justify-end"><div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white/60 transition-colors"><svg className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div></div>
              </BentoCard>

              {/* Row 2: Gallery Laptop */}
              <BentoCard noPadding className="order-7 md:order-none col-span-12 md:col-span-3 h-[280px]">
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
                        className={`h-0.5 rounded-full transition-all duration-500 ${i === galleryIndex ? 'bg-silver-500 w-4' : 'bg-white/20 w-1'}`}
                      />
                    ))}
                  </div>
                </div>
              </BentoCard>

              {/* Row 2: Play */}
              <BentoCard className="hidden md:flex col-span-12 md:col-span-3 h-[280px] flex-col justify-between bg-white/[0.02] opacity-60 pointer-events-none select-none border-white/5">
                <div><span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/40 mb-4 block font-sans">Play</span><p className="text-xl md:text-2xl font-display font-medium leading-tight text-white/60">In progress</p></div>
                <div className="flex justify-end opacity-0"><div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center"><svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div></div>
              </BentoCard>

              {/* Row 3: Spotify Now Playing */}
              <BentoCard noPadding className="hidden md:flex col-span-12 md:col-span-5 h-[140px] flex-col justify-center bg-[#1DB954]/5 overflow-hidden group/spotify">
                <SpotifyCard />
                {/* Subtle green glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/5 to-transparent opacity-0 group-hover/spotify:opacity-100 transition-opacity duration-700"></div>
              </BentoCard>

              {/* Row 3: Quote Box - Refined with click icon in top right */}
              <BentoCard
                noPadding
                className="hidden md:flex col-span-12 md:col-span-3 h-[140px] flex-col justify-between overflow-hidden group/quote relative bg-white/[0.04] cursor-pointer active:scale-[0.98] transition-all duration-300"
                onClick={cycleQuote}
              >
                <div className="flex justify-between items-center relative z-10 px-6 pt-5">
                  <span className="text-[9px] font-black tracking-[0.4em] uppercase text-white/60 font-sans">Quote</span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover/quote:border-silver-500/50 transition-colors">
                    <MousePointer2 className="w-3.5 h-3.5 text-white/60 group-hover/quote:text-silver-500 transition-colors" />
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
                <div className="absolute inset-0 bg-gradient-to-br from-silver-500/5 to-transparent opacity-0 group-hover/quote:opacity-100 transition-opacity duration-700"></div>
              </BentoCard>

              {/* Row 3: Stack - Refined Layout */}
              <BentoCard noPadding className="order-4 md:order-none col-span-12 md:col-span-4 h-[140px] flex flex-col overflow-hidden group/stack-card relative bg-white/[0.02]">
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
                          <img loading="lazy" decoding="async" 
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
                <div className="absolute inset-0 bg-gradient-to-br from-silver-500/5 to-transparent opacity-0 group-hover/stack-card:opacity-100 transition-opacity duration-700"></div>
              </BentoCard>

            </div>
          </div>
        )}

        {currentView === 'project-detail' && selectedProject && (
          <Suspense fallback={null}>
            <ProjectDetailView
              project={selectedProject}
              projects={PROJECTS}
              onBack={handleBack}
              onNext={handleNextProject}
              onExpandImage={setExpandedImage}
            />
          </Suspense>
        )}
      </main>

      <footer id="contact" className="py-24 px-6 border-t border-white/5 text-center relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-sm mb-8 overflow-hidden">
            <img loading="lazy" decoding="async" 
              src="/images/Czyboylogo3.webp" 
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