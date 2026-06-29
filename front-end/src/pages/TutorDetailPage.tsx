import { Link, useParams } from 'react-router';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTutor } from '@/hooks/useTutors';
import { pageDescriptionClassName, pageShellClassName, pageTitleClassName } from '@/lib/mobile-ui';
import { PET_SPECIES_LABELS } from '@/types/pet';

export function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tutor, isLoading } = useTutor(id);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  if (!tutor) {
    return <p className="text-sm text-muted-foreground">Tutor não encontrado.</p>;
  }

  return (
    <div className={pageShellClassName}>
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h1 className={pageTitleClassName}>{tutor.name}</h1>
          <p className={`break-words ${pageDescriptionClassName}`}>
            {[tutor.phone ?? tutor.whatsapp, tutor.email].filter(Boolean).join(' · ')}
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto sm:self-start">
          <Link to={`/tutors/${tutor.id}/pets/new`}>
            <Plus className="size-4" />
            Novo Pet
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pets</CardTitle>
          <CardDescription>
            Selecione um pet para iniciar consulta ou agendar atendimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tutor.pets.length === 0 ? (
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">Nenhum pet cadastrado.</p>
              <Button asChild className="w-full sm:w-auto">
                <Link to={`/tutors/${tutor.id}/pets/new`}>Cadastrar Pet</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {tutor.pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{pet.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {PET_SPECIES_LABELS[pet.species]}
                      </Badge>
                      {pet.breed && (
                        <Badge variant="outline">{pet.breed}</Badge>
                      )}
                    </div>
                  </div>
                  <Button asChild className="w-full shrink-0 sm:w-auto">
                    <Link to={`/tutors/${tutor.id}/pets/${pet.id}`}>Selecionar</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
