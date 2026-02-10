'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings2, Eye, HelpCircle } from 'lucide-react';
import { Toaster } from 'sonner';

import { Dropzone } from '@/components/uploader/Dropzone';
import { ControlsPanel } from '@/components/studio/ControlsPanel';
import { PreviewPanel } from '@/components/studio/PreviewPanel';
import { ExportPanel } from '@/components/studio/ExportPanel';
import { CropperModal } from '@/components/studio/CropperModal';

import { createDefaultSettings, type ToolSettings, type ImageFile } from '@/lib/image/types';
import { exportImage, downloadBlob } from '@/lib/image/export';
import { formatFileSize } from '@/lib/image/presets';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

export default function StudioPage() {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [settings, setSettings] = useState<ToolSettings>(createDefaultSettings());
  const [cropperOpen, setCropperOpen] = useState(false);
  const isMobile = useIsMobile();

  // Reset function
  const handleImageLoad = useCallback((loadedImage: ImageFile) => {
    setImage(loadedImage);
    setSettings(createDefaultSettings(loadedImage));
  }, []);

  const handleImageUpdate = useCallback((updatedImage: ImageFile) => {
    setImage(updatedImage);
    setSettings(prev => ({
      ...prev,
      resize: {
        ...prev.resize,
        width: updatedImage.width,
        height: updatedImage.height,
      },
      crop: undefined, // Reset crop after BG removal or drastic change
    }));
  }, []);

  const handleClear = useCallback(() => {
    if (image) URL.revokeObjectURL(image.url);
    setImage(null);
    setSettings(createDefaultSettings());
  }, [image]);

  const handleCropComplete = useCallback((cropData: { x: number; y: number; width: number; height: number }) => {
    setSettings(prev => ({
      ...prev,
      crop: cropData,
    }));
  }, []);

  // Ctrl+S export
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        const activeEl = document.activeElement;
        const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
        if (!isInput && image) {
          e.preventDefault();
          try {
            const result = await exportImage(image, settings);
            downloadBlob(result.blob, result.filename);
            toast.success(`Exportado: ${result.filename} (${formatFileSize(result.size)})`);
          } catch {
            toast.error('Erro ao exportar');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, settings]);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
    };
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Toaster richColors position="bottom-right" className="z-50" />

      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur z-20 flex-shrink-0">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="hover:bg-muted">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-sm" />
              </div>
              <span className="font-semibold text-sm">Asset Studio</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 hidden md:block border border-border px-2 py-0.5 rounded">
              v2.0
            </span>
            <div className="w-px h-4 bg-border hidden md:block mx-2" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link href="/help">
                      <HelpCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ajuda</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 container mx-auto p-4 min-h-0 overflow-hidden">
        {isMobile ? (
          <Tabs defaultValue="controls" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="controls" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Controles
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="controls" className="flex-1 overflow-auto space-y-4 data-[state=inactive]:hidden pb-20">
              <Dropzone
                onImageLoad={handleImageLoad}
                currentImage={image}
                onClear={handleClear}
              />
              <div className="h-[500px]">
                <ControlsPanel
                  settings={settings}
                  image={image}
                  onSettingsChange={setSettings}
                  onOpenCropper={() => setCropperOpen(true)}
                  onImageUpdate={handleImageUpdate}
                />
              </div>
              <ExportPanel image={image} settings={settings} />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 data-[state=inactive]:hidden h-full pb-20">
              <PreviewPanel image={image} settings={settings} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-[360px_1fr] gap-6 h-full items-start">
            {/* Left Column (Controls) */}
            <div className="flex flex-col gap-4 h-full overflow-hidden">
              <div className="flex-shrink-0">
                <Dropzone
                  onImageLoad={handleImageLoad}
                  currentImage={image}
                  onClear={handleClear}
                />
              </div>

              <div className="flex-1 min-h-0">
                <ControlsPanel
                  settings={settings}
                  image={image}
                  onSettingsChange={setSettings}
                  onOpenCropper={() => setCropperOpen(true)}
                  onImageUpdate={handleImageUpdate}
                />
              </div>

              <div className="flex-shrink-0 pt-2">
                <ExportPanel image={image} settings={settings} />
              </div>
            </div>

            {/* Right Column (Preview) */}
            <div className="h-full min-h-0">
              <PreviewPanel image={image} settings={settings} />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CropperModal
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        image={image}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}