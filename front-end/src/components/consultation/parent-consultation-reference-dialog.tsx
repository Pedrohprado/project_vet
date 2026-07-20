import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ExternalLink,
  FileText,
  Pill,
} from 'lucide-react';
import { getConsultation } from '@/api/consultations';
import type { Consultation, ConsultationAttachment } from '@/types/consultation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getSafeMediaUrl } from '@/lib/safe-url';
import {
  PRESCRIPTION_DOCUMENT_TYPE_LABELS,
  PRESCRIPTION_PHARMACY_TYPE_LABELS,
} from '@/types/consultation';

type ParentConsultationReferenceDialogProps = {
  parentConsultationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TABS = [
  { id: 'anamnese', label: 'Anamnese' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'receita', label: 'Receita' },
  { id: 'exames', label: 'Exames' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function formatValue(value: string | null | undefined) {
  return value?.trim() ? value : '—';
}

function formatConsultationDateTime(startedAt: string) {
  const date = new Date(startedAt);
  return {
    date: date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function formatAttachmentDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ReferenceField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1 rounded-lg border bg-card p-3">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{formatValue(value)}</p>
    </div>
  );
}

function AnamneseTab({ consultation }: { consultation: Consultation }) {
  return (
    <div className="space-y-3">
      {(consultation.weightKg || consultation.temperature) && (
        <div className="flex flex-wrap gap-3">
          {consultation.weightKg ? (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">Peso: </span>
              <span className="text-muted-foreground">
                {consultation.weightKg} kg
              </span>
            </div>
          ) : null}
          {consultation.temperature ? (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">Temperatura: </span>
              <span className="text-muted-foreground">
                {consultation.temperature} °C
              </span>
            </div>
          ) : null}
        </div>
      )}

      <ReferenceField label="Queixa principal" value={consultation.mainComplaint} />
      <ReferenceField label="Histórico" value={consultation.history} />
      <ReferenceField label="Exame físico" value={consultation.physicalExam} />
      <ReferenceField label="Observações" value={consultation.observations} />
    </div>
  );
}

function DiagnosticoTab({ consultation }: { consultation: Consultation }) {
  return (
    <div className="space-y-3">
      <ReferenceField label="Diagnóstico" value={consultation.diagnosis} />
      <ReferenceField label="Conduta" value={consultation.conduct} />
    </div>
  );
}

function ReceitaTab({ consultation }: { consultation: Consultation }) {
  if (consultation.prescriptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum medicamento prescrito.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {PRESCRIPTION_DOCUMENT_TYPE_LABELS[consultation.prescriptionDocumentType]}
      </p>

      <div className="space-y-2">
        {consultation.prescriptions.map((item) => {
          const details = [item.dosage, item.frequency, item.duration]
            .filter(Boolean)
            .join(' · ');
          const meta = [
            item.routeOfAdministration,
            item.pharmacyType
              ? PRESCRIPTION_PHARMACY_TYPE_LABELS[item.pharmacyType]
              : null,
            item.quantity,
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border bg-card p-3"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pill className="size-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium leading-snug text-foreground">
                  {item.medicineName}
                </p>
                {meta ? (
                  <p className="text-xs text-muted-foreground">{meta}</p>
                ) : null}
                {details ? (
                  <p className="text-sm text-muted-foreground">{details}</p>
                ) : null}
                {item.instructions ? (
                  <p className="rounded-md bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground">
                    {item.instructions}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AttachmentItem({ attachment }: { attachment: ConsultationAttachment }) {
  const displayName = attachment.label?.trim() || attachment.fileName;
  const fileUrl = getSafeMediaUrl(attachment.fileUrl);

  return (
    <li className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            {attachment.fileName} · {formatAttachmentDate(attachment.createdAt)}
          </p>
          <p className="text-xs text-muted-foreground">
            Enviado por {attachment.uploadedBy.name}
          </p>
        </div>
      </div>
      {fileUrl ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0"
          render={
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" />
          }
        >
          <ExternalLink className="size-3.5" />
          Visualizar
        </Button>
      ) : null}
    </li>
  );
}

function ExamesTab({ consultation }: { consultation: Consultation }) {
  if (consultation.attachments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum exame anexado.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {consultation.attachments.map((attachment) => (
        <AttachmentItem key={attachment.id} attachment={attachment} />
      ))}
    </ul>
  );
}

function TabPanel({
  tab,
  consultation,
}: {
  tab: TabId;
  consultation: Consultation;
}) {
  switch (tab) {
    case 'anamnese':
      return <AnamneseTab consultation={consultation} />;
    case 'diagnostico':
      return <DiagnosticoTab consultation={consultation} />;
    case 'receita':
      return <ReceitaTab consultation={consultation} />;
    case 'exames':
      return <ExamesTab consultation={consultation} />;
  }
}

export function ParentConsultationReferenceDialog({
  parentConsultationId,
  open,
  onOpenChange,
}: ParentConsultationReferenceDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>('anamnese');

  if (!open && activeTab !== 'anamnese') {
    setActiveTab('anamnese');
  }

  const { data: consultation, isLoading, isError } = useQuery({
    queryKey: ['consultation', parentConsultationId, 'reference'],
    queryFn: () => getConsultation(parentConsultationId),
    enabled: open && Boolean(parentConsultationId),
  });

  const dateTime = consultation
    ? formatConsultationDateTime(consultation.startedAt)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(560px,85vh)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0">
        <div className="shrink-0 space-y-3 border-b px-4 pt-4 pb-3 pr-12">
          <DialogHeader className="gap-1.5 p-0">
            <DialogTitle>Consulta anterior</DialogTitle>
            {dateTime ? (
              <div className="space-y-0.5">
                <p className="text-sm font-medium capitalize text-foreground">
                  {dateTime.date}
                </p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  às {dateTime.time}
                </p>
              </div>
            ) : (
              <DialogDescription>
                Referência read-only da consulta que originou este retorno.
              </DialogDescription>
            )}
          </DialogHeader>

          {consultation ? (
            <nav
              aria-label="Abas da consulta anterior"
              className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 scrollbar-none"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted/70',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          ) : null}
        </div>

        <div
          role="tabpanel"
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-thin"
        >
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : null}

          {isError || (!isLoading && !consultation) ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar a consulta anterior.
            </p>
          ) : null}

          {consultation ? (
            <TabPanel tab={activeTab} consultation={consultation} />
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
