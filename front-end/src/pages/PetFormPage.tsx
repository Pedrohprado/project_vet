import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { PetFormFields } from '@/components/pet/pet-form-fields';
import {
  emptyPetPhotoSelection,
  type PetPhotoSelection,
} from '@/components/pet/pet-photo-field';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCreatePet, useUploadPetPhoto } from '@/hooks/usePets';
import { useFormFieldErrors } from '@/hooks/useFormFieldErrors';
import {
  emptyPetFormData,
  formDataToPetPayload,
  petFormSchema,
  type PetFormData,
} from '@/lib/pet-form';
import {
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';

export function PetFormPage() {
  const { id: tutorId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const createPet = useCreatePet();
  const uploadPhoto = useUploadPetPhoto();
  const [form, setForm] = useState<PetFormData>(emptyPetFormData);
  const [photo, setPhoto] = useState<PetPhotoSelection>(emptyPetPhotoSelection);
  const { fieldErrors, formError, applyZodError, clearFieldError, clearErrors, setFormError } =
    useFormFieldErrors<keyof PetFormData>();

  const isSaving = createPet.isPending || uploadPhoto.isPending;

  function updateField<K extends keyof PetFormData>(field: K, value: PetFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!tutorId) return;

    const parsed = petFormSchema.safeParse(form);

    if (!parsed.success) {
      applyZodError(parsed.error);
      return;
    }

    clearErrors();

    try {
      const pet = await createPet.mutateAsync({
        tutorId,
        data: formDataToPetPayload(parsed.data),
      });

      if (photo.file) {
        await uploadPhoto.mutateAsync({ id: pet.id, file: photo.file });
      }

      toast.success('Pet cadastrado!');
      void navigate(`/tutors/${tutorId}/pets/${pet.id}`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao cadastrar pet';
      setFormError(message);
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Cadastrar Pet</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do pet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PetFormFields
              form={form}
              onChange={updateField}
              fieldErrors={fieldErrors}
              photo={photo}
              onPhotoChange={setPhoto}
              photoDisabled={isSaving}
            />

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Pet'}
              </Button>
              {tutorId && (
                <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link to={`/tutors/${tutorId}`}>Cancelar</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
