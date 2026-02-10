import type { ImageFile, WallpaperSettings, CropData, OutputSettings, PreprocessingSettings } from './types';
import { ASPECT_RATIOS, getPresetById } from './presets';
import { removeBackground, type Config } from '@imgly/background-removal';

// Cache para evitar recarregar a imagem original (URL -> Elemento)
const originalImageCache = new Map<string, HTMLImageElement>();

// Configuração otimizada para o @imgly
const REMOVE_BG_CONFIG: Config = {
  debug: false,
  proxyToWorker: true,
  model: 'isnet', // Modelo de alta qualidade
};

export async function loadImage(file: File): Promise<ImageFile> {
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
        element: img, // Importante para o Canvas
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * ESTÁGIO 1: Processamento Pesado (IA Local - Remove BG)
 */
export async function processImage(
  imageFile: ImageFile,
  settings: PreprocessingSettings,
  onProgress?: (message: string, progress: number) => void
): Promise<{ original: HTMLImageElement; processed: HTMLImageElement }> {
  
  let originalImg: HTMLImageElement;

  if (originalImageCache.has(imageFile.url)) {
    originalImg = originalImageCache.get(imageFile.url)!;
  } else {
    originalImg = new Image();
    originalImg.crossOrigin = "anonymous";
    originalImg.src = imageFile.url;
    await new Promise((resolve, reject) => {
      originalImg.onload = resolve;
      originalImg.onerror = reject;
    });
    originalImageCache.set(imageFile.url, originalImg);
  }

  if (!settings.removeBackground) {
    onProgress?.("Pronto", 100);
    return { original: originalImg, processed: originalImg };
  }

  try {
    const config: Config = {
      ...REMOVE_BG_CONFIG,
      progress: (key: string, current: number, total: number) => {
        if (!onProgress) return;
        const estimatedTotal = total > 0 ? total : 40_000_000; 
        const percent = Math.min(Math.round((current / estimatedTotal) * 100), 99);

        let message = "Processando...";
        if (key.includes('fetch')) message = `Baixando IA (${percent}%)...`;
        else if (key.includes('compute')) message = `Removendo fundo (${percent}%)...`;
        
        onProgress(message, percent);
      }
    };

    const blob = await removeBackground(imageFile.url, config);
    const noBgUrl = URL.createObjectURL(blob);
    
    const noBgImg = new Image();
    noBgImg.src = noBgUrl;
    await new Promise((resolve, reject) => {
      noBgImg.onload = resolve;
      noBgImg.onerror = reject;
    });

    onProgress?.("Concluído", 100);
    return { original: originalImg, processed: noBgImg };

  } catch (error) {
    console.error("Erro na IA:", error);
    onProgress?.("Erro (usando original)", 100);
    return { original: originalImg, processed: originalImg };
  }
}

/**
 * ESTÁGIO 2: Composição (Rápido - Filtros, Crop, Wallpapers)
 * Retorna Promise quando há imagem IA (blob URL) para aguardar carregamento.
 */
export async function composeCanvas(
  source: { original: HTMLImageElement; processed: HTMLImageElement },
  wallpaperSettings: WallpaperSettings,
  outputSettings: OutputSettings
): Promise<HTMLCanvasElement> {
  const { processed: foregroundImg } = source;

  const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(
    wallpaperSettings,
    outputSettings
  );

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error("Contexto 2D falhou");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // --- LÓGICA DE EXIBIÇÃO DA IA (Cloudflare) ---
  // Se já geramos a imagem na nuvem, mostramos ela (é preciso aguardar o carregamento do blob URL).
  if (wallpaperSettings.mode === 'extend' && wallpaperSettings.extendMode === 'ai' && wallpaperSettings.aiGeneratedImage) {
    await new Promise<void>((resolve, reject) => {
      const aiImg = new Image();
      aiImg.onload = () => {
        ctx.drawImage(aiImg, 0, 0, targetWidth, targetHeight);
        resolve();
      };
      aiImg.onerror = () => reject(new Error('Falha ao carregar imagem gerada pela IA'));
      aiImg.src = wallpaperSettings.aiGeneratedImage!;
    });
    return canvas;
  }

  if (!wallpaperSettings.enabled) {
    drawCenteredImage(ctx, foregroundImg, targetWidth, targetHeight, outputSettings.fitMode);
    return canvas;
  }

  switch (wallpaperSettings.mode) {
    case 'fit': {
      switch (wallpaperSettings.background.type) {
        case 'blur':
          drawBlurredBackground(ctx, foregroundImg, targetWidth, targetHeight, wallpaperSettings.background.blurIntensity);
          break;
        case 'solid':
          drawSolidBackground(ctx, targetWidth, targetHeight, wallpaperSettings.background.solidColor);
          break;
        case 'gradient':
          drawGradientBackground(
            ctx,
            targetWidth,
            targetHeight,
            wallpaperSettings.background.gradientStart,
            wallpaperSettings.background.gradientEnd
          );
          break;
      }
      drawCenteredImage(ctx, foregroundImg, targetWidth, targetHeight, 'contain');
      break;
    }

    case 'crop': {
      if (wallpaperSettings.crop) {
        applyCrop(ctx, foregroundImg, wallpaperSettings.crop, targetWidth, targetHeight);
      } else {
        drawCenteredImage(ctx, foregroundImg, targetWidth, targetHeight, 'cover');
      }
      break;
    }

    case 'extend': {
      if (wallpaperSettings.extendMode === 'mirror') {
        drawMirroredEdges(ctx, foregroundImg, targetWidth, targetHeight);
      } else if (wallpaperSettings.extendMode === 'stretch') {
        drawStretchedEdges(ctx, foregroundImg, targetWidth, targetHeight);
      } else if (wallpaperSettings.extendMode === 'ai') {
        // Modo IA selecionado mas AINDA NÃO gerado:
        // Mostramos um preview cinza com a imagem no centro
        ctx.fillStyle = '#2a2a2a'; // Cinza escuro elegante
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        drawCenteredImage(ctx, foregroundImg, targetWidth, targetHeight, 'contain');
      }
      break;
    }
  }

  return canvas;
}

export async function transformImage(
  imageFile: ImageFile,
  wallpaperSettings: WallpaperSettings,
  outputSettings: OutputSettings,
  preprocessing: PreprocessingSettings
): Promise<HTMLCanvasElement> {
  const processed = await processImage(imageFile, preprocessing);
  return composeCanvas(processed, wallpaperSettings, outputSettings);
}

// --- FUNÇÕES DE IA (Cloudflare) ---

const DEFAULT_AI_PROMPT =
  "seamless horizontal extension of the same scene, natural continuation left and right, no visible seams or borders, single continuous image, consistent art style and lighting, fantasy map, tabletop game map, high quality";

export interface GenerateAIExpansionOptions {
  /** Prompt opcional do usuário para guiar a IA (ex.: "floresta sombria, mesmas árvores"). */
  prompt?: string;
  /** Provedor: cloudflare (padrão) ou fal (melhor qualidade, requer FAL_KEY). */
  provider?: 'cloudflare' | 'fal';
}

/**
 * Função que prepara a imagem e chama a API de extensão (Cloudflare ou fal.ai).
 */
export async function generateAIExpansion(
  originalImage: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  options?: GenerateAIExpansionOptions
): Promise<string> {
  
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Erro de contexto Canvas");

  // --- 1. PREPARAR INPUT IMAGE ---
  // A IA precisa de contexto de cor nas bordas para saber o que desenhar.
  // Usamos 'stretch' para esticar a borda e dar essa dica de cor.
  drawStretchedEdges(ctx, originalImage, targetWidth, targetHeight);
  // Desenhamos a original no centro
  drawCenteredImage(ctx, originalImage, targetWidth, targetHeight, 'contain');
  
  const imgBlob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));

  // --- 2. PREPARAR MÁSCARA (bordas suaves para transição sem costuras) ---
  // Branco = área para a IA preencher; preto = proteger. Bordas suaves = blend melhor.
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = targetWidth;
  maskCanvas.height = targetHeight;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) throw new Error("Erro ao criar contexto da máscara");

  maskCtx.fillStyle = '#FFFFFF';
  maskCtx.fillRect(0, 0, targetWidth, targetHeight);

  const drawW = originalImage.width;
  const drawH = originalImage.height;
  const scale = Math.min(targetWidth / drawW, targetHeight / drawH);
  const scaledW = drawW * scale;
  const scaledH = drawH * scale;
  const x = (targetWidth - scaledW) / 2;
  const y = (targetHeight - scaledH) / 2;

  maskCtx.fillStyle = '#000000';
  const pad = 15; // margem interna para transição suave
  maskCtx.fillRect(x + pad, y + pad, scaledW - pad * 2, scaledH - pad * 2);

  // Aplicar blur na máscara para a IA misturar nas bordas (evita linhas duras)
  const maskBlurCanvas = document.createElement('canvas');
  maskBlurCanvas.width = targetWidth;
  maskBlurCanvas.height = targetHeight;
  const blurCtx = maskBlurCanvas.getContext('2d');
  if (!blurCtx) throw new Error("Erro ao criar contexto blur da máscara");
  blurCtx.filter = 'blur(25px)';
  blurCtx.drawImage(maskCanvas, 0, 0);
  blurCtx.filter = 'none';

  const maskBlob = await new Promise<Blob | null>(r => maskBlurCanvas.toBlob(r, 'image/png'));

  if (!imgBlob || !maskBlob) throw new Error("Erro ao criar arquivos de imagem");

  const finalPrompt = (options?.prompt?.trim() || '').length > 0
    ? options.prompt!.trim()
    : DEFAULT_AI_PROMPT;
  const provider = options?.provider || 'cloudflare';

  const formData = new FormData();
  formData.append('image', imgBlob);
  formData.append('mask', maskBlob);
  formData.append('prompt', finalPrompt);
  formData.append('provider', provider);
  const savedStrength = typeof localStorage !== 'undefined' ? localStorage.getItem('asset-studio-ai-strength') : null;
  formData.append('strength', savedStrength || '0.88');
  formData.append('width', String(targetWidth));
  formData.append('height', String(targetHeight));

  console.log("Enviando requisição para API...", { provider });
  const response = await fetch('/api/outpaint', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error("Erro API:", err);
      throw new Error(`Erro na API: ${err.error || response.statusText}`);
  }

  const newImageBlob = await response.blob();
  if (newImageBlob.size < 1000) {
      throw new Error("A IA retornou uma imagem inválida.");
  }

  return URL.createObjectURL(newImageBlob);
}


