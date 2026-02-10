import React, { useCallback, useState } from 'react';
import { Upload, ImageIcon, X, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ImageFile } from '@/lib/image/types';
import { loadImage } from '@/lib/image/transform';
import { formatFileSize, formatDimensions } from '@/lib/image/presets';

interface DropzoneProps {
  onImageLoad: (image: ImageFile) => void;
  currentImage: ImageFile | null;
  onClear: () => void;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function Dropzone({ onImageLoad, currentImage, onClear }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato não suportado. Use PNG, JPG ou WebP.');
      return;
    }

    setIsLoading(true);
    try {
      const imageFile = await loadImage(file);
      onImageLoad(imageFile);
    } catch (err) {
      setError('Erro ao carregar imagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [onImageLoad]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input
    e.target.value = '';
  }, [handleFile]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleFile(file);
          break;
        }
      }
    }
  }, [handleFile]);

  // Global paste handler
  React.useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handleFile]);

  if (currentImage) {
    return (
      <div className="panel animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            <img 
              src={currentImage.url} 
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" title={currentImage.name}>
              {currentImage.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDimensions(currentImage.width, currentImage.height)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(currentImage.size)}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClear}
            aria-label="Remover imagem"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'dropzone cursor-pointer transition-all',
        isDragActive && 'dropzone-active',
        isLoading && 'opacity-50 pointer-events-none'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      tabIndex={0}
      role="button"
      aria-label="Área de upload de imagem"
    >
      <input
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileInput}
        className="hidden"
        id="file-input"
      />
      
      <label htmlFor="file-input" className="cursor-pointer">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : isDragActive ? (
              <Upload className="h-6 w-6 text-primary" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para carregar'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG ou WebP
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clipboard className="h-3 w-3" />
            <span>Ou cole com Ctrl+V</span>
          </div>
        </div>
      </label>

      {error && (
        <p className="text-sm text-destructive mt-4 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
