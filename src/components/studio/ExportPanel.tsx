'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ImageFile, ToolSettings } from '@/lib/image/types';
import { exportImage, downloadBlob } from '@/lib/image/export';
import { formatFileSize } from '@/lib/image/presets';

interface ExportPanelProps {
  image: ImageFile | null;
  settings: ToolSettings;
}

export function ExportPanel({ image, settings }: ExportPanelProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!image) return;
    setExporting(true);
    try {
      const result = await exportImage(image, settings);
      downloadBlob(result.blob, result.filename);
      toast.success(`Exportado: ${result.filename} (${formatFileSize(result.size)})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao exportar');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex-shrink-0">
      <Button
        onClick={handleExport}
        disabled={!image || exporting}
        className="w-full h-10 shadow-lg shadow-primary/20 font-medium"
        data-export-button
      >
        {exporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exportando…
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Exportar Imagem
          </>
        )}
      </Button>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Ctrl+S para exportar rapidamente
      </p>
    </div>
  );
}
