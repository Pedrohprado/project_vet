import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { DurationInput } from '@/components/ui/duration-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCreateAppointment } from '@/hooks/useAppointments';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import { APPOINTMENT_TYPE_LABELS } from '@/types/appointment';
import { getDefaultDateTimeValue } from '@/lib/date-input';
import {
  minutesToDurationDigits,
  parseDurationDigits,
} from '@/lib/duration-input';

const appointmentSchema = z.object({
  scheduledAt: z.string().min(1, 'Data e hora são obrigatórias'),
  durationMinutes: z
    .number()
    .int()
    .min(1, 'Duração mínima de 1 minuto')
    .max(5999, 'Duração máxima de 99 horas e 59 minutos'),
  title: z.string().optional(),
  description: z.string().optional(),
});

export function AppointmentFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const createAppointment = useCreateAppointment();

  const tutorId = searchParams.get('tutorId') ?? '';
  const petId = searchParams.get('petId') ?? '';
  const type = (searchParams.get('type') ?? 'CONSULTATION') as
    | 'CONSULTATION'
    | 'VACCINATION';

  const defaultTitle = type === 'VACCINATION' ? 'Vacinação' : '';

  const [form, setForm] = useState({
    scheduledAt: getDefaultDateTimeValue(),
    durationDigits: minutesToDurationDigits(30),
    title: defaultTitle,
    description: '',
  });
  const [error, setError] = useState<string>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!tutorId || !petId) {
      setError('Tutor ou pet não informados');
      return;
    }

    const parsed = appointmentSchema.safeParse({
      ...form,
      durationMinutes: parseDurationDigits(form.durationDigits),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setError(undefined);

    try {
      await createAppointment.mutateAsync({
        tutorId,
        petId,
        type,
        scheduledAt: new Date(parsed.data.scheduledAt).toISOString(),
        durationMinutes: parsed.data.durationMinutes,
        title: parsed.data.title || undefined,
        description: parsed.data.description || undefined,
      });

      toast.success('Agendamento criado!');
      void navigate('/agenda');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar agendamento';
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div>
        <h1 className={pageTitleClassName}>
          Agendar {APPOINTMENT_TYPE_LABELS[type]}
        </h1>
        <p className={pageDescriptionClassName}>
          Defina data, hora e observações do agendamento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do agendamento</CardTitle>
          <CardDescription>Tipo: {APPOINTMENT_TYPE_LABELS[type]}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Data e hora *</Label>
                <DateTimePicker
                  id="scheduledAt"
                  value={form.scheduledAt}
                  onChange={(scheduledAt) =>
                    setForm((prev) => ({ ...prev, scheduledAt }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duração</Label>
                <DurationInput
                  id="durationMinutes"
                  value={form.durationDigits}
                  onChange={(durationDigits) =>
                    setForm((prev) => ({ ...prev, durationDigits }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Observações</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={createAppointment.isPending}
              >
                {createAppointment.isPending ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
              {tutorId && petId && (
                <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link to={`/tutors/${tutorId}/pets/${petId}`}>Cancelar</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
