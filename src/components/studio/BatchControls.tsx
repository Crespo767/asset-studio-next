import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { StudioSettings } from '@/lib/image/types';
import { 
  WALLPAPER_PRESETS, 
  FOUNDRY_PRESETS, 
  type Preset 
} from '@/lib/image/presets';

interface BatchControlsProps {
  settings: StudioSettings;
  onSettingsChange: (settings: StudioSettings) => void;
}

const batchPresets: { label: string; presets: Preset[] }[] = [
  { label: 'Wallpapers', presets: WALLPAPER_PRESETS },
  { label: 'Foundry VTT', presets: FOUNDRY_PRESETS },
];

export function BatchControls({ settings, onSettingsChange }: BatchControlsProps) {
  const { batch } = settings;

  const updateBatch = (updates: Partial<typeof batch>) => {
    onSettingsChange({
      ...settings,
      batch: { ...batch, ...updates },
    });
  };

  const togglePreset = (presetId: string) => {
    const isSelected = batch.selectedPresets.includes(presetId);
    const newSelected = isSelected
      ? batch.selectedPresets.filter(id => id !== presetId)
      : [...batch.selectedPresets, presetId];
    updateBatch({ selectedPresets: newSelected });
  };

  const selectAll = (presets: Preset[]) => {
    const presetIds = presets.map(p => p.id);
    const allSelected = presetIds.every(id => batch.selectedPresets.includes(id));
    
    if (allSelected) {
      updateBatch({ 
        selectedPresets: batch.selectedPresets.filter(id => !presetIds.includes(id)) 
      });
    } else {
      const newSelected = [...new Set([...batch.selectedPresets, ...presetIds])];
      updateBatch({ selectedPresets: newSelected });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="batch-toggle" className="text-sm font-medium cursor-pointer">Vários tamanhos (ZIP)</Label>
        <Switch id="batch-toggle" checked={batch.enabled} onCheckedChange={(enabled) => updateBatch({ enabled })} />
      </div>

      {batch.enabled && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-xs text-muted-foreground">Exporte múltiplas resoluções em um ZIP.</p>

          {batchPresets.map(({ label, presets }) => {
            const allSelected = presets.every(p => batch.selectedPresets.includes(p.id));
            const someSelected = presets.some(p => batch.selectedPresets.includes(p.id));

            return (
              <div key={label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`batch-${label}`}
                    checked={allSelected}
                    onCheckedChange={() => selectAll(presets)}
                    className={someSelected && !allSelected ? 'opacity-50' : ''}
                  />
                  <Label 
                    htmlFor={`batch-${label}`}
                    className="text-xs font-medium cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>

                <div className="grid grid-cols-1 gap-1 pl-6">
                  {presets.map((preset) => (
                    <div key={preset.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`batch-${preset.id}`}
                        checked={batch.selectedPresets.includes(preset.id)}
                        onCheckedChange={() => togglePreset(preset.id)}
                      />
                      <Label 
                        htmlFor={`batch-${preset.id}`}
                        className="text-xs cursor-pointer text-muted-foreground"
                      >
                        {preset.name}
                        <span className="ml-1 opacity-60">
                          ({preset.width}×{preset.height})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {batch.selectedPresets.length === 0 && (
            <p className="text-xs text-destructive">
              Selecione ao menos um preset para o batch export.
            </p>
          )}

          {batch.selectedPresets.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {batch.selectedPresets.length} preset(s) selecionado(s)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
