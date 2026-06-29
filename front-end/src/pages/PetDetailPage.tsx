import { Link, useNavigate, useParams } from 'react-router';
import { Calendar, Clock, Stethoscope, Syringe } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useCreateConsultation,
  useOpenConsultation,
} from '@/hooks/useConsultations';
import { usePet } from '@/hooks/usePets';
import { useTutor } from '@/hooks/useTutors';
import { pageShellClassName, pageTitleClassName } from '@/lib/mobile-ui';
import { PET_SPECIES_LABELS, PET_SEX_LABELS } from '@/types/pet';

export function PetDetailPage() {
  const { id: tutorId, petId } = useParams<{ id: string; petId: string }>();
  const navigate = useNavigate();
  const { data: tutor } = useTutor(tutorId);
  const { data: pet, isLoading } = usePet(petId);
  const { data: openConsultation, isLoading: isLoadingOpen } =
    useOpenConsultation(petId);
  const createConsultation = useCreateConsultation();

  async function handleStartConsultation() {
    if (!tutorId || !petId) return;

    try {
      const consultation = await createConsultation.mutateAsync({
        tutorId,
        petId,
      });
      toast.success('Consulta iniciada!');
      void navigate(`/consultations/${consultation.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409 && openConsultation) {
        toast.info('Retomando consulta em andamento.');
        void navigate(`/consultations/${openConsultation.id}`);
        return;
      }

      const message =
        err instanceof ApiError ? err.message : 'Erro ao iniciar consulta';
      toast.error(message);
    }
  }

  function handleContinueConsultation() {
    if (!openConsultation) return;
    void navigate(`/consultations/${openConsultation.id}`);
  }

  if (isLoading || isLoadingOpen) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  if (!pet || !tutorId) {
    return <p className="text-sm text-muted-foreground">Pet não encontrado.</p>;
  }

  const hasOpenConsultation = openConsultation?.status === 'OPEN';

  return (
    <div className={pageShellClassName}>
      <div>
        <p className="text-sm text-muted-foreground">
          Tutor:{' '}
          <Link to={`/tutors/${tutorId}`} className="text-primary hover:underline">
            {tutor?.name ?? '...'}
          </Link>
        </p>
        <h1 className={pageTitleClassName}>{pet.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{PET_SPECIES_LABELS[pet.species]}</Badge>
          <Badge variant="outline">{PET_SEX_LABELS[pet.sex]}</Badge>
          {pet.breed && <Badge variant="outline">{pet.breed}</Badge>}
        </div>
      </div>

      {hasOpenConsultation && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="size-5 shrink-0" />
              Consulta em andamento
            </CardTitle>
            <CardDescription>
              Iniciada em{' '}
              {new Date(openConsultation.startedAt).toLocaleString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleContinueConsultation}>
              Continuar consulta
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Próximo passo</CardTitle>
          <CardDescription>
            {hasOpenConsultation
              ? 'Finalize a consulta em andamento ou agende outros atendimentos.'
              : 'Escolha como prosseguir com o atendimento deste pet.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3">
          {!hasOpenConsultation && (
            <Button
              className="h-auto min-h-14 flex-col gap-2 py-4"
              onClick={handleStartConsultation}
              disabled={createConsultation.isPending}
            >
              <Stethoscope className="size-5" />
              {createConsultation.isPending ? 'Iniciando...' : 'Iniciar Consulta'}
            </Button>
          )}
          <Button variant="outline" className="h-auto min-h-14 flex-col gap-2 py-4" asChild>
            <Link
              to={`/appointments/new?tutorId=${tutorId}&petId=${petId}&type=CONSULTATION`}
            >
              <Calendar className="size-5" />
              Agendar Consulta
            </Link>
          </Button>
          <Button variant="outline" className="h-auto min-h-14 flex-col gap-2 py-4" asChild>
            <Link
              to={`/appointments/new?tutorId=${tutorId}&petId=${petId}&type=VACCINATION`}
            >
              <Syringe className="size-5" />
              Agendar Vacinação
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
