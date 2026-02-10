import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Crop, Monitor, Smartphone, Sparkles, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import type { StudioSettings, WallpaperMode, BackgroundType, ExtendMode } from '@/lib/image/types';
import { ASPECT_RATIOS } from '@/lib/image/presets';
import { generateAIExpansion, calculateTargetDimensions } from '@/lib/image/transform';

interface WallpaperControlsProps {
  settings: StudioSettings;
  image: any; // Recebe a imagem para processar
  onSettingsChange: (settings: StudioSettings) => void;
  onOpenCropper: () => void;
}

export function WallpaperControls({ settings, image, onSettingsChange, onOpenCropper }: WallpaperControlsProps) {
  const { wallpaper } = settings;
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFeedback, setAIFeedback] = useState<'pending' | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiProvider, setAiProvider] = useState<'cloudflare' | 'fal'>('cloudflare');

  const updateWallpaper = (updates: Partial<typeof wallpaper>) => {
    onSettingsChange({
      ...settings,
      wallpaper: { ...wallpaper, ...updates },
    });
  };

  const updateBackground = (updates: Partial<typeof wallpaper.background>) => {
    onSettingsChange({
      ...settings,
      wallpaper: {
        ...wallpaper,
        background: { ...wallpaper.background, ...updates },
      },
    });
  };

  const handleGenerateAI = async () => {
    if (!image) return;
    setIsGenerating(true);
    setAIFeedback(null);
    try {
      const { width, height } = calculateTargetDimensions(wallpaper, settings.output);
      const url = await generateAIExpansion(image.element, width, height, {
        prompt: customPrompt.trim() || undefined,
        provider: aiProvider,
      });
      updateWallpaper({ aiGeneratedImage: url });
      setAIFeedback('pending');
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Erro ao gerar IA.';
      alert(msg.includes('FAL_KEY') ? 'Para usar fal.ai, configure FAL_KEY no servidor (.env.local).' : msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIFeedback = (good: boolean) => {
    if (good && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('asset-studio-ai-strength', '0.88');
      } catch (_) {}
    }
    setAIFeedback(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="wallpaper-toggle" className="text-sm font-medium cursor-pointer">
          Redimensionar para novo formato
        </Label>
        <Switch
          id="wallpaper-toggle"
          checked={wallpaper.enabled}
          onCheckedChange={(enabled) => updateWallpaper({ enabled })}
        />
      </div>

      {wallpaper.enabled && (
        <div className="space-y-4 animate-fade-in pt-1">
          <Separator className="my-2" />

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Orientação</Label>
            <div className="grid grid-cols-2 gap-1 rounded-md bg-muted/50 p-1">
              <button
                onClick={() => updateWallpaper({ orientation: 'horizontal' })}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${
                  wallpaper.orientation === 'horizontal' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Monitor className="h-3 w-3" />
                Horizontal
              </button>
              <button
                onClick={() => updateWallpaper({ orientation: 'vertical' })}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${
                  wallpaper.orientation === 'vertical' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Smartphone className="h-3 w-3" />
                Vertical
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Proporção</Label>
            <Select
              value={wallpaper.aspectRatio}
              onValueChange={(aspectRatio) => updateWallpaper({ aspectRatio })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ar) => (
                  <SelectItem key={ar.id} value={ar.id}>
                    {wallpaper.orientation === 'vertical' 
                      ? `${ar.name.split(':')[1] || '?'}:${ar.name.split(':')[0] || '?'} (${ar.name.replace(':', '×')})`.replace('Ultrawide', 'Tall')
                      : ar.name
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {wallpaper.aspectRatio === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Largura</Label>
                <Input
                  type="number"
                  value={wallpaper.customWidth || 1920}
                  onChange={(e) => updateWallpaper({ customWidth: parseInt(e.target.value) || 1920 })}
                  min={100}
                  max={8192}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Altura</Label>
                <Input
                  type="number"
                  value={wallpaper.customHeight || 1080}
                  onChange={(e) => updateWallpaper({ customHeight: parseInt(e.target.value) || 1080 })}
                  min={100}
                  max={8192}
                />
              </div>
            </div>
          )}

          <Separator className="my-2" />

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Modo</Label>
            <RadioGroup value={wallpaper.mode} onValueChange={(mode: any) => updateWallpaper({ mode })} className="space-y-1">
              <div className="flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-muted/50">
                <RadioGroupItem value="fit" id="mode-fit" />
                <Label htmlFor="mode-fit" className="flex-1 cursor-pointer text-sm">Fit com fundo</Label>
              </div>
              <div className="flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-muted/50">
                <RadioGroupItem value="crop" id="mode-crop" />
                <Label htmlFor="mode-crop" className="flex-1 cursor-pointer text-sm">Crop</Label>
              </div>
              <div className="flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-muted/50">
                <RadioGroupItem value="extend" id="mode-extend" />
                <Label htmlFor="mode-extend" className="flex-1 cursor-pointer text-sm">Estender bordas</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Mode-specific options */}
          {wallpaper.mode === 'fit' && (
            <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/20">
              <Label className="w-full text-xs text-muted-foreground">Fundo</Label>
              <RadioGroup value={wallpaper.background.type} onValueChange={(type: BackgroundType) => updateBackground({ type })} className="flex gap-3">
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="blur" id="bg-blur" />
                  <Label htmlFor="bg-blur" className="text-xs cursor-pointer">Blur</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="solid" id="bg-solid" />
                  <Label htmlFor="bg-solid" className="text-xs cursor-pointer">Sólido</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="gradient" id="bg-gradient" />
                  <Label htmlFor="bg-gradient" className="text-xs cursor-pointer">Gradiente</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {wallpaper.mode === 'crop' && (
            <Button variant="outline" size="sm" onClick={onOpenCropper} className="w-full">
              <Crop className="h-3 w-3 mr-2" />
              Abrir editor de crop
            </Button>
          )}

          {wallpaper.mode === 'extend' && (
            <div className="space-y-3 p-2 rounded-lg bg-muted/20">
              <Label className="text-xs text-muted-foreground">Extensão</Label>
              <RadioGroup value={wallpaper.extendMode} onValueChange={(extendMode: ExtendMode) => updateWallpaper({ extendMode })} className="flex gap-4">
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="mirror" id="extend-mirror" />
                  <Label htmlFor="extend-mirror" className="text-xs cursor-pointer">Mirror</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="stretch" id="extend-stretch" />
                  <Label htmlFor="extend-stretch" className="text-xs cursor-pointer">Stretch</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="ai" id="extend-ai" />
                  <Label htmlFor="extend-ai" className="text-xs cursor-pointer text-primary font-medium flex items-center gap-1">
                    IA <Sparkles className="h-3 w-3" />
                  </Label>
                </div>
              </RadioGroup>

              {wallpaper.extendMode === 'ai' && (
                <div className="pt-2 space-y-3 animate-fade-in">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Motor</Label>
                    <Select value={aiProvider} onValueChange={(v: 'cloudflare' | 'fal') => setAiProvider(v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cloudflare">Cloudflare (padrão, grátis)</SelectItem>
                        <SelectItem value="fal">fal.ai SDXL (melhor qualidade, requer chave)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Prompt (opcional)</Label>
                    <Textarea
                      placeholder="Ex.: floresta sombria, mesmas árvores e iluminação, cenário de fantasia, sem pessoas"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="min-h-[60px] resize-y text-xs"
                      maxLength={500}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Se vazio, usa descrição padrão. Em inglês costuma dar melhores resultados.
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={handleGenerateAI} 
                          disabled={isGenerating || !image}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar extensão com IA
                      </>
                    )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px]">
                        Cada geração pode variar (a IA usa aleatoriedade). Se não ficar boa, gere novamente ou dê 👍 quando ficar boa para melhorar as próximas.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {aiFeedback === 'pending' && wallpaper.aiGeneratedImage && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Ficou bom?</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAIFeedback(true)}>
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Gostei — próximas gerações usarão essas preferências</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAIFeedback(false)}>
                              <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Não ficou bom — tente gerar novamente</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Foundry: use Horizontal, 16:9 ou 3:2 e preset Foundry. Exporte em WebP.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}