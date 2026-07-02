import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPetWeight } from '@/lib/pet-format';

const weightSchema = z.object({
  weightKg: z
    .string()
    .min(1, 'Informe o peso')
    .refine((value) => Number(value) > 0, 'Peso deve ser positivo'),
});

type PetWeightDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petName?: string;
  previousWeightKg?: string | null;
  initialWeightKg?: string | null;
  onConfirm: (weightKg: number) => void;
};

export function PetWeightDialog({
  open,
  onOpenChange,
  petName,
  previousWeightKg,
  initialWeightKg,
  onConfirm,
}: PetWeightDialogProps) {
  const [weightKg, setWeightKg] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setWeightKg(initialWeightKg ?? '');
      setFieldError(null);
    }
  }, [open, initialWeightKg]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFieldError(null);
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = weightSchema.safeParse({ weightKg });

    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Peso inválido');
      return;
    }

    setFieldError(null);
    onConfirm(Number(parsed.data.weightKg));
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar peso</DialogTitle>
          {petName ? (
            <DialogDescription>
              Informe o novo peso de {petName}.
              {previousWeightKg ? (
                <>
                  {' '}
                  Peso anterior: {formatPetWeight(previousWeightKg)}.
                </>
              ) : null}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pet-weight-kg">Peso (kg)</Label>
            <Input
              id="pet-weight-kg"
              type="number"
              step="0.01"
              value={weightKg}
              aria-invalid={Boolean(fieldError)}
              onChange={(e) => {
                setWeightKg(e.target.value);
                setFieldError(null);
              }}
            />
            {fieldError ? (
              <p className="text-sm text-destructive">{fieldError}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
