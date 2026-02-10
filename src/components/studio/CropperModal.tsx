'use client';

import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
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
import { Check, X } from 'lucide-react';
import type { ImageFile, CropData } from '@/lib/image/types';

interface CropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageFile | null;
  onCropComplete: (cropData: CropData) => void;
}

export function CropperModal({ open, onOpenChange, image, onCropComplete }: CropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropChange = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleConfirm = () => {
    if (croppedArea) {
      onCropComplete({
        x: croppedArea.x,
        y: croppedArea.y,
        width: croppedArea.width,
        height: croppedArea.height,
      });
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[90vw] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="text-base">Recortar Imagem</DialogTitle>
        </DialogHeader>

        {/* Crop area */}
        <div className="relative flex-1 min-h-0 bg-black/90">
          <Cropper
            image={image.url}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropChange}
            showGrid
            style={{
              containerStyle: {
                position: 'absolute',
                inset: 0,
              },
            }}
          />
        </div>

        {/* Zoom control + Actions */}
        <DialogFooter className="px-6 py-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-4 w-full">
            {/* Zoom slider */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Zoom</Label>
              <Slider
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                min={1}
                max={3}
                step={0.05}
                className="flex-1"
              />
              <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleConfirm}>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Aplicar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
