import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BoxvetSummaryLoadingAnimation } from '@/components/consultation/boxvet-summary-loading-animation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ConsultationWhatsAppReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorName: string;
  tutorPhone: string | null;
  message: string;
  onMessageChange: (message: string) => void;
  onConfirm: () => void;
  isConfirming: boolean;
  isGenerating: boolean;
  confirmLabel?: string;
  confirmingLabel?: string;
};

export function ConsultationWhatsAppReviewDialog({
  open,
  onOpenChange,
  tutorName,
  tutorPhone,
  message,
  onMessageChange,
  onConfirm,
  isConfirming,
  isGenerating,
  confirmLabel = 'Concluir',
  confirmingLabel = 'Concluindo...',
}: ConsultationWhatsAppReviewDialogProps) {
  const busy = isConfirming || isGenerating;
  const [showAnimationPreview, setShowAnimationPreview] = useState(false);

  if ((!open || isGenerating) && showAnimationPreview) {
    setShowAnimationPreview(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[80vh] flex-col overflow-hidden sm:max-w-lg'>
        <DialogHeader className='shrink-0'>
          <DialogTitle>Revisar resumo pós-consulta</DialogTitle>
          <DialogDescription>
            {isGenerating
              ? 'Gerando um resumo humanizado com IA para o WhatsApp…'
              : 'Confira a mensagem que será enviada ao tutor via WhatsApp. Você pode editar o texto antes de concluir.'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex min-h-0 flex-1 flex-col gap-4'>
          <div className='shrink-0 space-y-1 text-sm'>
            <p>
              <span className='text-muted-foreground'>Destinatário: </span>
              <span className='font-medium'>{tutorName}</span>
            </p>
            {tutorPhone ? (
              <p>
                <span className='text-muted-foreground'>WhatsApp: </span>
                <span className='font-medium'>{tutorPhone}</span>
              </p>
            ) : (
              <p className='text-amber-700 dark:text-amber-500'>
                Tutor sem WhatsApp/telefone cadastrado. O resumo não poderá ser
                aberto no WhatsApp.
              </p>
            )}
          </div>

          <div className='flex min-h-0 flex-1 flex-col gap-2'>
            <div className='flex items-center justify-between gap-3'>
              <Label htmlFor='whatsapp-review-message'>Mensagem</Label>
              {!isGenerating ? (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setShowAnimationPreview((current) => !current)}
                  disabled={isConfirming}
                >
                  {showAnimationPreview ? 'Voltar ao texto' : 'Ver animação'}
                </Button>
              ) : null}
            </div>
            {isGenerating || showAnimationPreview ? (
              <BoxvetSummaryLoadingAnimation className='min-h-0 flex-1' />
            ) : (
              <Textarea
                id='whatsapp-review-message'
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                rows={12}
                className='min-h-0 flex-1 resize-none overflow-y-auto'
                disabled={isConfirming}
              />
            )}
          </div>
        </div>

        <DialogFooter className='shrink-0 gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={onConfirm}
            disabled={busy || !message.trim()}
          >
            {isConfirming ? confirmingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
