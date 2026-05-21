
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ProjectStackProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

const ProjectStack: React.FC<ProjectStackProps> = React.memo(({ projects, onProjectClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  // Get the visible projects (current and next 2)
  const getVisibleProjects = () => {
    const visible = [];
    for (let i = 0; i < Math.min(projects.length, 3); i++) {
      visible.push(projects[(currentIndex + i) % projects.length]);
    }
    return visible;
  };

  const visibleProjects = getVisibleProjects();

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[500px] flex items-center justify-center perspective-1000">
      <div className="relative w-[300px] md:w-[450px] h-[400px] md:h-[500px]">
        <AnimatePresence mode="popLayout">
          {visibleProjects.map((project, index) => {
            const isTop = index === 0;
            return (
              <motion.div
                key={project.id}
                layout
                initial={{ 
                  scale: 0.8, 
                  y: 40, 
                  opacity: 0,
                  rotateZ: -5
                }}
                animate={{ 
                  scale: 1 - index * 0.05, 
                  y: index * -20, 
                  zIndex: projects.length - index,
                  opacity: 1 - index * 0.2,
                  rotateZ: index * 2,
                  filter: index === 0 ? 'blur(0px)' : 'blur(2px)'
                }}
                exit={{ 
                  x: 300, 
                  opacity: 0, 
                  rotateZ: 20,
                  transition: { duration: 0.4 }
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 30 
                }}
                className="absolute inset-0"
                style={{ originX: 0.5, originY: 1 }}
              >
                <div 
                  onClick={() => isTop && onProjectClick?.(project)}
                  className={`relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl cursor-pointer group ${isTop ? 'cursor-pointer' : 'pointer-events-none'}`}
                >
                  {(project.previewVideoUrl || project.imageUrl?.endsWith('.mp4')) ? (
                    <video 
                      src={project.previewVideoUrl || project.imageUrl} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      poster={!project.imageUrl?.endsWith('.mp4') ? project.imageUrl : undefined}
                    />
                  ) : (
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  {/* Dark Overlay for visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-700" />
                  
                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="inline-block glass px-3 py-1 rounded-full border border-white/10 backdrop-blur-xl mb-3">
                      <span className="text-[9px] font-bold tracking-[0.2em] text-white/90 uppercase font-sans">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-display mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-2 font-light max-w-[80%] opacity-0 h-0 overflow-hidden group-hover:opacity-100 group-hover:h-auto group-hover:mt-2 transition-all duration-500 ease-out">
                      {project.description}
                    </p>
                  </div>

                  {isTop && (
                    <div className="absolute top-8 right-8 w-12 h-12 rounded-full glass border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        <button 
          onClick={prevProject}
          className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all group"
        >
          <ChevronLeft className="w-6 h-6 text-white group-active:scale-90 transition-transform" />
        </button>
        
        <div className="flex gap-2">
          {projects.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-orange-500' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>

        <button 
          onClick={nextProject}
          className="w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all group"
        >
          <ChevronRight className="w-6 h-6 text-white group-active:scale-90 transition-transform" />
        </button>
      </div>
    </div>
  );
});

export default ProjectStack;
