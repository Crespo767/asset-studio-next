import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  AlertTriangle,
  ImageIcon,
  Loader2
} from 'lucide-react';
import type { ImageFile, StudioSettings } from '@/lib/image/types';
import { processImage, composeCanvas, calculateTargetDimensions } from '@/lib/image/transform';
import { formatDimensions } from '@/lib/image/presets';

interface PreviewPanelProps {
  image: ImageFile | null;
  settings: StudioSettings;
}

export function PreviewPanel({ image, settings }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Estados de Controle de Processamento
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Iniciando...");
  const [processedSource, setProcessedSource] = useState<{ original: HTMLImageElement; processed: HTMLImageElement } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const targetDimensions = settings.wallpaper.enabled 
    ? calculateTargetDimensions(settings.wallpaper, settings.output)
    : { 
        width: settings.output.customWidth, 
        height: settings.output.customHeight 
      };

  const warnings: string[] = [];
  if (targetDimensions.width > 8192 || targetDimensions.height > 8192) {
    warnings.push('Dimensões > 8192px podem causar problemas de compatibilidade.');
  }

  // EFEITO 1: Processamento Pesado (IA) - Executa apenas quando a imagem ou a config de IA mudam
  useEffect(() => {
    if (!image) {
      setProcessedSource(null);
      setPreviewUrl(null);
      return;
    }

    let isMounted = true;

    const runHeavyProcess = async () => {
      setIsProcessing(true);
      setLoadingProgress(0);
      setLoadingMessage("Carregando recursos...");

      try {
        const result = await processImage(
          image, 
          settings.preprocessing, 
          (message, progress) => {
            if (isMounted) {
              setLoadingMessage(message);
              setLoadingProgress(progress);
            }
          }
        );
        
        if (isMounted) {
          setProcessedSource(result);
        }
      } catch (error) {
        console.error("Erro fatal no processamento:", error);
      } finally {
        if (isMounted) setIsProcessing(false);
      }
    };

    runHeavyProcess();

    return () => { isMounted = false; };
  }, [image, settings.preprocessing.removeBackground]); // Dependências: Imagem e Toggle de Fundo

  // EFEITO 2: Composição Leve - Executa em tempo real para sliders e ajustes visuais
  useEffect(() => {
    if (!processedSource) return;

    // Debounce leve (50ms) para garantir fluidez nos sliders
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const canvas = await composeCanvas(processedSource, settings.wallpaper, settings.output);
      const url = canvas.toDataURL('image/png', 0.8);
      setPreviewUrl(url);
    }, 50);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [processedSource, settings.wallpaper, settings.output]); // Dependências: Configurações visuais

  const handleFit = () => setZoom(100);

  if (!image) {
    return (
      <div className="panel h-full flex flex-col">
        <div className="panel-header">Preview</div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">Carregue uma imagem para visualizar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full flex flex-col relative">
      {/* Overlay de Loading com Feedback Visual */}
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 transition-all duration-300">
          <div className="w-full max-w-xs space-y-4 text-center">
            <div className="relative mx-auto w-fit">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {loadingProgress}%
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-lg">{loadingMessage}</h3>
              <p className="text-xs text-muted-foreground">
                O primeiro uso pode demorar enquanto baixamos a IA.
              </p>
            </div>
            <Progress value={loadingProgress} className="h-2 w-full transition-all duration-300" />
          </div>
        </div>
      )}

      <Tabs defaultValue="after" className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <TabsList>
            <TabsTrigger value="before">Antes</TabsTrigger>
            <TabsTrigger value="after">Depois</TabsTrigger>
            <TabsTrigger value="sidebyside">Lado a Lado</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(25, zoom - 25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-24">
              <Slider
                value={[zoom]}
                onValueChange={([z]) => setZoom(z)}
                min={25}
                max={200}
                step={25}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(200, zoom + 25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFit}>
              <Maximize className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-right">{zoom}%</span>
          </div>
        </div>

        {/* ... Restante do código de abas e canvas igual ao anterior ... */}
        {/* Manter as partes de Warnings, Info Bar e TabsContent do código anterior */}
        {/* ... */}
        <div className="flex-1 min-h-0">
          <TabsContent value="before" className="h-full m-0">
            <div className="preview-container h-full overflow-auto flex items-center justify-center p-4">
              <img
                src={image.url}
                alt="Original"
                style={{ maxWidth: `${zoom}%`, maxHeight: `${zoom}%`, objectFit: 'contain' }}
                className="rounded shadow-lg"
              />
            </div>
          </TabsContent>

          <TabsContent value="after" className="h-full m-0">
            <div className="preview-container h-full overflow-auto flex items-center justify-center p-4 relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: `${zoom}%`, maxHeight: `${zoom}%`, objectFit: 'contain' }}
                  className="rounded shadow-lg"
                />
              ) : (
                !isProcessing && <div className="text-muted-foreground text-sm">Aguardando...</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sidebyside" className="h-full m-0">
            <div className="preview-container h-full overflow-auto p-4">
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground mb-2">Original</p>
                  <img
                    src={image.url}
                    alt="Original"
                    style={{ maxWidth: `${zoom * 0.9}%`, maxHeight: `${zoom * 0.9}%`, objectFit: 'contain' }}
                    className="rounded shadow-lg"
                  />
                </div>
                <div className="flex flex-col items-center justify-center relative">
                  <p className="text-xs text-muted-foreground mb-2">Resultado</p>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ maxWidth: `${zoom * 0.9}%`, maxHeight: `${zoom * 0.9}%`, objectFit: 'contain' }}
                      className="rounded shadow-lg"
                    />
                  ) : (
                    !isProcessing && <div className="text-muted-foreground text-sm">Aguardando...</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}