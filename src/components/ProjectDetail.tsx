import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Project } from '../types';
import { InteractiveCanvas } from './InteractiveCanvas';
import { 
  ArrowLeft, 
  Layers, 
  Compass, 
  Cpu, 
  Palette, 
  ChevronsRight, 
  Calendar, 
  User, 
  Activity,
  ArrowRight
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  nextProject: Project;
  onBack: () => void;
  onNavigateToProject: (projectId: string) => void;
  theme: 'dark' | 'light';
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  nextProject,
  onBack,
  onNavigateToProject,
  theme
}) => {
  // Always scroll to top upon loading a new project detail
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [project.id]);

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-brand-black text-white' : 'bg-brand-offwhite text-brand-black'
    } transition-colors duration-300 pb-20`}>
      
      {/* Absolute Back Header Floating Bar */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all duration-300 shadow-md ${
            theme === 'dark'
              ? 'border-white/10 bg-black/80 text-white hover:bg-white hover:text-black hover:border-white'
              : 'border-black/10 bg-white/80 text-brand-black hover:bg-black hover:text-white hover:border-black'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ESC // BACK TO WORKS</span>
        </button>
      </div>

      {/* --- SECTION 01: HERO --- */}
      <section className="relative w-full h-[95vh] flex items-end overflow-hidden">
        {/* Full screen background artwork representation */}
        <div className="absolute inset-0 z-0">
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-100 dark:brightness-[0.45]"
          />
          {/* Ambient organic gradient bottom shade to guarantee typography high-contrast reading */}
          <div className={`absolute inset-0 bg-gradient-to-t ${
            theme === 'dark' 
              ? 'from-brand-black via-brand-black/40 to-transparent' 
              : 'from-brand-offwhite/80 via-brand-offwhite/40 to-transparent'
          }`} />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 max-w-3xl"
          >
            {/* Year & Category Pill */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono tracking-wider text-brand-bronze uppercase">
              <span className="flex items-center gap-1.5 border border-brand-bronze/30 px-3 py-1 rounded-full bg-brand-bronze/5">
                <Calendar className="w-3.5 h-3.5" />
                {project.year}
              </span>
              <span className="flex items-center gap-1.5 border border-brand-bronze/30 px-3 py-1 rounded-full bg-brand-bronze/5">
                <User className="w-3.5 h-3.5" />
                {project.client || 'Personal Art Commission'}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-none uppercase">
              {project.title}
            </h1>

            <p className={`font-mono text-xs md:text-sm tracking-widest uppercase ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              PROJECT CATEGORY // {project.category}
            </p>
          </motion.div>
        </div>
      </section>


      {/* --- SECTION 02: CONCEPT / OVERVIEW --- */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-4 space-y-1">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-brand-bronze font-bold">
              01 // CORE CONCEPT
            </h4>
            <h3 className="font-display text-2xl font-semibold tracking-tight">
              Project Overview
            </h3>
          </div>

          <div className="lg:col-span-8">
            <p className={`font-sans text-xl md:text-2xl font-light leading-relaxed tracking-tight ${
              theme === 'dark' ? 'text-neutral-200' : 'text-neutral-700'
            }`}>
              {project.concept}
            </p>
          </div>

        </div>
      </section>


      {/* --- SECTION 03: KEY VISUAL GALLERY --- */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-6 md:px-12 space-y-20 md:space-y-36">
        {project.keyVisuals.map((visual, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%'} }
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full flex flex-col space-y-4"
          >
            {/* Visual Screen with Wide Frame Negative Space */}
            <div className={`overflow-hidden rounded-sm border ${
              theme === 'dark' ? 'border-neutral-800bg-neutral-900/40' : 'border-neutral-200 bg-black/5'
            } aspect-video relative`}>
              <img
                src={visual}
                alt={`${project.title} detailed visual presentation 0${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Technical metadata tag spacing */}
            <div className="flex justify-between font-mono text-[10px] text-brand-muted uppercase">
              <span>PLATE 0{idx + 1} // STRUCTURAL SPEC</span>
              <span>HD PHOTO RENDER CAMERA 01</span>
            </div>
          </motion.div>
        ))}
      </section>


      {/* --- SECTION 04: DESIGN PROCESS STUDIES --- */}
      <section className={`py-24 md:py-32 ${
        theme === 'dark' ? 'bg-brand-slate' : 'bg-brand-paper'
      } border-y transition-all duration-300 ${
        theme === 'dark' ? 'border-neutral-850' : 'border-neutral-300'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="mb-16 space-y-2">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-brand-bronze font-bold">
              02 // STRUCTURAL PIPELINE
            </h4>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Design & Development Process
            </h2>
            <p className={`font-sans text-xs ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              Visual breakdown describing intellectual concept formulation, mesh building, rendering physics, and material research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* SKETCH */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-brand-bronze">
                <Layers className="w-4 h-4" />
                <span>01 // CONCEPT SKETCH</span>
              </div>
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-neutral-700/20 bg-neutral-900/5 hover-scale-img">
                <img src={project.sketchUrl} alt="Concept Sketch" referrerPolicy="no-referrer" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
              </div>
              <h5 className="font-display font-medium text-sm">Intellectual BlueprintING</h5>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Initial hand drawings, digital vector layouts, and composition curves mapped to define visual tensions before rendering.
              </p>
            </div>

            {/* REFERENCE DESIGN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-brand-bronze">
                <Compass className="w-4 h-4" />
                <span>02 // MOOD & MOVEMENT</span>
              </div>
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-neutral-700/20 bg-neutral-900/5">
                <img src={project.referenceUrl} alt="Mood Reference" referrerPolicy="no-referrer" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
              </div>
              <h5 className="font-display font-medium text-sm">Visual Micro-Research</h5>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Collecting organic nature structures, mathematical topology papers, chemical metalloids, and digital eroded textures.
              </p>
            </div>

            {/* 3D DEV */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-brand-bronze">
                <Cpu className="w-4 h-4" />
                <span>03 // 3D TOPOLOGY GRID</span>
              </div>
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-neutral-700/20 bg-neutral-900/5">
                <img src={project.devUrl} alt="3D Development mesh" referrerPolicy="no-referrer" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
              </div>
              <h5 className="font-display font-medium text-sm">CGI Solid Modeling</h5>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Constructing high-poly volumetric hulls, sub-division mesh surfaces, vector forces and procedural noise modifiers.
              </p>
            </div>

            {/* MATERIAL NODES */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-brand-bronze">
                <Palette className="w-4 h-4" />
                <span>04 // MATERIAL NODES</span>
              </div>
              <div className="aspect-[4/3] rounded-sm overflow-hidden border border-neutral-700/20 bg-neutral-900/5">
                <img src={project.materialUrl} alt="Material Study Nodes" referrerPolicy="no-referrer" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
              </div>
              <h5 className="font-display font-medium text-sm">Shading & Lux Calibrator</h5>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Writing custom refractive ray formulas, fine brushed metal anisotropic shaders, and chromatic optical aberration nodes.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* --- SECTION 05: MOTION GRAPHIC STUDY --- */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-6 md:px-12 space-y-10">
        <div className="space-y-2">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-brand-bronze font-bold">
            03 // TIME & MOTION KINETICS
          </h4>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            Autoplay Physics Simulator
          </h2>
          <p className={`font-sans text-xs ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`}>
            A real-time procedural loop representing continuous environmental kinetic stress. Pure computational motion vector fields.
          </p>
        </div>

        {/* Video / Dynamic Interactive Component */}
        <div className="relative aspect-video w-full rounded-sm overflow-hidden border border-neutral-800 bg-neutral-950 shadow-inner flex items-center justify-center">
          <InteractiveCanvas type={project.motionUrl || 'chrome_pulse_wave'} theme={theme} />
          
          <div className="absolute top-4 right-4 bg-red-500/25 border border-red-500 px-2.5 py-1 rounded-sm flex items-center gap-1.5 font-mono text-[9px] text-white">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>RENDER CONSOLE // ONLINE RUNNING</span>
          </div>

          <div className="absolute bottom-4 left-4 bg-black/90 pointer-events-none border border-white/10 px-3 py-1.5 rounded-sm font-mono text-[9px] text-zinc-400">
            TIMEPHASE_DELTA: {project.id}_procedural.sim
          </div>
        </div>
      </section>


      {/* --- SECTION 06: FINAL SPECTACULAR CLIMAX --- */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        <div className="text-center space-y-1">
          <h4 className="font-mono text-[10px] tracking-widest text-brand-bronze font-bold uppercase">
            04 // THE FINAL SELECTION
          </h4>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
            Comprehensive Master Render Presentation
          </h2>
        </div>

        {/* Cinematic full screen container */}
        <div className="w-full aspect-[21/9] rounded-sm overflow-hidden border border-neutral-700/20 relative shadow-2xl">
          <img
            src={project.finalVisualUrl}
            alt="Final spectacular presentation"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 right-6 font-mono text-[10px] text-white/85 bg-black/65 px-4 py-1.5 border border-white/10 rounded-sm">
            {project.title} © 2026. ALL SPECIFICATION RETAINED
          </div>
        </div>
      </section>


      {/* --- NEXT PROJECT REDIRECT TRIGGER (NETFLIX STYLE) --- */}
      <section className={`mt-24 border-t ${
        theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'
      }`}>
        <div 
          onClick={() => onNavigateToProject(nextProject.id)}
          className="group relative cursor-pointer w-full py-20 bg-gradient-to-r from-transparent via-neutral-500/5 to-transparent hover:via-brand-bronze/5 transition-all duration-500"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-4">
              <span className="font-mono text-[11px] tracking-widest text-brand-bronze font-bold flex items-center gap-2 uppercase">
                <ChevronsRight className="w-4 h-4 animate-bounce-horizontal" />
                Next Project Portfolio Teaser
              </span>
              
              <h3 className="font-display text-4xl md:text-6xl font-bold tracking-tight uppercase group-hover:text-brand-bronze transition-colors">
                {nextProject.title} &rarr;
              </h3>

              <p className={`font-sans text-sm ${
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                {nextProject.subtitle} ({nextProject.year}) • {nextProject.category}
              </p>
            </div>

            {/* Micro thumbnail peek preview */}
            <div className="w-36 md:w-56 aspect-[16/10] rounded-sm overflow-hidden border border-neutral-700/20 relative bg-zinc-900 shadow-lg group-hover:scale-105 transition-all duration-500">
              <img
                src={nextProject.thumbnailUrl}
                alt="Next thumbnail placeholder preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover saturate-50 group-hover:saturate-100 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
            </div>

          </div>
        </div>

        {/* Back to top index shortcut */}
        <div className="text-center pt-10">
          <button
            onClick={onBack}
            className="font-mono text-xs uppercase tracking-widest text-brand-muted hover:text-brand-bronze transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO COMPLETE GRID INDEX ({project.category})</span>
          </button>
        </div>
      </section>

    </div>
  );
};
