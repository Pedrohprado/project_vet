import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const tutorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof tutorSchema>;

const initialData: FormData = {
  name: '',
  document: '',
  mobile: '',
  email: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  notes: '',
};

export function TutorFormPage() {
  const navigate = useNavigate();
  const createTutor = useCreateTutor();
  const [form, setForm] = useState<FormData>(initialData);
  const [error, setError] = useState<string>();

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = tutorSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setError(undefined);

    try {
      const { mobile, ...rest } = parsed.data;
      const celular = mobile || undefined;

      const tutor = await createTutor.mutateAsync({
        ...rest,
        phone: celular,
        whatsapp: celular,
      });
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
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">CPF</Label>
                <Input
                  id="document"
                  value={form.document}
                  onChange={(e) => updateField('document', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Celular</Label>
                <Input
                  id="mobile"
                  value={form.mobile}
                  onChange={(e) => updateField('mobile', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </div>
            </div>

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
