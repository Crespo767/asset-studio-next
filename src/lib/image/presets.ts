// ── Format options ──────────────────────────────────────────────────
export const FORMAT_OPTIONS = [
  { id: 'png', name: 'PNG', mimeType: 'image/png', extension: '.png', supportsQuality: false },
  { id: 'jpg', name: 'JPG', mimeType: 'image/jpeg', extension: '.jpg', supportsQuality: true },
  { id: 'webp', name: 'WebP', mimeType: 'image/webp', extension: '.webp', supportsQuality: true },
  { id: 'ico', name: 'ICO', mimeType: 'image/x-icon', extension: '.ico', supportsQuality: false },
  { id: 'bmp', name: 'BMP', mimeType: 'image/bmp', extension: '.bmp', supportsQuality: false },
  { id: 'avif', name: 'AVIF', mimeType: 'image/avif', extension: '.avif', supportsQuality: true },
] as const;

export type FormatId = typeof FORMAT_OPTIONS[number]['id'];

// ── Resolution presets ──────────────────────────────────────────────
export interface ResolutionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { id: 'hd', name: 'HD (720p)', width: 1280, height: 720 },
  { id: 'fhd', name: 'Full HD (1080p)', width: 1920, height: 1080 },
  { id: 'qhd', name: 'QHD (1440p)', width: 2560, height: 1440 },
  { id: '4k', name: '4K (2160p)', width: 3840, height: 2160 },
  { id: 'instagram', name: 'Instagram', width: 1080, height: 1080 },
  { id: 'twitter', name: 'Twitter Header', width: 1500, height: 500 },
  { id: 'youtube', name: 'YouTube Thumb', width: 1280, height: 720 },
  // Foundry VTT Maps (100px per grid square)
  { id: 'foundry-20x20', name: 'Foundry 20×20', width: 2000, height: 2000 },
  { id: 'foundry-30x30', name: 'Foundry 30×30', width: 3000, height: 3000 },
  { id: 'foundry-40x40', name: 'Foundry 40×40', width: 4000, height: 4000 },
  { id: 'foundry-32x18', name: 'Foundry 32×18 (16:9)', width: 3200, height: 1800 },
  { id: 'foundry-64x32', name: 'Foundry 64×32 (16:9)', width: 6400, height: 3200 },
];

// ── Helpers ─────────────────────────────────────────────────────────
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