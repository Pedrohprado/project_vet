import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  PawPrint,
  Search,
  Stethoscope,
  Syringe,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { getOpenConsultationByPet } from '@/api/consultations';
import { getOpenVaccinationByPet } from '@/api/vaccinations';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PetAvatar } from '@/components/pet/pet-avatar';
import { TutorPetAvatarStack } from '@/components/tutor/tutor-pet-avatar-stack';
import { useCreateConsultation } from '@/hooks/useConsultations';
import { useCreateVaccination } from '@/hooks/useVaccinations';
import { useTutor, useTutors } from '@/hooks/useTutors';
import { PET_SPECIES_LABELS } from '@/types/pet';
import type { PetSummary, TutorWithPets } from '@/types/tutor';

type Step = 'tutor' | 'pet' | 'actions';

type NewAtendimentoSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function resetState() {
  return {
    step: 'tutor' as Step,
    tutorSearch: '',
    debouncedTutorSearch: '',
    selectedTutorId: undefined as string | undefined,
    selectedPetId: undefined as string | undefined,
    petSearch: '',
  };
}

function TutorResultsTable({
  tutors,
  onSelect,
}: {
  tutors: TutorWithPets[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-muted-foreground">
            <th className="px-3 py-2.5 font-medium">Nome</th>
            <th className="px-3 py-2.5 font-medium">Celular</th>
            <th className="px-3 py-2.5 font-medium">E-mail</th>
            <th className="px-3 py-2.5 font-medium">Pets</th>
          </tr>
        </thead>
        <tbody>
          {tutors.map((tutor) => (
            <tr
              key={tutor.id}
              className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/50"
              onClick={() => onSelect(tutor.id)}
            >
              <td className="px-3 py-2.5 font-medium">{tutor.name}</td>
              <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                {tutor.phone ?? tutor.whatsapp ?? '—'}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {tutor.email ?? '—'}
              </td>
              <td className="px-3 py-2.5">
                <TutorPetAvatarStack pets={tutor.pets} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PetResultsTable({
  pets,
  onSelect,
}: {
  pets: PetSummary[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-muted-foreground">
            <th className="w-12 px-3 py-2.5" aria-hidden="true" />
            <th className="px-3 py-2.5 font-medium">Nome</th>
            <th className="px-3 py-2.5 font-medium">Espécie</th>
            <th className="px-3 py-2.5 font-medium">Raça</th>
          </tr>
        </thead>
        <tbody>
          {pets.map((pet) => (
            <tr
              key={pet.id}
              className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/50"
              onClick={() => onSelect(pet.id)}
            >
              <td className="px-3 py-2.5">
                <PetAvatar pet={pet} />
              </td>
              <td className="px-3 py-2.5 font-medium">{pet.name}</td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {PET_SPECIES_LABELS[pet.species]}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">{pet.breed ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TutorStep({
  tutorSearch,
  onTutorSearchChange,
  debouncedTutorSearch,
  onSelectTutor,
  onClose,
}: {
  tutorSearch: string;
  onTutorSearchChange: (value: string) => void;
  debouncedTutorSearch: string;
  onSelectTutor: (id: string) => void;
  onClose: () => void;
}) {
  const hasSearch = debouncedTutorSearch.trim().length > 0;
  const { data, isLoading } = useTutors(
    debouncedTutorSearch || undefined,
    hasSearch ? undefined : { limit: 5 },
  );
  const hasResults = (data?.items.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar tutor por nome..."
          value={tutorSearch}
          onChange={(e) => onTutorSearchChange(e.target.value)}
          className="pl-8"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        {!hasSearch && (
          <p className="text-sm font-medium text-muted-foreground">Tutores cadastrados</p>
        )}

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {!isLoading && !hasResults && (
          <Card>
            <CardContent className="space-y-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                {hasSearch
                  ? `Nenhum tutor encontrado para "${debouncedTutorSearch}".`
                  : 'Nenhum tutor cadastrado ainda.'}
              </p>
              <Button asChild className="w-full sm:w-auto" onClick={onClose}>
                <Link to="/tutors/new">
                  <UserPlus className="size-4" />
                  Cadastrar Tutor
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && hasResults && data && (
          <div className="max-h-[45vh] overflow-y-auto">
            <TutorResultsTable tutors={data.items} onSelect={onSelectTutor} />
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <Button asChild variant="ghost" className="w-full" onClick={onClose}>
          <Link to="/tutors/new">
            <UserPlus className="size-4" />
            Cadastrar novo tutor
          </Link>
        </Button>
      </div>
    </div>
  );
}

function PetStep({
  tutorId,
  petSearch,
  onPetSearchChange,
  onSelectPet,
  onBack,
  onClose,
}: {
  tutorId: string;
  petSearch: string;
  onPetSearchChange: (value: string) => void;
  onSelectPet: (id: string) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const { data: tutor, isLoading } = useTutor(tutorId);

  const filteredPets = useMemo(() => {
    if (!tutor?.pets) return [];
    const query = petSearch.trim().toLowerCase();
    if (!query) return tutor.pets;
    return tutor.pets.filter((pet) => pet.name.toLowerCase().includes(query));
  }, [tutor?.pets, petSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Tutor selecionado</p>
          <p className="truncate font-medium">{tutor?.name ?? '...'}</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {!isLoading && tutor && tutor.pets.length === 0 && (
        <Card>
          <CardContent className="space-y-3 py-6 text-center">
            <PawPrint className="mx-auto size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Este tutor ainda não tem pets cadastrados.
            </p>
            <Button asChild className="w-full sm:w-auto" onClick={onClose}>
              <Link to={`/tutors/${tutor.id}/pets/new`}>Cadastrar Pet</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && tutor && tutor.pets.length > 0 && (
        <>
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar pet por nome..."
              value={petSearch}
              onChange={(e) => onPetSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="space-y-2">
            {!petSearch.trim() && (
              <p className="text-sm font-medium text-muted-foreground">Pets do tutor</p>
            )}

            {filteredPets.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum pet encontrado para &quot;{petSearch}&quot;.
              </p>
            ) : (
              <div className="max-h-[45vh] overflow-y-auto">
                <PetResultsTable pets={filteredPets} onSelect={onSelectPet} />
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <Button asChild variant="ghost" className="w-full" onClick={onClose}>
              <Link to={`/tutors/${tutor.id}/pets/new`}>
                <PawPrint className="size-4" />
                Cadastrar novo pet
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ActionsStep({
  tutorId,
  petId,
  onBack,
  onClose,
}: {
  tutorId: string;
  petId: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { data: tutor } = useTutor(tutorId);
  const createConsultation = useCreateConsultation();
  const createVaccination = useCreateVaccination();

  const selectedPet = tutor?.pets.find((pet) => pet.id === petId);
  const isPending = createConsultation.isPending || createVaccination.isPending;

  async function handleStartConsultation() {
    try {
      const consultation = await createConsultation.mutateAsync({ tutorId, petId });
      toast.success('Consulta iniciada!');
      onClose();
      void navigate(`/consultations/${consultation.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        const openConsultation = await getOpenConsultationByPet(petId);
        if (openConsultation) {
          toast.info('Retomando consulta em andamento.');
          onClose();
          void navigate(`/consultations/${openConsultation.id}`);
          return;
        }
      }

      const message =
        err instanceof ApiError ? err.message : 'Erro ao iniciar consulta';
      toast.error(message);
    }
  }

  async function handleStartVaccination() {
    try {
      const vaccination = await createVaccination.mutateAsync({ tutorId, petId });
      toast.success('Vacinação iniciada!');
      onClose();
      void navigate(`/vaccinations/${vaccination.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        const openVaccination = await getOpenVaccinationByPet(petId);
        if (openVaccination) {
          toast.info('Retomando vacinação em andamento.');
          onClose();
          void navigate(`/vaccinations/${openVaccination.id}`);
          return;
        }
      }

      const message =
        err instanceof ApiError ? err.message : 'Erro ao iniciar vacinação';
      toast.error(message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Pet selecionado</p>
          <p className="truncate font-medium">
            {selectedPet?.name ?? '...'} · {tutor?.name ?? '...'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como deseja prosseguir?</CardTitle>
          <CardDescription>
            Escolha se deseja iniciar uma consulta ou uma vacinação.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <Button
            className="h-auto min-h-11 flex-col gap-1.5 py-3"
            onClick={() => void handleStartConsultation()}
            disabled={isPending}
          >
            <Stethoscope className="size-5" />
            {createConsultation.isPending ? 'Iniciando...' : 'Iniciar Consulta'}
          </Button>
          <Button
            className="h-auto min-h-11 flex-col gap-1.5 py-3"
            onClick={() => void handleStartVaccination()}
            disabled={isPending}
          >
            <Syringe className="size-5" />
            {createVaccination.isPending ? 'Iniciando...' : 'Iniciar Vacinação'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function NewAtendimentoSheet({ open, onOpenChange }: NewAtendimentoSheetProps) {
  const [step, setStep] = useState<Step>('tutor');
  const [tutorSearch, setTutorSearch] = useState('');
  const [debouncedTutorSearch, setDebouncedTutorSearch] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState<string>();
  const [selectedPetId, setSelectedPetId] = useState<string>();
  const [petSearch, setPetSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedTutorSearch(tutorSearch);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [tutorSearch]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      const initial = resetState();
      setStep(initial.step);
      setTutorSearch(initial.tutorSearch);
      setDebouncedTutorSearch(initial.debouncedTutorSearch);
      setSelectedTutorId(initial.selectedTutorId);
      setSelectedPetId(initial.selectedPetId);
      setPetSearch(initial.petSearch);
    }
    onOpenChange(nextOpen);
  }

  function handleClose() {
    handleOpenChange(false);
  }

  function handleSelectTutor(id: string) {
    setSelectedTutorId(id);
    setPetSearch('');
    setStep('pet');
  }

  function handleSelectPet(id: string) {
    setSelectedPetId(id);
    setStep('actions');
  }

  const stepDescription: Record<Step, string> = {
    tutor: 'Busque e selecione o tutor do atendimento.',
    pet: 'Selecione o pet que será atendido.',
    actions: 'Escolha como prosseguir com o atendimento.',
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Atendimento</DialogTitle>
          <DialogDescription>{stepDescription[step]}</DialogDescription>
        </DialogHeader>

        <div>
          {step === 'tutor' && (
            <TutorStep
              tutorSearch={tutorSearch}
              onTutorSearchChange={setTutorSearch}
              debouncedTutorSearch={debouncedTutorSearch}
              onSelectTutor={handleSelectTutor}
              onClose={handleClose}
            />
          )}

          {step === 'pet' && selectedTutorId && (
            <PetStep
              tutorId={selectedTutorId}
              petSearch={petSearch}
              onPetSearchChange={setPetSearch}
              onSelectPet={handleSelectPet}
              onBack={() => {
                setSelectedTutorId(undefined);
                setStep('tutor');
              }}
              onClose={handleClose}
            />
          )}

          {step === 'actions' && selectedTutorId && selectedPetId && (
            <ActionsStep
              tutorId={selectedTutorId}
              petId={selectedPetId}
              onBack={() => {
                setSelectedPetId(undefined);
                setStep('pet');
              }}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
