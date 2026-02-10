import type { FormatId } from './presets';

export interface ImageFile {
  file: File;
  url: string;
  width: number;
  height: number;
  name: string;
  size: number;
  element: HTMLImageElement;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeSettings {
  width: number;
  height: number;
  maintainAspect: boolean;
}

export interface ToolSettings {
  rotation: number;        // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  resize: ResizeSettings;
  quality: number;         // 1–100
  format: FormatId;
  crop?: CropData;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  format: FormatId;
  size: number;
}

export function createDefaultSettings(image?: ImageFile | null): ToolSettings {
  return {
    rotation: 0,
    flipH: false,
    flipV: false,
    resize: {
      width: image?.width ?? 1920,
      height: image?.height ?? 1080,
      maintainAspect: true,
    },
    quality: 90,
    format: 'png',
  };
}