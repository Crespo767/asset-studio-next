import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileDown, 
  Loader2, 
  CheckCircle2,
  Archive
} from 'lucide-react';
import type { ImageFile, StudioSettings } from '@/lib/image/types';
import { exportSingle, exportBatch, downloadBlob, downloadFile } from '@/lib/image/export';
import { formatFileSize } from '@/lib/image/presets';

interface ExportPanelProps {
  image: ImageFile | null;
  settings: StudioSettings;
}

type ExportState = 'idle' | 'exporting' | 'success' | 'error';

export function ExportPanel({ image, settings }: ExportPanelProps) {
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [progress, setProgress] = useState(0);
  const [lastExport, setLastExport] = useState<{ filename: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!image) return;

    setExportState('exporting');
    setProgress(0);
    setError(null);

    try {
      if (settings.batch.enabled && settings.batch.selectedPresets.length > 0) {
        // Batch export
        const zipBlob = await exportBatch(
          image, 
          settings,
          (current, total) => setProgress((current / total) * 100)
        );

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const filename = `asset-studio-exports-${dateStr}.zip`;
        
        downloadBlob(zipBlob, filename);
        setLastExport({ filename, size: zipBlob.size });
      } else {
        // Single export
        setProgress(50);
        const result = await exportSingle(image, settings);
        setProgress(100);
        
        downloadBlob(result.blob, result.filename);
        setLastExport({ filename: result.filename, size: result.size });
      }

      setExportState('success');
      
      // Reset after a few seconds
      setTimeout(() => {
        setExportState('idle');
      }, 3000);
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Erro ao exportar');
      setExportState('error');
    }
  };

  const handleDownloadOriginal = () => {
    if (image) {
      downloadFile(image.file);
    }
  };

  const isExporting = exportState === 'exporting';
  const isBatchMode = settings.batch.enabled && settings.batch.selectedPresets.length > 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <Button
        data-export-button
        onClick={handleExport}
        disabled={!image || isExporting}
        className="w-full"
        size="lg"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exportando...
          </>
        ) : exportState === 'success' ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Exportado!
          </>
        ) : isBatchMode ? (
          <>
            <Archive className="h-4 w-4 mr-2" />
            Exportar ZIP ({settings.batch.selectedPresets.length} arquivos)
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </>
        )}
      </Button>

      {/* Progress */}
      {isExporting && (
        <div className="space-y-2 animate-fade-in">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Success Info */}
      {exportState === 'success' && lastExport && (
        <div className="p-3 bg-muted/50 rounded-lg animate-fade-in">
          <p className="text-xs text-muted-foreground">Último export:</p>
          <p className="text-sm font-medium truncate" title={lastExport.filename}>
            {lastExport.filename}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(lastExport.size)}
          </p>
        </div>
      )}

      {/* Error */}
      {exportState === 'error' && error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg animate-fade-in">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Button variant="ghost" size="sm" onClick={handleDownloadOriginal} disabled={!image} className="w-full text-muted-foreground">
        <FileDown className="h-3 w-3 mr-2" />
        Baixar original
      </Button>

      {image && !isBatchMode && (
        <p className="text-[10px] text-muted-foreground text-center">
          {settings.optimization.format.toUpperCase()}
          {settings.optimization.format !== 'png' && ` • ${settings.optimization.quality}%`}
        </p>
      )}
    </div>
  );
}
