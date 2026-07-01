import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { EllipsisVertical, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { TutorPetAvatarStack } from '@/components/tutor/tutor-pet-avatar-stack';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteTutor, useTutors } from '@/hooks/useTutors';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import type { TutorWithPets } from '@/types/tutor';

function TutorRow({
  tutor,
  onDelete,
}: {
  tutor: TutorWithPets;
  onDelete: (tutor: TutorWithPets) => void;
}) {
  const navigate = useNavigate();

  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 text-sm font-medium">{tutor.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {tutor.phone ?? tutor.whatsapp ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{tutor.email ?? '—'}</td>
      <td className="px-4 py-3">
        <TutorPetAvatarStack pets={tutor.pets} />
      </td>
      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Ações do tutor" />
            }
          >
            <EllipsisVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => void navigate(`/tutors/${tutor.id}`)}>
              <Eye className="size-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                void navigate(`/tutors/${tutor.id}`, { state: { openEdit: true } })
              }
            >
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(tutor)}>
              <Trash2 className="size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function TutorListPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tutorToDelete, setTutorToDelete] = useState<TutorWithPets | null>(null);
  const { data, isLoading, error } = useTutors(debouncedSearch || undefined, { limit: 20 });
  const deleteTutor = useDeleteTutor();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  async function handleConfirmDelete() {
    if (!tutorToDelete) return;

    try {
      await deleteTutor.mutateAsync(tutorToDelete.id);
      toast.success('Tutor excluído.');
      setTutorToDelete(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao excluir tutor';
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>Tutores</h1>
          <p className={pageDescriptionClassName}>
            Busque e gerencie os tutores cadastrados na clínica.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/tutors/new">
            <Plus className="size-4" />
            Novo Tutor
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Tutores cadastrados</CardTitle>
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, celular ou documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          {isLoading && (
            <div className="space-y-2 px-4 py-6 sm:px-0">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {error && (
            <p className="px-4 py-8 text-sm text-destructive sm:px-0">
              Não foi possível carregar os tutores.
            </p>
          )}

          {!isLoading && !error && data?.items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-0">
              {debouncedSearch
                ? `Nenhum tutor encontrado para "${debouncedSearch}".`
                : 'Nenhum tutor cadastrado ainda.'}
            </p>
          )}

          {!isLoading && !error && data && data.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Celular</th>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                    <th className="px-4 py-3 font-medium">Pets</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((tutor) => (
                    <TutorRow key={tutor.id} tutor={tutor} onDelete={setTutorToDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={tutorToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTutorToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir tutor?</DialogTitle>
            <DialogDescription>
              Esta ação não tem volta. O tutor <strong>{tutorToDelete?.name}</strong> e todos
              os pets, atendimentos e agendamentos vinculados serão removidos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTutorToDelete(null)}
              disabled={deleteTutor.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={deleteTutor.isPending}
            >
              {deleteTutor.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
