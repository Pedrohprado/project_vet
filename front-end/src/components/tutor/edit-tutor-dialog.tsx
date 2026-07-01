import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { TutorFormFields } from '@/components/tutor/tutor-form-fields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateTutor } from '@/hooks/useTutors';
import {
  emptyTutorFormData,
  formDataToUpdatePayload,
  tutorFormSchema,
  tutorToFormData,
  type TutorFormData,
} from '@/lib/tutor-form';
import type { Tutor } from '@/types/tutor';

type EditTutorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutor: Tutor | null;
};

export function EditTutorDialog({ open, onOpenChange, tutor }: EditTutorDialogProps) {
  const updateTutor = useUpdateTutor();
  const [form, setForm] = useState<TutorFormData>(emptyTutorFormData);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open && tutor) {
      setForm(tutorToFormData(tutor));
      setError(undefined);
    }
  }, [open, tutor]);

  function updateField(field: keyof TutorFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setError(undefined);
      setForm(emptyTutorFormData);
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!tutor) return;

    const parsed = tutorFormSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setError(undefined);

    try {
      await updateTutor.mutateAsync({
        id: tutor.id,
        data: formDataToUpdatePayload(parsed.data),
      });
      toast.success('Tutor atualizado.');
      handleOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar tutor';
      setError(message);
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar tutor</DialogTitle>
          {tutor ? (
            <DialogDescription>Atualize os dados de {tutor.name}.</DialogDescription>
          ) : null}
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-1 py-4">
            <TutorFormFields form={form} onChange={updateField} idPrefix="edit-tutor" />
            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter className="gap-2 border-t pt-4 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updateTutor.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateTutor.isPending}>
              {updateTutor.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
