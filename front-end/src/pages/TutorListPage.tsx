import { useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTutors } from '@/hooks/useTutors';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import { PET_SPECIES_LABELS } from '@/types/pet';

export function TutorListPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data, isLoading } = useTutors(debouncedSearch);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setDebouncedSearch(search);
  }

  return (
    <div className={pageShellClassName}>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className={pageTitleClassName}>Tutores</h1>
          <p className={pageDescriptionClassName}>
            Busque e selecione um tutor cadastrado.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto sm:self-start">
          <Link to="/tutors/new">Novo Tutor</Link>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar por nome, celular ou documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
          <Search className="size-4" />
          Buscar
        </Button>
      </form>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando tutores...</p>
      )}

      {!isLoading && data?.items.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum tutor encontrado.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3">
        {data?.items.map((tutor) => (
          <Card key={tutor.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="text-lg">{tutor.name}</CardTitle>
                  <CardDescription className="break-words">
                    {[tutor.phone ?? tutor.whatsapp, tutor.email]
                      .filter(Boolean)
                      .join(' · ') || 'Sem contato'}
                  </CardDescription>
                </div>
                <Button asChild className="w-full shrink-0 sm:w-auto">
                  <Link to={`/tutors/${tutor.id}`}>Selecionar</Link>
                </Button>
              </div>
            </CardHeader>
            {tutor.pets.length > 0 && (
              <CardContent className="flex flex-wrap gap-2">
                {tutor.pets.map((pet) => (
                  <Badge key={pet.id} variant="secondary">
                    {pet.name} ({PET_SPECIES_LABELS[pet.species]})
                  </Badge>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
