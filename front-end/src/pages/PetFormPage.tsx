import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCreatePet } from '@/hooks/usePets';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import type { PetSex, PetSpecies } from '@/types/tutor';

const petSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  species: z.enum(['DOG', 'CAT', 'OTHER']),
  breed: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).default('UNKNOWN'),
  birthDate: z.string().optional(),
  color: z.string().optional(),
  weightKg: z.string().optional(),
  isCastrated: z.boolean().default(false),
  microchip: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  continuousMedications: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof petSchema>;

const initialData: FormData = {
  name: '',
  species: 'DOG',
  breed: '',
  sex: 'UNKNOWN',
  birthDate: '',
  color: '',
  weightKg: '',
  isCastrated: false,
  microchip: '',
  allergies: '',
  chronicDiseases: '',
  continuousMedications: '',
  notes: '',
};

export function PetFormPage() {
  const { id: tutorId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const createPet = useCreatePet();
  const [form, setForm] = useState<FormData>(initialData);
  const [error, setError] = useState<string>();

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!tutorId) return;

    const parsed = petSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setError(undefined);

    try {
      const pet = await createPet.mutateAsync({
        tutorId,
        data: {
          name: parsed.data.name,
          species: parsed.data.species as PetSpecies,
          sex: parsed.data.sex as PetSex,
          isCastrated: parsed.data.isCastrated,
          breed: parsed.data.breed || undefined,
          birthDate: parsed.data.birthDate || undefined,
          color: parsed.data.color || undefined,
          weightKg: parsed.data.weightKg
            ? Number(parsed.data.weightKg)
            : undefined,
          microchip: parsed.data.microchip || undefined,
          allergies: parsed.data.allergies || undefined,
          chronicDiseases: parsed.data.chronicDiseases || undefined,
          continuousMedications: parsed.data.continuousMedications || undefined,
          notes: parsed.data.notes || undefined,
        },
      });

      toast.success('Pet cadastrado!');
      void navigate(`/tutors/${tutorId}/pets/${pet.id}`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao cadastrar pet';
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>Cadastrar Pet</h1>
        <p className={pageDescriptionClassName}>
          Após salvar, você poderá iniciar uma consulta ou criar um agendamento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do pet</CardTitle>
          <CardDescription>Informações básicas e de saúde.</CardDescription>
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
                <Label htmlFor="species">Espécie *</Label>
                <Select
                  value={form.species}
                  onValueChange={(value) =>
                    updateField('species', value as FormData['species'])
                  }
                >
                  <SelectTrigger id="species" className="w-full">
                    <SelectValue placeholder="Selecione a espécie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOG">Cachorro</SelectItem>
                    <SelectItem value="CAT">Gato</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sexo</Label>
                <Select
                  value={form.sex}
                  onValueChange={(value) =>
                    updateField('sex', value as FormData['sex'])
                  }
                >
                  <SelectTrigger id="sex" className="w-full">
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNKNOWN">Não informado</SelectItem>
                    <SelectItem value="MALE">Macho</SelectItem>
                    <SelectItem value="FEMALE">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Raça</Label>
                <Input
                  id="breed"
                  value={form.breed}
                  onChange={(e) => updateField('breed', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <DatePicker
                  id="birthDate"
                  value={form.birthDate ?? ''}
                  onChange={(birthDate) => updateField('birthDate', birthDate)}
                  toDate={new Date()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightKg">Peso (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.01"
                  value={form.weightKg}
                  onChange={(e) => updateField('weightKg', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Input
                  id="allergies"
                  value={form.allergies}
                  onChange={(e) => updateField('allergies', e.target.value)}
                />
              </div>
              <div className="flex min-h-11 items-center gap-3">
                <Checkbox
                  id="isCastrated"
                  checked={form.isCastrated}
                  onCheckedChange={(checked) =>
                    updateField('isCastrated', checked === true)
                  }
                />
                <Label htmlFor="isCastrated" className="cursor-pointer">
                  Castrado
                </Label>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="w-full sm:w-auto" disabled={createPet.isPending}>
                {createPet.isPending ? 'Salvando...' : 'Salvar Pet'}
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
