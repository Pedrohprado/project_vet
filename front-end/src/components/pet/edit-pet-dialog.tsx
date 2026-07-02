import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { PetFormFields } from '@/components/pet/pet-form-fields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdatePet } from '@/hooks/usePets';
import { useFormFieldErrors } from '@/hooks/useFormFieldErrors';
import {
  emptyPetFormData,
  formDataToUpdatePetPayload,
  petFormSchema,
  petToFormData,
  type PetFormData,
} from '@/lib/pet-form';
import type { Pet } from '@/types/pet';

type EditPetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet: Pet | null;
};

export function EditPetDialog({ open, onOpenChange, pet }: EditPetDialogProps) {
  const updatePet = useUpdatePet();
  const [form, setForm] = useState<PetFormData>(emptyPetFormData);
  const { fieldErrors, formError, applyZodError, clearFieldError, clearErrors, setFormError } =
    useFormFieldErrors<keyof PetFormData>('edit-pet');

  useEffect(() => {
    if (open && pet) {
      setForm(petToFormData(pet));
      clearErrors();
    }
  }, [open, pet, clearErrors]);

  function updateField<K extends keyof PetFormData>(field: K, value: PetFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      clearErrors();
      setForm(emptyPetFormData);
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!pet) return;

    const parsed = petFormSchema.safeParse(form);

    if (!parsed.success) {
      applyZodError(parsed.error);
      return;
    }

    clearErrors();

    try {
      await updatePet.mutateAsync({
        id: pet.id,
        data: formDataToUpdatePetPayload(parsed.data),
      });
      toast.success('Pet atualizado.');
      handleOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar pet';
      setFormError(message);
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar pet</DialogTitle>
          {pet ? (
            <DialogDescription>Atualize os dados de {pet.name}.</DialogDescription>
          ) : null}
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-1 py-4">
            <PetFormFields
              form={form}
              onChange={updateField}
              idPrefix="edit-pet"
              fieldErrors={fieldErrors}
            />
            {formError ? <p className="mt-4 text-sm text-destructive">{formError}</p> : null}
          </div>

          <DialogFooter className="gap-2 border-t pt-4 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updatePet.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updatePet.isPending}>
              {updatePet.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
