'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';
import type { ImageFile, ToolSettings } from '@/lib/image/types';
import { createPreviewCanvas } from '@/lib/image/transform';
import { formatFileSize, formatDimensions } from '@/lib/image/presets';

interface PreviewPanelProps {
  image: ImageFile | null;
  settings: ToolSettings;
}

export function PreviewPanel({ image, settings }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [debouncedSettings, setDebouncedSettings] = useState(settings);

  // Debounce settings updates to avoid lag on sliders/inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSettings(settings);
    }, 100); // 100ms delay

    return () => clearTimeout(timer);
  }, [settings]);

  // Compute output dimensions for info bar
  const outputInfo = useMemo(() => {
    if (!image) return null;
    const { rotation, crop, resize } = settings; // Use immediate settings for numbers text
    const isRotated90 = rotation === 90 || rotation === 270;

    let srcW = image.width, srcH = image.height;
    if (crop) {
      srcW = Math.round(crop.width);
      srcH = Math.round(crop.height);
    }
    const postRotW = isRotated90 ? srcH : srcW;
    const postRotH = isRotated90 ? srcW : srcH;
    const outW = resize.width || postRotW;
    const outH = resize.height || postRotH;

    return { width: outW, height: outH };
  }, [image, settings]);

  // Render preview canvas (using debounced settings)
  useEffect(() => {
    if (!image || !canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    // Limit max dimension to avoid huge canvases
    const maxDim = Math.max(container.clientWidth, container.clientHeight, 800) * (window.devicePixelRatio || 1);

    // Run in animation frame to avoid blocking main thread
    let animationFrameId: number;

    const render = () => {
      try {
        const preview = createPreviewCanvas(image, debouncedSettings, maxDim);
        const target = canvasRef.current;
        if (target) {
          target.width = preview.width;
          target.height = preview.height;
          const ctx = target.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, target.width, target.height);
            ctx.drawImage(preview, 0, 0);
          }
        }
      } catch {
        // silently fail
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [image, debouncedSettings]);

  if (!image) {
    return (
      <Card className="flex flex-col items-center justify-center h-full border-border/50 bg-muted/10 shadow-sm border-dashed">
        <div className="flex flex-col items-center gap-4 text-muted-foreground/50">
          <div className="p-4 rounded-full bg-muted/20">
            <ImageIcon className="h-10 w-10" />
          </div>
          <p className="text-sm font-medium">Faça upload de uma imagem para visualizar</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border/50 shadow-sm overflow-hidden">
      {/* Info bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20 flex-shrink-0">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground truncate max-w-[200px]" title={image.name}>
            {image.name}
          </span>
          <span className="w-px h-3 bg-border" />
          <span className="hidden sm:inline">
            Original: {formatDimensions(image.width, image.height)}
          </span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span className="hidden sm:inline">
            {formatFileSize(image.size)}
          </span>
        </div>
        {outputInfo && (
          <div className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
            Saída: {formatDimensions(outputInfo.width, outputInfo.height)}
          </div>
        )}
      </div>

      {/* Canvas preview area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-6 min-h-0 overflow-hidden bg-muted/10 relative"
      >
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain shadow-2xl rounded-md bg-checkerboard z-10"
          style={{
            imageRendering: 'auto',
            // Add a subtle transition for smooth resizing visuals
            transition: 'all 0.1s ease-out'
          }}
        />
      </div>
    </div>
  );
}