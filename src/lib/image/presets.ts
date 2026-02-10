export interface Preset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'wallpaper' | 'foundry' | 'social' | 'custom';
  description?: string;
}

export const WALLPAPER_PRESETS: Preset[] = [
  { id: 'fhd', name: '1080p (Full HD)', width: 1920, height: 1080, category: 'wallpaper' },
  { id: 'qhd', name: '1440p (QHD)', width: 2560, height: 1440, category: 'wallpaper' },
  { id: '4k', name: '4K (UHD)', width: 3840, height: 2160, category: 'wallpaper' },
  { id: 'ultrawide', name: 'Ultrawide 21:9', width: 3440, height: 1440, category: 'wallpaper' },
  { id: 'ultrawide-4k', name: 'Ultrawide 4K', width: 5120, height: 2160, category: 'wallpaper' },
];

// Mapas horizontais para Foundry VTT: 100px/grid, 16:9 ou 3:2, <15MB em WebP
export const FOUNDRY_PRESETS: Preset[] = [
  { 
    id: 'foundry-16-9-med', 
    name: 'Foundry 16:9 Médio (32×18)', 
    width: 3200, 
    height: 1800, 
    category: 'foundry',
    description: 'Mapa horizontal 16:9, 100px/grid. Ideal para cenas médias.'
  },
  { 
    id: 'foundry-16-9-large', 
    name: 'Foundry 16:9 Grande (40×22)', 
    width: 4000, 
    height: 2200, 
    category: 'foundry',
    description: 'Mapa horizontal 16:9, mais detalhe. Exporte em WebP.'
  },
  { 
    id: 'foundry-3-2-med', 
    name: 'Foundry 3:2 Médio (30×20)', 
    width: 3000, 
    height: 2000, 
    category: 'foundry',
    description: 'Mapa horizontal 3:2, 100px/grid.'
  },
  { 
    id: 'foundry-3-2-large', 
    name: 'Foundry 3:2 Grande (40×30)', 
    width: 4000, 
    height: 3000, 
    category: 'foundry',
    description: 'Mapa grande 3:2. Mantenha arquivo <15MB (WebP).'
  },
  { 
    id: 'foundry-1688', 
    name: 'Foundry 3000×1688', 
    width: 3000, 
    height: 1688, 
    category: 'foundry',
    description: '16:9 alternativo, bom para performance.'
  },
];

export const SOCIAL_PRESETS: Preset[] = [
  { id: 'instagram-square', name: 'Instagram Square', width: 1080, height: 1080, category: 'social' },
  { id: 'instagram-portrait', name: 'Instagram Portrait', width: 1080, height: 1350, category: 'social' },
  { id: 'twitter-header', name: 'Twitter Header', width: 1500, height: 500, category: 'social' },
  { id: 'youtube-thumb', name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'social' },
];

export const ALL_PRESETS: Preset[] = [
  ...WALLPAPER_PRESETS,
  ...FOUNDRY_PRESETS,
  ...SOCIAL_PRESETS,
];

export const ASPECT_RATIOS = [
  { id: '16:9', name: '16:9', ratio: 16 / 9 },
  { id: '21:9', name: '21:9 Ultrawide', ratio: 21 / 9 },
  { id: '4:3', name: '4:3', ratio: 4 / 3 },
  { id: '1:1', name: '1:1 Square', ratio: 1 },
  { id: 'custom', name: 'Custom', ratio: null },
] as const;

// --- ATUALIZADO COM ICO ---
export const FORMAT_OPTIONS = [
  { id: 'png', name: 'PNG', mimeType: 'image/png', extension: '.png', supportsQuality: false },
  { id: 'jpg', name: 'JPG', mimeType: 'image/jpeg', extension: '.jpg', supportsQuality: true },
  { id: 'webp', name: 'WebP', mimeType: 'image/webp', extension: '.webp', supportsQuality: true },
  { id: 'ico', name: 'ICO', mimeType: 'image/x-icon', extension: '.ico', supportsQuality: false },
] as const;

export type FormatId = typeof FORMAT_OPTIONS[number]['id'];
export type AspectRatioId = typeof ASPECT_RATIOS[number]['id'];

export function getPresetById(id: string): Preset | undefined {
  return ALL_PRESETS.find(p => p.id === id);
}

export function getPresetsByCategory(category: Preset['category']): Preset[] {
  return ALL_PRESETS.filter(p => p.category === category);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}