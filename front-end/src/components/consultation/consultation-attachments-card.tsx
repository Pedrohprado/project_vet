import { useRef, useState } from 'react';
import { ExternalLink, FileText, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useDeleteConsultationAttachment,
  useUploadConsultationAttachment,
} from '@/hooks/useConsultations';
import type { ConsultationAttachment } from '@/types/consultation';

type ConsultationAttachmentsCardProps = {
  consultationId: string;
  petId: string;
  attachments: ConsultationAttachment[];
  canManage: boolean;
  className?: string;
};

function formatAttachmentDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ConsultationAttachmentsCard({
  consultationId,
  petId,
  attachments,
  canManage,
  className,
}: ConsultationAttachmentsCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAttachment = useUploadConsultationAttachment();
  const deleteAttachment = useDeleteConsultationAttachment();
  const [label, setLabel] = useState('');

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Apenas arquivos PDF são permitidos');
      event.target.value = '';
      return;
    }

    try {
      await uploadAttachment.mutateAsync({
        consultationId,
        petId,
        file,
        label: label.trim() || undefined,
      });
      toast.success('Exame anexado com sucesso');
      setLabel('');
      event.target.value = '';
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erro ao anexar exame',
      );
      event.target.value = '';
    }
  }

  async function handleRemove(attachmentId: string) {
    try {
      await deleteAttachment.mutateAsync({
        consultationId,
        petId,
        attachmentId,
      });
      toast.success('Anexo removido');
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erro ao remover anexo',
      );
    }
  }

  return (
    <Card className={cn('mt-4 sm:mt-6', className)}>
      <CardHeader>
        <CardTitle>3. Exames anexados</CardTitle>
        <CardDescription>
          Vincule laudos e exames em PDF a esta consulta para manter o histórico
          clínico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage ? (
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <div className="space-y-2">
              <Label htmlFor={`attachment-label-${consultationId}`}>
                Nome do exame (opcional)
              </Label>
              <Input
                id={`attachment-label-${consultationId}`}
                value={label}
                placeholder="Ex: Hemograma, Raio-X..."
                onChange={(event) => setLabel(event.target.value)}
              />
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(event) => void handleFileChange(event)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploadAttachment.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                {uploadAttachment.isPending ? 'Enviando...' : 'Anexar PDF'}
              </Button>
            </div>
          </div>
        ) : null}

        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum exame anexado a esta consulta.
          </p>
        ) : (
          <ul className="space-y-2">
            {attachments.map((attachment) => {
              const displayName =
                attachment.label?.trim() || attachment.fileName;

              return (
                <li
                  key={attachment.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.fileName} · {formatAttachmentDate(attachment.createdAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Enviado por {attachment.uploadedBy.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      render={
                        <a
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <ExternalLink className="size-3.5" />
                      Visualizar
                    </Button>
                    {canManage ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={deleteAttachment.isPending}
                        onClick={() => void handleRemove(attachment.id)}
                      >
                        <Trash2 className="size-3.5" />
                        Remover
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
