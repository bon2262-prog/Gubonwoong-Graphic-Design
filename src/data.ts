import { Project } from './types';

// Let's seed with our generated assets and custom high-fidelity details
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'liquid-geometry',
    title: 'Liquid Geometry',
    subtitle: 'Latest Fluid Dynamics Study',
    year: '2026',
    category: '3D Design',
    aspectRatio: '16:9',
    thumbnailUrl: '/src/assets/images/liquid_geometry_1780900490463.png',
    isFeatured: true,
    isExperiment: false,
    concept: 'A visual exploration of liquid motion inspired by digital erosion, light refraction, and premium industrial alloys. Examining the fluid threshold of metallic state transitions under simulated extreme atmospheric pressures.',
    keyVisuals: [
      '/src/assets/images/liquid_geometry_1780900490463.png',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'
    ],
    sketchUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop', // stylized abstract creative sketch
    referenceUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop', // reference board
    devUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop', // 3D render dev
    materialUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop', // Material nodes
    motionUrl: 'dynamic_active_canvas', // Indicates we will render an live animated shader-like Canvas
    finalVisualUrl: '/src/assets/images/liquid_geometry_1780900490463.png',
    client: 'Seoul Museum of Contemporary Art'
  },
  {
    id: 'chrome-bloom',
    title: 'Chrome Bloom',
    subtitle: 'Botanical Cybernetics',
    year: '2026',
    category: 'Art Direction',
    aspectRatio: '4:5',
    thumbnailUrl: '/src/assets/images/chrome_bloom_1780900510271.png',
    isFeatured: false,
    isExperiment: false,
    concept: 'An organic virtual sculpture exploring the intersections of botanical aesthetics and cybernetic structures. Metal chrome petals wrap around soft translucent cores, forming a synthesis of technology and delicate natural forms.',
    keyVisuals: [
      '/src/assets/images/chrome_bloom_1780900510271.png',
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop'
    ],
    sketchUrl: 'https://images.unsplash.com/photo-1544273677-c433136021d4?q=80&w=600&auto=format&fit=crop',
    referenceUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600&auto=format&fit=crop',
    devUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop',
    materialUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop',
    motionUrl: 'chrome_pulse_wave',
    finalVisualUrl: '/src/assets/images/chrome_bloom_1780900510271.png',
    client: 'Aesthetic Generation Lab'
  },
  {
    id: 'industrial-erosion',
    title: 'Brutalist Tension',
    subtitle: 'Form & Hardness Study',
    year: '2025',
    category: '3D Design',
    aspectRatio: '1:1',
    thumbnailUrl: '/src/assets/images/industrial_erosion_1780900527338.png',
    isFeatured: false,
    isExperiment: false,
    concept: 'Examining the dialogue between high-contrast textures: rough architectural concrete blocks intersecting with flawless, shining gold grid wires. Highlighting structural limits, artificial gravity and geometric weights.',
    keyVisuals: [
      '/src/assets/images/industrial_erosion_1780900527338.png',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop'
    ],
    sketchUrl: 'https://images.unsplash.com/photo-1502239608882-93b729c6af43?q=80&w=600&auto=format&fit=crop',
    referenceUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600&auto=format&fit=crop',
    devUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    materialUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=600&auto=format&fit=crop',
    motionUrl: 'gravitational_stress',
    finalVisualUrl: '/src/assets/images/industrial_erosion_1780900527338.png',
    client: 'Zero-Gravity Collective'
  },
  {
    id: 'digital-flora',
    title: 'Holographic Flora',
    subtitle: 'Post-Human Botany',
    year: '2026',
    category: 'Motion Design',
    aspectRatio: '9:16',
    thumbnailUrl: '/src/assets/images/digital_flora_1780900544023.png',
    isFeatured: false,
    isExperiment: false,
    concept: 'A surreal look into laboratory vessels cultivating electronic botanical ecosystems. Plants emit self-illuminating quantum light patterns that react instantly to invisible sonic vibrational pulses.',
    keyVisuals: [
      '/src/assets/images/digital_flora_1780900544023.png',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop'
    ],
    sketchUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    referenceUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop',
    devUrl: 'https://images.unsplash.com/photo-1561715276-a2d087060f1d?q=80&w=600&auto=format&fit=crop',
    materialUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=600&auto=format&fit=crop',
    motionUrl: 'electronic_photosynthesis',
    finalVisualUrl: '/src/assets/images/digital_flora_1780900544023.png',
    client: 'Neo-Ecology Tokyo'
  },
  // Selected Experiments (These are tagged with isExperiment: true to lay gracefully in physical row break)
  {
    id: 'exp-kinetic-noise',
    title: 'Kinetic Perlin Noise',
    subtitle: 'Reactive 3D Wire Grid',
    year: '2026',
    category: '3D Design',
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    isExperiment: true,
    concept: 'A real-time interactive canvas experiment simulating flow fields, vortex curls, and particle ribbons. Built using pure high-performance GPU mathematics rendering directly on a 2D surface.',
    keyVisuals: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'
    ],
    sketchUrl: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?q=80&w=600&auto=format&fit=crop',
    referenceUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600&auto=format&fit=crop',
    devUrl: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?q=80&w=600&auto=format&fit=crop',
    materialUrl: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=600&auto=format&fit=crop',
    motionUrl: 'perlin_noise_field',
    finalVisualUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    client: 'Personal Lab'
  },
  {
    id: 'exp-crystalline-shear',
    title: 'Crystalline Shear',
    subtitle: 'Glass Refraction Study',
    year: '2026',
    category: '3D Design',
    aspectRatio: '1:1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    isExperiment: true,
    concept: 'Algorithmic fracture system recreating custom crystal shards and chromatic dispersion. Visualizing high index light dispersion through complex multi-faced gem structures.',
    keyVisuals: [
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop'
    ],
    sketchUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop',
    referenceUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
    devUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop',
    materialUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
    motionUrl: 'glass_refraction_loop',
    finalVisualUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop',
    client: 'Personal Lab'
  },
  // Normal projects to balance the rows
  {
    id: 'silica-brand',
    title: 'Silica Co.',
    subtitle: 'Branding for Tactile Glassware',
    year: '2025',
    category: 'Brand Identity',
    aspectRatio: '4:5',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    isExperiment: false,
    concept: 'A holistic identity system for a premium sand-printed glass workshop. Minimal typography, structural letterheads, and transparent raw paper stocks reinforce the organic nature of melted silica.',
    keyVisuals: [
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544200175-ca6e80a7b325?q=80&w=1200&auto=format&fit=crop'
    ],
    sketchUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop',
    referenceUrl: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?q=80&w=600&auto=format&fit=crop',
    devUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=600&auto=format&fit=crop',
    materialUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop',
    motionUrl: 'silica_press',
    finalVisualUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop',
    client: 'Silica Artisanal Co.'
  },
  {
    id: 'kinetic-identity',
    title: 'Neo-Move Studio',
    subtitle: 'Generative Typography System',
    year: '2025',
    category: 'Motion Design',
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
    isFeatured: false,
    isExperiment: false,
    concept: 'Developing a liquid and elastic typographic logo generator that transforms its layout based on real-time sound frequencies of physical spaces. Clean Neue Haas styled shapes paired with rapid digital response.',
    keyVisuals: [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop'
    ],
    sketchUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop',
    referenceUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
    devUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    materialUrl: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=600&auto=format&fit=crop',
    motionUrl: 'typography_warp',
    finalVisualUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
    client: 'Move Digital Arts Festival'
  }
];