// --- FUNÇÕES AUXILIARES DE DESENHO E CÁLCULO ---

export function calculateTargetDimensions(
  settings: WallpaperSettings,
  outputSettings: OutputSettings
): { width: number; height: number } {
  if (!settings.enabled) {
    const preset = getPresetById(outputSettings.preset);
    if (preset) {
      return { width: preset.width, height: preset.height };
    }
    return { width: outputSettings.customWidth, height: outputSettings.customHeight };
  }

  const aspectRatio = ASPECT_RATIOS.find(ar => ar.id === settings.aspectRatio);
  
  if (settings.aspectRatio === 'custom' && settings.customWidth && settings.customHeight) {
    if (settings.orientation === 'vertical' && settings.customWidth > settings.customHeight) {
       return { width: settings.customHeight, height: settings.customWidth };
    }
    return { width: settings.customWidth, height: settings.customHeight };
  }

  const preset = getPresetById(outputSettings.preset);
  const baseWidth = preset?.width || outputSettings.customWidth;
  
  if (aspectRatio?.ratio) {
    let targetRatio = aspectRatio.ratio;
    let width = baseWidth;
    let height = Math.round(baseWidth / targetRatio);

    if (settings.orientation === 'vertical') {
      targetRatio = 1 / targetRatio;
      if (width > height) {
         if (preset) {
             width = preset.height; 
             height = preset.width;
         } else {
             const tempHeight = width;
             height = tempHeight;
             width = Math.round(height * targetRatio);
         }
      }
    } else {
        height = Math.round(width / targetRatio);
    }

    return { width, height };
  }

  return { width: baseWidth, height: Math.round(baseWidth / (16 / 9)) };
}

