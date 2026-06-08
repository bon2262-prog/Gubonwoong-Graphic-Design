import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Globe, ArrowUpRight, Send, Briefcase, Mail } from 'lucide-react';

interface InfoPageProps {
  onBackToWork: () => void;
  onOpenContact: () => void;
  theme: 'dark' | 'light';
}

export const InfoPage: React.FC<InfoPageProps> = ({ onBackToWork, onOpenContact, theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-[85vh] py-24 md:py-36 ${
        theme === 'dark' ? 'bg-brand-black text-white' : 'bg-brand-offwhite text-brand-black'
      } transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Profile Biography Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 border-b border-brand-muted/20 pb-16">
          <div className="lg:col-span-4 space-y-2">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-brand-bronze font-bold">
              01 // BIOGRAPHY
            </h4>
            <h2 className="font-display text-4xl font-bold tracking-tight uppercase leading-none">
              PROFILE SPEC
            </h2>
          </div>
          
          <div className="lg:col-span-8 space-y-6">
            <p className={`font-display text-3xl sm:text-4xl md:text-[44px] font-light leading-[1.12] tracking-tight ${
              theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'
            }`}>
              Graphic Designer / 3D Artist / Art Director based in Seoul.
            </p>
            <p className={`font-sans text-base leading-relaxed max-w-2xl ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              Focused on high-performance visual identity, complex 3D virtual imagery, and digital artworks. Partnering with forward-thinking contemporary brands, cultural institutions, and CGI collectives to synthesize spatial engineering and conceptual layout architecture.
            </p>
          </div>
        </div>

        {/* Services & Domain Competency */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 border-b border-brand-muted/20 py-16">
          <div className="lg:col-span-4 space-y-2">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-brand-bronze font-bold">
              02 // CAPABILITIES
            </h4>
            <h2 className="font-display text-4xl font-bold tracking-tight uppercase leading-none">
              SERVICES
            </h2>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className={`p-6 border rounded-sm ${
              theme === 'dark' ? 'border-zinc-800/80 bg-zinc-900/20' : 'border-zinc-200 bg-white/40'
            }`}>
              <div className="font-mono text-xs text-brand-bronze mb-2">01 // BRANDING</div>
              <h3 className="font-display text-lg font-bold uppercase mb-1">Brand Identity</h3>
              <p className="font-sans text-xs text-brand-muted leading-relaxed">
                Logotypes, responsive type guidelines, corporate communications, design systems, and editorial packaging.
              </p>
            </div>

            <div className={`p-6 border rounded-sm ${
              theme === 'dark' ? 'border-zinc-800/80 bg-zinc-900/20' : 'border-zinc-200 bg-white/40'
            }`}>
              <div className="font-mono text-xs text-brand-bronze mb-2">02 // COMPUTATIONAL</div>
              <h3 className="font-display text-lg font-bold uppercase mb-1">3D Design</h3>
              <p className="font-sans text-xs text-brand-muted leading-relaxed">
                Volumetric CGI compositions, complex metallic sculptures, spatial engineering rendering, and raw mockups.
              </p>
            </div>

            <div className={`p-6 border rounded-sm ${
              theme === 'dark' ? 'border-zinc-800/80 bg-zinc-900/20' : 'border-zinc-200 bg-white/40'
            }`}>
              <div className="font-mono text-xs text-brand-bronze mb-2">03 // DIRECTION</div>
              <h3 className="font-display text-lg font-bold uppercase mb-1">Art Direction</h3>
              <p className="font-sans text-xs text-brand-muted leading-relaxed">
                Establishing central structural rules, photography guidelines, aesthetic hierarchies, and cohesive brand messages.
              </p>
            </div>

            <div className={`p-6 border rounded-sm ${
              theme === 'dark' ? 'border-zinc-800/80 bg-zinc-900/20' : 'border-zinc-200 bg-white/40'
            }`}>
              <div className="font-mono text-xs text-brand-bronze mb-2">04 // KINETICS</div>
              <h3 className="font-display text-lg font-bold uppercase mb-1">Motion Design</h3>
              <p className="font-sans text-xs text-brand-muted leading-relaxed">
                Procedural key loops, dynamic typographic warp systems, Web3 kinetic assets, and seamless transitions.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Client list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 border-b border-brand-muted/20 py-16">
          <div className="lg:col-span-4 space-y-2">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-brand-bronze font-bold">
              03 // REPUTATION
            </h4>
            <h2 className="font-display text-4xl font-bold tracking-tight uppercase leading-none">
              CLIENTS
            </h2>
          </div>

          <div className="lg:col-span-8 flex flex-wrap gap-4 items-center">
            {['Seoul Museum of Contemporary Art', 'Aesthetic Generation Lab', 'Zero-Gravity Collective', 'Neo-Ecology Tokyo', 'Nike Korea (Art Dept)', 'Hyundai Genesis Lounge', 'Samsung Studio C', 'D-DP Design Lab'].map((client, idx) => (
              <span
                key={client}
                className={`px-4 py-2 font-mono text-xs rounded-full border transition-all ${
                  theme === 'dark'
                    ? 'border-neutral-800 hover:border-brand-bronze bg-zinc-900/60 text-zinc-300'
                    : 'border-neutral-200 hover:border-brand-bronze bg-white text-zinc-700'
                }`}
              >
                {client}
              </span>
            ))}
          </div>
        </div>

        {/* Action Bottom Section / Contact Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 pt-16">
          <div className="lg:col-span-4 space-y-2">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-brand-bronze font-bold">
              04 // ACQUISITION
            </h4>
            <h2 className="font-display text-4xl font-bold tracking-tight uppercase leading-none">
              CONNECT
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <a 
                href="mailto:hello@domain.com"
                className={`flex-1 flex items-center justify-between p-6 border rounded-sm group transition-all duration-300 ${
                  theme === 'dark' ? 'border-neutral-800 bg-[#1D1C1A]/40 hover:bg-[#1D1C1A]/80' : 'border-neutral-300 bg-white/40 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-bronze" />
                  <div>
                    <div className="font-mono text-[10px] text-brand-muted uppercase">Primary Connection</div>
                    <div className="font-display font-semibold text-lg">hello@domain.com</div>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-brand-muted group-hover:text-brand-bronze transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>

              <button 
                onClick={onOpenContact}
                className={`flex-1 flex items-center justify-between p-6 border rounded-sm group transition-all text-left duration-300 ${
                  theme === 'dark' ? 'border-neutral-800 bg-[#1D1C1A]/40 hover:bg-[#1D1C1A]/80' : 'border-neutral-300 bg-white/40 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-brand-bronze" />
                  <div>
                    <div className="font-mono text-[10px] text-brand-muted uppercase">Form Submission</div>
                    <div className="font-display font-semibold text-lg">Send RFP Project</div>
                  </div>
                </div>
                <Send className="w-4 h-4 text-brand-muted group-hover:text-brand-bronze transition-colors" />
              </button>
            </div>

            {/* SNS Channels with real accounts */}
            <div className="flex items-center gap-6 font-mono text-xs pt-4">
              <a
                href="https://instagram.com/bonwoong_gu"
                target="_blank"
                rel="no-referrer"
                className="flex items-center gap-1 text-brand-muted hover:text-brand-bronze transition-all"
              >
                <Instagram className="w-4 h-4" />
                <span>INSTAGRAM</span>
              </a>
              <span className="text-zinc-600">•</span>
              <a
                href="https://behance.net/bonwoong_gu"
                target="_blank"
                rel="no-referrer"
                className="flex items-center gap-1 text-brand-muted hover:text-brand-bronze transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>BEHANCE_PORTFOLIO</span>
              </a>
              <span className="text-zinc-600">•</span>
              <button
                onClick={onBackToWork}
                className="text-brand-bronze font-bold hover:underline"
              >
                BACK TO GALLERY &rarr;
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
