import type { ImageFile, ToolSettings, CropData } from './types';

/**
 * Loads a File into our ImageFile structure.
 */
export function loadImage(file: File): Promise<ImageFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        name: file.name,
        size: file.size,
        element: img,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar a imagem.'));
    };
    img.src = url;
  });
}

/**
 * Apply all transformations (rotation, flip, crop, resize) and return canvas.
 */
export function applyTransformations(
  imageFile: ImageFile,
  settings: ToolSettings
): HTMLCanvasElement {
  const { rotation, flipH, flipV, resize, crop } = settings;
  const img = imageFile.element;

  // Step 1 — Crop (on original image coordinates)
  let srcX = 0, srcY = 0, srcW = img.naturalWidth, srcH = img.naturalHeight;
  if (crop) {
    srcX = Math.round(crop.x);
    srcY = Math.round(crop.y);
    srcW = Math.round(crop.width);
    srcH = Math.round(crop.height);
  }

  // Step 2 — Figure out dimensions after rotation
  const isRotated90 = rotation === 90 || rotation === 270;
  const postRotW = isRotated90 ? srcH : srcW;
  const postRotH = isRotated90 ? srcW : srcH;

  // Step 3 — Final output size (resize)
  const outW = resize.width || postRotW;
  const outH = resize.height || postRotH;

  // Create canvas at output size
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.save();

  // Move origin to center for rotation + flip
  ctx.translate(outW / 2, outH / 2);

  // Apply rotation
  if (rotation) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Apply flips
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  // After rotation, the "draw space" dimensions are the pre-rotation output
  const drawW = isRotated90 ? outH : outW;
  const drawH = isRotated90 ? outW : outH;

  // Draw centered
  ctx.drawImage(
    img,
    srcX, srcY, srcW, srcH,
    -drawW / 2, -drawH / 2, drawW, drawH
  );

  ctx.restore();

  return canvas;
}

/**
 * Quick preview canvas — same pipeline, but capped at a max dimension for performance.
 */
export function createPreviewCanvas(
  imageFile: ImageFile,
  settings: ToolSettings,
  maxDimension: number = 800
): HTMLCanvasElement {
  const { rotation, crop } = settings;
  const img = imageFile.element;

  // Calculate source dimensions
  let srcW = img.naturalWidth, srcH = img.naturalHeight;
  if (crop) {
    srcW = Math.round(crop.width);
    srcH = Math.round(crop.height);
  }

  const isRotated90 = rotation === 90 || rotation === 270;
  const postRotW = isRotated90 ? srcH : srcW;
  const postRotH = isRotated90 ? srcW : srcH;

  // Scale down for preview
  const scale = Math.min(1, maxDimension / Math.max(postRotW, postRotH));
  const previewSettings: ToolSettings = {
    ...settings,
    resize: {
      ...settings.resize,
      width: Math.round(postRotW * scale),
      height: Math.round(postRotH * scale),
    },
  };

  return applyTransformations(imageFile, previewSettings);
}