export function drawBlurredBackground(ctx: CanvasRenderingContext2D, img: HTMLImageElement | ImageBitmap, targetWidth: number, targetHeight: number, blurIntensity: number): void {
  if (blurIntensity === 0) {
     drawCenteredImage(ctx, img, targetWidth, targetHeight, 'cover');
     return;
  }
  const blurPx = Math.round((blurIntensity / 100) * 50);
  ctx.save();
  const imgWidth = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const imgHeight = 'naturalHeight' in img ? img.naturalHeight : img.height;
  const scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight);
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;
  const offsetX = (targetWidth - scaledWidth) / 2;
  const offsetY = (targetHeight - scaledHeight) / 2;
  ctx.filter = `blur(${blurPx}px)`;
  const bleed = blurPx * 2;
  ctx.drawImage(img, offsetX - bleed, offsetY - bleed, scaledWidth + bleed * 2, scaledHeight + bleed * 2);
  ctx.restore();
}

export function drawSolidBackground(ctx: CanvasRenderingContext2D, targetWidth: number, targetHeight: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
}

export function drawGradientBackground(ctx: CanvasRenderingContext2D, targetWidth: number, targetHeight: number, colorStart: string, colorEnd: string): void {
  const gradient = ctx.createLinearGradient(0, 0, targetWidth, 0);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
}

