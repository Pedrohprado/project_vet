import { useState } from 'react';
import { useNavigate } from 'react-router';
import { EllipsisVertical, Eye, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { NewAtendimentoSheet } from '@/components/atendimento/new-atendimento-sheet';
import { Badge } from '@/components/ui/badge';
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
import { useAtendimentos } from '@/hooks/useAtendimentos';
import { useDeleteConsultation } from '@/hooks/useConsultations';
import { useDeleteVaccination } from '@/hooks/useVaccinations';
import {
  pageDescriptionClassName,
  pageShellClassName,
  pageTitleClassName,
} from '@/lib/mobile-ui';
import { cn } from '@/lib/utils';
import {
  ATENDIMENTO_KIND_LABELS,
  ATENDIMENTO_STATUS_LABELS,
  type AtendimentoListItem,
  type AtendimentoStatus,
} from '@/types/atendimento';
import { PET_SPECIES_LABELS } from '@/types/pet';

const statusBadgeVariant: Record<
  AtendimentoStatus,
  'default' | 'secondary' | 'outline'
> = {
  OPEN: 'default',
  FINISHED: 'secondary',
  CANCELLED: 'outline',
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AtendimentoRow({
  item,
  onDelete,
}: {
  item: AtendimentoListItem;
  onDelete: (item: AtendimentoListItem) => void;
}) {
  const navigate = useNavigate();
  const isOpen = item.status === 'OPEN';
  const detailPath =
    item.kind === 'CONSULTATION'
      ? `/consultations/${item.id}`
      : `/vaccinations/${item.id}`;

  function openDetails() {
    void navigate(detailPath);
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
      aria-label={`Ver detalhes do atendimento de ${item.pet.name}`}
    >
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        {formatDateTime(item.occurredAt)}
      </td>
      <td className="px-4 py-3">
        <Badge
          variant="outline"
          className={cn(
            item.kind === 'VACCINATION' &&
              'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
          )}
        >
          {ATENDIMENTO_KIND_LABELS[item.kind]}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm">{item.tutor.name}</td>
      <td className="px-4 py-3 text-sm">
        {item.pet.name}{' '}
        <span className="text-muted-foreground">
          ({PET_SPECIES_LABELS[item.pet.species as keyof typeof PET_SPECIES_LABELS] ?? item.pet.species})
        </span>
      </td>
      <td className="px-4 py-3 text-sm">{item.veterinarian.name}</td>
      <td className="px-4 py-3">
        <Badge variant={statusBadgeVariant[item.status]}>
          {ATENDIMENTO_STATUS_LABELS[item.status]}
        </Badge>
      </td>
      <td
        className="px-4 py-3 text-right"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Ações do atendimento"
              />
            }
          >
            <EllipsisVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openDetails}>
              <Eye className="size-4" />
              {isOpen ? 'Continuar atendimento' : 'Ver detalhes'}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(item)}
              disabled={item.kind === 'VACCINATION' && item.status === 'FINISHED'}
            >
              <Trash2 className="size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function AtendimentoPage() {
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AtendimentoListItem | null>(
    null,
  );
  const { data, isLoading, error } = useAtendimentos(1, 20);
  const deleteConsultation = useDeleteConsultation();
  const deleteVaccination = useDeleteVaccination();

  const isDeleting = deleteConsultation.isPending || deleteVaccination.isPending;

  async function handleConfirmDelete() {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.kind === 'CONSULTATION') {
        await deleteConsultation.mutateAsync({
          id: itemToDelete.id,
          petId: itemToDelete.pet.id,
        });
      } else {
        await deleteVaccination.mutateAsync({
          id: itemToDelete.id,
          petId: itemToDelete.pet.id,
        });
      }

      toast.success('Atendimento excluído.');
      setItemToDelete(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao excluir atendimento';
      toast.error(message);
    }
  }

  return (
    <div className={pageShellClassName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>Atendimento</h1>
          <p className={pageDescriptionClassName}>
            Acompanhe os atendimentos recentes e inicie um novo quando necessário.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsNewSheetOpen(true)}>
          <Plus className="size-4" />
          Novo Atendimento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos atendimentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          {isLoading && (
            <p className="px-4 py-8 text-sm text-muted-foreground sm:px-0">
              Carregando atendimentos...
            </p>
          )}

          {error && (
            <p className="px-4 py-8 text-sm text-destructive sm:px-0">
              Não foi possível carregar os atendimentos.
            </p>
          )}

          {!isLoading && !error && data?.items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-0">
              Nenhum atendimento registrado ainda. Clique em &quot;Novo Atendimento&quot; para
              começar.
            </p>
          )}

          {!isLoading && !error && data && data.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Tutor</th>
                    <th className="px-4 py-3 font-medium">Pet</th>
                    <th className="px-4 py-3 font-medium">Veterinário</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <AtendimentoRow
                      key={`${item.kind}-${item.id}`}
                      item={item}
                      onDelete={setItemToDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <NewAtendimentoSheet open={isNewSheetOpen} onOpenChange={setIsNewSheetOpen} />

      <Dialog
        open={itemToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir atendimento?</DialogTitle>
            <DialogDescription>
              Esta ação não tem volta. O atendimento de{' '}
              <strong>{itemToDelete?.pet.name}</strong> ({itemToDelete?.tutor.name}) será
              removido permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setItemToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
