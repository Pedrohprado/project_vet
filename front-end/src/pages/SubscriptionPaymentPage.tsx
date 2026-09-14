import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { BrandCardBirds } from '@/components/brand/brand-card-birds';
import { BrandLogo } from '@/components/brand/brand-logo';
import { BrandPageBackground } from '@/components/brand-page-background';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  firstName,
  getPostAuthPath,
  hasAppAccess,
  markPixAccess,
  SUBSCRIPTION_PRICE,
} from '@/lib/billing';
import {
  marketingBodyClassName,
  marketingCardClassName,
  marketingTitleClassName,
} from '@/lib/landing-styles';
import { cn } from '@/lib/utils';

export function SubscriptionPaymentPage() {
  const navigate = useNavigate();
  const { user, clinic, isLoading, isAuthenticated } = useAuth();
  const [isActivating, setIsActivating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (hasAppAccess(user, clinic)) {
    return <Navigate to={getPostAuthPath(user, clinic)} replace />;
  }

  const name = firstName(user?.name);
  const clinicId = clinic?.id ?? user?.clinicId;

  function handlePix() {
    if (!clinicId) {
      toast.error('Não foi possível identificar sua clínica.');
      return;
    }

    setIsActivating(true);
    markPixAccess(clinicId);
    toast.success('Acesso liberado. Bem-vindo à BoxVet!');
    void navigate('/estatisticas', { replace: true });
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-white px-4 py-10 sm:px-6 sm:py-12">
      <BrandPageBackground variant="absolute" blurHeight="55%" />

      <div className="relative z-10 w-full max-w-md md:max-w-xl">
        <div className="relative">
          <BrandCardBirds />

          <div className={marketingCardClassName}>
            <div className="mb-5 flex justify-center md:justify-start">
              <BrandLogo size="lg" />
            </div>

            <h1 className={marketingTitleClassName}>
              {name}, como você quer pagar?
            </h1>
            <p className={`${marketingBodyClassName} mt-2.5`}>
              Escolha a forma de pagamento pra entrar na BoxVet.
            </p>

            <div className="mt-6 grid gap-2.5 md:grid-cols-2">
              <button
                type="button"
                disabled={isActivating || !clinicId}
                onClick={handlePix}
                className={cn(
                  'flex w-full flex-col items-start rounded-xl border border-border bg-white px-4 py-3.5 text-left text-foreground transition-opacity',
                  'hover:border-foreground/30 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                <span className="text-sm font-semibold">Pagar com Pix</span>
                <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {SUBSCRIPTION_PRICE} — acesso por 30 dias, enviaremos um QR Code
                  para você renovar o pagamento
                </span>
              </button>

              <button
                type="button"
                disabled
                className="flex w-full flex-col items-start rounded-xl border border-border/70 bg-white px-4 py-3.5 text-left opacity-70"
              >
                <span className="text-sm font-semibold text-foreground">
                  Pagar com cartão
                </span>
                <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {SUBSCRIPTION_PRICE}/mês — assinatura mensal, cancele quando quiser
                </span>
                <span className="mt-1.5 text-xs font-medium text-primary">
                  Em breve
                </span>
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-muted-foreground"
              onClick={() => void navigate('/assinatura')}
            >
              Voltar
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              pagamento seguro via AbacatePay 🥑
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
