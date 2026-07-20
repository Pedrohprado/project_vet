import { useEffect, useId, useMemo, useRef } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { PetPhotoSelection } from '@/lib/pet-photo';
import { getSafeMediaUrl } from '@/lib/safe-url';
import { cn } from '@/lib/utils';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;

type PetPhotoFieldProps = {
  petName?: string;
  currentPhotoUrl?: string | null;
  value: PetPhotoSelection;
  onChange: (value: PetPhotoSelection) => void;
  idPrefix?: string;
  disabled?: boolean;
  className?: string;
};

export function PetPhotoField({
  petName = 'Pet',
  currentPhotoUrl = null,
  value,
  onChange,
  idPrefix = '',
  disabled = false,
  className,
}: PetPhotoFieldProps) {
  const generatedId = useId();
  const inputId = `${idPrefix || generatedId}-photo`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filePreviewUrl = useMemo(
    () => (value.file ? URL.createObjectURL(value.file) : null),
    [value.file],
  );

  useEffect(() => {
    if (!filePreviewUrl) return;
    return () => {
      URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const displayUrl =
    getSafeMediaUrl(filePreviewUrl) ??
    (value.removeExisting ? null : getSafeMediaUrl(currentPhotoUrl) ?? null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error('Apenas imagens JPEG, PNG ou WebP são permitidas');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error('A imagem excede o tamanho máximo de 5 MB');
      event.target.value = '';
      return;
    }

    onChange({ file, removeExisting: false });
    event.target.value = '';
  }

  function handleRemove() {
    onChange({ file: null, removeExisting: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const hasPhoto = Boolean(displayUrl);

  return (
    <div className={cn('space-y-3', className)}>
      <Label htmlFor={inputId}>Foto do pet</Label>
      <div className="flex flex-col gap-4">
        <Avatar className="size-20 shrink-0 rounded-full border border-border sm:size-24">
          {displayUrl ? (
            <AvatarImage src={displayUrl} alt={petName} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary">
            <Camera className="size-8" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled}
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="size-4" />
            {hasPhoto ? 'Trocar foto' : 'Adicionar foto'}
          </Button>
          {hasPhoto ? (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={handleRemove}
            >
              <Trash2 className="size-4" />
              Remover
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
