import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ZoomIn, RotateCcw } from 'lucide-react';
import type { ImageFile, CropData } from '@/lib/image/types';

interface CropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageFile | null;
  aspectRatio: number;
  onCropComplete: (cropData: CropData) => void;
}

export function CropperModal({ 
  open, 
  onOpenChange, 
  image, 
  aspectRatio,
  onCropComplete 
}: CropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleApply = () => {
    if (croppedAreaPixels) {
      onCropComplete({
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      });
      onOpenChange(false);
    }
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Recortar Imagem</DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-muted rounded-lg overflow-hidden min-h-0">
          <Cropper
            image={image.url}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={handleCropComplete}
            showGrid
            classes={{
              containerClassName: 'rounded-lg',
            }}
          />
        </div>

        {/* Zoom Control */}
        <div className="flex items-center gap-4 py-2">
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <Slider
              value={[zoom]}
              onValueChange={([z]) => setZoom(z)}
              min={1}
              max={3}
              step={0.1}
            />
          </div>
          <span className="text-sm text-muted-foreground w-12">
            {zoom.toFixed(1)}x
          </span>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleApply}>
            Aplicar Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
