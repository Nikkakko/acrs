import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  /** Current image URL or path (for existing/uploaded photos) */
  value?: string;
  /** Newly selected file (not yet uploaded) */
  file?: File | null;
  /** Resolves stored path to full URL for display */
  resolveUrl?: (path: string) => string;
  /** Called when user selects a file */
  onFileSelect: (file: File | null) => void;
  /** Called when user clears the image */
  onClear: () => void;
  /** Accept attribute for file input */
  accept?: string;
  /** Max file size in bytes (default 5MB) */
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUpload({
  value,
  file,
  resolveUrl = (p) => p,
  onFileSelect,
  onClear,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  className
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blobUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );
  useEffect(
    () => () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    },
    [blobUrl]
  );

  const previewSrc = blobUrl ?? (value ? resolveUrl(value) : null);

  const validateFile = useCallback(
    (f: File): string | null => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(f.type)) {
        return 'Invalid file type. Please use JPEG, PNG, WebP or GIF.';
      }
      if (f.size > maxSize) {
        return `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`;
      }
      return null;
    },
    [maxSize]
  );

  const handleFile = useCallback(
    (f: File | null) => {
      setError(null);
      if (f) {
        const err = validateFile(f);
        if (err) {
          setError(err);
          return;
        }
      }
      onFileSelect(f);
    },
    [onFileSelect, validateFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      handleFile(f ?? null);
      e.target.value = '';
    },
    [handleFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const f = e.dataTransfer.files?.[0];
      if (f?.type.startsWith('image/')) handleFile(f);
    },
    [disabled, handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setError(null);
      onClear();
      if (inputRef.current) inputRef.current.value = '';
    },
    [onClear]
  );

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
        disabled={disabled}
        aria-hidden
      />

      {previewSrc ? (
        <div className="relative inline-block group">
          <div
            className={cn(
              'relative h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-muted ring-offset-background transition-shadow',
              !disabled && 'cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2'
            )}
            onClick={handleClick}
          >
            <img
              src={previewSrc}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  title="Change photo"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleClear}
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed transition-colors',
            isDragging && 'border-primary bg-primary/5',
            !isDragging && 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Upload image"
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Drop or click</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
