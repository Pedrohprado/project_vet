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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type ConsultationWhatsAppReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorName: string;
  tutorPhone: string | null;
  message: string;
  onMessageChange: (message: string) => void;
  mode: 'finish' | 'resend';
  onProceedWithoutSend: () => void;
  onProceedWithSend: () => void;
  confirmingAction?: 'skip' | 'send' | null;
  isConfirming: boolean;
  isGenerating: boolean;
};

export function ConsultationWhatsAppReviewDialog({
  open,
  onOpenChange,
  tutorName,
  tutorPhone,
  message,
  onMessageChange,
  mode,
  onProceedWithoutSend,
  onProceedWithSend,
  confirmingAction = null,
  isConfirming,
  isGenerating,
}: ConsultationWhatsAppReviewDialogProps) {
  const busy = isConfirming || isGenerating;
  const canSend = Boolean(tutorPhone && message.trim());
  const isResend = mode === 'resend';
  const skipLabel = isResend ? 'Fechar' : 'Concluir';
  const sendLabel = isResend ? 'Reenviar' : 'Enviar';
  const confirmingWithoutLabel = isResend ? 'Fechando...' : 'Concluindo...';
  const confirmingWithLabel = isResend ? 'Reenviando...' : 'Enviando...';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Revisar resumo pós-consulta</DialogTitle>
          <DialogDescription>
            Geramos uma mensagem pré-formatada que poderá ser enviada ao tutor
            via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-[min(22rem,50vh)] flex-1 flex-col overflow-hidden rounded-xl border border-border/60 shadow-sm">
            <div className="shrink-0 bg-[#008069] px-4 py-3 text-white">
              <p className="truncate text-sm font-semibold">{tutorName}</p>
              <p className="truncate text-xs text-white/85">
                {tutorPhone ?? 'Sem WhatsApp ou telefone cadastrado'}
              </p>
            </div>

            {!tutorPhone ? (
              <p className="shrink-0 border-b border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Cadastre WhatsApp ou telefone do tutor para enviar a mensagem.
                Você ainda pode concluir.
              </p>
            ) : null}

            <div
              className={cn(
                'relative min-h-0 flex-1 overflow-y-auto p-3 sm:p-4',
                'bg-[#efeae2] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)]',
                '[background-size:12px_12px]',
              )}
            >
              {isGenerating ? (
                <BoxvetSummaryLoadingAnimation className="min-h-[14rem] border-0 bg-white/70" />
              ) : (
                <div className="flex justify-end">
                  <div className="relative max-w-[95%] min-w-[12rem] rounded-lg rounded-br-sm bg-[#d9fdd3] px-3 py-2 shadow-sm ring-1 ring-black/5">
                    <label htmlFor="whatsapp-review-message" className="sr-only">
                      Mensagem para o tutor
                    </label>
                    <Textarea
                      id="whatsapp-review-message"
                      value={message}
                      onChange={(e) => onMessageChange(e.target.value)}
                      rows={10}
                      disabled={isConfirming}
                      className="min-h-[11rem] resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-[#111b21] shadow-none focus-visible:ring-0"
                    />
                    <p className="mt-1 text-right text-[10px] leading-none text-[#667781]">
                      Prévia · editável
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            action="finish"
            alwaysShowActionIcon
            className="w-full"
            onClick={onProceedWithoutSend}
            disabled={busy}
          >
            {isConfirming && confirmingAction === 'skip'
              ? confirmingWithoutLabel
              : skipLabel}
          </Button>
          <Button
            type="button"
            action="share"
            alwaysShowActionIcon
            className="w-full"
            onClick={onProceedWithSend}
            disabled={busy || !canSend}
          >
            {isConfirming && confirmingAction === 'send'
              ? confirmingWithLabel
              : sendLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
