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
import { useCreateProductIdea } from '@/hooks/useProductIdeas';

type CreateIdeaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateIdeaDialog({ open, onOpenChange }: CreateIdeaDialogProps) {
  const createIdea = useCreateProductIdea();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTitle('');
      setDescription('');
    }
  }

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Informe um título para a ideia');
      return;
    }

    try {
      await createIdea.mutateAsync({
        title: trimmedTitle,
        description: description.trim() || null,
      });
      toast.success('Ideia enviada. Ela entrou em Ideias.');
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erro ao enviar ideia',
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova ideia</DialogTitle>
          <DialogDescription>
            Conte o que falta no Box Vet. A ideia entra em Ideias e o time move
            o card quando for priorizar ou começar a construir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idea-title">Título</Label>
            <Input
              id="idea-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Lembrete de vacina pelo WhatsApp"
              maxLength={120}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idea-description">Descrição</Label>
            <Textarea
              id="idea-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Explique o problema e como isso ajudaria no dia a dia da clínica."
              maxLength={2000}
              className="min-h-28"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={createIdea.isPending}
          >
            {createIdea.isPending ? 'Enviando...' : 'Enviar ideia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
