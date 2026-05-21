
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project, onClick }) => {
  return (
    <div 
      data-cursor="project"
      onClick={() => onClick?.(project)}
      className="group flex flex-col gap-4 cursor-pointer"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem] border border-white/5 transition-all duration-700 hover:border-white/20">
        {(project.previewVideoUrl || project.imageUrl?.endsWith('.mp4')) ? (
          <video 
            src={project.previewVideoUrl || project.imageUrl} 
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out scale-100 group-hover:scale-105 opacity-90 group-hover:opacity-100"
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
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out scale-100 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />
        )}
        
        {/* Dark Overlay for visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Pill Overlay - Bottom Left */}
        <div className="absolute bottom-6 left-6">
          <div className="glass px-4 py-2 rounded-full border border-white/20 backdrop-blur-xl">
            <span className="text-[11px] font-bold text-white tracking-tight font-sans">
              {project.title} • {project.year}
            </span>
          </div>
        </div>

        {/* Arrow Overlay - Top Right */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
          <div className="glass w-10 h-10 rounded-full flex items-center justify-center border border-white/20">
            <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Caption Below - Revealed on Hover */}
      <div className="px-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-out">
        <p className="text-white/50 text-sm md:text-base leading-relaxed font-light line-clamp-2">
          {project.description}
        </p>
      </div>
    </div>
  );
});

export default ProjectCard;
