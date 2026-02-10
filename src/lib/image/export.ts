import JSZip from 'jszip';
import type { ExportResult, ImageFile, StudioSettings } from './types';
import { FORMAT_OPTIONS, getPresetById, type Preset } from './presets';
import { processImage, composeCanvas } from './transform';

// Função auxiliar para converter PNG Blob em ICO Blob válido com cabeçalho binário
async function pngToIco(pngBlob: Blob): Promise<Blob> {
  const pngData = new Uint8Array(await pngBlob.arrayBuffer());
  const fileSize = pngData.length;

  // Cabeçalho ICO (6 bytes)
  const header = new Uint8Array([
    0, 0,             // Reservado
    1, 0,             // Tipo (1 = ICO)
    1, 0              // Número de imagens (1)
  ]);

  // Diretório da Imagem (16 bytes)
  // Nota: Para ICOs maiores que 256px, a largura/altura é salva como 0
  const width = 0; 
  const height = 0;

  const entry = new Uint8Array([
    width,            // Largura
    height,           // Altura
    0,                // Paleta de cores (0 = sem paleta)
    0,                // Reservado
    1, 0,             // Planos de cor (1)
    32, 0,            // Bits por pixel (32)
    fileSize & 0xFF, (fileSize >> 8) & 0xFF, (fileSize >> 16) & 0xFF, (fileSize >> 24) & 0xFF, // Tamanho do PNG
    22, 0, 0, 0       // Offset onde começa o PNG (6 header + 16 entry = 22)
  ]);

  // Combina tudo num único Blob
  return new Blob([header, entry, pngData], { type: 'image/x-icon' });
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  const formatOption = FORMAT_OPTIONS.find(f => f.id === format);
  let mimeType = formatOption?.mimeType || 'image/png';
  const normalizedQuality = quality / 100;

  // Se for ICO, geramos um PNG primeiro e depois convertemos o binário
  if (format === 'ico') {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const icoBlob = await pngToIco(blob);
          resolve(icoBlob);
        }
      }, 'image/png');
    });
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      mimeType,
      formatOption?.supportsQuality ? normalizedQuality : undefined
    );
  });
}

export async function optimizeToTargetSize(
  canvas: HTMLCanvasElement,
  targetSizeMB: number,
  format: string,
  startQuality: number = 95
): Promise<{ blob: Blob; quality: number }> {
  const targetBytes = targetSizeMB * 1024 * 1024;
  let quality = startQuality;
  let blob = await canvasToBlob(canvas, format, quality);

  // ICO não suporta "qualidade" variável do mesmo jeito, então pulamos a otimização
  if (format === 'ico') {
      return { blob, quality: 100 };
  }

  let minQuality = 10;
  let maxQuality = quality;

  while (maxQuality - minQuality > 5 && blob.size > targetBytes) {
    quality = Math.floor((minQuality + maxQuality) / 2);
    blob = await canvasToBlob(canvas, format, quality);

    if (blob.size > targetBytes) {
      maxQuality = quality;
    } else {
      minQuality = quality;
    }
  }

  if (blob.size > targetBytes && quality > 10) {
    blob = await canvasToBlob(canvas, format, 10);
    quality = 10;
  }

  return { blob, quality };
}

export function generateFilename(
  originalName: string,
  preset: Preset | null,
  width: number,
  height: number,
  format: string,
  mode?: string
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const formatOption = FORMAT_OPTIONS.find(f => f.id === format);
  const extension = formatOption?.extension || '.png';
  
  const modeSuffix = mode ? `_${mode}` : '';
  const sizeSuffix = preset ? `_${preset.id}` : `_${width}x${height}`;
  
  return `${baseName}${modeSuffix}${sizeSuffix}${extension}`;
}

export async function exportSingle(
  imageFile: ImageFile,
  settings: StudioSettings
): Promise<ExportResult> {
  const processedSource = await processImage(imageFile, settings.preprocessing);
  const canvas = await composeCanvas(processedSource, settings.wallpaper, settings.output);

  const { format, quality, targetSizeEnabled, targetSizeMB } = settings.optimization;

  let blob: Blob;
  let finalQuality = quality;

  if (targetSizeEnabled && format !== 'ico') {
    const result = await optimizeToTargetSize(canvas, targetSizeMB, format, quality);
    blob = result.blob;
    finalQuality = result.quality;
  } else {
    blob = await canvasToBlob(canvas, format, quality);
  }

  const preset = getPresetById(settings.output.preset);
  const filename = generateFilename(
    imageFile.name,
    preset,
    canvas.width,
    canvas.height,
    format,
    settings.wallpaper.enabled ? settings.wallpaper.mode : undefined
  );

  return {
    blob,
    filename,
    width: canvas.width,
    height: canvas.height,
    format,
    size: blob.size,
  };
}

export async function exportBatch(
  imageFile: ImageFile,
  settings: StudioSettings,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const presetIds = settings.batch.selectedPresets;
  const total = presetIds.length;

  const processedSource = await processImage(imageFile, settings.preprocessing);

  for (let i = 0; i < presetIds.length; i++) {
    const presetId = presetIds[i];
    const preset = getPresetById(presetId);
    
    if (!preset) continue;

    const batchSettings: StudioSettings = {
      ...settings,
      output: {
        ...settings.output,
        preset: presetId,
        customWidth: preset.width,
        customHeight: preset.height,
      },
    };

    const canvas = await composeCanvas(
      processedSource,
      batchSettings.wallpaper,
      batchSettings.output
    );

    const blob = await canvasToBlob(
      canvas,
      settings.optimization.format,
      settings.optimization.quality
    );

    const filename = generateFilename(
      imageFile.name,
      preset,
      canvas.width,
      canvas.height,
      settings.optimization.format,
      settings.wallpaper.enabled ? settings.wallpaper.mode : undefined
    );

    zip.file(filename, blob);

    onProgress?.(i + 1, total);

    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return zip.generateAsync({ type: 'blob' });
}

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

export function downloadFile(file: File): void {
  downloadBlob(file, file.name);
}