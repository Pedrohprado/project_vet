import { useState } from 'react';
import { joinWaitlist } from '@/api/waitlist';
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
import { ApiError } from '@/api/http';
import { landingPrimaryButtonClassName } from '@/lib/landing-styles';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type WaitlistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planInterest?: string;
};

export function WaitlistDialog({
  open,
  onOpenChange,
  planInterest,
}: WaitlistDialogProps) {
  const [email, setEmail] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error('Informe seu e-mail.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await joinWaitlist({
        email: email.trim(),
        clinicName: clinicName.trim() || undefined,
        planInterest,
      });

      toast.success(result.message);
      setEmail('');
      setClinicName('');
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Erro ao entrar na lista de espera.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Entrar na lista de espera</DialogTitle>
          <DialogDescription>
            {planInterest
              ? `Deixe seu e-mail para ser avisado quando o plano ${planInterest} estiver disponível.`
              : 'Deixe seu e-mail para ser avisado quando os planos estiverem disponíveis.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="waitlist-email">E-mail</Label>
            <Input
              id="waitlist-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waitlist-clinic">Clínica (opcional)</Label>
            <Input
              id="waitlist-clinic"
              type="text"
              value={clinicName}
              onChange={(event) => setClinicName(event.target.value)}
              placeholder="Nome da clínica"
              className="h-10"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className={cn(landingPrimaryButtonClassName, 'w-full sm:w-auto')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Entrar na lista de espera'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
