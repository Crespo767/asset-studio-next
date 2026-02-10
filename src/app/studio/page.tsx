'use client'; // Importante: define que essa página roda no navegador (tem state)

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'; 
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Settings2, 
  Eye,
  HelpCircle
} from 'lucide-react';

// Importando os componentes que você já moveu para a pasta correta
import { Dropzone } from '@/components/uploader/Dropzone';
import { ControlsPanel } from '@/components/studio/ControlsPanel';
import { PreviewPanel } from '@/components/studio/PreviewPanel';
import { ExportPanel } from '@/components/studio/ExportPanel';
import { CropperModal } from '@/components/studio/CropperModal';

import { DEFAULT_SETTINGS, type StudioSettings, type ImageFile } from '@/lib/image/types';
import { ASPECT_RATIOS } from '@/lib/image/presets';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';

export default function StudioPage() {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);
  const [cropperOpen, setCropperOpen] = useState(false);
  const isMobile = useIsMobile();

  // Lógica para definir o Aspect Ratio do Cropper
  const aspectRatio = (() => {
    const ar = ASPECT_RATIOS.find(a => a.id === settings.wallpaper.aspectRatio);
    if (ar?.ratio) return ar.ratio;
    if (settings.wallpaper.customWidth && settings.wallpaper.customHeight) {
      return settings.wallpaper.customWidth / settings.wallpaper.customHeight;
    }
    return 16 / 9;
  })();

  // Atalho de teclado: Ctrl+S para exportar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        const activeElement = document.activeElement;
        const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        
        if (!isInput && image) {
          e.preventDefault();
          const exportBtn = document.querySelector<HTMLButtonElement>('[data-export-button]');
          if (exportBtn) exportBtn.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image]);

  const handleImageLoad = useCallback((loadedImage: ImageFile) => {
    setImage(loadedImage);
  }, []);

  const handleClear = useCallback(() => {
    if (image) {
      URL.revokeObjectURL(image.url);
    }
    setImage(null);
  }, [image]);

  const handleCropComplete = useCallback((cropData: { x: number; y: number; width: number; height: number }) => {
    setSettings(prev => ({
      ...prev,
      wallpaper: {
        ...prev.wallpaper,
        crop: cropData,
      },
    }));
  }, []);

  // Limpeza de memória ao sair da página
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image.url);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Cabeçalho */}
      <header className="border-b border-border flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-md">
                <img 
                  src="/asset_studio.png" 
                  alt="Logo Asset Studio" 
                  className="w-full h-full object-contain scale-[2.5]" 
                />
              </div>
              <span className="font-semibold text-lg hidden sm:inline">Asset Studio</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon">
                    <Link href="/help">
                      <HelpCircle className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ajuda</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <span className="text-xs text-muted-foreground hidden md:inline">
              Ctrl+S para exportar
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto px-4 py-4 min-h-0">
        {isMobile ? (
          // Layout Mobile: Abas
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

            <TabsContent value="controls" className="flex-1 overflow-auto m-0 space-y-4">
              <Dropzone 
                onImageLoad={handleImageLoad}
                currentImage={image}
                onClear={handleClear}
              />
              <ControlsPanel 
                settings={settings}
                image={image}
                onSettingsChange={setSettings}
                onOpenCropper={() => setCropperOpen(true)}
              />
              <ExportPanel image={image} settings={settings} />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0">
              <PreviewPanel image={image} settings={settings} />
            </TabsContent>
          </Tabs>
        ) : (
          // Layout Desktop: Duas Colunas
          <div className="grid grid-cols-[380px_1fr] gap-6 h-[calc(100vh-5rem)]">
            {/* Coluna Esquerda: Controles */}
            <div className="flex flex-col gap-4 overflow-hidden">
              <Dropzone 
                onImageLoad={handleImageLoad}
                currentImage={image}
                onClear={handleClear}
              />
              <div className="flex-1 min-h-0 overflow-hidden">
                <ControlsPanel 
                  settings={settings}
                  image={image} 
                  onSettingsChange={setSettings}
                  onOpenCropper={() => setCropperOpen(true)}
                />
              </div>
              <ExportPanel image={image} settings={settings} />
            </div>

            {/* Coluna Direita: Preview */}
            <PreviewPanel image={image} settings={settings} />
          </div>
        )}
      </main>

      {/* Modal de Crop */}
      <CropperModal
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        image={image}
        aspectRatio={aspectRatio}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}