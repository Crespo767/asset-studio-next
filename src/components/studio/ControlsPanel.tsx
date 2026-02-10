'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eraser,
  RotateCw,
  RotateCcw,
  FlipHorizontal2,
  FlipVertical2,
  Crop,
  Maximize2,
  FileImage,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import type { ImageFile, ToolSettings } from '@/lib/image/types';
import { FORMAT_OPTIONS, RESOLUTION_PRESETS } from '@/lib/image/presets';
import { cn } from '@/lib/utils';

interface ControlsPanelProps {
  settings: ToolSettings;
  image: ImageFile | null;
  onSettingsChange: (settings: ToolSettings) => void;
  onOpenCropper: () => void;
  onImageUpdate: (image: ImageFile) => void;
}

const ACCORDION_DEFAULTS = ['rotation', 'resize', 'format'];

export function ControlsPanel({
  settings,
  image,
  onSettingsChange,
  onOpenCropper,
  onImageUpdate,
}: ControlsPanelProps) {
  const [removingBg, setRemovingBg] = useState(false);

  const update = (partial: Partial<ToolSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  // ── Remove Background ───────────────────────────────────────────
  const handleRemoveBg = async () => {
    if (!image) return;
    setRemovingBg(true);
    try {
      const formData = new FormData();
      formData.append('image', image.file);

      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao remover fundo');
      }

      const blob = await res.blob();
      const file = new File([blob], image.name.replace(/\.[^.]+$/, '_no-bg.png'), {
        type: 'image/png',
      });

      // Load the new image
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = url;
      });

      // Revoke old URL
      URL.revokeObjectURL(image.url);

      onImageUpdate({
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        name: file.name,
        size: file.size,
        element: img,
      });

      toast.success('Fundo removido com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover fundo');
    } finally {
      setRemovingBg(false);
    }
  };

  // ── Rotation handlers ───────────────────────────────────────────
  const rotateCW = () => update({ rotation: ((settings.rotation + 90) % 360) as ToolSettings['rotation'] });
  const rotateCCW = () => update({ rotation: ((settings.rotation + 270) % 360) as ToolSettings['rotation'] });
  const toggleFlipH = () => update({ flipH: !settings.flipH });
  const toggleFlipV = () => update({ flipV: !settings.flipV });

  // ── Resize handlers ─────────────────────────────────────────────
  const handleResizeWidth = (value: string) => {
    const w = parseInt(value) || 0;
    if (settings.resize.maintainAspect && image) {
      const ratio = image.height / image.width;
      update({ resize: { ...settings.resize, width: w, height: Math.round(w * ratio) } });
    } else {
      update({ resize: { ...settings.resize, width: w } });
    }
  };

  const handleResizeHeight = (value: string) => {
    const h = parseInt(value) || 0;
    if (settings.resize.maintainAspect && image) {
      const ratio = image.width / image.height;
      update({ resize: { ...settings.resize, height: h, width: Math.round(h * ratio) } });
    } else {
      update({ resize: { ...settings.resize, height: h } });
    }
  };

  const handlePresetSelect = (presetId: string) => {
    if (presetId === 'original' && image) {
      update({
        resize: { ...settings.resize, width: image.width, height: image.height },
      });
      return;
    }
    const preset = RESOLUTION_PRESETS.find(p => p.id === presetId);
    if (preset) {
      update({
        resize: { ...settings.resize, width: preset.width, height: preset.height },
      });
    }
  };

  const formatSupportsQuality = FORMAT_OPTIONS.find(f => f.id === settings.format)?.supportsQuality ?? false;

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border/50 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          Ferramentas
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Accordion type="multiple" defaultValue={ACCORDION_DEFAULTS} className="w-full space-y-4">

            {/* ── 1. Remover Fundo ────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                <Eraser className="h-4 w-4 text-muted-foreground" />
                Remover Fundo
              </div>
              <div className="pl-6">
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Remove o fundo via IA (remove.bg).
                </p>
                <Button
                  onClick={handleRemoveBg}
                  disabled={!image || removingBg}
                  className="w-full transition-all"
                  size="sm"
                  variant="secondary"
                >
                  {removingBg ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Eraser className="mr-2 h-3.5 w-3.5" />
                      Remover Fundo
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* ── 2. Rotação e Flip ───────────────────────────────── */}
            <AccordionItem value="rotation" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium text-foreground/90 data-[state=open]:text-primary">
                <span className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4 text-muted-foreground" />
                  Rotação e Flip
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0 pl-1">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={rotateCCW} className="gap-2 h-9">
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span className="text-xs">90° Esq</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={rotateCW} className="gap-2 h-9">
                      <RotateCw className="h-3.5 w-3.5" />
                      <span className="text-xs">90° Dir</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFlipH}
                      className={cn("gap-2 h-9 transition-colors", settings.flipH && "bg-primary/10 border-primary/40 text-primary")}
                    >
                      <FlipHorizontal2 className="h-3.5 w-3.5" />
                      <span className="text-xs">Flip H</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFlipV}
                      className={cn("gap-2 h-9 transition-colors", settings.flipV && "bg-primary/10 border-primary/40 text-primary")}
                    >
                      <FlipVertical2 className="h-3.5 w-3.5" />
                      <span className="text-xs">Flip V</span>
                    </Button>
                  </div>
                  {settings.rotation !== 0 && (
                    <div className="flex justify-center">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Rotação: {settings.rotation}°
                      </span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <div className="h-px bg-border/50" />

            {/* ── 3. Recorte ──────────────────────────────────────── */}
            <AccordionItem value="crop" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium text-foreground/90 data-[state=open]:text-primary">
                <span className="flex items-center gap-2">
                  <Crop className="h-4 w-4 text-muted-foreground" />
                  Recorte
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0 pl-1">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      onClick={onOpenCropper}
                      disabled={!image}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 h-9"
                    >
                      <Crop className="h-3.5 w-3.5" />
                      Abrir Recorte
                    </Button>
                    {settings.crop && (
                      <Button
                        onClick={() => update({ crop: undefined })}
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                  {settings.crop && (
                    <div className="flex justify-center">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {Math.round(settings.crop.width)} × {Math.round(settings.crop.height)}px
                      </span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <div className="h-px bg-border/50" />

            {/* ── 4. Resolução ────────────────────────────────────── */}
            <AccordionItem value="resize" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium text-foreground/90 data-[state=open]:text-primary">
                <span className="flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-muted-foreground" />
                  Resolução
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0 pl-1">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-normal">Preset</Label>
                    <Select onValueChange={handlePresetSelect}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original {image ? `(${image.width}×${image.height})` : ''}</SelectItem>

                        <SelectGroup>
                          <SelectLabel>Padrão</SelectLabel>
                          <SelectItem value="hd">HD (720p) — 1280×720</SelectItem>
                          <SelectItem value="fhd">Full HD (1080p) — 1920×1080</SelectItem>
                          <SelectItem value="qhd">QHD (1440p) — 2560×1440</SelectItem>
                          <SelectItem value="4k">4K (2160p) — 3840×2160</SelectItem>
                        </SelectGroup>

                        <SelectGroup>
                          <SelectLabel>Redes Sociais</SelectLabel>
                          <SelectItem value="instagram">Instagram — 1080×1080</SelectItem>
                          <SelectItem value="twitter">Twitter Header — 1500×500</SelectItem>
                          <SelectItem value="youtube">YouTube Thumb — 1280×720</SelectItem>
                        </SelectGroup>

                        <SelectGroup>
                          <SelectLabel>Foundry VTT (100px/grid)</SelectLabel>
                          <SelectItem value="foundry-20x20">20×20 grid — 2000×2000</SelectItem>
                          <SelectItem value="foundry-30x30">30×30 grid — 3000×3000</SelectItem>
                          <SelectItem value="foundry-40x40">40×40 grid — 4000×4000</SelectItem>
                          <SelectItem value="foundry-32x18">32×18 grid (16:9) — 3200×1800</SelectItem>
                          <SelectItem value="foundry-64x32">64×32 grid (16:9) — 6400×3200</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="resize-w" className="text-xs text-muted-foreground font-normal">Largura</Label>
                      <Input
                        id="resize-w"
                        type="number"
                        min={1}
                        value={settings.resize.width}
                        onChange={(e) => handleResizeWidth(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="resize-h" className="text-xs text-muted-foreground font-normal">Altura</Label>
                      <Input
                        id="resize-h"
                        type="number"
                        min={1}
                        value={settings.resize.height}
                        onChange={(e) => handleResizeHeight(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Label htmlFor="maintain-aspect" className="text-xs text-muted-foreground cursor-pointer font-normal">
                      Manter proporção
                    </Label>
                    <Switch
                      id="maintain-aspect"
                      checked={settings.resize.maintainAspect}
                      onCheckedChange={(checked) =>
                        update({ resize: { ...settings.resize, maintainAspect: checked } })
                      }
                      className="scale-90"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <div className="h-px bg-border/50" />

            {/* ── 5. Formato ──────────────────────────────────────── */}
            <AccordionItem value="format" className="border-none">
              <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium text-foreground/90 data-[state=open]:text-primary">
                <span className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                  Formato
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0 pl-1">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Select
                      value={settings.format}
                      onValueChange={(value) => update({ format: value as ToolSettings['format'] })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMAT_OPTIONS.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.name} ({f.extension})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formatSupportsQuality && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground font-normal">Qualidade</Label>
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {settings.quality}%
                        </span>
                      </div>
                      <Slider
                        value={[settings.quality]}
                        onValueChange={([v]) => update({ quality: v })}
                        min={1}
                        max={100}
                        step={1}
                        className="py-1"
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}