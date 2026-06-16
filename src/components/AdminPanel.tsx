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
  Upload,
  Settings,
  Database,
  Globe,
  Server,
  GripVertical
} from 'lucide-react';
import {
  getStorageSettings,
  saveStorageSettings,
  uploadToCloudProvider,
  StorageSettings
} from '../utils/cloudUploader';
import {
  getGithubSettings,
  saveGithubSettings,
  fetchProjectsFromGithub,
  commitProjectsToGithub,
  GithubSyncSettings
} from '../utils/githubSync';


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

const isTextPlate = (url: string) => {
  if (!url) return false;
  return url.startsWith('text:');
};

const getTextFromPlate = (url: string) => {
  if (!url) return '';
  return url.slice(5);
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
    galleryLayout: 'stack',
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
    finalVisualUrl: '',
    bannerTag: '',
    client: ''
  });

  const [newKeyVisualText, setNewKeyVisualText] = useState('');
  const [newKeyVisualTextPlate, setNewKeyVisualTextPlate] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [draggedProjectIdx, setDraggedProjectIdx] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [storageSettings, setStorageSettingsState] = useState<StorageSettings>(getStorageSettings());
  const [showStorageConfig, setShowStorageConfig] = useState(false);
  const [testUploadResult, setTestUploadResult] = useState('');
  const [isTestingUpload, setIsTestingUpload] = useState(false);

  const [githubSettings, setGithubSettingsState] = useState<GithubSyncSettings>(getGithubSettings());
  const [showGithubConfig, setShowGithubConfig] = useState(false);
  const [isTestingGithub, setIsTestingGithub] = useState(false);
  const [githubTestResult, setGithubTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);


  // Helper inside component to compress image to stay safe under storage limits
  const compressImage = (file: File, maxWidth = 1000, maxHeight = 1000): Promise<string> => {
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75); // Compressed efficiently to save space & sync quickly
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

  const uploadToServer = async (base64: string, filename: string): Promise<string> => {
    // 1. First, try the active cloud provider (Cloudinary, Supabase or Catbox)
    try {
      if (storageSettings.provider !== 'local') {
        const cloudUrl = await uploadToCloudProvider(base64, filename, storageSettings);
        if (cloudUrl) {
          console.log(`[Admin Uploader] Upload succeeded via client cloud provider:`, cloudUrl);
          return cloudUrl;
        }
      }
    } catch (cloudErr: any) {
      console.warn('[Admin Uploader] Direct client-cloud upload failed. Attempting local backend API fallback now:', cloudErr);
    }

    // 2. Primary fallback: Local Dev Server upload API (Express/Vite localhost:3000 container)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, base64 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          console.log(`Successfully uploaded to server: ${data.url}`);
          return data.url;
        }
      }
      console.warn(`Server upload returned status ${res.status}. Falling back to embed-optimized Base64.`);
    } catch (e) {
      console.warn('Server upload failed (unreachable/client-only). Falling back to embed-optimized Base64:', e);
    }
    // 3. Absolute failsafe: return local base64 so it still renders perfectly inside client session
    return base64;
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
        const fileArray = Array.from(files) as File[];
        const promises = fileArray.map((file) => {
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
        
        // Parallel upload to server with fallback
        const uploadPromises = base64s.map((b64, index) => {
          return uploadToServer(b64, fileArray[index].name);
        });
        const urls = await Promise.all(uploadPromises);

        setFormState(prev => {
          const prevVisuals = prev[fieldKey] as string[] || [];
          const prevLayouts = prev.keyVisualsLayout || [];
          const newLayouts = [...prevLayouts];
          if (fieldKey === 'keyVisuals') {
            urls.forEach(() => newLayouts.push('full'));
          }
          return {
            ...prev,
            [fieldKey]: [...prevVisuals, ...urls],
            keyVisualsLayout: newLayouts
          };
        });
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
        
        const serverUrl = await uploadToServer(base64, file.name);

        setFormState(prev => ({
          ...prev,
          [fieldKey]: serverUrl
        }));
      }
    } catch (error: any) {
      console.error('File reading or upload error:', error);
      alert(`Error loading the selected file:\n${error?.message || error}\nPlease try again.`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'a0106180') {
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
    setShowStorageConfig(false);
    setShowGithubConfig(false);
  };

  const handleCreateNewTrigger = () => {
    setFormState({
      id: 'custom-' + Date.now(),
      title: 'New Creative Piece',
      subtitle: 'Conceptual Study',
      year: '2026',
      category: '3D Design',
      aspectRatio: '1:1',
      galleryLayout: 'stack',
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
      finalVisualUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      bannerTag: 'LATEST DIGITAL SCULPTURE',
      client: 'Personal Art Commission'
    });
    setIsEditing(true);
    setIsCreatingNew(true);
    setShowStorageConfig(false);
    setShowGithubConfig(false);
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
        keyVisuals: [...formState.keyVisuals, newKeyVisualText.trim()],
        keyVisualsLayout: [...(formState.keyVisualsLayout || []), 'full']
      });
      setNewKeyVisualText('');
    }
  };

  const handleAddTextPlate = () => {
    if (newKeyVisualTextPlate.trim()) {
      setFormState({
        ...formState,
        keyVisuals: [...formState.keyVisuals, 'text:' + newKeyVisualTextPlate.trim()],
        keyVisualsLayout: [...(formState.keyVisualsLayout || []), 'full']
      });
      setNewKeyVisualTextPlate('');
    }
  };

  const handleRemoveKeyVisual = (idx: number) => {
    const updated = [...formState.keyVisuals];
    updated.splice(idx, 1);
    const updatedLayouts = [...(formState.keyVisualsLayout || [])];
    if (updatedLayouts.length > idx) {
      updatedLayouts.splice(idx, 1);
    }
    setFormState({
      ...formState,
      keyVisuals: updated,
      keyVisualsLayout: updatedLayouts
    });
  };

  const handleMoveKeyVisualUp = (idx: number) => {
    if (idx <= 0) return;
    const updated = [...formState.keyVisuals];
    const updatedLayouts = [...(formState.keyVisualsLayout || [])];
    
    // Swap source elements
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    
    // Swap corresponding layout items (ensuring length matches)
    while (updatedLayouts.length < updated.length) {
      updatedLayouts.push('full');
    }
    const tempLayout = updatedLayouts[idx];
    updatedLayouts[idx] = updatedLayouts[idx - 1];
    updatedLayouts[idx - 1] = tempLayout;

    setFormState({
      ...formState,
      keyVisuals: updated,
      keyVisualsLayout: updatedLayouts
    });
  };

  const handleMoveKeyVisualDown = (idx: number) => {
    if (idx >= formState.keyVisuals.length - 1) return;
    const updated = [...formState.keyVisuals];
    const updatedLayouts = [...(formState.keyVisualsLayout || [])];
    
    // Swap source elements
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    
    // Swap corresponding layout items (ensuring length matches)
    while (updatedLayouts.length < updated.length) {
      updatedLayouts.push('full');
    }
    const tempLayout = updatedLayouts[idx];
    updatedLayouts[idx] = updatedLayouts[idx + 1];
    updatedLayouts[idx + 1] = tempLayout;

    setFormState({
      ...formState,
      keyVisuals: updated,
      keyVisualsLayout: updatedLayouts
    });
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    
    const updated = [...formState.keyVisuals];
    const updatedLayouts = [...(formState.keyVisualsLayout || [])];
    while (updatedLayouts.length < updated.length) {
      updatedLayouts.push('full');
    }

    // Swap elements
    const temp = updated[draggedIdx];
    updated[draggedIdx] = updated[targetIdx];
    updated[targetIdx] = temp;

    const tempLayout = updatedLayouts[draggedIdx];
    updatedLayouts[draggedIdx] = updatedLayouts[targetIdx];
    updatedLayouts[targetIdx] = tempLayout;

    setFormState({
      ...formState,
      keyVisuals: updated,
      keyVisualsLayout: updatedLayouts
    });
    
    setDraggedIdx(targetIdx);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleProjectDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedProjectIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProjectDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleProjectDragEnter = (e: React.DragEvent, targetIdx: number) => {
    if (draggedProjectIdx === null || draggedProjectIdx === targetIdx) return;
    
    const updated = [...projects];
    // Swap projects
    const temp = updated[draggedProjectIdx];
    updated[draggedProjectIdx] = updated[targetIdx];
    updated[targetIdx] = temp;

    onUpdateProjects(updated);
    setDraggedProjectIdx(targetIdx);
  };

  const handleProjectDragEnd = () => {
    setDraggedProjectIdx(null);
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
                </div>

                <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full font-mono text-center text-lg p-3 bg-neutral-900 border border-neutral-800 focus:border-brand-bronze text-white tracking-widest outline-none rounded-sm"
                    placeholder="ENTER PASSWORD"
                    maxLength={20}
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
                      {projects.map((proj, idx) => (
                        <div
                          key={proj.id}
                          draggable
                          onDragStart={(e) => handleProjectDragStart(e, idx)}
                          onDragOver={handleProjectDragOver}
                          onDragEnter={(e) => handleProjectDragEnter(e, idx)}
                          onDragEnd={handleProjectDragEnd}
                          className={`p-3 rounded-sm border flex items-center justify-between transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                            draggedProjectIdx === idx
                              ? 'border-brand-bronze scale-95 opacity-50 bg-brand-bronze/5 shadow-inner'
                              : formState.id === proj.id
                                ? 'border-brand-bronze bg-brand-bronze/5'
                                : 'border-transparent bg-neutral-900/10 hover:bg-neutral-900/40 hover:border-brand-bronze/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-zinc-500 hover:text-brand-bronze transition-colors shrink-0" />
                            <div
                              onClick={() => handleEditProject(proj)}
                              className="flex-1 cursor-pointer min-w-0"
                            >
                              <div className="font-display font-semibold text-xs tracking-tight truncate">{proj.title}</div>
                              <div className="font-mono text-[9px] text-neutral-400 truncate">
                                {proj.category} • {proj.year} {proj.isExperiment && '• [EXPMT]'} {proj.isFeatured && '• [★ HERO]'}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1 px-2.5 text-neutral-500 hover:text-red-400 hover:scale-105 transition-all shrink-0"
                            title="Delete file project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reset defaults actions bottom */}
                  <div className={`p-4 border-t uppercase text-center space-y-2.5 ${
                    theme === 'dark' ? 'border-neutral-800 bg-[#161616]' : 'border-neutral-200 bg-neutral-50'
                  }`}>
                    <div className="font-mono text-[9px] text-neutral-400">CLOUD CDN STORAGE (NETLIFY)</div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowStorageConfig(!showStorageConfig);
                        setShowGithubConfig(false);
                        setIsEditing(false);
                      }}
                      className={`w-full flex items-center justify-center gap-2 border transition-all font-mono text-[10px] p-2 leading-none rounded-sm ${
                        showStorageConfig
                          ? 'border-brand-bronze bg-brand-bronze/10 text-white font-bold'
                          : 'border-brand-bronze/40 text-brand-bronze hover:border-brand-bronze hover:bg-brand-bronze/5'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{showStorageConfig ? "CLOSE CLOUD SETTINGS" : "CONFIGURE CLOUD STORAGE"}</span>
                    </button>

                    <div className="font-mono text-[9px] text-neutral-400 pt-1">GITHUB DATA SYNCHRONIZATION</div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGithubConfig(!showGithubConfig);
                        setShowStorageConfig(false);
                        setIsEditing(false);
                      }}
                      className={`w-full flex items-center justify-center gap-2 border transition-all font-mono text-[10px] p-2 leading-none rounded-sm ${
                        showGithubConfig
                          ? 'border-brand-bronze bg-brand-bronze/10 text-white font-bold'
                          : 'border-neutral-500/40 text-neutral-400 hover:border-brand-bronze hover:bg-brand-bronze/5 hover:text-brand-bronze'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{showGithubConfig ? "CLOSE GITHUB CONFIG" : "CONFIGURE GITHUB SYNC"}</span>
                    </button>

                    <div className="font-mono text-[8px] text-neutral-500 pt-1.5">RESTORE SYSTEM METRIC DATA</div>
                    <button
                      onClick={handleResetDefaults}
                      className="w-full flex items-center justify-center gap-2 border border-neutral-800 hover:border-red-500/50 hover:text-red-400 transition-all text-neutral-500 font-mono text-[9px] p-2 leading-none rounded-sm bg-black/10"
                    >
                      <RefreshCcw className="w-2.5 h-2.5" />
                      <span>RESET CATALOG TO SEED STATUS</span>
                    </button>
                  </div>
                </div>

                {/* Right Area: Interactive Editor Form */}
                <div className="w-full md:w-7/12 overflow-y-auto p-6 md:p-8">
                  {showStorageConfig ? (
                    <div className="space-y-6 text-left">
                      <div className="flex justify-between items-center pb-2 border-b border-brand-bronze/20">
                        <h4 className="font-mono text-[11px] text-brand-bronze uppercase flex items-center gap-2">
                          <Globe className="w-4 h-4 text-brand-bronze" />
                          <span>CLOUD STORAGE SERVICE CONFIG (NETLIFY-COMPATIBLE)</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowStorageConfig(false)}
                          className="font-mono text-[10px] hover:underline hover:text-white text-zinc-400"
                        >
                          CLOSE
                        </button>
                      </div>

                      <div className={`p-4 rounded-sm text-xs space-y-2 border ${
                        theme === 'dark' 
                          ? 'bg-neutral-900/50 border-neutral-800 text-zinc-300' 
                          : 'bg-neutral-100 border-neutral-200 text-brand-black'
                      }`}>
                        <span className="font-bold font-mono text-[9px] text-brand-bronze block">💡 STATIC HOSTING TIP (NETLIFY)</span>
                        <p className="leading-relaxed text-[11px]">
                          Netlify and other static hosting environments are fully client-side and do not support local server folder uploads (which results in a 404). Setting up <strong>Cloudinary</strong> or <strong>Supabase</strong> allows uploading pictures and videos straight from your browser to a cloud CDN.
                        </p>
                        <p className="leading-relaxed text-[11px] text-zinc-400">
                          Credentials are saved securely inside your browser's persistent cache (localStorage). If you want team deployments to automatically use these channels, define them as environment variables starting with <code className="bg-zinc-900 px-1 font-mono text-white text-[10px]">VITE_</code> inside your Netlify Settings panel.
                        </p>
                      </div>

                      {/* Provider Selector */}
                      <div className="space-y-2">
                        <label className="font-mono text-[9px] text-neutral-400 block">SELECT STORAGE PROVIDER</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'catbox', label: 'Catbox CDN', desc: 'No signup, free instant' },
                            { id: 'cloudinary', label: 'Cloudinary', desc: 'Unsigned Preset' },
                            { id: 'supabase', label: 'Supabase Store', desc: 'REST Direct' },
                            { id: 'local', label: 'Local API', desc: 'AI Studio Node Host' }
                          ].map((prov) => (
                            <button
                              key={prov.id}
                              type="button"
                              onClick={() => {
                                setStorageSettingsState(prev => ({ ...prev, provider: prov.id as any }));
                                setTestUploadResult('');
                              }}
                              className={`p-3 rounded-sm border flex flex-col text-left transition-all ${
                                storageSettings.provider === prov.id
                                  ? 'border-brand-bronze bg-brand-bronze/10 text-white'
                                  : theme === 'dark'
                                  ? 'border-neutral-800 bg-[#161616]/50 text-zinc-400 hover:border-neutral-700'
                                  : 'border-neutral-200 bg-white text-zinc-600 hover:border-neutral-400'
                              }`}
                            >
                              <span className="font-sans font-bold text-[11px]">{prov.label}</span>
                              <span className="font-mono text-[8px] text-neutral-500 mt-1">{prov.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cloudinary Section */}
                      {storageSettings.provider === 'cloudinary' && (
                        <div className={`space-y-4 p-4 rounded-sm border ${
                          theme === 'dark' ? 'bg-neutral-900/30 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                        }`}>
                          <h5 className="font-mono text-[10px] text-brand-bronze uppercase">// CLOUDINARY UNSIGNED CONFIG</h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-neutral-400 block">CLOUDINARY CLOUD NAME</label>
                              <input
                                type="text"
                                value={storageSettings.cloudinaryCloudName}
                                onChange={(e) => setStorageSettingsState(prev => ({ ...prev, cloudinaryCloudName: e.target.value }))}
                                placeholder="e.g. dxyz1234b"
                                className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                  theme === 'dark'
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                    : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                }`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-neutral-400 block">UNSIGNED UPLOAD PRESET</label>
                              <input
                                type="text"
                                value={storageSettings.cloudinaryUploadPreset}
                                onChange={(e) => setStorageSettingsState(prev => ({ ...prev, cloudinaryUploadPreset: e.target.value }))}
                                placeholder="e.g. portfolio_preset"
                                className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                  theme === 'dark'
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                    : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                }`}
                              />
                              <span className="font-mono text-[8px] text-neutral-500 block">* Must be set to 'Unsigned' inside Cloudinary Console</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-mono text-[9px] text-neutral-400 block">FOLDER NAME (OPTIONAL)</label>
                            <input
                              type="text"
                              value={storageSettings.cloudinaryFolder}
                              onChange={(e) => setStorageSettingsState(prev => ({ ...prev, cloudinaryFolder: e.target.value }))}
                              placeholder="e.g. portfolios"
                              className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                theme === 'dark'
                                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                  : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Supabase Storage Section */}
                      {storageSettings.provider === 'supabase' && (
                        <div className={`space-y-4 p-4 rounded-sm border ${
                          theme === 'dark' ? 'bg-neutral-900/30 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                        }`}>
                          <h5 className="font-mono text-[10px] text-brand-bronze uppercase">// SUPABASE OBJECT STORAGE CONFIG</h5>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-neutral-400 block">SUPABASE PROJECT URL</label>
                              <input
                                type="text"
                                value={storageSettings.supabaseUrl}
                                onChange={(e) => setStorageSettingsState(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                                placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                                className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                  theme === 'dark'
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                    : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                }`}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-neutral-400 block">SUPABASE ANON KEY (PUBLIC API KEY)</label>
                              <input
                                type="password"
                                value={storageSettings.supabaseAnonKey}
                                onChange={(e) => setStorageSettingsState(prev => ({ ...prev, supabaseAnonKey: e.target.value }))}
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                  theme === 'dark'
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                    : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                }`}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="font-mono text-[9px] text-neutral-400 block">BUCKET NAME</label>
                                <input
                                  type="text"
                                  value={storageSettings.supabaseBucket}
                                  onChange={(e) => setStorageSettingsState(prev => ({ ...prev, supabaseBucket: e.target.value }))}
                                  placeholder="e.g. portfolio-assets"
                                  className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                    theme === 'dark'
                                      ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                      : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                  }`}
                                />
                                <span className="font-mono text-[8px] text-neutral-500 block">* Bucket policies must allow Public Select & Insert</span>
                              </div>
                              <div className="space-y-1">
                                <label className="font-mono text-[9px] text-neutral-400 block">FOLDER PATH IN BUCKET (OPTIONAL)</label>
                                <input
                                  type="text"
                                  value={storageSettings.supabaseFolder}
                                  onChange={(e) => setStorageSettingsState(prev => ({ ...prev, supabaseFolder: e.target.value }))}
                                  placeholder="e.g. uploads"
                                  className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                    theme === 'dark'
                                      ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                      : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Catbox Section */}
                      {storageSettings.provider === 'catbox' && (
                        <div className={`p-4 rounded-sm border border-dashed text-xs space-y-2 ${
                          theme === 'dark' ? 'border-neutral-800 bg-[#161616]/50' : 'border-neutral-300 bg-[#E9E5DE]/20'
                        }`}>
                          <span className="text-brand-bronze block font-bold text-[10px] font-mono">// CATBOX ANONYMOUS CDN</span>
                          <p className="text-[11px] leading-relaxed text-neutral-400">
                            Catbox is an excellent, lightweight hosting service that accepts direct file uploads anonymously from the client. Files are processed cleanly inside your browser, hosted permanently on global fast CDNs (<code className="text-brand-bronze font-mono">https://files.catbox.moe/...</code>), and accessible from Netlify instantly with zero configurations required.
                          </p>
                        </div>
                      )}

                      {/* Local Section */}
                      {storageSettings.provider === 'local' && (
                        <div className={`p-4 rounded-sm border border-dashed text-xs space-y-2 ${
                          theme === 'dark' ? 'border-neutral-800 bg-[#161616]/50' : 'border-neutral-300 bg-[#E9E5DE]/20'
                        }`}>
                          <span className="text-red-400 block font-bold text-[10px] font-mono">// CONTAINER FALLBACK STORAGE</span>
                          <p className="text-[11px] leading-relaxed text-neutral-400">
                            Standard system directories write straight to the local container of this workspace. Useful during active local development (runs Express endpoint <code className="text-zinc-300 font-mono">/api/upload</code>) but <strong>will return a 404</strong> on fully static deployment providers.
                          </p>
                        </div>
                      )}

                      {/* Save Credentials */}
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            saveStorageSettings(storageSettings);
                            alert('Cloud storage configuration successfully saved! These credentials will be used whenever uploading images or videos.');
                          }}
                          className="w-full bg-brand-bronze text-black hover:bg-brand-bronze/85 py-3 px-4 font-mono font-bold text-xs uppercase rounded-sm transition-all"
                        >
                          SAVE PERSISTED SETTINGS
                        </button>
                      </div>

                      {/* Interactive Uploader Test Sandbox */}
                      <div className="border-t border-neutral-800 pt-6 space-y-3">
                        <span className="font-mono text-[10px] text-brand-bronze block uppercase">// STORAGE CONNECTION SANDBOX</span>
                        <div className={`p-4 rounded-sm border flex flex-col sm:flex-row gap-4 items-center justify-between ${
                          theme === 'dark' ? 'bg-[#161616]/30 border-neutral-800' : 'bg-[#E9E5DE]/20 border-neutral-200'
                        }`}>
                          <div className="space-y-1 text-left sm:flex-1">
                            <h6 className="font-display font-semibold text-xs">Interactive Upload Test</h6>
                            <p className="text-[11px] text-neutral-400">
                              Drop or choose a small image here to check the configuration and make sure connection logs run successfully.
                            </p>
                          </div>

                          <div className="flex flex-col items-center gap-2">
                            <label className="relative cursor-pointer bg-neutral-800 hover:bg-neutral-700 hover:text-white px-3 py-1.5 text-[10px] font-mono border border-neutral-700 rounded transition-colors block">
                              <span>{isTestingUpload ? 'UPLOADING...' : 'TEST CDN UPLOAD'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isTestingUpload}
                                onChange={async (e) => {
                                  const files = e.target.files;
                                  if (!files || files.length === 0) return;
                                  setIsTestingUpload(true);
                                  setTestUploadResult('');
                                  try {
                                    const file = files[0];
                                    const b64 = await compressImage(file, 600, 600);
                                    const resultUrl = await uploadToCloudProvider(b64, file.name, storageSettings);
                                    setTestUploadResult(resultUrl);
                                    console.log('Upload Connection succeeded:', resultUrl);
                                  } catch (testErr: any) {
                                    console.error('Connection check failed:', testErr);
                                    alert(`Upload connection failed!\n${testErr?.message || testErr}`);
                                  } finally {
                                    setIsTestingUpload(false);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {testUploadResult && (
                          <div className="p-3.5 bg-emerald-950/15 border border-emerald-900/35 rounded-sm space-y-2 animate-fadeIn text-left">
                            <span className="font-mono text-[9px] text-emerald-400 block font-bold">✓ CONNECTION SUCCESSFUL</span>
                            <div className="flex gap-3 items-center">
                              <img
                                src={testUploadResult}
                                alt="Test result"
                                className="w-12 h-12 object-cover border border-emerald-950 rounded-sm bg-neutral-900"
                              />
                              <div className="flex-1 space-y-1">
                                <label className="font-mono text-[8px] text-emerald-500/80 block uppercase">SECURE CLOUD CDN REPOSITORY PATH</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={testUploadResult}
                                  className="w-full font-mono text-[10px] p-1.5 bg-neutral-900 border border-neutral-850 rounded text-zinc-300"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : showGithubConfig ? (
                    <div className="space-y-6 text-left">
                      <div className="flex justify-between items-center pb-2 border-b border-brand-bronze/20">
                        <h4 className="font-mono text-[11px] text-brand-bronze uppercase flex items-center gap-2">
                          <Database className="w-4 h-4 text-brand-bronze" />
                          <span>GITHUB REPOSITORY DATA SYNCHRONIZATION</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowGithubConfig(false)}
                          className="font-mono text-[10px] hover:underline hover:text-white text-zinc-400"
                        >
                          CLOSE
                        </button>
                      </div>

                      <div className={`p-4 rounded-sm text-xs space-y-2 border ${
                        theme === 'dark' 
                          ? 'bg-neutral-900/50 border-neutral-800 text-zinc-300' 
                          : 'bg-neutral-100 border-neutral-200 text-brand-black'
                      }`}>
                        <span className="font-bold font-mono text-[9px] text-brand-bronze block">💡 STATIC HOSTING DATA PERSISTENCE (GITHUB)</span>
                        <p className="leading-relaxed text-[11px]">
                          By connecting your portfolio straight to your GitHub repository, all operations (Add, Edit, Delete, Reset) are automatically committed directly to your <code className="bg-black/15 px-1 font-mono text-[10px]">data.json</code> or <code className="bg-black/15 px-1 font-mono text-[10px]">projects-db.json</code> file on GitHub.
                        </p>
                        <p className="leading-relaxed text-[11px] text-zinc-400">
                          This maintains complete consistency without databases, meaning other devices and public visitors instantly view your updated portfolio directly from GitHub.
                        </p>
                      </div>

                      {/* Enabled Toggle */}
                      <div className="flex items-center justify-between p-3 border border-neutral-800/40 rounded-sm bg-black/10">
                        <div className="space-y-1 text-left mr-4">
                          <label className="font-mono text-[10px] font-bold text-brand-bronze block uppercase">ENABLE GITHUB AUTOMATED SYNC</label>
                          <span className="text-[10px] text-neutral-400 block leading-tight">If disabled, the application uses local caches and fallback standard container file storage.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGithubSettingsState(prev => ({ ...prev, enabled: !prev.enabled }))}
                          className="text-brand-bronze focus:outline-none transition-transform active:scale-95"
                        >
                          {githubSettings.enabled ? (
                            <ToggleRight className="w-9 h-9" />
                          ) : (
                            <ToggleLeft className="w-9 h-9 text-neutral-500" />
                          )}
                        </button>
                      </div>

                      {/* Credentials Input Grid */}
                      <div className={`space-y-4 p-4 rounded-sm border ${
                        theme === 'dark' ? 'bg-neutral-900/30 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                      }`}>
                        <h5 className="font-mono text-[10px] text-brand-bronze uppercase">// GITHUB REPOSITORY CONFIG DETAILS</h5>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="font-mono text-[9px] text-neutral-400 block">GITHUB PERSONAL ACCESS TOKEN (PAT)</label>
                            <input
                              type="password"
                              value={githubSettings.token}
                              onChange={(e) => setGithubSettingsState(prev => ({ ...prev, token: e.target.value }))}
                              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                              className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                theme === 'dark'
                                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                  : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                              }`}
                            />
                            <span className="font-mono text-[8px] text-neutral-500 block">* Stored only locally in your browser cache. Needs scopes: "repo" or "public_repo".</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-neutral-400 block">REPOSITORY OWNER</label>
                              <input
                                type="text"
                                value={githubSettings.owner}
                                onChange={(e) => setGithubSettingsState(prev => ({ ...prev, owner: e.target.value }))}
                                placeholder="e.g. bon2262"
                                className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                  theme === 'dark'
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                    : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                }`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-neutral-400 block">REPOSITORY NAME</label>
                              <input
                                type="text"
                                value={githubSettings.repo}
                                onChange={(e) => setGithubSettingsState(prev => ({ ...prev, repo: e.target.value }))}
                                placeholder="e.g. gubw-portfolio"
                                className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                  theme === 'dark'
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                    : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-neutral-400 block">TARGET BRANCH</label>
                              <input
                                type="text"
                                value={githubSettings.branch}
                                onChange={(e) => setGithubSettingsState(prev => ({ ...prev, branch: e.target.value }))}
                                placeholder="main"
                                className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                  theme === 'dark'
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                    : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                }`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-neutral-400 block">TARGET JSON FILE PATH</label>
                              <input
                                type="text"
                                value={githubSettings.filePath}
                                onChange={(e) => setGithubSettingsState(prev => ({ ...prev, filePath: e.target.value }))}
                                placeholder="projects-db.json"
                                className={`w-full text-xs p-2.5 rounded-sm border focus:border-brand-bronze outline-none ${
                                  theme === 'dark'
                                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 placeholder-neutral-600'
                                    : 'bg-white border-neutral-300 text-neutral-700 placeholder-neutral-400'
                                }`}
                              />
                              <span className="font-mono text-[8px] text-neutral-500 block">* e.g. "projects-db.json" or "src/data.json"</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Save Credentials */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            saveGithubSettings(githubSettings);
                            alert('GitHub Sync configurations settings successfully saved to Local Cache overrides! Active data pipeline will reflect this instantly.');
                          }}
                          className="w-full bg-brand-bronze text-black hover:bg-brand-bronze/85 py-3 px-4 font-mono font-bold text-xs uppercase rounded-sm transition-all"
                        >
                          SAVE GITHUB CONFIG OVERRIDES
                        </button>
                      </div>

                      {/* Connection tester */}
                      <div className="border-t border-neutral-800 pt-6 space-y-3">
                        <span className="font-mono text-[10px] text-brand-bronze block uppercase">// GITHUB REPOSITORY DIAGNOSTIC SANDBOX</span>
                        <div className={`p-4 rounded-sm border flex flex-col sm:flex-row gap-4 items-center justify-between ${
                          theme === 'dark' ? 'bg-[#161616]/30 border-neutral-800' : 'bg-[#E9E5DE]/20 border-neutral-200'
                        }`}>
                          <div className="space-y-1 text-left sm:flex-1">
                            <h6 className="font-display font-semibold text-xs">Test Repository Integration</h6>
                            <p className="text-[11px] text-neutral-400 mr-2">
                              Checks credentials by pulling the current file from GitHub. Highly recommended to verify permissions.
                            </p>
                          </div>

                          <div className="flex flex-col items-center gap-2">
                            <button
                              type="button"
                              disabled={isTestingGithub}
                              onClick={async () => {
                                setIsTestingGithub(true);
                                setGithubTestResult(null);
                                try {
                                  // Verify the connection
                                  const list = await fetchProjectsFromGithub(githubSettings);
                                  if (list) {
                                    setGithubTestResult({
                                      success: true,
                                      message: `INTEGRATION VERIFIED: Successfully pulled existing projects data file. Found ${list.length} project items.`,
                                      count: list.length
                                    });
                                  } else {
                                    setGithubTestResult({
                                      success: true,
                                      message: `INTEGRATION SUCCESSFUL (NEW PATH): File does not exist yet at specified path. It will be initialized on next catalog project modification.`,
                                      count: 0
                                    });
                                  }
                                } catch (err: any) {
                                  setGithubTestResult({
                                    success: false,
                                    message: `CONNECTION FAILED: ${err?.message || err}`
                                  });
                                } finally {
                                  setIsTestingGithub(false);
                                }
                              }}
                              className="bg-neutral-800 hover:bg-neutral-700 hover:text-white px-4 py-2 text-[10px] font-mono border border-neutral-700 rounded transition-colors block leading-none"
                            >
                              {isTestingGithub ? 'CONTACTING...' : 'TEST REPO CONNECTION'}
                            </button>
                          </div>
                        </div>

                        {githubTestResult && (
                          <div className={`p-3.5 rounded-sm space-y-1.5 animate-fadeIn text-left border ${
                            githubTestResult.success 
                              ? 'bg-emerald-950/15 border-emerald-900/35 text-emerald-400' 
                              : 'bg-red-950/15 border-red-900/35 text-red-400'
                          }`}>
                            <span className="font-mono text-[9px] block font-bold">
                              {githubTestResult.success ? '✓ REPOSITORY RESPONSE RECEIVED' : '❌ DIAGNOSTIC PIPELINE ERROR'}
                            </span>
                            <p className="font-mono text-[10px] leading-relaxed">
                              {githubTestResult.message}
                            </p>
                            {githubTestResult.success && githubTestResult.count !== undefined && githubTestResult.count > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to completely overwrite your local/offline database with the pulled GitHub file catalog right now?')) {
                                    fetchProjectsFromGithub(githubSettings).then(pulled => {
                                      if (pulled) {
                                        onUpdateProjects(pulled);
                                        alert('Successfully imported and replaced local catalog with GitHub master file!');
                                      }
                                    });
                                  }
                                }}
                                className="mt-2 text-brand-bronze text-[10px] font-mono underline hover:text-white block"
                              >
                                OVERWRITE LOCAL / FALLBACK CATALOG WITH REPO COPY
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : isEditing ? (
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

                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-neutral-400 block">HERO BANNER OVERLINE (e.g. LATEST DIGITAL SCULPTURE)</label>
                        <input
                          type="text"
                          placeholder="LATEST DIGITAL SCULPTURE"
                          value={formState.bannerTag || ''}
                          onChange={(e) => setFormState({ ...formState, bannerTag: e.target.value })}
                          className="w-full text-xs p-2.5 bg-neutral-900/50 border border-zinc-850 focus:border-brand-bronze text-white rounded-sm"
                        />
                      </div>

                      {/* Year & Client Metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-neutral-400 block">YEAR</label>
                          <input
                            type="text"
                            required
                            value={formState.year}
                            onChange={(e) => setFormState({ ...formState, year: e.target.value })}
                            className="w-full text-xs p-2.5 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm focus:border-brand-bronze"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-neutral-400 block">CLIENT</label>
                          <input
                            type="text"
                            placeholder="Personal Art Commission"
                            value={formState.client || ''}
                            onChange={(e) => setFormState({ ...formState, client: e.target.value })}
                            className="w-full text-xs p-2.5 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm focus:border-brand-bronze"
                          />
                        </div>
                      </div>

                      {/* Technical Tags Metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-neutral-400 block">CATEGORY</label>
                          <select
                            value={formState.category}
                            onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                            className="w-full text-xs p-2.5 bg-neutral-900 text-white outline-none rounded-sm border border-zinc-850 focus:border-brand-bronze"
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
                            className="w-full text-xs p-2.5 bg-neutral-900 text-white outline-none rounded-sm border border-zinc-850 focus:border-brand-bronze"
                          >
                            <option value="1:1">1:1 (Square)</option>
                            <option value="4:5">4:5 (Portrait)</option>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Tall)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] text-neutral-400 block">GALLERY GRID</label>
                          <select
                            value={formState.galleryLayout || 'stack'}
                            onChange={(e) => setFormState({ ...formState, galleryLayout: e.target.value as any })}
                            className="w-full text-xs p-2.5 bg-neutral-900 text-white outline-none rounded-sm border border-zinc-850 focus:border-brand-bronze"
                          >
                            <option value="stack">1 Column Stack</option>
                            <option value="grid2">2 Columns Grid</option>
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
                            <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">Attach multiple files. Drag image blocks directly or use ▲/▼ to change order.</span>
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
                            className="bg-neutral-800 hover:bg-neutral-700 text-zinc-300 hover:text-white px-3 font-mono text-[10px] font-bold rounded-sm uppercase flex items-center gap-1 shrink-0"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-brand-bronze" />
                            <span>ADD MEDIA</span>
                          </button>
                        </div>

                        <div className="space-y-1.5 border border-neutral-800/85 p-2.5 rounded-sm bg-neutral-950/40">
                          <label className="font-mono text-[8px] text-zinc-500 block uppercase">// OR ADD NARRATIVE TEXT PLATE</label>
                          <div className="flex gap-2 items-start">
                            <textarea
                              value={newKeyVisualTextPlate}
                              onChange={(e) => setNewKeyVisualTextPlate(e.target.value)}
                              rows={2}
                              className="flex-1 text-xs p-2 bg-neutral-900/50 border border-zinc-850 text-white rounded-sm resize-none font-sans"
                              placeholder="Type story narratives, quotes, or captions to display between visual plates..."
                            />
                            <button
                              type="button"
                              onClick={handleAddTextPlate}
                              className="bg-neutral-800 hover:bg-neutral-700 text-zinc-300 hover:text-white px-3 py-2 font-mono text-[10px] font-bold rounded-sm uppercase flex items-center gap-1 shrink-0 h-full mt-auto"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-brand-bronze" />
                              <span>ADD TEXT</span>
                            </button>
                          </div>
                        </div>

                        {/* Grid list preview of Key Visuals with responsive scaling and delete buttons */}
                        {formState.keyVisuals && formState.keyVisuals.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pt-1 border border-neutral-900 p-2 rounded-sm bg-neutral-950/20">
                            {formState.keyVisuals.map((vis, idx) => {
                              const isVid = isVideoUrl(vis);
                              const isVimeo = isVimeoUrl(vis);
                              const isTxt = isTextPlate(vis);

                              return (
                                <div 
                                  key={idx} 
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, idx)}
                                  onDragOver={handleDragOver}
                                  onDragEnter={(e) => handleDragEnter(e, idx)}
                                  onDragEnd={handleDragEnd}
                                  className={`group relative bg-[#161616] border rounded overflow-hidden aspect-video transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                                    draggedIdx === idx 
                                      ? 'border-brand-bronze scale-95 opacity-40 shadow-inner' 
                                      : 'border-neutral-800 hover:border-brand-bronze/40 hover:shadow-lg'
                                  }`}
                                >
                                  {isTxt ? (
                                    <div className="w-full h-full p-2 bg-neutral-900 border border-neutral-800 overflow-y-auto flex items-center justify-center">
                                      <p className="text-[9px] text-zinc-300 font-sans italic text-center line-clamp-3">
                                        {getTextFromPlate(vis)}
                                      </p>
                                    </div>
                                  ) : isVimeo ? (
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
                                  {/* Small Badge */}
                                  <div className="absolute bottom-1.5 left-1.5 bg-black/75 px-1 py-0.5 rounded text-[8px] font-mono text-brand-bronze uppercase pointer-events-none group-hover:opacity-0 transition-opacity z-10">
                                    {formState.keyVisualsLayout?.[idx] === 'half' 
                                      ? '2단 (HALF)' 
                                      : formState.keyVisualsLayout?.[idx] === 'third' 
                                        ? '3단 (THIRD)' 
                                        : formState.keyVisualsLayout?.[idx] === 'fourth' 
                                          ? '4단 (QUARTER)' 
                                          : formState.keyVisualsLayout?.[idx] === 'fifth' 
                                            ? '5단 (FIFTH)' 
                                            : '1단 (FULL)'}
                                  </div>

                                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
                                    <div className="flex justify-between items-start w-full">
                                      <span className="font-mono text-[8px] text-zinc-300 uppercase flex items-center gap-1">
                                        <GripVertical className="w-2.5 h-2.5 text-brand-bronze shrink-0" />
                                        {isTxt ? 'TEXT' : isVimeo ? 'VIMEO' : isVid ? 'VIDEO' : 'IMAGE'} 0{idx + 1}
                                      </span>
                                      <select
                                        value={formState.keyVisualsLayout?.[idx] || 'full'}
                                        onChange={(e) => {
                                          const updatedLayouts = [...(formState.keyVisualsLayout || [])];
                                          while (updatedLayouts.length < formState.keyVisuals.length) {
                                            updatedLayouts.push('full');
                                          }
                                          updatedLayouts[idx] = e.target.value as any;
                                          setFormState({
                                            ...formState,
                                            keyVisualsLayout: updatedLayouts
                                          });
                                        }}
                                        className="bg-neutral-900 border border-neutral-700 text-[8px] text-zinc-300 font-mono rounded px-1 py-0.5 outline-none cursor-pointer"
                                      >
                                        <option value="full">1단 (FULL)</option>
                                        <option value="half">2단 (HALF)</option>
                                        <option value="third">3단 (THIRD)</option>
                                        <option value="fourth">4단 (QUARTER)</option>
                                        <option value="fifth">5단 (FIFTH)</option>
                                      </select>
                                    </div>
                                    <div className="flex justify-between items-center w-full mt-auto">
                                      <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-0.5 rounded">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => handleMoveKeyVisualUp(idx)}
                                          className={`px-1.5 py-0.5 rounded text-[7px] font-bold transition-all ${
                                            idx === 0
                                              ? 'text-zinc-600 cursor-not-allowed opacity-30 bg-neutral-950/20'
                                              : 'text-brand-bronze bg-zinc-800 hover:bg-zinc-750 hover:text-white'
                                          }`}
                                          title="Move Up"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === formState.keyVisuals.length - 1}
                                          onClick={() => handleMoveKeyVisualDown(idx)}
                                          className={`px-1.5 py-0.5 rounded text-[7px] font-bold transition-all ${
                                            idx === formState.keyVisuals.length - 1
                                              ? 'text-zinc-600 cursor-not-allowed opacity-30 bg-neutral-950/20'
                                              : 'text-brand-bronze bg-zinc-800 hover:bg-zinc-750 hover:text-white'
                                          }`}
                                          title="Move Down"
                                        >
                                          ▼
                                        </button>
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => handleRemoveKeyVisual(idx)} 
                                        className="text-red-400 font-bold hover:scale-105 hover:text-red-200 transition-all text-[9px] font-mono bg-black/85 px-1.5 py-1 rounded"
                                      >
                                        DELETE
                                      </button>
                                    </div>
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
