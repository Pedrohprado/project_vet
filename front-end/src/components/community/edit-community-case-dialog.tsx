import { useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateCommunityCase } from '@/hooks/useCommunity';
import type { CommunityCase } from '@/types/community';

type EditCommunityCaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityCase: CommunityCase;
  onUpdated?: (communityCase: CommunityCase) => void;
};

export function EditCommunityCaseDialog({
  open,
  onOpenChange,
  communityCase,
  onUpdated,
}: EditCommunityCaseDialogProps) {
  const updateCase = useUpdateCommunityCase();
  const [title, setTitle] = useState(communityCase.title);
  const [authorNote, setAuthorNote] = useState(communityCase.authorNote ?? '');
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCaseId, setPrevCaseId] = useState(communityCase.id);

  if (open !== prevOpen || communityCase.id !== prevCaseId) {
    setPrevOpen(open);
    setPrevCaseId(communityCase.id);
    if (open) {
      setTitle(communityCase.title);
      setAuthorNote(communityCase.authorNote ?? '');
    }
  }

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Informe um título para o caso');
      return;
    }

    try {
      const updated = await updateCase.mutateAsync({
        id: communityCase.id,
        payload: {
          title: trimmedTitle,
          authorNote: authorNote.trim() || null,
        },
      });
      toast.success('Publicação atualizada');
      onOpenChange(false);
      onUpdated?.(updated);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erro ao editar publicação',
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar publicação</DialogTitle>
          <DialogDescription>
            Você pode alterar o título e o texto adicional. O relato clínico da
            consulta permanece igual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-community-case-title">Título</Label>
            <Input
              id="edit-community-case-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-community-case-note">
              Texto adicional (opcional)
            </Label>
            <Textarea
              id="edit-community-case-note"
              value={authorNote}
              onChange={(event) => setAuthorNote(event.target.value)}
              rows={4}
              maxLength={5000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateCase.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={updateCase.isPending}
          >
            {updateCase.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
