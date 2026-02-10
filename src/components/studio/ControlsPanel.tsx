import { WallpaperControls } from './WallpaperControls';
import { OutputControls } from './OutputControls';
import { OptimizationControls } from './OptimizationControls';
import { BatchControls } from './BatchControls';
import { PreprocessingControls } from './PreprocessingControls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Wand2, Maximize2, Monitor, Settings2, Layers } from 'lucide-react';
import type { StudioSettings, ImageFile } from '@/lib/image/types';

interface ControlsPanelProps {
  settings: StudioSettings;
  image: ImageFile | null;
  onSettingsChange: (settings: StudioSettings) => void;
  onOpenCropper: () => void;
}

const ACCORDION_DEFAULTS = ['layout', 'size'];

export function ControlsPanel({ settings, image, onSettingsChange, onOpenCropper }: ControlsPanelProps) {
  return (
    <ScrollArea className="h-full">
      <Accordion type="multiple" defaultValue={ACCORDION_DEFAULTS} className="pr-2 pb-6 w-full">
        <AccordionItem value="preprocess" className="border-b border-border px-0">
          <AccordionTrigger className="py-3 hover:no-underline text-sm font-medium">
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-muted-foreground" />
              Pré-processamento
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <PreprocessingControls settings={settings} onSettingsChange={onSettingsChange} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="layout" className="border-b border-border px-0">
          <AccordionTrigger className="py-3 hover:no-underline text-sm font-medium">
            <span className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
              Layout
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <WallpaperControls
              settings={settings}
              image={image}
              onSettingsChange={onSettingsChange}
              onOpenCropper={onOpenCropper}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size" className="border-b border-border px-0">
          <AccordionTrigger className="py-3 hover:no-underline text-sm font-medium">
            <span className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              Tamanho de saída
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <OutputControls settings={settings} image={image} onSettingsChange={onSettingsChange} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="optimization" className="border-b border-border px-0">
          <AccordionTrigger className="py-3 hover:no-underline text-sm font-medium">
            <span className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              Otimização
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <OptimizationControls settings={settings} onSettingsChange={onSettingsChange} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="batch" className="border-b border-border px-0">
          <AccordionTrigger className="py-3 hover:no-underline text-sm font-medium">
            <span className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Exportação em lote
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <BatchControls settings={settings} onSettingsChange={onSettingsChange} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ScrollArea>
  );
}