const LOCAL_STORAGE_KEY = 'bonwoong_gu_portfolio_projects';

export function getProjects(): Project[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load portfolio database from localStorage', e);
  }
  return INITIAL_PROJECTS;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save portfolio database to localStorage', e);
  }
}

// Robust, high-capacity IndexedDB storage for storing heavy compressed base64 images without QuotaExceeded errors
const DB_NAME = 'PortfolioDB';
const STORE_NAME = 'ProjectsStore';
const DB_VERSION = 1;

function getIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getProjectsAsync(): Promise<Project[]> {
  try {
    const response = await fetch('/api/projects');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Cache locally for instant loading with fallback
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.warn('Silent localstorage write fallback skip', e);
        }
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to load from server API, falling back to local:', e);
  }

  // Fallback 1: IndexedDB cache
  try {
    const db = await getIndexedDB();
    const data = await new Promise<Project[] | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get('projects_list');
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        resolve(null);
      };
    });
    if (data && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.error('Failed to load from IndexedDB backup:', e);
  }
  return getProjects();
}

export async function saveProjectsAsync(projects: Project[]): Promise<void> {
  // Primary save: Server-side API persistence
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projects }),
    });
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    console.log('App database successfully persisted to server.');
  } catch (e) {
    console.error('Failed to save to server database:', e);
  }

  // Backup saves: IndexedDB & LocalStorage
  try {
    const db = await getIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(projects, 'projects_list');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB backup skipped:', e);
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('LocalStorage backup skipped:', e);
  }
}

