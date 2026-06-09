export interface Project {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  category: string; // "Brand Identity" | "3D Design" | "Art Direction" | "Motion Design"
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16';
  thumbnailUrl: string;
  isFeatured: boolean;
  isExperiment: boolean;
  concept: string; // Project overview, 3-5 lines max
  keyVisuals: string[]; // Large high-quality showcase images
  sketchUrl: string;
  referenceUrl: string;
  devUrl: string;
  materialUrl: string;
  motionUrl: string; // Custom video, animation or visual simulation
  finalVisualUrl: string;
  client?: string;
  galleryLayout?: 'stack' | 'grid2';
  keyVisualsLayout?: ('full' | 'half')[];
}

export type ThemeType = 'dark' | 'light';
