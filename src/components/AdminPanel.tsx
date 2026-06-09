import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { INITIAL_PROJECTS } from '../data';
import { 
  Lock, 
  Unlock, 
  Trash2, 
  Plus, 
  CheckCircle, 
  RefreshCcw, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  HelpCircle,
  FolderOpen,
  X,
  PlusCircle,
  Upload
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onUpdateProjects: (updatedList: Project[]) => void;
  theme: 'dark' | 'light';
}

const isVideoUrl = (url: string) => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.mov?'];
  const lowercaseUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowercaseUrl.includes(ext));
};

const isVimeoUrl = (url: string) => {
  if (!url) return false;
  return url.includes('vimeo.com') || url.includes('player.vimeo.com');
};

const getVimeoEmbedUrl = (url: string) => {
  let videoId = '';
  if (url.includes('player.vimeo.com/video/')) {
    const match = url.match(/video\/([0-9]+)/);
    if (match && match[1]) {
      videoId = match[1];
    }
  } else {
    const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (match && match[1]) {
      videoId = match[1];
    }
  }

  if (videoId) {
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1`;
  }
  return url;
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  projects,
  onUpdateProjects,
  theme
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Edit State Form fields
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [formState, setFormState] = useState<Project>({
    id: '',
    title: '',
    subtitle: '',
    year: '2026',
    category: '3D Design',
    aspectRatio: '1:1',
    thumbnailUrl: '',
    isFeatured: false,
    isExperiment: false,
    concept: '',
    keyVisuals: [],
    sketchUrl: '',
    referenceUrl: '',
    devUrl: '',
    materialUrl: '',
    motionUrl: '',
    finalVisualUrl: ''
  });

  const [newKeyVisualText, setNewKeyVisualText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Helper inside component to compress image to stay safe under localStorage limits
  const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLocalFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    fieldKey: keyof Project,
    multiple = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (multiple) {
        const promises = (Array.from(files) as File[]).map((file) => {
          if (file.type.startsWith('video/')) {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (ev) => resolve(ev.target?.result as string);
              reader.onerror = () => reject(new Error('Failed to read video file'));
              reader.readAsDataURL(file);
            });
          } else {
            return compressImage(file);
          }
        });
        const base64s = await Promise.all(promises);
        setFormState(prev => ({
          ...prev,
          [fieldKey]: [...(prev[fieldKey] as string[] || []), ...base64s]
        }));
      } else {
        const file = files[0];
        let base64 = '';
        if (file.type.startsWith('video/')) {
          base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read video file'));
            reader.readAsDataURL(file);
          });
        } else {
          base64 = await compressImage(file);
        }
        setFormState(prev => ({
          ...prev,
          [fieldKey]: base64
        }));
      }
    } catch (error) {
      console.error('File reading or compression error:', error);
      alert('Error reading/compressing the selected file. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1111') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPassword('');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you absolutely sure you want to reset the entire database back to default seed projects? This will remove all custom additions.')) {
      onUpdateProjects(INITIAL_PROJECTS);
      setSelectedProjectId(null);
      setIsEditing(false);
    }
  };

  const handleEditProject = (proj: Project) => {
    setFormState({ ...proj });
    setIsEditing(true);
    setIsCreatingNew(false);
    setSelectedProjectId(proj.id);
  };

  const handleCreateNewTrigger = () => {
    setFormState({
      id: 'custom-' + Date.now(),
      title: 'New Creative Piece',
      subtitle: 'Conceptual Study',
      year: '2026',
      category: '3D Design',
      aspectRatio: '1:1',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      isFeatured: false,
      isExperiment: false,
      concept: 'An intricate exploratory visual design study charting technical compositions and structural boundaries.',
      keyVisuals: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'],
      sketchUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop',
      referenceUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
      devUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop',
      materialUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
      motionUrl: 'chrome_pulse_wave',
      finalVisualUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'
    });
    setIsEditing(true);
    setIsCreatingNew(true);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Delete this project permanently from active catalog?')) {
      const filtered = projects.filter(p => p.id !== id);
      onUpdateProjects(filtered);
      if (selectedProjectId === id) setSelectedProjectId(null);
      setIsEditing(false);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingNew) {
      onUpdateProjects([formState, ...projects]);
    } else {
      const updated = projects.map(p => (p.id === formState.id ? formState : p));
      onUpdateProjects(updated);
    }
    setIsEditing(false);
    setSelectedProjectId(formState.id);
    setIsCreatingNew(false);
  };

  const handleCopyValue = (fieldKey: keyof Project, sampleUrl: string) => {
    setFormState({ ...formState, [fieldKey]: sampleUrl });
  };

  const handleAddKeyVisual = () => {
    if (newKeyVisualText.trim()) {
      setFormState({
        ...formState,
        keyVisuals: [...formState.keyVisuals, newKeyVisualText.trim()]
      });
      setNewKeyVisualText('');
    }
  };

  const handleRemoveKeyVisual = (idx: number) => {
    const updated = [...formState.keyVisuals];
    updated.splice(idx, 1);
    setFormState({ ...formState, keyVisuals: updated });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
        >
          {/* Main Console frame */}
          <div className={`relative w-full max-w-5xl h-[88vh] rounded-md border flex flex-col overflow-hidden shadow-2xl ${
            theme === 'dark' 
              ? 'bg-[#121212] border-neutral-800 text-white' 
              : 'bg-brand-paper border-neutral-300 text-brand-black'
          }`}>
            
            {/* System Title Bar */}
            <div className={`flex items-center justify-between px-6 py-4 border-b uppercase font-mono text-[11px] ${
              theme === 'dark' ? 'border-neutral-800 bg-[#161616]' : 'border-neutral-300 bg-[#E9E5DE]'
            }`}>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-brand-bronze" />
                <span className="font-semibold tracking-wider">BONWOONG GU portfolio administration console</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-zinc-500">// SECRET PANEL</span>
                <button
                  onClick={onClose}
                  className="hover:text-red-400 transition-colors"
                  title="Exit panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* If NOT Authenticated -> Show Password Padlock Screen */}
            {!isAuthenticated ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full border border-brand-bronze/40 flex items-center justify-center text-brand-bronze bg-brand-bronze/5 animate-pulse">
                  <Lock className="w-6 h-6" />
                </div>
                
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight">System Access Required</h3>
                  <p className="font-sans text-xs text-neutral-400">
                    Entering administrative dashboard requires security verification credentials. Password configured by user is <code className="font-mono text-brand-bronze border-b border-brand-bronze/40 px-1 font-bold">1111</code>.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full font-mono text-center text-lg p-3 bg-neutral-900 border border-neutral-800 focus:border-brand-bronze text-white tracking-widest outline-none rounded-sm"
                    placeholder="••••"
                    maxLength={4}
                    autoFocus
                  />
                  
                  {authError && (
                    <p className="font-mono text-[10px] text-red-400 uppercase tracking-wider animate-shake">
                      * AUTHENTICATION FAILED. INCORRECT VALUES.
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full border border-brand-bronze bg-brand-bronze text-brand-black hover:bg-transparent hover:text-brand-bronze transition-all py-2.5 text-xs font-mono font-bold tracking-wider rounded-sm uppercase"
                  >
                    DEPLOY ACCESS RENDERER
                  </button>
                </form>
              </div>
            ) : (
              // If AUTHENTICATED -> Show Split Console
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Left Sidebar: Projects List & Controls */}
                <div className={`w-full md:w-5/12 border-r flex flex-col justify-between ${
                  theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'
                }`}>
                  <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono text-[10px] text-zinc-400 uppercase">Interactive Index ({projects.length})</h4>
                      <button
                        onClick={handleCreateNewTrigger}
                        className="flex items-center gap-1 bg-brand-bronze hover:bg-brand-bronze/80 text-black px-2.5 py-1 text-[10px] font-mono font-bold rounded-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>CREATE NEW</span>
                      </button>
                    </div>

                    {/* Scroll Catalog list */}
                    <div className="space-y-2 max-h-[50vh] md:max-h-[62vh] overflow-y-auto">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className={`p-3 rounded-sm border flex items-center justify-between transition-all ${
                            formState.id === proj.id
                              ? 'border-brand-bronze bg-brand-bronze/5'
                              : 'border-transparent bg-neutral-900/10 hover:bg-neutral-900/40'
                          }`}
                        >
                          <div
                            onClick={() => handleEditProject(proj)}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-display font-semibold text-xs tracking-tight">{proj.title}</div>
                            <div className="font-mono text-[9px] text-neutral-400">
                              {proj.category} • {proj.year} {proj.isExperiment && '• [EXPERIMENT]'} {proj.isFeatured && '• [★ HERO]'}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1 px-2.5 text-neutral-500 hover:text-red-400 hover:scale-105 transition-all"
                            title="Delete file project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reset defaults actions bottom */}
                  <div className={`p-4 border-t uppercase text-center space-y-2 ${
                    theme === 'dark' ? 'border-neutral-800 bg-[#161616]' : 'border-neutral-200 bg-neutral-50'
                  }`}>
                    <div className="font-mono text-[9px] text-neutral-400">RESTORE SYSTEM METRIC DATA</div>
                    <button
                      onClick={handleResetDefaults}
                      className="w-full flex items-center justify-center gap-2 border border-zinc-700/80 hover:border-red-400 hover:text-red-400 transition-all text-neutral-400 font-mono text-[10px] p-2 leading-none rounded-sm"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      <span>RESET GALLERY TO pristine SEED</span>
                    </button>
                  </div>
                </div>

                {/* Right Area: Interactive Editor Form */}
                <div className="w-full md:w-7/12 overflow-y-auto p-6 md:p-8">
                  {isEditing ? (
                    <form onSubmit={handleSaveForm} className="space-y-6">
                      <div className="flex justify-between items-center pb-2 border-b border-brand-bronze/20">
                        <h4 className="font-mono text-xs text-brand-bronze uppercase">
                          {isCreatingNew ? 'Create Project Manifest' : 'Modify Project Coordinates'}
                        </h4>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="font-mono text-[10px] hover:underline"
                          >
                            CANCEL
                          </button>
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-3 py-1 bg-brand-bronze text-black font-mono text-[10px] font-bold rounded-sm animate-pulse-slow"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>SAVE COORDINATES</span>
                          </button>
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-neutral-400 block">PROJECT TITLE</label>
                          <input
                            type="text"
                            required
                            value={formState.title}
                            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                            className="w-full text-xs p-2.5 bg-neutral-900/50 border border-zinc-850 focus:border-brand-bronze text-white rounded-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-neutral-400 block">SUBTITLE CAPTION</label>
                          <input
                            type="text"
                            value={formState.subtitle}
                            onChange={(e) => setFormState({ ...formState, subtitle: e.target.value })}
                            className="w-full text-xs p-2.5 bg-neutral-900/50 border border-zinc-850 focus:border-brand-bronze text-white rounded-sm"
                          />
                        </div>
                      </div>

                      {/* Technical Tags Metadata */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-neutral-400 block">YEAR</label>
                          <input
                            type="text"
                            required
                            value={formState.year}
                            onChange={(e) => setFormState({ ...formState, year: e.target.value })}
                            className="w-full text-xs p-2.5 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm"
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <label className="font-mono text-[9px] text-neutral-400 block">CATEGORY</label>
                          <select
                            value={formState.category}
                            onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                            className="w-full text-xs p-2.5 bg-neutral-900 text-white outline-none rounded-sm border"
                          >
                            <option value="3D Design">3D Design</option>
                            <option value="Brand Identity">Brand Identity</option>
                            <option value="Art Direction">Art Direction</option>
                            <option value="Motion Design">Motion Design</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-neutral-400 block">RATIO</label>
                          <select
                            value={formState.aspectRatio}
                            onChange={(e) => setFormState({ ...formState, aspectRatio: e.target.value as any })}
                            className="w-full text-xs p-2.5 bg-neutral-900 text-white outline-none rounded-sm border"
                          >
                            <option value="1:1">1:1 (Square)</option>
                            <option value="4:5">4:5 (Portrait)</option>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Tall)</option>
                          </select>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="flex flex-wrap gap-6 items-center p-3.5 bg-neutral-900/40 rounded-sm border border-neutral-800">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormState({ ...formState, isFeatured: !formState.isFeatured })}>
                          {formState.isFeatured ? <ToggleRight className="text-brand-bronze w-6 h-6" /> : <ToggleLeft className="text-zinc-500 w-6 h-6" />}
                          <span className="font-mono text-[10px] uppercase">IS FEATURED MASTERPIECE (HERO BANNER)</span>
                        </div>

                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormState({ ...formState, isExperiment: !formState.isExperiment })}>
                          {formState.isExperiment ? <ToggleRight className="text-brand-bronze w-6 h-6" /> : <ToggleLeft className="text-zinc-500 w-6 h-6" />}
                          <span className="font-mono text-[10px] uppercase">IS SELECTED EXPERIMENT (MIDDLE ROW)</span>
                        </div>
                      </div>

                      {/* Thumbnail URL Asset with custom Quick buttons */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div>
                            <label className="font-mono text-[9px] text-neutral-400 block uppercase">CORE THUMBNAIL</label>
                            <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">Upload a local project image or paste a web address</span>
                          </div>
                          <div className="flex gap-2 text-[9px] font-mono text-zinc-500">
                            <span>Samples:</span>
                            <button type="button" onClick={() => handleCopyValue('thumbnailUrl', '/src/assets/images/liquid_geometry_1780900490463.png')} className="underline text-brand-bronze hover:text-white">Liquid</button>
                            <button type="button" onClick={() => handleCopyValue('thumbnailUrl', '/src/assets/images/chrome_bloom_1780900510271.png')} className="underline text-brand-bronze hover:text-white">Chrome</button>
                            <button type="button" onClick={() => handleCopyValue('thumbnailUrl', '/src/assets/images/industrial_erosion_1780900527338.png')} className="underline text-brand-bronze hover:text-white">Erosion</button>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-center">
                          {formState.thumbnailUrl && (
                            <img 
                              src={formState.thumbnailUrl} 
                              alt="Thumbnail preview"
                              className="w-12 h-12 object-cover border border-neutral-800 rounded bg-[#161616]"
                            />
                          )}
                          <div className="flex-1 space-y-1.5 align-middle">
                            <input
                              type="text"
                              required
                              value={formState.thumbnailUrl}
                              onChange={(e) => setFormState({ ...formState, thumbnailUrl: e.target.value })}
                              className="w-full text-xs p-2 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm"
                              placeholder="Image web address or uploaded base64 data"
                            />
                            
                            <label className="inline-flex items-center gap-1.5 cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-zinc-300 hover:text-white px-3 py-1 text-[10px] font-mono rounded-sm border border-neutral-700 transition-colors">
                              <Upload className="w-3 h-3 text-brand-bronze" />
                              <span>{isUploading ? 'COMPRESSING...' : 'UPLOAD LOCAL PHOTO'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleLocalFileUpload(e, 'thumbnailUrl')}
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Concept Brief */}
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-neutral-400 block truncate">CONCEPT BRIEF OVERVIEW (3-5 LINES ONLY)</label>
                        <textarea
                          
                          rows={3}
                          value={formState.concept}
                          onChange={(e) => setFormState({ ...formState, concept: e.target.value })}
                          className="w-full text-xs p-2.5 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm resize-none"
                          maxLength={500}
                        />
                      </div>

                      {/* PROCESS PIPELINE URLS */}
                      <div className="space-y-2 border-t border-neutral-800 pt-4">
                        <span className="font-mono text-[10px] text-brand-bronze block">// DESIGN PROCESS SEED PHOTOS (Upload directly or paste web links)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* 01 Sketch */}
                          <div className="space-y-1.5 p-2 bg-neutral-905/30 border border-neutral-800 rounded-sm">
                            <div className="flex justify-between items-center">
                              <label className="font-mono text-[9px] text-neutral-400 block">01 // SKETCH DETAILED PIC</label>
                              <label className="cursor-pointer text-[9px] font-mono text-brand-bronze underline hover:text-white">
                                {isUploading ? 'WAIT...' : 'Upload File'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleLocalFileUpload(e, 'sketchUrl')}
                                  disabled={isUploading}
                                />
                              </label>
                            </div>
                            <div className="flex gap-2 items-center">
                              {formState.sketchUrl && (
                                <img src={formState.sketchUrl} className="w-8 h-8 object-cover border border-neutral-800 rounded bg-[#161616]" alt="Sketch preview" />
                              )}
                              <input
                                type="text"
                                value={formState.sketchUrl}
                                onChange={(e) => setFormState({ ...formState, sketchUrl: e.target.value })}
                                className="flex-1 text-[11px] p-1.5 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm"
                                placeholder="Sketch image web address or file data"
                              />
                            </div>
                          </div>
                          
                          {/* 02 Reference */}
                          <div className="space-y-1.5 p-2 bg-neutral-905/30 border border-neutral-800 rounded-sm">
                            <div className="flex justify-between items-center">
                              <label className="font-mono text-[9px] text-neutral-400 block">02 // REFERENCE BOARD PIC</label>
                              <label className="cursor-pointer text-[9px] font-mono text-brand-bronze underline hover:text-white">
                                {isUploading ? 'WAIT...' : 'Upload File'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleLocalFileUpload(e, 'referenceUrl')}
                                  disabled={isUploading}
                                />
                              </label>
                            </div>
                            <div className="flex gap-2 items-center">
                              {formState.referenceUrl && (
                                <img src={formState.referenceUrl} className="w-8 h-8 object-cover border border-neutral-800 rounded bg-[#161616]" alt="Reference board preview" />
                              )}
                              <input
                                type="text"
                                value={formState.referenceUrl}
                                onChange={(e) => setFormState({ ...formState, referenceUrl: e.target.value })}
                                className="flex-1 text-[11px] p-1.5 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm"
                                placeholder="Reference board web address or file data"
                              />
                            </div>
                          </div>

                          {/* 03 Dev Mesh */}
                          <div className="space-y-1.5 p-2 bg-neutral-905/30 border border-neutral-800 rounded-sm">
                            <div className="flex justify-between items-center">
                              <label className="font-mono text-[9px] text-neutral-400 block">03 // 3D DEV MESH STEP PIC</label>
                              <label className="cursor-pointer text-[9px] font-mono text-brand-bronze underline hover:text-white">
                                {isUploading ? 'WAIT...' : 'Upload File'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleLocalFileUpload(e, 'devUrl')}
                                  disabled={isUploading}
                                />
                              </label>
                            </div>
                            <div className="flex gap-2 items-center">
                              {formState.devUrl && (
                                <img src={formState.devUrl} className="w-8 h-8 object-cover border border-neutral-800 rounded bg-[#161616]" alt="Mesh preview" />
                              )}
                              <input
                                type="text"
                                value={formState.devUrl}
                                onChange={(e) => setFormState({ ...formState, devUrl: e.target.value })}
                                className="flex-1 text-[11px] p-1.5 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm"
                                placeholder="3D development step screenshot"
                              />
                            </div>
                          </div>

                          {/* 04 Material nodes */}
                          <div className="space-y-1.5 p-2 bg-neutral-905/30 border border-neutral-800 rounded-sm">
                            <div className="flex justify-between items-center">
                              <label className="font-mono text-[9px] text-neutral-400 block">04 // MATERIAL SHADER DIAGRAM PIC</label>
                              <label className="cursor-pointer text-[9px] font-mono text-brand-bronze underline hover:text-white">
                                {isUploading ? 'WAIT...' : 'Upload File'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleLocalFileUpload(e, 'materialUrl')}
                                  disabled={isUploading}
                                />
                              </label>
                            </div>
                            <div className="flex gap-2 items-center">
                              {formState.materialUrl && (
                                <img src={formState.materialUrl} className="w-8 h-8 object-cover border border-neutral-800 rounded bg-[#161616]" alt="Material preview" />
                              )}
                              <input
                                type="text"
                                value={formState.materialUrl}
                                onChange={(e) => setFormState({ ...formState, materialUrl: e.target.value })}
                                className="flex-1 text-[11px] p-1.5 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm"
                                placeholder="Material shader network node or setup pic"
                              />
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* MOTION PRESET CODE */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-800 pt-4">
                        <div className="space-y-1 bg-neutral-905/30 p-2 border border-neutral-800 rounded-sm">
                          <label className="font-mono text-[9px] text-neutral-400 block">03 // MOTION CANVAS SIMULATOR CODE</label>
                          <select
                            value={formState.motionUrl}
                            onChange={(e) => setFormState({ ...formState, motionUrl: e.target.value })}
                            className="w-full text-xs p-2 bg-[#121212] text-white outline-none rounded-sm border border-neutral-850 h-[38px]"
                          >
                            <option value="perlin_noise_field">Vector Perlin Noise Ribbon Flow</option>
                            <option value="chrome_pulse_wave">Iridescent Metallic Sine Phase</option>
                            <option value="glass_refraction_loop">Refractive Geometry Dot Field</option>
                            <option value="typography_warp">Abstract Solid Structural Grid</option>
                          </select>
                        </div>

                        {/* Climax Visual */}
                        <div className="space-y-1.5 p-2 bg-neutral-905/30 border border-neutral-800 rounded-sm">
                          <div className="flex justify-between items-center">
                            <label className="font-mono text-[9px] text-neutral-400 block truncate">04 // FINAL RENDER IMAGE</label>
                            <label className="cursor-pointer text-[9px] font-mono text-brand-bronze underline hover:text-white">
                              {isUploading ? 'WAIT...' : 'Upload File'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleLocalFileUpload(e, 'finalVisualUrl')}
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                          <div className="flex gap-2 items-center">
                            {formState.finalVisualUrl && (
                              <img src={formState.finalVisualUrl} className="w-8 h-8 object-cover border border-neutral-800 rounded bg-[#161616]" alt="Final visual preview" />
                            )}
                            <input
                              type="text"
                              required
                              value={formState.finalVisualUrl}
                              onChange={(e) => setFormState({ ...formState, finalVisualUrl: e.target.value })}
                              className="flex-1 text-[11px] p-1.5 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm"
                              placeholder="Focal design climax landscape picture"
                            />
                          </div>
                        </div>
                      </div>

                      {/* KEY VISUALS LIST BUILDER AND MULTIPLE LOCAL UPLOADS */}
                      <div className="space-y-3 border-t border-neutral-800 pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <label className="font-mono text-[9px] text-neutral-400 block">// KEY GALLERY SHOTPLATES ({formState.keyVisuals?.length || 0} media assets)</label>
                            <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">Attach multiple portfolio image/video rendering files at once</span>
                          </div>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer bg-brand-bronze hover:bg-brand-bronze/80 text-black px-3 py-1.5 font-mono text-[10px] font-bold rounded-sm transition-colors uppercase">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploading ? 'UPLOADING...' : 'UPLOAD IMAGES/VIDEOS'}</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              className="hidden"
                              onChange={(e) => handleLocalFileUpload(e, 'keyVisuals', true)}
                              disabled={isUploading}
                            />
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newKeyVisualText}
                            onChange={(e) => setNewKeyVisualText(e.target.value)}
                            className="flex-1 text-xs p-2 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm"
                            placeholder="Add web address manually (Image URL, Video file, or Vimeo Link)"
                          />
                          <button
                            type="button"
                            onClick={handleAddKeyVisual}
                            className="bg-neutral-800 hover:bg-neutral-700 text-zinc-300 hover:text-white px-3 font-mono text-[10px] font-bold rounded-sm uppercase flex items-center gap-1"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-brand-bronze" />
                            <span>ADD</span>
                          </button>
                        </div>

                        {/* Grid list preview of Key Visuals with responsive scaling and delete buttons */}
                        {formState.keyVisuals && formState.keyVisuals.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pt-1 border border-neutral-900 p-2 rounded-sm bg-neutral-950/20">
                            {formState.keyVisuals.map((vis, idx) => {
                              const isVid = isVideoUrl(vis);
                              const isVimeo = isVimeoUrl(vis);

                              return (
                                <div 
                                  key={idx} 
                                  className="group relative bg-[#161616] border border-neutral-800 rounded overflow-hidden aspect-video"
                                >
                                  {isVimeo ? (
                                    <div className="w-full h-full relative bg-neutral-905">
                                      <iframe
                                        src={getVimeoEmbedUrl(vis)}
                                        className="absolute inset-0 w-full h-full pointer-events-none scale-105"
                                        frameBorder="0"
                                        allow="autoplay"
                                        title={`Vimeo preview 0${idx + 1}`}
                                      ></iframe>
                                    </div>
                                  ) : isVid ? (
                                    <video 
                                      src={vis} 
                                      className="w-full h-full object-cover"
                                      autoPlay
                                      loop
                                      muted 
                                      playsInline
                                      preload="metadata"
                                    />
                                  ) : (
                                    <img 
                                      src={vis} 
                                      alt={`Gallery plate ${idx + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
                                    <span className="font-mono text-[8px] text-zinc-400 self-start uppercase">
                                      {isVimeo ? 'VIMEO' : isVid ? 'VIDEO' : 'IMAGE'} 0{idx + 1}
                                    </span>
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemoveKeyVisual(idx)} 
                                      className="text-red-400 font-bold hover:scale-110 hover:text-red-300 transition-all text-[9.5px] font-mono bg-black/85 px-2 py-1 rounded self-end"
                                    >
                                      DELETE
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-dashed border-neutral-800 rounded-sm font-mono text-[9.5px] text-zinc-500">
                            NO KEY VISUAL PLATES ATTACHED. SELECT LOCAL IMAGES/VIDEOS OR ADD URLS ABOVE.
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-bronze text-white hover:bg-transparent hover:text-brand-bronze border border-brand-bronze transition-all font-mono font-bold uppercase py-3 rounded-sm text-xs tracking-wider"
                      >
                        SAVE AND UPLOAD MANIFEST TO SYSTEM
                      </button>

                    </form>
                  ) : (
                    // Prompt screen when editing is idle
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <Unlock className="w-12 h-12 text-brand-bronze/40" />
                      <div className="space-y-1.5">
                        <h4 className="font-display font-semibold uppercase">Console Decrypted Successfully</h4>
                        <p className="font-sans text-xs text-neutral-400 max-w-sm">
                          Select any project from the left navigation index list to edit its coordinates, customizable aspects and timelines, or hit "CREATE NEW" to draft a new artwork grid slot.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
