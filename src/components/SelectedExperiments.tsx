import React, { useState } from 'react';
import { motion } from 'motion/react';
import { InteractiveCanvas } from './InteractiveCanvas';
import { Project } from '../types';
import { Sparkles, Terminal, Cpu } from 'lucide-react';

interface SelectedExperimentsProps {
  experiments: Project[];
  onSelectExperiment: (projectId: string) => void;
  theme: 'dark' | 'light';
}

export const SelectedExperiments: React.FC<SelectedExperimentsProps> = ({
  experiments,
  onSelectExperiment,
  theme
}) => {
  const [activeExpIdx, setActiveExpIdx] = useState(0);
  const activeExp = experiments[activeExpIdx] || experiments[0];

  if (!activeExp) return null;

  // Let's decide which dynamic stream preset matches the active experiment
  const getCanvasPreset = (id: string) => {
    if (id.includes('noise')) return 'perlin_noise_field';
    if (id.includes('shear') || id.includes('glass')) return 'glass_refraction_loop';
    return 'chrome_pulse_wave';
  };

  return (
    <div className={`relative my-16 overflow-hidden border-y ${
      theme === 'dark' 
        ? 'border-neutral-850 bg-brand-slate text-white' 
        : 'border-black/5 bg-[#e8e5de] text-brand-black'
    } py-12 md:py-20 transition-all duration-300`}>
      {/* Background Interactive Shader simulation */}
      <div className="absolute inset-0 opacity-50 z-0">
        <InteractiveCanvas type={getCanvasPreset(activeExp.id)} theme={theme} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 z-10 flex flex-col lg:flex-row items-center gap-10 md:gap-16">
        
        {/* Left Side: Metadata & Experiment Selectors */}
        <div className="w-full lg:w-4/12 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-bronze font-bold">
              <Cpu className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Computational Research & Core</span>
            </div>
            
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
              Selected 3D Experiments
            </h2>
            <p className={`font-sans text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed max-w-md`}>
              Interlocking WebGL mathematics, procedural texture modules, and custom physics simulation engines designed for high-end web experiences. Brush your mouse over the background to warp the physics dynamically.
            </p>
          </div>

          {/* Quick interactive buttons / Tabs */}
          <div className="space-y-3">
            {experiments.map((exp, idx) => (
              <button
                key={exp.id}
                onClick={() => setActiveExpIdx(idx)}
                className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all text-left group ${
                  activeExpIdx === idx
                    ? 'border-brand-bronze bg-brand-bronze/15 text-brand-bronze'
                    : theme === 'dark'
                      ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 text-neutral-400'
                      : 'border-neutral-300 hover:border-neutral-400 bg-white/40 text-[#6b6862]'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-brand-muted group-hover:text-brand-bronze/80">
                    0{idx + 1} // Research Lab
                  </div>
                  <h4 className="font-display text-sm font-semibold tracking-tight">
                    {exp.title}
                  </h4>
                  <p className="font-sans text-[11px] opacity-75 truncate max-w-[200px]">
                    {exp.subtitle}
                  </p>
                </div>
                <div className="font-mono text-xs opacity-70 flex items-center gap-1.5 self-end pb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>RUN</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Virtual Active Terminal Window / Preview Card */}
        <div className="w-full lg:w-8/12 flex justify-center">
          <motion.div
            key={activeExp.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`w-full max-w-xl rounded-sm border shadow-xl overflow-hidden ${
              theme === 'dark' 
                ? 'border-white/10 bg-black/70 backdrop-blur-md' 
                : 'border-neutral-200 bg-white/70 backdrop-blur-md'
            }`}
          >
            {/* Header toolbar */}
            <div className={`flex items-center justify-between px-4 py-2 text-[10px] font-mono border-b uppercase ${
              theme === 'dark' ? 'border-white/5 text-neutral-500' : 'border-neutral-200 text-neutral-500'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="ml-2 font-semibold">interactive_viewport.exe</span>
              </div>
              <div>Hz 60.0 // FPS 100%</div>
            </div>

            {/* Simulated Live Frame */}
            <div className="relative aspect-[16/10] overflow-hidden group">
              <InteractiveCanvas type={getCanvasPreset(activeExp.id)} theme={theme} />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-brand-bronze uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Active Experiment Module // {activeExp.year}</span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight">
                    {activeExp.title}
                  </h3>
                  <p className="font-sans text-xs text-neutral-300 leading-relaxed max-w-md">
                    {activeExp.concept}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => onSelectExperiment(activeExp.id)}
                      className="border border-brand-bronze bg-brand-bronze text-brand-black hover:bg-transparent hover:text-brand-bronze transition-all px-4 py-1.5 text-xs font-mono font-bold tracking-wider rounded-sm"
                    >
                      EXPLORE DESIGN SPEC &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