export function drawCenteredImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement | ImageBitmap, targetWidth: number, targetHeight: number, fitMode: 'contain' | 'cover' = 'contain'): void {
  const imgWidth = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const imgHeight = 'naturalHeight' in img ? img.naturalHeight : img.height;
  let scale: number;
  if (fitMode === 'contain') {
    scale = Math.min(targetWidth / imgWidth, targetHeight / imgHeight);
  } else {
    scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight);
  }
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;
  const offsetX = (targetWidth - scaledWidth) / 2;
  const offsetY = (targetHeight - scaledHeight) / 2;
  ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
}

export function applyCrop(ctx: CanvasRenderingContext2D, img: HTMLImageElement | ImageBitmap, cropData: CropData, targetWidth: number, targetHeight: number): void {
  ctx.drawImage(img, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, targetWidth, targetHeight);
}

export function drawMirroredEdges(ctx: CanvasRenderingContext2D, img: HTMLImageElement | ImageBitmap, targetWidth: number, targetHeight: number): void {
  const imgWidth = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const imgHeight = 'naturalHeight' in img ? img.naturalHeight : img.height;
  
  const scale = targetHeight / imgHeight;
  const scaledWidth = imgWidth * scale;
  const offsetX = (targetWidth - scaledWidth) / 2;
  
  if (offsetX > 0) {
    // Left Mirror
    ctx.save();
    ctx.translate(offsetX, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, imgWidth * 0.5, imgHeight, 0, 0, offsetX, targetHeight);
    ctx.restore();
    
    // Right Mirror
    ctx.save();
    ctx.translate(targetWidth, 0); 
    ctx.scale(-1, 1); 
    ctx.drawImage(img, imgWidth * 0.5, 0, imgWidth * 0.5, imgHeight, 0, 0, offsetX, targetHeight);
    ctx.restore();
  }
  
  ctx.drawImage(img, offsetX, 0, scaledWidth, targetHeight);
}

export function drawStretchedEdges(ctx: CanvasRenderingContext2D, img: HTMLImageElement | ImageBitmap, targetWidth: number, targetHeight: number): void {
  const imgWidth = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const imgHeight = 'naturalHeight' in img ? img.naturalHeight : img.height;
  
  // Para garantir que o stretch cubra tudo verticalmente, calculamos o scale vertical
  const scale = targetHeight / imgHeight;
  const scaledWidth = imgWidth * scale;
  const offsetX = (targetWidth - scaledWidth) / 2;
  
  if (offsetX > 0) {
    // Estica 1px da esquerda para preencher o lado esquerdo
    ctx.drawImage(img, 0, 0, 1, imgHeight, 0, 0, offsetX, targetHeight);
    // Estica 1px da direita para preencher o lado direito
    ctx.drawImage(img, imgWidth - 1, 0, 1, imgHeight, targetWidth - offsetX, 0, offsetX, targetHeight);
  }
  
  // Desenha o centro
  ctx.drawImage(img, offsetX, 0, scaledWidth, targetHeight);
}