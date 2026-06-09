import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getProjects, saveProjects } from './data';
import { Project } from './types';
import { WorkGridItem } from './components/WorkGridItem';
import { SelectedExperiments } from './components/SelectedExperiments';
import { ProjectDetail } from './components/ProjectDetail';
import { InfoPage } from './components/InfoPage';
import { ContactOverlay } from './components/ContactOverlay';
import { AdminPanel } from './components/AdminPanel';
import { 
  Sun, 
  Moon, 
  Settings, 
  User, 
  Briefcase, 
  Mail, 
  Monitor, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'work' | 'info'>('work');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Initialize and load project database from localStorage
  useEffect(() => {
    setProjects(getProjects());
  }, []);

  // Sync projects updates with data persistence layer
  const handleUpdateProjects = (updatedList: Project[]) => {
    setProjects(updatedList);
    saveProjects(updatedList);
  };

  const handleOpenContact = () => {
    setIsContactOpen(true);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Find the next project in sequence to preview at the bottom of a project page (Netflix style)
  const getNextProject = (currentId: string): Project => {
    // filter down same level projects
    const selectable = projects.filter(p => !p.isFeatured);
    if (selectable.length <= 1) return projects[0];
    const currentIndex = selectable.findIndex(p => p.id === currentId);
    const nextIndex = (currentIndex + 1) % selectable.length;
    return selectable[nextIndex];
  };

  // Filter projects by roles
  const featuredProject = projects.find(p => p.isFeatured) || projects[0];
  const regularProjects = projects.filter(p => !p.isFeatured && !p.isExperiment);
  const experimentsList = projects.filter(p => p.isExperiment);

  // Split list to insert Experiments section flawlessly in-between:
  // WORK, WORK, WORK -> Selected Experiments Banner (commented out) -> WORK, WORK, WORK
  const firstHalfGrid = regularProjects.slice(0, 3);
  const secondHalfGrid = regularProjects.slice(3);

  // Keyboard shortcut to close overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsContactOpen(false);
        setIsAdminOpen(false);
        setSelectedProjectId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden relative ${
      theme === 'dark' 
        ? 'bg-brand-black text-white selection:bg-brand-bronze selection:text-black' 
        : 'bg-brand-offwhite text-brand-black selection:bg-brand-bronze selection:text-black'
    }`}>
      {/* Subtle organic elegant paper texture overlay across whole application */}
      <div className="noise-overlay" />

      {/* --- FLOATING LEFT COLUMN METADATA BRAND: DOES NOT SCROLL --- */}
      <header className="hidden lg:block fixed top-[104px] left-12 w-64 z-[50] select-none pointer-events-none">
        {/* Subtitles Stack placed proportionally below the h-20 (80px) top banner */}
        <div className="space-y-1 font-mono text-[10px] text-brand-muted uppercase tracking-widest pl-0.5 pointer-events-auto">
          <div>Graphic Designer</div>
          <div>3D Virtual Artist</div>
          <div>Art Director // Seoul</div>
        </div>
      </header>

      {/* --- TOP HEADER NAVIGATION ROW --- */}
      <nav className={`fixed top-0 left-0 right-0 z-40 px-6 md:px-12 h-20 flex justify-between items-center gap-8 backdrop-blur-xs select-none border-b ${
        theme === 'dark' ? 'border-white/5 bg-brand-black/20' : 'border-black/5 bg-brand-offwhite/20'
      }`}>
        {/* Logo Name / Trigger */}
        <div 
          onClick={() => { setSelectedProjectId(null); setCurrentTab('work'); }}
          className="cursor-pointer group pointer-events-auto"
        >
          {/* Mobile Name Trigger */}
          <span className="lg:hidden font-display font-bold text-base tracking-tight text-brand-bronze uppercase">
            B. GU // ART
          </span>
          {/* Desktop Logo: perfectly height-aligned inside the h-20 nav container */}
          <h1 className="hidden lg:block font-display text-2xl font-bold tracking-tight uppercase leading-none text-balance hover:text-brand-bronze transition-colors">
            BONWOONG GU
          </h1>
        </div>

        {/* Menu Items (EXACTLY 3) with dynamic slider highlighting */}
        <div className="flex items-center gap-6 sm:gap-8 font-mono text-xs tracking-widest uppercase">
          <button
            onClick={() => {
              setSelectedProjectId(null);
              setCurrentTab('work');
            }}
            className={`transition-colors relative py-1 ${
              currentTab === 'work' && !selectedProjectId 
                ? 'text-brand-bronze font-semibold font-bold' 
                : theme === 'dark'
                  ? 'text-brand-muted hover:text-white'
                  : 'text-brand-muted hover:text-brand-black'
            }`}
          >
            <span>WORK</span>
            {currentTab === 'work' && !selectedProjectId && (
              <motion.span layoutId="navMarker" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-brand-bronze" />
            )}
          </button>

          <button
            onClick={() => {
              setSelectedProjectId(null);
              setCurrentTab('info');
            }}
            className={`transition-colors relative py-1 ${
              currentTab === 'info' 
                ? 'text-brand-bronze font-semibold font-bold' 
                : theme === 'dark'
                  ? 'text-brand-muted hover:text-white'
                  : 'text-brand-muted hover:text-brand-black'
            }`}
          >
            <span>INFO</span>
            {currentTab === 'info' && (
              <motion.span layoutId="navMarker" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-brand-bronze" />
            )}
          </button>

          <button
            onClick={handleOpenContact}
            className="text-brand-muted hover:text-brand-bronze transition-colors py-1 flex items-center gap-1.5"
            title="Open Contact transmission"
          >
            <span>CONTACT</span>
            <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
          </button>
        </div>

        {/* Luxury Utility Tools Line (Theme toggles, Admin console trigger) */}
        <div className="flex items-center gap-3 border-l border-brand-muted/20 pl-6">
          {/* Theme switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full border transition-all ${
              theme === 'dark'
                ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white'
                : 'border-neutral-300 hover:border-neutral-400 bg-white text-zinc-600'
            }`}
            title="Toggle Visual Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Admin console button */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className={`p-2 rounded-full border transition-all ${
              theme === 'dark'
                ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-brand-bronze'
                : 'border-neutral-300 hover:border-neutral-400 bg-white text-zinc-600 hover:text-brand-bronze'
            }`}
            title="Portfolio Studio Settings"
            id="admin-settings-anchor"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* --- CENTRAL MAIN VIEW CONTENT WRAPPER --- */}
      <main className="pt-24 lg:pl-80 transition-all duration-300">
        <AnimatePresence mode="wait">
          {/* CASE A: DETAILED PROJECT PERSPECTIVE */}
          {selectedProject ? (
            <motion.div
              key={`detail-${selectedProject.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ProjectDetail
                project={selectedProject}
                nextProject={getNextProject(selectedProject.id)}
                onBack={() => setSelectedProjectId(null)}
                onNavigateToProject={(id) => setSelectedProjectId(id)}
                theme={theme}
              />
            </motion.div>
          ) : currentTab === 'info' ? (
            /* CASE B: MINIMALIST INFO TAB PAGE */
            <motion.div
              key="info-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <InfoPage
                onBackToWork={() => setCurrentTab('work')}
                onOpenContact={() => setIsContactOpen(true)}
                theme={theme}
              />
            </motion.div>
          ) : (
            /* CASE C: CORE COMPLETE WORKS HOME PAGE (90% of Site space) */
            <motion.div
              key="work-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-12 pb-16"
            >
              
              {/* --- 1. HERO FEATURED PROJECT SECTION --- */}
              {featuredProject && (
                <section className="px-6 md:px-12 pt-4">
                  <div 
                    onClick={() => setSelectedProjectId(featuredProject.id)}
                    className="group relative cursor-pointer overflow-hidden rounded-sm border border-neutral-800/10 dark:border-neutral-200/5 aspect-video w-full"
                    id="featured-hero-display"
                  >
                    {/* Background Hero graphics */}
                    <img
                      src={featuredProject.thumbnailUrl}
                      alt="Featured project fluid scenery"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                    />

                    {/* Ambient organic gradients for high-contrast typography reading */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Black brand overlay on hover (40% opacity) */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Meta info floating */}
                    <div className="absolute inset-0 flex flex-col justify-between p-8 sm:p-12 text-white">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[9px] uppercase tracking-widest border border-white/30 bg-black/45 px-3 py-1.5 rounded-full text-brand-bronze font-bold">
                          ★ Highly Featured Piece
                        </span>
                        <div className="font-mono text-[9px] text-zinc-400">
                          SECTOR // {featuredProject.year} PRESENTATION
                        </div>
                      </div>

                      {/* Title & tags */}
                      <div className="space-y-4 max-w-xl">
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] tracking-widest text-[#C5A880] uppercase">LATEST DIGITAL SCULPTURE</span>
                          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight uppercase leading-none">
                            {featuredProject.title}
                          </h2>
                        </div>
                        <p className="font-sans text-xs text-neutral-200 leading-relaxed max-w-md hidden sm:block">
                          {featuredProject.concept}
                        </p>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-white group-hover:text-brand-bronze transition-colors">
                            <span>COLLECT RECORD DETAILS</span>
                            <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* SECTION SUBTITLE OVERVIEW */}
              <section className="px-6 md:px-12 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b pb-4 border-brand-muted/10">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] tracking-widest text-brand-bronze uppercase">// ALL COHORT RENDERINGS</div>
                  <h3 className="font-display text-xl font-semibold tracking-tight">CGI & Identity Catalog</h3>
                </div>
                <div className="font-mono text-[10px] text-brand-muted flex items-center gap-1.5">
                  <span>Aspect ratio mixture enabled</span>
                  <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                </div>
              </section>

              {/* --- 2. GRID HOUSING (FIRST FLANK) --- */}
              <section className="px-6 md:px-12">
                {firstHalfGrid.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 align-start">
                    {firstHalfGrid.map((proj, idx) => (
                      <WorkGridItem
                        key={proj.id}
                        project={proj}
                        onSelect={(id) => setSelectedProjectId(id)}
                        index={idx}
                        theme={theme}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs font-mono text-neutral-500">
                    * No regular work records registered. Utilize admin settings to seed.
                  </div>
                )}
              </section>

              {/* --- 3. DYNAMIC COMMITTED SELECTED EXPERIMENTS PANEL (COMMENTED OUT / HIDDEN AS REQUESTED) --- */}
              {/* 
              {experimentsList.length > 0 && (
                <SelectedExperiments
                  experiments={experimentsList}
                  onSelectExperiment={(id) => setSelectedProjectId(id)}
                  theme={theme}
                />
              )}
              */}

              {/* --- 4. GRID HOUSING (SECOND FLANK) --- */}
              <section className="px-6 md:px-12">
                {secondHalfGrid.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 align-start pt-6">
                    {secondHalfGrid.map((proj, idx) => (
                      <WorkGridItem
                        key={proj.id}
                        project={proj}
                        onSelect={(id) => setSelectedProjectId(id)}
                        index={idx + 3}
                        theme={theme}
                      />
                    ))}
                  </div>
                )}
              </section>

            </motion.div>
          )}
        </AnimatePresence>

        {/* --- CENTRAL GLOBAL BRAND FOOTER --- */}
        <footer className={`mt-24 border-t px-6 py-12 md:px-12 md:py-16 ${
          theme === 'dark' ? 'border-neutral-900 bg-neutral-950/10' : 'border-neutral-200 bg-neutral-100/10'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 font-mono text-[10px] text-brand-muted uppercase">
            <div className="space-y-1">
              <p className="font-semibold text-brand-bronze text-xs tracking-wider">BONWOONG GU portfolio</p>
              <p>© 2026. All visual and spatial rights reserved by core guidelines.</p>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="mailto:hello@domain.com" className="hover:text-brand-bronze transition-colors flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>hello@domain.com</span>
              </a>
              <span>|</span>
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="hover:text-brand-bronze transition-colors flex items-center gap-1"
              >
                <span>ADMIN PANEL</span>
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* --- GLOBAL CONTACT MODAL BLUR SHEET (NOT SEPARATE PAGE!) --- */}
      <ContactOverlay
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        theme={theme}
      />

      {/* --- GLOBAL ADMINISTRATIVE DASHBOARD DRAWER PANEL --- */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        projects={projects}
        onUpdateProjects={handleUpdateProjects}
        theme={theme}
      />
    </div>
  );
}
