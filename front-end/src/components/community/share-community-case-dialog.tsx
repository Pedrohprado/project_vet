import { useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { Badge } from '@/components/ui/badge';
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
import { useCreateCommunityCase } from '@/hooks/useCommunity';
import { formatApproximateAge } from '@/lib/community-age';
import { PET_SPECIES_LABELS } from '@/types/pet';
import type { CommunityCase } from '@/types/community';
import type { Consultation } from '@/types/consultation';
import type { PetSpecies } from '@/types/tutor';

type ShareCommunityCaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation;
  onPublished?: (communityCase: CommunityCase) => void;
};

function defaultTitle(consultation: Consultation) {
  const diagnosisHint = consultation.diagnosis?.trim();
  const complaintHint = consultation.mainComplaint?.trim();
  if (diagnosisHint) return diagnosisHint.slice(0, 120);
  if (complaintHint) return complaintHint.slice(0, 120);
  return 'Caso clínico';
}

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value?.trim()) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      <p className="whitespace-pre-wrap rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

export function ShareCommunityCaseDialog({
  open,
  onOpenChange,
  consultation,
  onPublished,
}: ShareCommunityCaseDialogProps) {
  const createCase = useCreateCommunityCase();
  const [title, setTitle] = useState(() => defaultTitle(consultation));
  const [authorNote, setAuthorNote] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevConsultationId, setPrevConsultationId] = useState(consultation.id);

  if (open !== prevOpen || consultation.id !== prevConsultationId) {
    setPrevOpen(open);
    setPrevConsultationId(consultation.id);
    if (open) {
      setTitle(defaultTitle(consultation));
      setAuthorNote('');
    }
  }

  const approximateAge = formatApproximateAge(consultation.pet.birthDate);
  const speciesLabel =
    PET_SPECIES_LABELS[consultation.pet.species as PetSpecies] ??
    consultation.pet.species;

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Informe um título para o caso');
      return;
    }

    try {
      const created = await createCase.mutateAsync({
        consultationId: consultation.id,
        title: trimmedTitle,
        authorNote: authorNote.trim() || null,
      });
      toast.success('Caso compartilhado na comunidade');
      onOpenChange(false);
      onPublished?.(created);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Erro ao compartilhar caso',
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="mb-4">
          <DialogTitle>Compartilhar na comunidade</DialogTitle>
          <DialogDescription>
            Compartilhe o caso para ajudar outros veterinários a aprender com a
            sua experiência clínica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-0.5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{speciesLabel}</Badge>
            {approximateAge ? (
              <Badge variant="outline">{approximateAge}</Badge>
            ) : null}
            {consultation.weightKg ? (
              <Badge variant="outline">{consultation.weightKg} kg</Badge>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-case-title">Título</Label>
            <Input
              id="community-case-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              placeholder="Resumo do caso"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-case-author-note">
              Texto adicional (opcional)
            </Label>
            <Textarea
              id="community-case-author-note"
              value={authorNote}
              onChange={(event) => setAuthorNote(event.target.value)}
              rows={3}
              maxLength={5000}
              placeholder="Contexto, dúvida ou aprendizado que queira compartilhar..."
            />
          </div>

          <div className="space-y-3 border-t pt-3">
            <p className="text-sm font-medium">Relato da consulta</p>
            <ReadonlyField
              label="Queixa principal"
              value={consultation.mainComplaint}
            />
            <ReadonlyField label="Histórico" value={consultation.history} />
            <ReadonlyField
              label="Exame físico"
              value={consultation.physicalExam}
            />
            <ReadonlyField
              label="Diagnóstico"
              value={consultation.diagnosis}
            />
            <ReadonlyField label="Conduta" value={consultation.conduct} />
            <ReadonlyField
              label="Observações"
              value={consultation.observations}
            />
          </div>

          <DialogFooter className="flex-row justify-end gap-2 border-t pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCase.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={createCase.isPending}
            >
              {createCase.isPending ? 'Publicando...' : 'Publicar caso'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
