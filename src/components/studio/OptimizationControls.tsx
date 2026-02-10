import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import type { StudioSettings } from '@/lib/image/types';
import { FORMAT_OPTIONS, type FormatId } from '@/lib/image/presets';

interface OptimizationControlsProps {
  settings: StudioSettings;
  onSettingsChange: (settings: StudioSettings) => void;
}

export function OptimizationControls({ settings, onSettingsChange }: OptimizationControlsProps) {
  const { optimization } = settings;

  const updateOptimization = (updates: Partial<typeof optimization>) => {
    onSettingsChange({
      ...settings,
      optimization: { ...optimization, ...updates },
    });
  };

  const selectedFormat = FORMAT_OPTIONS.find(f => f.id === optimization.format);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Formato</Label>
        <RadioGroup value={optimization.format} onValueChange={(format: FormatId) => updateOptimization({ format })} className="flex flex-wrap gap-3">
          {FORMAT_OPTIONS.map((format) => (
            <div key={format.id} className="flex items-center space-x-2">
              <RadioGroupItem value={format.id} id={`format-${format.id}`} />
              <Label 
                htmlFor={`format-${format.id}`} 
                className="text-sm cursor-pointer"
              >
                {format.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {selectedFormat?.supportsQuality && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Qualidade</Label>
            <span className="text-xs text-muted-foreground">{optimization.quality}%</span>
          </div>
          <Slider value={[optimization.quality]} onValueChange={([quality]) => updateOptimization({ quality })} min={10} max={100} step={5} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="target-size-toggle" className="text-xs text-muted-foreground">Meta de tamanho</Label>
        <Switch id="target-size-toggle" checked={optimization.targetSizeEnabled} onCheckedChange={(targetSizeEnabled) => updateOptimization({ targetSizeEnabled })} />
      </div>
      {optimization.targetSizeEnabled && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={optimization.targetSizeMB}
            onChange={(e) => updateOptimization({ targetSizeMB: parseFloat(e.target.value) || 5 })}
            min={0.1}
            max={50}
            step={0.5}
            className="w-16 h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">MB</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <Label htmlFor="remove-metadata" className="text-xs text-muted-foreground">Remover EXIF</Label>
        <Switch id="remove-metadata" checked={optimization.removeMetadata} onCheckedChange={(removeMetadata) => updateOptimization({ removeMetadata })} />
      </div>
    </div>
  );
}
