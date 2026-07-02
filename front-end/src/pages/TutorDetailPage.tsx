import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { EllipsisVertical, Eye, Pencil, Plus } from 'lucide-react';
import { EditTutorDialog } from '@/components/tutor/edit-tutor-dialog';
import { PetAvatar } from '@/components/pet/pet-avatar';
import { PageBackButton } from '@/components/page-back-button';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { useTutor } from '@/hooks/useTutors';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import { formatPetAge, formatPetWeight } from '@/lib/pet-format';
import { PET_SPECIES_LABELS } from '@/types/pet';
import type { PetSummary } from '@/types/tutor';

type TutorDetailLocationState = {
  openEdit?: boolean;
};

function PetRow({ tutorId, pet }: { tutorId: string; pet: PetSummary }) {
  const navigate = useNavigate();
  const detailPath = `/tutors/${tutorId}/pets/${pet.id}`;

  function openDetails() {
    void navigate(detailPath);
  }

  function openEdit() {
    void navigate(detailPath, { state: { openEdit: true } });
  }

  return (
    <tr
      className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50"
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetails();
        }
      }}
      tabIndex={0}
      aria-label={`Ver detalhes de ${pet.name}`}
    >
      <td className="px-4 py-3">
        <PetAvatar pet={pet} />
      </td>
      <td className="px-4 py-3 text-sm font-medium">{pet.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {PET_SPECIES_LABELS[pet.species]}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{pet.breed ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {formatPetAge(pet.birthDate)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {formatPetWeight(pet.weightKg)}
      </td>
      <td
        className="px-4 py-3 text-right"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Ações do pet" />
            }
          >
            <EllipsisVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openDetails}>
              <Eye className="size-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openEdit}>
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const { data: tutor, isLoading, error } = useTutor(id);

  useEffect(() => {
    const state = location.state as TutorDetailLocationState | null;
    if (!state?.openEdit || !tutor) return;

    setEditOpen(true);
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, tutor]);

  if (isLoading) {
    return (
      <div className={`${pageShellClassName} space-y-4`}>
        <PageBackButton to="/tutors" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !tutor || !id) {
    return <p className="text-sm text-muted-foreground">Tutor não encontrado.</p>;
  }

  return (
    <div className={pageShellClassName}>
      <PageBackButton to="/tutors" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className={pageTitleClassName}>{tutor.name}</h1>
          <div className={`mt-1 space-y-0.5 ${pageDescriptionClassName}`}>
            <p>Celular: {tutor.phone ?? tutor.whatsapp ?? '—'}</p>
            <p>E-mail: {tutor.email ?? '—'}</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to={`/tutors/${tutor.id}/pets/new`}>
              <Plus className="size-4" />
              Novo Pet
            </Link>
          </Button>
        </div>
      </div>

      <EditTutorDialog open={editOpen} onOpenChange={setEditOpen} tutor={tutor} />

      <Card>
        <CardHeader>
          <CardTitle>Pets</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          {tutor.pets.length === 0 ? (
            <div className="space-y-3 px-4 py-8 text-center sm:px-0">
              <p className="text-sm text-muted-foreground">Nenhum pet cadastrado.</p>
              <Button asChild className="w-full sm:w-auto">
                <Link to={`/tutors/${tutor.id}/pets/new`}>Cadastrar Pet</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="w-12 px-4 py-3" aria-hidden="true" />
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Espécie</th>
                    <th className="px-4 py-3 font-medium">Raça</th>
                    <th className="px-4 py-3 font-medium">Idade</th>
                    <th className="px-4 py-3 font-medium">Peso</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tutor.pets.map((pet) => (
                    <PetRow key={pet.id} tutorId={id} pet={pet} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
