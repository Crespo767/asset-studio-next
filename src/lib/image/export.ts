import type { ExportResult, ImageFile, ToolSettings } from './types';
import { FORMAT_OPTIONS } from './presets';
import { applyTransformations } from './transform';

// ── PNG → ICO conversion ────────────────────────────────────────────
async function pngToIco(pngBlob: Blob): Promise<Blob> {
  const pngData = new Uint8Array(await pngBlob.arrayBuffer());
  const fileSize = pngData.length;

  const header = new Uint8Array([0, 0, 1, 0, 1, 0]);
  const entry = new Uint8Array([
    0, 0, 0, 0, 1, 0, 32, 0,
    fileSize & 0xFF, (fileSize >> 8) & 0xFF, (fileSize >> 16) & 0xFF, (fileSize >> 24) & 0xFF,
    22, 0, 0, 0,
  ]);

  return new Blob([header, entry, pngData], { type: 'image/x-icon' });
}

// ── Canvas → Blob ───────────────────────────────────────────────────
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  const formatOption = FORMAT_OPTIONS.find(f => f.id === format);
  const mimeType = formatOption?.mimeType || 'image/png';
  const normalizedQuality = quality / 100;

  if (format === 'ico') {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (blob) resolve(await pngToIco(blob));
      }, 'image/png');
    });
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Falha ao criar blob'));
      },
      mimeType,
      formatOption?.supportsQuality ? normalizedQuality : undefined
    );
  });
}

// ── Filename generation ─────────────────────────────────────────────
export function generateFilename(
  originalName: string,
  width: number,
  height: number,
  format: string
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const formatOption = FORMAT_OPTIONS.find(f => f.id === format);
  const extension = formatOption?.extension || '.png';
  return `${baseName}_${width}x${height}${extension}`;
}

// ── Main export function ────────────────────────────────────────────
export async function exportImage(
  imageFile: ImageFile,
  settings: ToolSettings
): Promise<ExportResult> {
  const canvas = applyTransformations(imageFile, settings);
  const blob = await canvasToBlob(canvas, settings.format, settings.quality);
  const filename = generateFilename(imageFile.name, canvas.width, canvas.height, settings.format);

  return {
    blob,
    filename,
    width: canvas.width,
    height: canvas.height,
    format: settings.format,
    size: blob.size,
  };
}

// ── Download helpers ────────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}