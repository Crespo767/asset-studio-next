import type { FormatId } from './presets';

export interface ImageFile {
  file: File;
  url: string;
  width: number;
  height: number;
  name: string;
  size: number;
  element: HTMLImageElement; // ADICIONADO: Necessário para o canvas ler a imagem
}

export type WallpaperMode = 'fit' | 'crop' | 'extend';
export type BackgroundType = 'blur' | 'solid' | 'gradient';
export type ExtendMode = 'mirror' | 'stretch' | 'ai'; // ALTERADO: Adicionado 'ai'
export type Orientation = 'horizontal' | 'vertical';

export interface PreprocessingSettings {
  removeBackground: boolean;
}

export interface WallpaperSettings {
  enabled: boolean;
  orientation: Orientation;
  mode: WallpaperMode;
  aspectRatio: string;
  customWidth?: number;
  customHeight?: number;
  background: {
    type: BackgroundType;
    blurIntensity: number;
    solidColor: string;
    gradientStart: string;
    gradientEnd: string;
  };
  extendMode: ExtendMode;
  aiGeneratedImage?: string; // ADICIONADO: Guarda o resultado da IA
  crop?: CropData;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OutputSettings {
  preset: string;
  customWidth: number;
  customHeight: number;
  maintainAspect: boolean;
  fitMode: 'contain' | 'cover';
}

export interface OptimizationSettings {
  format: FormatId;
  quality: number;
  targetSizeEnabled: boolean;
  targetSizeMB: number;
  removeMetadata: boolean;
}

export interface BatchSettings {
  enabled: boolean;
  selectedPresets: string[];
}

export interface StudioSettings {
  preprocessing: PreprocessingSettings;
  wallpaper: WallpaperSettings;
  output: OutputSettings;
  optimization: OptimizationSettings;
  batch: BatchSettings;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  format: FormatId;
  size: number;
}

export const DEFAULT_SETTINGS: StudioSettings = {
  preprocessing: {
    removeBackground: false,
  },
  wallpaper: {
    enabled: false,
    orientation: 'horizontal',
    mode: 'fit',
    aspectRatio: '16:9',
    background: {
      type: 'blur',
      blurIntensity: 40,
      solidColor: '#1a1a1a',
      gradientStart: '#1a1a1a',
      gradientEnd: '#2d2d2d',
    },
    extendMode: 'mirror',
  },
  output: {
    preset: 'fhd',
    customWidth: 1920,
    customHeight: 1080,
    maintainAspect: true,
    fitMode: 'contain',
  },
  optimization: {
    format: 'png',
    quality: 90,
    targetSizeEnabled: false,
    targetSizeMB: 5,
    removeMetadata: true,
  },
  batch: {
    enabled: false,
    selectedPresets: ['fhd', 'qhd', '4k'],
  },
};