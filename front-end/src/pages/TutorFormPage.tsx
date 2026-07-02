import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { TutorFormFields } from '@/components/tutor/tutor-form-fields';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateTutor } from '@/hooks/useTutors';
import { useFormFieldErrors } from '@/hooks/useFormFieldErrors';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import {
  emptyTutorFormData,
  formDataToCreatePayload,
  tutorFormSchema,
  type TutorFormData,
} from '@/lib/tutor-form';

export function TutorFormPage() {
  const navigate = useNavigate();
  const createTutor = useCreateTutor();
  const [form, setForm] = useState<TutorFormData>(emptyTutorFormData);
  const { fieldErrors, formError, applyZodError, clearFieldError, clearErrors, setFormError } =
    useFormFieldErrors<keyof TutorFormData>('new-tutor');
  const [createdTutorId, setCreatedTutorId] = useState<string | null>(null);

  function updateField(field: keyof TutorFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  }

  function handleAddPetChoice(addPet: boolean) {
    if (!createdTutorId) return;

    const tutorId = createdTutorId;
    setCreatedTutorId(null);

    if (addPet) {
      void navigate(`/tutors/${tutorId}/pets/new`);
      return;
    }

    void navigate('/tutors');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = tutorFormSchema.safeParse(form);

    if (!parsed.success) {
      applyZodError(parsed.error);
      return;
    }

    clearErrors();

    try {
      const tutor = await createTutor.mutateAsync(
        formDataToCreatePayload(parsed.data),
      );
      toast.success('Tutor cadastrado!');
      setCreatedTutorId(tutor.id);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao cadastrar tutor';
      setFormError(message);
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Novo Tutor</h1>
        <p className={pageDescriptionClassName}>
          Preencha os dados de contato e endereço do tutor.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do tutor</CardTitle>
          <CardDescription>Informações de contato e endereço.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TutorFormFields
              form={form}
              onChange={updateField}
              idPrefix="new-tutor"
              fieldErrors={fieldErrors}
            />

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="w-full sm:w-auto" disabled={createTutor.isPending}>
                {createTutor.isPending ? 'Salvando...' : 'Salvar Tutor'}
              </Button>
              <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/atendimento">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={createdTutorId !== null}
        onOpenChange={(open) => {
          if (!open && createdTutorId) {
            handleAddPetChoice(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar pet?</DialogTitle>
            <DialogDescription>
              Deseja adicionar um pet para este tutor agora?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddPetChoice(false)}
            >
              Agora não
            </Button>
            <Button type="button" onClick={() => handleAddPetChoice(true)}>
              Sim, adicionar pet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
