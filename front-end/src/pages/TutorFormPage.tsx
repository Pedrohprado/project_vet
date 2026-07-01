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
import { useCreateTutor } from '@/hooks/useTutors';
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
  const [error, setError] = useState<string>();

  function updateField(field: keyof TutorFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = tutorFormSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setError(undefined);

    try {
      const tutor = await createTutor.mutateAsync(
        formDataToCreatePayload(parsed.data),
      );
      toast.success('Tutor cadastrado!');
      void navigate(`/tutors/${tutor.id}/pets/new`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao cadastrar tutor';
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Novo Tutor</h1>
        <p className={pageDescriptionClassName}>
          Após salvar, você será direcionado para cadastrar o pet.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do tutor</CardTitle>
          <CardDescription>Informações de contato e endereço.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TutorFormFields form={form} onChange={updateField} idPrefix="new-tutor" />

            {error && <p className="text-sm text-destructive">{error}</p>}

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
    </div>
  );
}
