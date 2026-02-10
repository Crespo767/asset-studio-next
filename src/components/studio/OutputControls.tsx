import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Lock, Unlock } from 'lucide-react';
import type { StudioSettings, ImageFile } from '@/lib/image/types';
import { 
  WALLPAPER_PRESETS, 
  FOUNDRY_PRESETS, 
  SOCIAL_PRESETS,
  getPresetById
} from '@/lib/image/presets';

interface OutputControlsProps {
  settings: StudioSettings;
  image: ImageFile | null; // Novo: Recebe a imagem para cálculos
  onSettingsChange: (settings: StudioSettings) => void;
}

export function OutputControls({ settings, image, onSettingsChange }: OutputControlsProps) {
  const { output, wallpaper } = settings;

  // Estado local para evitar loops infinitos de arredondamento
  const [localWidth, setLocalWidth] = useState(output.customWidth.toString());
  const [localHeight, setLocalHeight] = useState(output.customHeight.toString());

  // Sincroniza estado local quando settings mudam externamente (ex: troca de preset)
  useEffect(() => {
    setLocalWidth(output.customWidth.toString());
    setLocalHeight(output.customHeight.toString());
  }, [output.customWidth, output.customHeight]);

  const updateOutput = (updates: Partial<typeof output>) => {
    onSettingsChange({
      ...settings,
      output: { ...output, ...updates },
    });
  };

  // Lógica de Manter Proporção
  const handleDimensionChange = (
    dimension: 'width' | 'height', 
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    
    // Atualiza visual imediatamente
    if (dimension === 'width') setLocalWidth(value);
    else setLocalHeight(value);

    if (numValue <= 0) return;

    let newWidth = dimension === 'width' ? numValue : output.customWidth;
    let newHeight = dimension === 'height' ? numValue : output.customHeight;

    // Se "Manter Proporção" estiver ativo
    if (output.maintainAspect) {
      let ratio = 1;
      
      // Se Wallpaper Mode estiver ativo, ele dita o ratio, então não mexemos aqui
      // Se estiver desligado, usamos o ratio da imagem original
      if (!wallpaper.enabled && image) {
        ratio = image.width / image.height;
        if (dimension === 'width') {
          newHeight = Math.round(numValue / ratio);
          setLocalHeight(newHeight.toString());
        } else {
          newWidth = Math.round(numValue * ratio);
          setLocalWidth(newWidth.toString());
        }
      }
    }

    updateOutput({
      preset: 'custom', // Força custom ao digitar
      customWidth: newWidth,
      customHeight: newHeight
    });
  };

  const handlePresetChange = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (preset) {
      onSettingsChange({
        ...settings,
        output: { ...output, preset: presetId, customWidth: preset.width, customHeight: preset.height },
        ...(preset.category === 'foundry' && wallpaper.enabled
          ? { wallpaper: { ...wallpaper, orientation: 'horizontal' } }
          : {}),
      });
    } else {
      updateOutput({ preset: 'custom' });
    }
  };

  const isCustomPreset = output.preset === 'custom';
  const isWallpaperActive = wallpaper.enabled;

  return (
    <div className="space-y-4">
      {isWallpaperActive && (
        <p className="text-[10px] text-muted-foreground">O tamanho segue o layout acima.</p>
      )}

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Preset</Label>
        <Select
          value={output.preset}
          onValueChange={handlePresetChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Wallpapers</SelectLabel>
              {WALLPAPER_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name} <span className="text-muted-foreground text-xs ml-1">({preset.width}×{preset.height})</span>
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Foundry VTT</SelectLabel>
              {FOUNDRY_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name} <span className="text-muted-foreground text-xs ml-1">({preset.width}×{preset.height})</span>
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Social Media</SelectLabel>
              {SOCIAL_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name} <span className="text-muted-foreground text-xs ml-1">({preset.width}×{preset.height})</span>
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Personalizado</SelectLabel>
              <SelectItem value="custom">Manual (Custom)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Dimensions */}
      <div className={`grid grid-cols-[1fr_auto_1fr] gap-2 items-end animate-fade-in ${!isCustomPreset ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Largura (W)</Label>
          <div className="relative">
            <Input
              type="number"
              value={localWidth}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              min={1}
              max={16384}
              className="pr-6"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">px</span>
          </div>
        </div>

        <div className="pb-2 text-muted-foreground">
          {output.maintainAspect && !isWallpaperActive ? (
            <Lock className="h-4 w-4" />
          ) : (
            <span className="text-xs">×</span>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Altura (H)</Label>
          <div className="relative">
            <Input
              type="number"
              value={localHeight}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              min={1}
              max={16384}
              className="pr-6"
              // Se manter proporção estiver ativo E tivermos a imagem, desabilita altura para forçar uso da largura
              disabled={output.maintainAspect && !isWallpaperActive && !!image}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">px</span>
          </div>
        </div>
      </div>

      {isWallpaperActive && isCustomPreset && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Altura ajustada pela proporção do layout.
        </p>
      )}

      <Separator className="my-3" />

      {!isWallpaperActive && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="maintain-aspect" className="text-sm cursor-pointer flex items-center gap-2">
              {output.maintainAspect ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              Manter proporção
            </Label>
            <Switch
              id="maintain-aspect"
              checked={output.maintainAspect}
              onCheckedChange={(maintainAspect) => updateOutput({ maintainAspect })}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ajuste</Label>
            <RadioGroup value={output.fitMode} onValueChange={(fitMode: 'contain' | 'cover') => updateOutput({ fitMode })} className="flex gap-4">
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="contain" id="fit-contain" />
                <Label htmlFor="fit-contain" className="text-xs cursor-pointer">Contain</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="cover" id="fit-cover" />
                <Label htmlFor="fit-cover" className="text-xs cursor-pointer">Cover</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}
    </div>
  );
}