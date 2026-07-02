import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Calendar, Clock, Pencil, Plus, Stethoscope, Syringe } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { getOpenVaccinationByPet } from '@/api/vaccinations';
import { EditPetDialog } from '@/components/pet/edit-pet-dialog';
import { PetAvatar } from '@/components/pet/pet-avatar';
import { PageBackButton } from '@/components/page-back-button';
import { PetRegistrationCard } from '@/components/pet/pet-registration-card';
import { PetVaccinationsCard } from '@/components/pet/pet-vaccinations-card';
import { PetWeightHistoryCard } from '@/components/pet/pet-weight-history-card';
import { PetTimeline } from '@/components/pet/pet-timeline';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCreateConsultation,
  useOpenConsultation,
} from '@/hooks/useConsultations';
import { usePetTimeline } from '@/hooks/usePetTimeline';
import { usePet } from '@/hooks/usePets';
import { useTutor } from '@/hooks/useTutors';
import {
  useCreateVaccination,
  useOpenVaccination,
} from '@/hooks/useVaccinations';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';

type PetDetailLocationState = {
  openEdit?: boolean;
};

export function PetDetailPage() {
  const { id: tutorId, petId } = useParams<{ id: string; petId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const { data: tutor } = useTutor(tutorId);
  const { data: pet, isLoading } = usePet(petId);
  const { data: timeline, isLoading: isLoadingTimeline } = usePetTimeline(petId);
  const { data: openConsultation, isLoading: isLoadingOpenConsultation } =
    useOpenConsultation(petId);
  const { data: openVaccination, isLoading: isLoadingOpenVaccination } =
    useOpenVaccination(petId);
  const createConsultation = useCreateConsultation();
  const createVaccination = useCreateVaccination();

  useEffect(() => {
    const state = location.state as PetDetailLocationState | null;
    if (!state?.openEdit || !pet) return;

    setEditOpen(true);
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, pet]);

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

  async function handleStartVaccination() {
    if (!tutorId || !petId) return;

    try {
      const vaccination = await createVaccination.mutateAsync({
        tutorId,
        petId,
      });
      toast.success('Vacinação iniciada!');
      void navigate(`/vaccinations/${vaccination.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        const existing = openVaccination ?? (await getOpenVaccinationByPet(petId));
        if (existing) {
          toast.info('Retomando vacinação em andamento.');
          void navigate(`/vaccinations/${existing.id}`);
          return;
        }
      }

      const message =
        err instanceof ApiError ? err.message : 'Erro ao iniciar vacinação';
      toast.error(message);
    }
  }

  function handleContinueConsultation() {
    if (!openConsultation) return;
    void navigate(`/consultations/${openConsultation.id}`);
  }

  function handleContinueVaccination() {
    if (!openVaccination) return;
    void navigate(`/vaccinations/${openVaccination.id}`);
  }

  if (isLoading || isLoadingOpenConsultation || isLoadingOpenVaccination) {
    return (
      <div className={`${pageShellClassName} space-y-4`}>
        {tutorId ? <PageBackButton to={`/tutors/${tutorId}`} /> : null}
        <div className="flex items-center gap-2">
          <Skeleton className="size-16 shrink-0 rounded-full sm:size-20" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="size-10 shrink-0 rounded-lg sm:hidden" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pet || !tutorId) {
    return <p className="text-sm text-muted-foreground">Pet não encontrado.</p>;
  }

  const hasOpenConsultation = openConsultation?.status === 'OPEN';
  const hasOpenVaccination = Boolean(openVaccination && !openVaccination.appliedAt);

  return (
    <div className={pageShellClassName}>
      <PageBackButton to={`/tutors/${tutorId}`} />

      <div className="flex min-w-0 items-center gap-2">
        <PetAvatar pet={pet} size="lg" />
        <div className="min-w-0 flex-1">
          <p className={`${pageDescriptionClassName} text-sm`}>
            Tutor:{' '}
            <Link
              to={`/tutors/${tutorId}`}
              className="text-primary hover:underline"
            >
              {tutor?.name ?? '...'}
            </Link>
          </p>
          <h1 className={pageTitleClassName}>{pet.name}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="size-10 sm:hidden"
            aria-label="Editar pet"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="hidden sm:inline-flex"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
          <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon-lg"
                  className="size-10"
                  aria-label="Ações do pet"
                />
              }
            >
              <Plus className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {!hasOpenConsultation && (
                <DropdownMenuItem
                  onClick={() => void handleStartConsultation()}
                  disabled={createConsultation.isPending}
                >
                  <Stethoscope className="size-4" />
                  {createConsultation.isPending ? 'Iniciando...' : 'Iniciar Consulta'}
                </DropdownMenuItem>
              )}
              {!hasOpenVaccination && (
                <DropdownMenuItem
                  onClick={() => void handleStartVaccination()}
                  disabled={createVaccination.isPending}
                >
                  <Syringe className="size-4" />
                  {createVaccination.isPending ? 'Iniciando...' : 'Iniciar Vacinação'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  void navigate(
                    `/appointments/new?tutorId=${tutorId}&petId=${petId}&type=CONSULTATION`,
                  )
                }
              >
                <Calendar className="size-4" />
                Agendar Consulta
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  void navigate(
                    `/appointments/new?tutorId=${tutorId}&petId=${petId}&type=VACCINATION`,
                  )
                }
              >
                <Syringe className="size-4" />
                Agendar Vacinação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>

      <EditPetDialog open={editOpen} onOpenChange={setEditOpen} pet={pet} />

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
            <Button className="w-full sm:w-auto" onClick={handleContinueConsultation}>
              Continuar consulta
            </Button>
          </CardContent>
        </Card>
      )}

      {hasOpenVaccination && openVaccination && (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Syringe className="size-5 shrink-0" />
              Vacinação em andamento
            </CardTitle>
            <CardDescription>
              Iniciada em{' '}
              {new Date(openVaccination.createdAt).toLocaleString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full sm:w-auto" onClick={handleContinueVaccination}>
              Continuar vacinação
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <div className="absolute right-0 bottom-full z-10 mb-2 hidden max-w-full flex-col items-end gap-2 sm:flex sm:flex-row sm:flex-wrap sm:justify-end">
          {!hasOpenConsultation && (
            <Button
              className="w-auto"
              onClick={handleStartConsultation}
              disabled={createConsultation.isPending}
            >
              <Stethoscope className="size-4" />
              {createConsultation.isPending ? 'Iniciando...' : 'Iniciar Consulta'}
            </Button>
          )}
          {!hasOpenVaccination && (
            <Button
              className="w-auto"
              onClick={handleStartVaccination}
              disabled={createVaccination.isPending}
            >
              <Syringe className="size-4" />
              {createVaccination.isPending ? 'Iniciando...' : 'Iniciar Vacinação'}
            </Button>
          )}
          <Button variant="outline" className="w-auto" asChild>
            <Link
              to={`/appointments/new?tutorId=${tutorId}&petId=${petId}&type=CONSULTATION`}
            >
              <Calendar className="size-4" />
              Agendar Consulta
            </Link>
          </Button>
          <Button variant="outline" className="w-auto" asChild>
            <Link
              to={`/appointments/new?tutorId=${tutorId}&petId=${petId}&type=VACCINATION`}
            >
              <Syringe className="size-4" />
              Agendar Vacinação
            </Link>
          </Button>
        </div>

        <PetRegistrationCard pet={pet} />
      </div>

      <PetVaccinationsCard
        petId={pet.id}
        openVaccinationId={hasOpenVaccination ? openVaccination?.id : undefined}
      />

      <PetWeightHistoryCard petId={pet.id} />

      <PetTimeline events={timeline} isLoading={isLoadingTimeline} />
    </div>
  );
}
