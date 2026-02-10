import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { StudioSettings } from '@/lib/image/types';

interface PreprocessingControlsProps {
  settings: StudioSettings;
  onSettingsChange: (settings: StudioSettings) => void;
}

export function PreprocessingControls({ settings, onSettingsChange }: PreprocessingControlsProps) {
  const { preprocessing } = settings;

  const updatePreprocessing = (updates: Partial<typeof preprocessing>) => {
    onSettingsChange({
      ...settings,
      preprocessing: { ...preprocessing, ...updates },
    });
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
      <div>
        <Label htmlFor="remove-bg" className="text-sm font-medium cursor-pointer">
          Remover fundo com IA
        </Label>
        <p className="text-[10px] text-muted-foreground">Processamento local</p>
      </div>
      <Switch
        id="remove-bg"
        checked={preprocessing.removeBackground}
        onCheckedChange={(checked) => updatePreprocessing({ removeBackground: checked })}
      />
    </div>
  );
}