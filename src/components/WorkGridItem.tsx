import React from 'react';
import { motion } from 'motion/react';
import { Project } from '../types';

interface WorkGridItemProps {
  project: Project;
  onSelect: (projectId: string) => void;
  index: number;
  theme: 'dark' | 'light';
}

export const WorkGridItem: React.FC<WorkGridItemProps> = ({ project, onSelect, index, theme }) => {
  // Map our database ratios to Tailwind ratios
  const getAspectRatioClass = (ratio: Project['aspectRatio']) => {
    switch (ratio) {
      case '1:1': return 'aspect-square';
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-[16/9]';
      case '9:16': return 'aspect-[9/16]';
      default: return 'aspect-square';
    }
  };

  // Modern stagger delay
  const motionDelay = (index % 4) * 0.08;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay: motionDelay, ease: [0.215, 0.61, 0.355, 1] }}
      onClick={() => onSelect(project.id)}
      className="group relative cursor-pointer overflow-hidden rounded-sm transition-all duration-300"
      id={`work-item-${project.id}`}
    >
      {/* Visual Container */}
      <div className={`relative w-full overflow-hidden ${getAspectRatioClass(project.aspectRatio)} ${
        theme === 'dark' ? 'bg-[#1C1A17]' : 'bg-[#e8e5de]'
      }`}>
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Minimal Elegance Overlay (Fade-in directly on top of the image - Translucent black matching the requested 40% opacity theme) */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 bg-black/40 text-white">
          {/* Top category label */}
          <div className="self-end font-mono text-[9px] px-3 py-1 rounded-full uppercase border border-white/20 bg-black/50 text-white/95">
            {project.category}
          </div>
 
          {/* Bottom title & metadata */}
          <div className="space-y-1">
            <h4 className="font-display text-lg font-bold tracking-tight text-balance shadow-sm text-white">
              {project.title}
            </h4>
            <div className="flex items-center justify-between font-mono text-[10px] text-white/95">
              <span className="tracking-wide">{project.subtitle}</span>
              <span className="border-b border-white/60 pb-0.5">{project.year}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
